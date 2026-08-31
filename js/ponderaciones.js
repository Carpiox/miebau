/*
 * Ponderaciones 2026-2027.
 * El catálogo y las tablas consumen una única salida JSON estática generada a
 * partir de fuentes versionadas. Los datos se insertan siempre con nodos DOM.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.MiebauPonderaciones = api;
    const start = () => api.init(root, root.document);
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const DATA_URL = '/data/ponderaciones-2026-2027.json?v=20260831';
  const MAX_VISIBLE_ROWS = 500;
  const STATUS_LABELS = {
    verified: 'Verificada 2026-2027',
    pending: 'Pendiente de normalizar',
    blocked: 'Fuente bloqueada',
    no_publication: 'Sin tabla publicada'
  };
  let dataPromise;

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function coefficientText(value) {
    return Number(value).toFixed(1).replace('.', ',');
  }

  function flattenRows(data) {
    const universities = new Map(data.universities.map((item) => [item.id, item]));
    const sources = new Map(data.sources.map((item) => [item.id, item]));
    const records = [];
    data.datasets.forEach((dataset) => {
      const source = sources.get(dataset.sourceId);
      dataset.rows.forEach((row) => {
        const universityNames = row.universityIds.map((id) => universities.get(id)?.name || id);
        row.weights.forEach((weight) => {
          const record = {
            datasetId: dataset.id,
            sourceId: dataset.sourceId,
            sourceName: source ? source.name : dataset.title,
            period: dataset.period,
            code: row.code || '',
            degree: row.degree,
            universityIds: row.universityIds,
            universityNames,
            campus: row.campus || '',
            center: row.center || '',
            branch: row.branch || '',
            subject: weight.subject,
            coefficient: weight.coefficient
          };
          record._search = normalizeText([
            record.code,
            record.degree,
            universityNames.join(' '),
            record.campus,
            record.center,
            record.branch,
            record.subject
          ].join(' '));
          records.push(record);
        });
      });
    });
    return records;
  }

  function filterRows(records, filters) {
    const query = normalizeText(filters.query || '');
    return records.filter((record) => {
      if (filters.datasetId && record.datasetId !== filters.datasetId) return false;
      if (filters.universityId && !record.universityIds.includes(filters.universityId)) return false;
      if (filters.onlyHigh && record.coefficient !== 0.2) return false;
      const searchable = record._search || normalizeText([
        record.code,
        record.degree,
        (record.universityNames || []).join(' '),
        record.campus,
        record.center,
        record.branch,
        record.subject
      ].join(' '));
      return !query || searchable.includes(query);
    });
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildCsv(records) {
    const header = ['Universidad', 'Grado', 'Código', 'Campus', 'Centro', 'Materia', 'Coeficiente', 'Fuente', 'Periodo'];
    const lines = [header.join(';')];
    records.forEach((record) => {
      lines.push([
        (record.universityNames || []).join(' / '),
        record.degree,
        record.code || '',
        record.campus || '',
        record.center || '',
        record.subject,
        coefficientText(record.coefficient),
        record.sourceName || '',
        record.period || '2026-2027'
      ].map(csvCell).join(';'));
    });
    return `\uFEFF${lines.join('\r\n')}\r\n`;
  }

  function loadData(win) {
    if (!dataPromise) {
      dataPromise = win.fetch(DATA_URL, { credentials: 'same-origin' }).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });
    }
    return dataPromise;
  }

  function element(doc, tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function option(doc, value, text) {
    const node = element(doc, 'option', '', text);
    node.value = value;
    return node;
  }

  function appendCell(doc, row, tag, text, scope, className) {
    const cell = element(doc, tag, className || '', text);
    if (scope) cell.scope = scope;
    row.appendChild(cell);
  }

  function officialLinkLabel(source) {
    return /pdf/i.test(source.sourceType || '') || /\.pdf(?:$|[/?])/i.test(source.sourceUrl || '')
      ? 'Ver PDF oficial'
      : 'Ver fuente oficial';
  }

  function initTable(win, doc, data) {
    const datasetFilter = doc.getElementById('datasetFilter');
    const universityFilter = doc.getElementById('tableUniversityFilter');
    const search = doc.getElementById('tableSearch');
    const onlyHigh = doc.getElementById('onlyHighWeights');
    const clear = doc.getElementById('clearTableFilters');
    const download = doc.getElementById('downloadTableCsv');
    const tableBody = doc.getElementById('ponderacionesTableBody');
    const table = doc.getElementById('ponderacionesTable');
    const resultCount = doc.getElementById('tableResultCount');
    const sourceTitle = doc.getElementById('verifiedTableTitle');
    const sourceScope = doc.getElementById('tableSourceScope');
    const sourceLink = doc.getElementById('officialTableLink');
    if (!datasetFilter || !universityFilter || !search || !onlyHigh || !tableBody || !table) return;

    const datasets = new Map(data.datasets.map((item) => [item.id, item]));
    const sources = new Map(data.sources.map((item) => [item.id, item]));
    const universities = new Map(data.universities.map((item) => [item.id, item]));
    const records = flattenRows(data);
    let filtered = [];
    let frame = 0;

    datasetFilter.replaceChildren();
    data.datasets.forEach((dataset) => datasetFilter.appendChild(option(doc, dataset.id, dataset.title)));
    datasetFilter.value = data.datasets[0].id;

    function populateUniversities() {
      const dataset = datasets.get(datasetFilter.value);
      const current = universityFilter.value;
      const ids = new Set(dataset.rows.flatMap((row) => row.universityIds));
      const items = [...ids].map((id) => universities.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, 'es'));
      universityFilter.replaceChildren(option(doc, '', 'Todas las incluidas en la tabla'));
      items.forEach((item) => universityFilter.appendChild(option(doc, item.id, item.name)));
      universityFilter.value = ids.has(current) ? current : '';
    }

    function renderSource() {
      const dataset = datasets.get(datasetFilter.value);
      const source = sources.get(dataset.sourceId);
      sourceTitle.textContent = dataset.title;
      sourceScope.textContent = source.scope;
      sourceLink.href = source.sourceUrl;
      sourceLink.textContent = officialLinkLabel(source);
      sourceLink.hidden = !source.sourceUrl;
    }

    function renderRows() {
      const filters = {
        datasetId: datasetFilter.value,
        universityId: universityFilter.value,
        query: search.value,
        onlyHigh: onlyHigh.checked
      };
      filtered = filterRows(records, filters);
      const visible = filtered.slice(0, MAX_VISIBLE_ROWS);
      const fragment = doc.createDocumentFragment();

      visible.forEach((record) => {
        const row = doc.createElement('tr');
        appendCell(doc, row, 'th', record.degree, 'row');
        appendCell(doc, row, 'td', record.universityNames.join(' / '));
        appendCell(doc, row, 'td', [record.campus, record.center].filter(Boolean).join(' · ') || '—');
        appendCell(doc, row, 'td', record.subject);
        appendCell(doc, row, 'td', coefficientText(record.coefficient), '', 'coefficient-value');
        fragment.appendChild(row);
      });

      if (!visible.length) {
        const row = doc.createElement('tr');
        const cell = element(doc, 'td', 'ponderaciones-empty', 'No hay ponderaciones que coincidan. Prueba a limpiar los filtros.');
        cell.colSpan = 5;
        row.appendChild(cell);
        fragment.appendChild(row);
      }
      tableBody.replaceChildren(fragment);
      const dataset = datasets.get(datasetFilter.value);
      table.caption.textContent = `${dataset.title}: ponderaciones oficiales ${dataset.period}, filtrables por grado, universidad y materia.`;
      const limited = filtered.length > MAX_VISIBLE_ROWS ? ` Se muestran las primeras ${MAX_VISIBLE_ROWS}; afina la búsqueda para ver un subconjunto concreto.` : '';
      resultCount.textContent = `${filtered.length.toLocaleString('es-ES')} ${filtered.length === 1 ? 'resultado' : 'resultados'}.${limited}`;
      download.disabled = !filtered.length;
    }

    function renderAll() {
      renderSource();
      renderRows();
    }

    function scheduleRender() {
      win.cancelAnimationFrame(frame);
      frame = win.requestAnimationFrame(renderRows);
    }

    datasetFilter.addEventListener('change', () => {
      populateUniversities();
      renderAll();
    });
    universityFilter.addEventListener('change', renderRows);
    search.addEventListener('input', scheduleRender);
    onlyHigh.addEventListener('change', renderRows);
    clear.addEventListener('click', () => {
      search.value = '';
      universityFilter.value = '';
      onlyHigh.checked = false;
      renderRows();
      search.focus();
    });
    download.addEventListener('click', () => {
      if (!filtered.length) return;
      const blob = new win.Blob([buildCsv(filtered)], { type: 'text/csv;charset=utf-8' });
      const url = win.URL.createObjectURL(blob);
      const anchor = doc.createElement('a');
      anchor.href = url;
      anchor.download = `ponderaciones-${datasetFilter.value}.csv`;
      doc.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      win.setTimeout(() => win.URL.revokeObjectURL(url), 0);
    });

    populateUniversities();
    renderAll();
  }

  function createCatalogCard(doc, item) {
    const isPrivate = item.kind === 'private';
    const card = element(doc, 'article', `pdf-card${item.status !== 'verified' && !isPrivate ? ' pdf-card-pending' : ''}`);
    const heading = element(doc, 'div', 'pdf-card-heading');
    heading.appendChild(element(doc, 'span', 'pdf-icon', isPrivate ? '◇' : '◈'));
    heading.firstChild.setAttribute('aria-hidden', 'true');
    heading.appendChild(element(doc, 'span', 'eyebrow', item.region));
    card.appendChild(heading);
    card.appendChild(element(doc, 'div', 'uni-name', item.name));

    if (isPrivate) {
      card.appendChild(element(doc, 'div', 'uni-city', `Universidad privada · ${item.mode}`));
      const link = element(doc, 'a', '', 'Ver ficha informativa →');
      link.href = item.profile;
      card.appendChild(link);
      return card;
    }

    card.appendChild(element(doc, 'span', `source-status source-status-${item.status}`, STATUS_LABELS[item.status]));
    card.appendChild(element(doc, 'div', 'uni-city', item.sourceType));
    if (item.status !== 'verified') card.appendChild(element(doc, 'p', 'source-note', item.reason));
    if (item.sourceUrl) {
      const link = element(doc, 'a', '', `${officialLinkLabel(item)} →`);
      link.href = item.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      card.appendChild(link);
    } else {
      card.appendChild(element(doc, 'span', 'pending-link', item.reason));
    }
    return card;
  }

  function createCatalogGroup(doc, title, items) {
    const section = element(doc, 'section', 'university-group');
    section.appendChild(element(doc, 'h3', '', title));
    if (!items.length) {
      section.appendChild(element(doc, 'p', 'university-group-empty', 'No hay resultados en esta sección.'));
      return section;
    }
    const grid = element(doc, 'div', 'pdf-grid');
    items.forEach((item) => grid.appendChild(createCatalogCard(doc, item)));
    section.appendChild(grid);
    return section;
  }

  function initCatalog(doc, data) {
    const regionFilter = doc.getElementById('regionFilter');
    const search = doc.getElementById('universitySearch');
    const count = doc.getElementById('ponderacionesCount');
    const badge = doc.getElementById('documentBadge');
    const grid = doc.getElementById('pdfGrid');
    if (!regionFilter || !search || !count || !badge || !grid) return;

    const publicItems = data.sources.map((source) => ({ ...source, kind: 'public' }));
    const privateItems = data.universities.filter((item) => item.type === 'private').map((item) => ({ ...item, kind: 'private' }));
    const catalog = publicItems.concat(privateItems).sort((a, b) => a.region.localeCompare(b.region, 'es') || a.name.localeCompare(b.name, 'es'));
    const regions = [...new Set(catalog.map((item) => item.region))].sort((a, b) => a.localeCompare(b, 'es'));

    regionFilter.replaceChildren(option(doc, '', 'Todas las comunidades'));
    regions.forEach((region) => regionFilter.appendChild(option(doc, region, region)));

    function render() {
      const selectedRegion = regionFilter.value;
      const query = normalizeText(search.value);
      const items = catalog.filter((item) => {
        const inRegion = !selectedRegion || item.region === selectedRegion;
        const matches = !query || normalizeText(`${item.name} ${item.region} ${item.sourceType || ''} ${item.mode || ''}`).includes(query);
        return inRegion && matches;
      });
      const visiblePublic = items.filter((item) => item.kind === 'public');
      const visiblePrivate = items.filter((item) => item.kind === 'private');
      count.textContent = `${items.length} ${items.length === 1 ? 'recurso' : 'recursos'}`;
      badge.textContent = `${visiblePublic.length} ${visiblePublic.length === 1 ? 'fuente' : 'fuentes'} · ${visiblePrivate.length} ${visiblePrivate.length === 1 ? 'ficha' : 'fichas'}`;
      grid.replaceChildren();
      grid.classList.toggle('pdf-grid-grouped', Boolean(selectedRegion));
      if (selectedRegion) {
        grid.appendChild(createCatalogGroup(doc, 'Universidades públicas', visiblePublic));
        grid.appendChild(createCatalogGroup(doc, 'Universidades privadas', visiblePrivate));
      } else {
        items.forEach((item) => grid.appendChild(createCatalogCard(doc, item)));
      }
    }

    regionFilter.addEventListener('change', render);
    search.addEventListener('input', render);
    render();
  }

  function init(win, doc) {
    const app = doc.getElementById('ponderacionesApp');
    if (!app || app.dataset.enhanced === 'true') return;
    app.dataset.enhanced = 'true';
    loadData(win).then((data) => {
      initTable(win, doc, data);
      initCatalog(doc, data);
    }).catch(() => {
      const status = doc.getElementById('tableResultCount');
      if (status) status.textContent = 'No se pudo cargar la consulta completa. La muestra HTML y el enlace a la fuente oficial siguen disponibles.';
      const catalogStatus = doc.getElementById('catalogStatus');
      if (catalogStatus) catalogStatus.textContent = 'No se pudo cargar el catálogo estático. Vuelve a intentarlo más tarde.';
    });
  }

  return {
    DATA_URL,
    MAX_VISIBLE_ROWS,
    normalizeText,
    coefficientText,
    flattenRows,
    filterRows,
    buildCsv,
    init
  };
}));
