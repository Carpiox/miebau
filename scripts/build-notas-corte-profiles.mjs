import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = path.join(ROOT, 'data', 'notas-corte-2026.json');
const OUTPUT_DIR = path.join(ROOT, 'notas-de-corte');
const HUB_PATH = path.join(ROOT, 'notas-de-corte.html');
const LATEST_START = '<!-- notas-corte-latest:generated:start -->';
const LATEST_END = '<!-- notas-corte-latest:generated:end -->';
const CUTOFF_DATA_START = '<!-- notas-corte-cutoff-data:generated:start -->';
const CUTOFF_DATA_END = '<!-- notas-corte-cutoff-data:generated:end -->';
const COVERAGE_START = '<!-- notas-corte-coverage:generated:start -->';
const COVERAGE_END = '<!-- notas-corte-coverage:generated:end -->';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function formatNota(value) {
  return Number(value).toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function displayDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function validateData(data) {
  assert(data && typeof data === 'object', 'El JSON raíz debe ser un objeto');
  assert(Array.isArray(data.sources), 'sources debe ser un array');
  assert(Array.isArray(data.entries), 'entries debe ser un array');
  assert(!JSON.stringify(data).includes('TODO'), 'No se permiten marcadores TODO');

  const sourceIds = new Set();
  for (const source of data.sources) {
    assert(source.id && !sourceIds.has(source.id), `Fuente duplicada o sin id: ${source.id || '(vacío)'}`);
    sourceIds.add(source.id);
    assert(source.status === 'verified', `La fuente ${source.id} no está verificada`);
    assert(/^https:\/\//.test(source.sourceUrl || ''), `La fuente ${source.id} no tiene una URL https:// válida`);
    assert(source.name, `La fuente ${source.id} necesita un nombre`);
  }

  const slugs = new Set();
  const priorities = new Set();
  for (const entry of data.entries) {
    assert(/^[a-z0-9-]+$/.test(entry.slug || ''), `Slug inválido: ${entry.slug}`);
    assert(!slugs.has(entry.slug), `Slug duplicado: ${entry.slug}`);
    slugs.add(entry.slug);
    assert(entry.url === `/notas-de-corte/${entry.slug}`, `URL incoherente para ${entry.slug}`);
    assert(Number.isInteger(entry.prioridad) && entry.prioridad >= 1, `Prioridad inválida en ${entry.slug}`);
    assert(!priorities.has(entry.prioridad), `Prioridad duplicada: ${entry.prioridad}`);
    priorities.add(entry.prioridad);
    assert(entry.grado, `Falta el grado en ${entry.slug}`);
    assert(entry.universidad, `Falta la universidad en ${entry.slug}`);
    assert(entry.comunidad, `Falta la comunidad en ${entry.slug}`);
    assert(entry.curso, `Falta el curso en ${entry.slug}`);
    assert(entry.turno, `Falta el turno/cupo en ${entry.slug}`);
    const nota = Number(entry.nota);
    assert(Number.isFinite(nota) && nota > 0 && nota <= 14, `Nota de corte fuera de rango en ${entry.slug}: ${entry.nota}`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.checkedAt || ''), `checkedAt inválido en ${entry.slug}`);
    assert(entry.sourceId && sourceIds.has(entry.sourceId), `sourceId inexistente o no verificado en ${entry.slug}`);
  }

  return data;
}

function renderBreadcrumb(entry) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://miebau.es/' },
      { '@type': 'ListItem', position: 2, name: 'Notas de corte', item: 'https://miebau.es/notas-de-corte' },
      { '@type': 'ListItem', position: 3, name: `${entry.grado} · ${entry.universidad}`, item: `https://miebau.es${entry.url}` },
    ],
  }).replace(/</g, '\\u003c');
}

