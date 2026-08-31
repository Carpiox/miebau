import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = path.join(ROOT, 'data', 'ponderaciones-2026-2027.json');
const PROFILE_DIR = path.join(ROOT, 'ponderaciones');
const GENERATED_START = '<!-- ponderaciones-profile:generated:start -->';
const GENERATED_END = '<!-- ponderaciones-profile:generated:end -->';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function coefficientText(value) {
  return Number(value).toFixed(1).replace('.', ',');
}

function officialLinkLabel(source) {
  return /pdf/i.test(source?.sourceType || '') || /\.pdf(?:$|[/?])/i.test(source?.sourceUrl || '')
    ? 'Ver PDF oficial'
    : 'Ver fuente oficial';
}

function recordsForUniversity(data, universityId) {
  const records = [];
  for (const dataset of data.datasets) {
    for (const row of dataset.rows) {
      if (!row.universityIds.includes(universityId)) continue;
      for (const weight of row.weights) {
        records.push({
          datasetId: dataset.id,
          sourceId: dataset.sourceId,
          period: dataset.period,
          code: row.code || '',
          degree: row.degree,
          campus: row.campus || '',
          center: row.center || '',
          branch: row.branch || '',
          subject: weight.subject,
          coefficient: weight.coefficient,
        });
      }
    }
  }
  return records;
}

function renderRows(records, indent = '          ') {
  return records.map((record) => {
    const campus = [record.campus, record.center].filter(Boolean).join(' · ') || '—';
    return `${indent}<tr><th scope="row">${escapeHtml(record.degree)}</th><td>${escapeHtml(campus)}</td><td>${escapeHtml(record.subject)}</td><td class="coefficient-value">${coefficientText(record.coefficient)}</td></tr>`;
  }).join('\n');
}

function renderVerifiedSection(data, university, records, baseIndent = '        ') {
  const sourceIds = [...new Set(records.map((record) => record.sourceId))];
  const source = data.sources.find((item) => item.id === sourceIds[0]);
  const sourceLink = source?.sourceUrl
    ? `<a class="btn btn-outline" id="profileOfficialLink" href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noopener">${officialLinkLabel(source)}</a>`
    : '';
  const sourceDescription = sourceIds.length === 1 && source
    ? `${source.name}. ${source.scope}`
    : 'Filas verificadas en las fuentes oficiales incluidas en la base de datos de Miebau.';
  const resultText = `${records.length.toLocaleString('es-ES')} ${records.length === 1 ? 'ponderación verificada' : 'ponderaciones verificadas'} para esta ficha.`;
  const prefix = baseIndent;

  return [
    `${prefix}${GENERATED_START}`,
    `${prefix}<section class="profile-ponderaciones" id="profilePonderacionesApp" data-university-id="${escapeHtml(university.id)}" aria-labelledby="profilePonderacionesTitle">`,
    `${prefix}  <div class="section-heading profile-table-heading">`,
    `${prefix}    <div><span class="eyebrow">Datos oficiales</span><h2 id="profilePonderacionesTitle">Ponderaciones 2026-2027</h2></div>`,
    `${prefix}    <span class="source-status source-status-verified">Actualizado 2026-2027 · Fuente oficial</span>`,
    `${prefix}  </div>`,
    `${prefix}  <p>${escapeHtml(sourceDescription)}</p>`,
    `${prefix}  <div class="selector-card ponderaciones-controls profile-table-controls">`,
    `${prefix}    <div class="ponderaciones-filter-grid profile-filter-grid">`,
    `${prefix}      <div class="form-group ponderaciones-search-group"><label class="form-label" for="profileTableSearch">Buscar grado, campus o materia</label><input class="form-input" id="profileTableSearch" type="search" autocomplete="off" placeholder="Ej. Biología o Matemáticas II"></div>`,
    `${prefix}    </div>`,
    `${prefix}    <div class="ponderaciones-toolbar">`,
    `${prefix}      <label class="coefficient-toggle" for="profileOnlyHighWeights"><input id="profileOnlyHighWeights" type="checkbox"> Solo coeficientes <span class="coefficient-value">0,2</span></label>`,
    `${prefix}      <div class="ponderaciones-actions"><button class="btn btn-ghost" id="profileClearFilters" type="button">Limpiar filtros</button><button class="btn btn-primary" id="profileDownloadCsv" type="button">Descargar tabla (CSV)</button></div>`,
    `${prefix}    </div>`,
    `${prefix}  </div>`,
    `${prefix}  <div class="card ponderaciones-table-card profile-table-card">`,
    `${prefix}    <div class="ponderaciones-source-heading"><div><h3>${escapeHtml(university.name)}</h3><p>Grado, campus, materia y coeficiente publicados para esta universidad.</p></div>${sourceLink}</div>`,
    `${prefix}    <p class="table-keyboard-hint" id="profileTableKeyboardHint">En móvil, desliza la tabla horizontalmente. La primera columna permanece visible.</p>`,
    `${prefix}    <div class="ponderaciones-result-line" id="profileTableResultCount" role="status" aria-live="polite">${resultText}</div>`,
    `${prefix}    <div class="ponderaciones-table-scroll" id="profileTableScroll" tabindex="0" aria-describedby="profileTableKeyboardHint">`,
    `${prefix}      <table class="ponderaciones-table profile-ponderaciones-table" id="profilePonderacionesTable">`,
    `${prefix}        <caption>Ponderaciones oficiales 2026-2027 de ${escapeHtml(university.name)}.</caption>`,
    `${prefix}        <thead><tr><th scope="col">Grado</th><th scope="col">Campus</th><th scope="col">Materia</th><th scope="col">Coeficiente</th></tr></thead>`,
    `${prefix}        <tbody id="profilePonderacionesTableBody">`,
    renderRows(records, `${prefix}          `),
    `${prefix}        </tbody>`,
    `${prefix}      </table>`,
    `${prefix}    </div>`,
    `${prefix}    <noscript><p class="table-static-note">La tabla completa está incluida en el HTML. Activa JavaScript solo si quieres utilizar los filtros o descargar el CSV.</p></noscript>`,
    `${prefix}  </div>`,
    `${prefix}  <p class="profile-global-link"><a href="/ponderaciones#tabla-global">Ver también todas las ponderaciones</a></p>`,
    `${prefix}</section>`,
    `${prefix}${GENERATED_END}`,
  ].join('\n');
}

