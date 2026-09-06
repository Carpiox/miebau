(function initExamSearchModule(globalScope) {
  'use strict';

  const DATA_URL = '/data/examenes-seo.json';
  const EMPTY_RESULTS_HTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>No se han encontrado exámenes con esos filtros.<br>Prueba con otra combinación.</p>
          </div>`;

  let entriesPromise;

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function entryYear(entry) {
    const reference = entry.contenido?.datos_comunidad_asignatura?.curso_referencia || '';
    return String(reference).match(/\b20\d{2}\b/)?.[0] || '';
  }

  function matchesCommunity(entry, selectedCommunity) {
    if (!selectedCommunity) return true;
    const aliases = {
      madrid: 'comunidad de madrid',
      murcia: 'region de murcia',
    };
    const selected = normalize(selectedCommunity);
    return normalize(entry.comunidad) === (aliases[selected] || selected);
  }

  function matchesSubject(entry, selectedSubject) {
    if (!selectedSubject) return true;
    const selected = normalize(selectedSubject);
    return [entry.asignatura, entry.nombre_oficial_vigente].filter(Boolean).some((candidate) => {
      const normalizedCandidate = normalize(candidate);
      return normalizedCandidate === selected || normalizedCandidate === `${selected} ii`;
    });
  }

  function filterExamEntries(entries, filters = {}) {
    return entries
      .filter((entry) => matchesSubject(entry, filters.subject))
      .filter((entry) => matchesCommunity(entry, filters.community))
      .filter((entry) => !filters.year || entryYear(entry) === String(filters.year))
      .map((entry) => ({
        asignatura: entry.nombre_oficial_vigente || entry.asignatura,
        comunidad: entry.comunidad,
        anio: entryYear(entry),
        url: entry.url,
      }));
  }

  function renderExamCards(results) {
    if (!results.length) return EMPTY_RESULTS_HTML;

    return results.map((result) => `
          <div class="exam-row">
            <div class="exam-icon">📄</div>
            <div class="exam-info">
              <div class="exam-title">${escapeHtml(result.asignatura)}</div>
              <div class="exam-meta">${escapeHtml(result.comunidad)}</div>
            </div>
            <div class="exam-tags">
              <span class="tag year">${escapeHtml(result.anio)}</span>
              <span class="tag">${escapeHtml(result.comunidad)}</span>
            </div>
            <a class="exam-link" href="${escapeHtml(result.url)}">Ver ficha →</a>
          </div>`).join('');
  }

  async function loadEntries(fetchImpl) {
    if (!entriesPromise) {
      entriesPromise = fetchImpl(DATA_URL)
        .then((response) => {
          if (!response.ok) throw new Error(`No se pudo cargar ${DATA_URL}`);
          return response.json();
        })
        .then((data) => Array.isArray(data.entries) ? data.entries : [])
        .catch((error) => {
          entriesPromise = undefined;
          throw error;
        });
    }
    return entriesPromise;
  }

  function showResults(doc, results, filters) {
    doc.getElementById('resultTitle').textContent =
      [filters.subject, filters.community, filters.year ? `Año ${filters.year}` : ''].filter(Boolean).join(' · ') || 'Todos los resultados';
    doc.getElementById('countBadge').textContent = `${results.length} ${results.length === 1 ? 'examen' : 'exámenes'}`;
    doc.getElementById('examList').innerHTML = renderExamCards(results);
    const area = doc.getElementById('resultArea');
    area.classList.add('visible');
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function searchExams(doc, fetchImpl) {
    const filters = {
      subject: doc.getElementById('selAsignatura').value,
      community: doc.getElementById('selComunidad').value,
      year: doc.getElementById('selAnio').value,
    };

    if (!filters.subject && !filters.community) {
      globalScope.alert('Selecciona al menos una asignatura o comunidad autónoma.');
      return;
    }

    try {
      const entries = await loadEntries(fetchImpl);
      showResults(doc, filterExamEntries(entries, filters), filters);
    } catch {
      showResults(doc, [], filters);
    }
  }

  const api = { entryYear, filterExamEntries, renderExamCards };

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (globalScope?.document) {
    globalScope.buscarExamenes = () => searchExams(globalScope.document, globalScope.fetch.bind(globalScope));
  }
})(typeof window !== 'undefined' ? window : null);