function cupoNote(turno) {
  const isSegundoPlazo = turno.includes('2º plazo');
  const isNoPrioritariaFP = turno.includes('no prioritaria de FP');
  if (!isSegundoPlazo && !isNoPrioritariaFP) return '';
  if (isSegundoPlazo && isNoPrioritariaFP) {
    return ' <strong>Importante:</strong> este dato corresponde al segundo plazo de preinscripción y a la opción no prioritaria de Formación Profesional, no a la nota de corte ordinaria del cupo general en primer plazo.';
  }
  if (isSegundoPlazo) {
    return ' <strong>Importante:</strong> este dato corresponde al segundo plazo de preinscripción, no a la nota de corte ordinaria del cupo general en primer plazo (que la fuente oficial no publicó sin esa anotación para este grado).';
  }
  return ' <strong>Importante:</strong> este dato corresponde a la opción no prioritaria de Formación Profesional dentro del cupo general.';
}

function renderProfile(data, entry) {
  const source = data.sources.find((item) => item.id === entry.sourceId);
  const canonical = `https://miebau.es${entry.url}`;
  const title = `Nota de corte ${escapeHtml(entry.grado)} en ${escapeHtml(entry.universidad)} · Miebau`;
  const description = `${entry.grado} en ${entry.universidad} (${entry.comunidad}): nota de corte ${formatNota(entry.nota)} en el cupo ${entry.turno}, curso ${entry.curso}. Fuente oficial verificada.`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#5a43f2">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/site.js" defer></script>
  <script type="application/ld+json">${renderBreadcrumb(entry)}</script>
</head>
<body>
  <nav class="navbar" aria-label="Navegación principal"></nav>
  <main class="page">
    <header class="content-hero">
      <span class="eyebrow">Nota de corte verificada · ${escapeHtml(entry.curso)}</span>
      <h1>${escapeHtml(entry.grado)} en ${escapeHtml(entry.universidad)}</h1>
      <p>Nota de corte del cupo ${escapeHtml(entry.turno)} en ${escapeHtml(entry.comunidad)}, verificada con fuente oficial.</p>
    </header>

    <section class="contact-grid profile-page-grid">
      <article class="card prose">
        <h2>Nota de corte</h2>
        <dl class="profile-facts">
          <div><dt>Nota de corte</dt><dd>${formatNota(entry.nota)}</dd></div>
          <div><dt>Cupo</dt><dd>${escapeHtml(entry.turno)}</dd></div>
          <div><dt>Curso</dt><dd>${escapeHtml(entry.curso)}</dd></div>
        </dl>
        <p>Recuerda que la nota de corte es un dato retrospectivo: la marcó el último estudiante admitido el curso citado, no un mínimo fijado de antemano. Sirve como referencia, no como garantía para el curso siguiente.${cupoNote(entry.turno)}</p>

        <h2>Fuente oficial</h2>
        <ul class="profile-source-list">
          <li>
            <a href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>
            <span class="source-status source-status-verified">Fuente oficial verificada · Comprobado el ${escapeHtml(displayDate(entry.checkedAt))}</span>
          </li>
        </ul>

        <p class="profile-global-link"><a href="/notas-de-corte">Ver todas las notas de corte</a> · <a href="/calculadora">Calcular mi nota</a></p>
      </article>

      <aside class="card profile-sidebar">
        <div class="card-title">Datos de la ficha</div>
        <dl class="profile-facts">
          <div><dt>Universidad</dt><dd>${escapeHtml(entry.universidad)}</dd></div>
          <div><dt>Comunidad autónoma</dt><dd>${escapeHtml(entry.comunidad)}</dd></div>
          <div><dt>Grado</dt><dd>${escapeHtml(entry.grado)}</dd></div>
        </dl>
        <span class="source-status source-status-verified">Verificado</span>
        <a class="btn btn-primary" href="/notas-de-corte">Volver a Notas de corte</a>
      </aside>
    </section>
  </main>
  <footer></footer>
</body>
</html>
`;
}

function outputPathFor(entry) {
  return path.join(OUTPUT_DIR, `${entry.slug}.html`);
}

function renderLatestSection(entries) {
  const latest = [...entries].sort((left, right) => right.prioridad - left.prioridad).slice(0, 20);

  const content = latest.length
    ? `<div class="exam-list">${latest.map((entry) => `
        <article class="exam-row" data-checked-at="${escapeHtml(entry.checkedAt)}">
          <div class="exam-icon" aria-hidden="true">📊</div>
          <div class="exam-info">
            <div class="exam-title">${escapeHtml(entry.grado)}</div>
            <div class="exam-meta">${escapeHtml(entry.universidad)} · ${escapeHtml(entry.comunidad)} · ${formatNota(entry.nota)}</div>
          </div>
          <a class="exam-link" href="${escapeHtml(entry.url)}">Ver ficha →</a>
        </article>`).join('')}
      </div>`
    : '<p class="catalog-empty-state">Todavía no hay notas de corte verificadas publicadas. Iremos añadiendo universidades a medida que verifiquemos cada fuente oficial — sin datos inventados ni de relleno.</p>';

  return `${LATEST_START}
    <section class="card" aria-labelledby="latestCutoffsTitle" style="margin-top: 0.5rem;">
      <h2 class="card-title" id="latestCutoffsTitle">Últimas notas de corte publicadas</h2>
      ${content}
    </section>
    ${LATEST_END}`;
}

function renderCutoffDataScript(entries) {
  const payload = entries.map((entry) => ({
    grado: entry.grado,
    universidad: entry.universidad,
    comunidad: entry.comunidad,
    nota: entry.nota,
    curso: entry.curso,
    turno: entry.turno,
    url: entry.url,
  }));
  return `${CUTOFF_DATA_START}
  <script>window.MIEBAU_CUTOFF_DATA = ${JSON.stringify(payload)};</script>
  ${CUTOFF_DATA_END}`;
}

function replaceGeneratedBlock(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  if (start === -1) return null;
  const end = source.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Bloque generado incompleto: ${startMarker}`);
  return `${source.slice(0, start)}${replacement}${source.slice(end + endMarker.length)}`;
}