function renderNotice(university, baseIndent = '        ') {
  const prefix = baseIndent;
  const name = escapeHtml(university.name);
  return [
    `${prefix}<h2>Antes de decidir</h2>`,
    `${prefix}<form class="card" name="aviso-ponderaciones" method="POST" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="aviso-ponderaciones"><p hidden><label>No rellenes este campo si eres una persona<input name="bot-field"></label></p><input type="hidden" name="universidad" value="${name}"><div class="card-title">Avísame cuando se publiquen las ponderaciones</div><p>Esta ficha no publica ponderaciones, notas de corte ni requisitos de admisión. Deben contrastarse con la universidad y la convocatoria antes de elegir materias o valorar una matrícula.</p><div class="form-group"><label class="form-label" for="aviso-email">Tu correo electrónico</label><input class="form-input" id="aviso-email" type="email" name="email" autocomplete="email" required placeholder="tu@email.com"></div><div class="form-group"><label class="form-label"><input type="checkbox" name="consentimiento" required> Quiero que me avisen cuando se publiquen las ponderaciones 2026-2027 de esta universidad</label><p class="form-hint">Usaremos tu correo solo para este aviso. Consulta la <a href="/politica-privacidad">política de privacidad</a>.</p></div><button class="btn btn-primary" type="submit">Quiero recibir el aviso</button></form>`,
    `${prefix}<p class="profile-global-link"><a href="/ponderaciones#tabla-global">Ver también todas las ponderaciones</a></p>`,
  ].join('\n');
}

function statusLabel(university, hasRecords) {
  if (hasRecords) return 'Ponderaciones verificadas';
  if (university.status === 'blocked') return 'Fuente pendiente de acceso';
  return 'Ponderaciones pendientes';
}

function metaDescription(university, hasRecords) {
  if (hasRecords) return `Consulta las ponderaciones EvAU 2026-2027 de ${university.name} en ${university.region}: grados, campus, materias y coeficientes verificados.`;
  return `Ficha de ${university.name} en ${university.region}: estado de las ponderaciones EvAU 2026-2027 y acceso a la fuente oficial disponible.`;
}

function renderPublicProfile(data, university, records) {
  const hasRecords = records.length > 0;
  const ownSource = data.sources.find((item) => item.id === university.sourceId);
  const canonical = `https://miebau.es/ponderaciones/${university.id}`;
  const sourceLink = ownSource?.sourceUrl
    ? `<p>Consulta también la <a href="${escapeHtml(ownSource.sourceUrl)}" target="_blank" rel="noopener noreferrer">fuente oficial disponible</a>.</p>`
    : '';
  const decision = hasRecords ? renderVerifiedSection(data, university, records) : renderNotice(university);
  const scripts = hasRecords ? '  <script src="/js/ponderaciones.js?v=20260831-perfiles" defer></script>\n' : '';
  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://miebau.es/' },
      { '@type': 'ListItem', position: 2, name: 'Ponderaciones', item: 'https://miebau.es/ponderaciones' },
      { '@type': 'ListItem', position: 3, name: university.name, item: canonical },
    ],
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#5a43f2">
  <title>${escapeHtml(university.name)} · Ponderaciones 2026-2027 · Miebau</title>
  <meta name="description" content="${escapeHtml(metaDescription(university, hasRecords))}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css?v=20260831-perfiles">
  <script src="/js/site.js" defer></script>