function renderCoverageLabel(entries) {
  const label = `${entries.length} ${entries.length === 1 ? 'nota de corte publicada' : 'notas de corte publicadas'}`;
  return `${COVERAGE_START}${label}${COVERAGE_END}`;
}

function renderHub(source, data) {
  const withLatest = replaceGeneratedBlock(source, LATEST_START, LATEST_END, renderLatestSection(data.entries));
  assert(withLatest !== null, `Falta el marcador ${LATEST_START} en notas-de-corte.html`);
  const withData = replaceGeneratedBlock(withLatest, CUTOFF_DATA_START, CUTOFF_DATA_END, renderCutoffDataScript(data.entries));
  assert(withData !== null, `Falta el marcador ${CUTOFF_DATA_START} en notas-de-corte.html`);
  const withCoverage = replaceGeneratedBlock(withData, COVERAGE_START, COVERAGE_END, renderCoverageLabel(data.entries));
  assert(withCoverage !== null, `Falta el marcador ${COVERAGE_START} en notas-de-corte.html`);
  return withCoverage;
}

async function expectedFiles(data) {
  const files = data.entries.map((entry) => ({
    filePath: outputPathFor(entry),
    content: renderProfile(data, entry),
  }));
  const hubSource = await readFile(HUB_PATH, 'utf8');
  files.push({ filePath: HUB_PATH, content: renderHub(hubSource, data) });
  return files;
}

async function main() {
  const data = validateData(JSON.parse(await readFile(DATA_PATH, 'utf8')));
  const files = await expectedFiles(data);
  const checkOnly = process.argv.includes('--check');

  if (checkOnly) {
    for (const file of files) {
      let current;
      try {
        current = await readFile(file.filePath, 'utf8');
      } catch {
        throw new Error(`${path.relative(ROOT, file.filePath)} no existe`);
      }
      if (current !== file.content) throw new Error(`${path.relative(ROOT, file.filePath)} no coincide con el generador`);
    }
  } else {
    for (const file of files) {
      await mkdir(path.dirname(file.filePath), { recursive: true });
      await writeFile(file.filePath, file.content, 'utf8');
    }
  }

  console.log(`OK: ${data.entries.length} fichas de notas de corte y el hub generados o verificados.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

export { expectedFiles, formatNota, outputPathFor, renderHub, renderLatestSection, renderProfile, validateData };