${scripts}  <script type="application/ld+json">${breadcrumb}</script>
</head>
<body>
  <nav class="navbar" aria-label="Navegación principal"></nav>
  <main class="page">
    <header class="content-hero">
      <span class="eyebrow">${university.id.endsWith('-publicas') ? 'Cobertura pública regional' : 'Universidad pública'} · ${escapeHtml(university.region)}</span>
      <h1>${escapeHtml(university.name)}</h1>
      <p>Consulta el estado y, cuando están verificadas, las ponderaciones EvAU 2026-2027 publicadas para esta ficha.</p>
    </header>

    <section class="contact-grid profile-page-grid">
      <article class="card prose">
        <h2>Información de la ficha</h2>
        <p>${escapeHtml(university.scope)}</p>
        <p><strong>Estado:</strong> ${escapeHtml(statusLabel(university, hasRecords))}. Solo mostramos coeficientes cuando una fuente oficial permite verificar el curso y cada fila.</p>
${sourceLink ? `        ${sourceLink}\n` : ''}
${decision}
      </article>

      <aside class="card profile-sidebar">
        <div class="card-title">Datos de la ficha</div>
        <dl class="profile-facts">
          <div><dt>Universidad o cobertura</dt><dd>${escapeHtml(university.name)}</dd></div>
          <div><dt>Comunidad autónoma</dt><dd>${escapeHtml(university.region)}</dd></div>
          <div><dt>Modalidad</dt><dd>${escapeHtml(university.mode || 'Presencial')}</dd></div>
          <div><dt>Curso</dt><dd>2026-2027</dd></div>
        </dl>
        <a class="btn btn-primary" href="/ponderaciones#comunidades">Ver universidades por comunidad</a>
      </aside>
    </section>
  </main>
  <footer></footer>
</body>
</html>
`;
}

function replacePrivateDecisionBlock(html, section) {
  const generatedStart = html.indexOf(GENERATED_START);
  if (generatedStart !== -1) {
    const generatedEnd = html.indexOf(GENERATED_END, generatedStart);
    if (generatedEnd === -1) throw new Error('Bloque generado incompleto en ficha privada');
    return `${html.slice(0, generatedStart)}${section.trimStart()}${html.slice(generatedEnd + GENERATED_END.length)}`;
  }

  const heading = '        <h2>Antes de decidir</h2>';
  const start = html.indexOf(heading);
  if (start === -1) throw new Error('No se encontró el bloque “Antes de decidir” en ficha privada');
  const formEnd = html.indexOf('</form>', start);
  if (formEnd === -1) throw new Error('No se encontró el final del formulario en ficha privada');
  return `${html.slice(0, start)}${section}${html.slice(formEnd + '</form>'.length)}`;
}

function ensureProfileScript(html) {
  const withStyles = html.replace(/href="\/css\/style\.css(?:\?[^\"]*)?"/, 'href="/css/style.css?v=20260831-perfiles"');
  const withGrid = withStyles.replace('class="contact-grid"', 'class="contact-grid profile-page-grid"');
  if (withGrid.includes('/js/ponderaciones.js')) return withGrid;
  const siteScript = '  <script src="/js/site.js" defer></script>';
  return withGrid.replace(siteScript, `${siteScript}\n  <script src="/js/ponderaciones.js?v=20260831-perfiles" defer></script>`);
}

async function expectedFiles(data) {
  const files = [];
  for (const university of data.universities) {
    const records = recordsForUniversity(data, university.id);
    const filePath = path.join(PROFILE_DIR, `${university.id}.html`);
    if (university.type === 'public') {
      files.push({ filePath, content: renderPublicProfile(data, university, records) });
      continue;
    }
    if (!records.length) continue;
    const current = await readFile(filePath, 'utf8');
    const section = renderVerifiedSection(data, university, records);
    files.push({ filePath, content: ensureProfileScript(replacePrivateDecisionBlock(current, section)) });
  }
  return files;
}

async function main() {
  const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  const files = await expectedFiles(data);
  const checkOnly = process.argv.includes('--check');
  if (checkOnly) {
    for (const file of files) {
      const current = await readFile(file.filePath, 'utf8');
      if (current !== file.content) throw new Error(`${path.relative(ROOT, file.filePath)} no coincide con el generador`);
    }
  } else {
    await Promise.all(files.map((file) => writeFile(file.filePath, file.content, 'utf8')));
  }
  console.log(`OK: ${files.length} fichas generadas o verificadas.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

export { recordsForUniversity, renderPublicProfile, renderVerifiedSection };
