import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = path.join(ROOT, 'data', 'examenes-seo.json');
const OUTPUT_DIR = path.join(ROOT, 'examenes');
const PENDING = 'pendiente_de_verificar';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wordCount(value = '') {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateDistinctIntros(entries) {
  const sentences = new Map();
  const tenWordSequences = new Map();

  for (const entry of entries) {
    for (const sentence of entry.contenido.intro.split(/(?<=[.!?])\s+/)) {
      const normalized = normalizeText(sentence);
      if (!normalized) continue;
      const previous = sentences.get(normalized);
      assert(!previous, `Frase repetida en las prioridades ${previous} y ${entry.prioridad}`);
      sentences.set(normalized, entry.prioridad);
    }

    const words = normalizeText(entry.contenido.intro).split(/\s+/).filter(Boolean);
    for (let index = 0; index <= words.length - 10; index += 1) {
      const sequence = words.slice(index, index + 10).join(' ');
      const previous = tenWordSequences.get(sequence);
      assert(!previous, `Secuencia de 10 palabras repetida en las prioridades ${previous} y ${entry.prioridad}`);
      tenWordSequences.set(sequence, entry.prioridad);
    }
  }
}

function validateData(data) {
  assert(data && typeof data === 'object', 'El JSON raíz debe ser un objeto');
  assert(Array.isArray(data.sources) && data.sources.length === 11, 'El primer lote debe declarar 11 fuentes oficiales');
  assert(Array.isArray(data.entries) && data.entries.length === 10, 'El primer lote debe contener exactamente 10 fichas');
  assert(!JSON.stringify(data).includes('TODO'), 'No se permiten marcadores TODO');

  const sourceIds = new Set();
  for (const source of data.sources) {
    assert(source.id && !sourceIds.has(source.id), `Fuente duplicada o sin id: ${source.id || '(vacío)'}`);
    sourceIds.add(source.id);
    assert(source.status === 'verified', `La fuente ${source.id} no está verificada`);
    assert(/^https:\/\/(?:www\.)?(?:um\.es|carm\.es)\//.test(source.sourceUrl), `La fuente ${source.id} no apunta a un dominio oficial murciano`);
    assert(source.period === 'PAU 2026', `Periodo inesperado en ${source.id}`);
  }

  const unique = {
    priority: new Set(),
    slug: new Set(),
    url: new Set(),
    title: new Set(),
    h1: new Set(),
    description: new Set(),
  };

  for (const entry of data.entries) {
    assert(Number.isInteger(entry.prioridad) && entry.prioridad >= 1 && entry.prioridad <= 10, `Prioridad inválida: ${entry.prioridad}`);
    assert(!unique.priority.has(entry.prioridad), `Prioridad duplicada: ${entry.prioridad}`);
    unique.priority.add(entry.prioridad);
    assert(/^region-de-murcia\/[a-z0-9-]+$/.test(entry.slug), `Slug inválido: ${entry.slug}`);
    assert(entry.url === `/examenes/${entry.slug}`, `URL incoherente para ${entry.slug}`);
    assert(entry.estado_datos === 'estructura_verificada', `Estado no verificado en ${entry.slug}`);
    assert(entry.indexacion === 'noindex', `La ficha ${entry.slug} debe permanecer en noindex`);
    assert(entry.widget_embed_url === PENDING, `El widget de ${entry.slug} todavía debe estar pendiente`);

    for (const [field, value] of [
      ['slug', entry.slug],
      ['url', entry.url],
      ['title', entry.seo?.title],
      ['h1', entry.seo?.h1],
      ['description', entry.seo?.meta_description],
    ]) {
      assert(value && !unique[field].has(value), `${field} vacío o duplicado en ${entry.slug}`);
      unique[field].add(value);
    }

    const introWords = wordCount(entry.contenido?.intro);
    assert(introWords >= 150 && introWords <= 200, `La introducción de ${entry.slug} tiene ${introWords} palabras`);

    const details = entry.contenido?.datos_comunidad_asignatura;
    assert(details?.curso_referencia === 'PAU 2026', `Curso incorrecto en ${entry.slug}`);
    assert(details.duracion_minutos === 90, `Duración no verificada en ${entry.slug}`);
    assert(details.modelo_examen_vigente && details.modelo_examen_vigente !== PENDING, `Falta el modelo de ${entry.slug}`);
    assert(details.numero_ejercicios && details.numero_ejercicios !== PENDING, `Falta el número de ejercicios de ${entry.slug}`);
    assert(Array.isArray(details.bloques_o_temario_destacado) && details.bloques_o_temario_destacado.length > 0, `Faltan bloques en ${entry.slug}`);
    assert(details.notas_especificas && details.notas_especificas !== PENDING, `Faltan notas verificadas en ${entry.slug}`);
    assert(details.ponderaciones_2026_2027 === PENDING, `No deben inventarse ponderaciones en ${entry.slug}`);
    assert(details.num_convocatorias_disponibles === PENDING, `No debe inventarse el número de convocatorias en ${entry.slug}`);

    assert(Array.isArray(entry.source_ids) && entry.source_ids.length === 2, `Cada ficha debe tener dos fuentes en ${entry.slug}`);
    assert(entry.source_ids[0] === 'murcia-pau-2026-general', `Falta la fuente general de duración en ${entry.slug}`);
    assert(entry.source_ids.every((id) => sourceIds.has(id)), `Referencia de fuente inexistente en ${entry.slug}`);
    assert(entry.source_ids[1] !== 'murcia-pau-2026-general', `Falta la fuente específica de ${entry.slug}`);
  }

  assert([...unique.priority].sort((a, b) => a - b).join(',') === '1,2,3,4,5,6,7,8,9,10', 'Las prioridades deben ser exactamente 1-10');
  validateDistinctIntros(data.entries);
  return data;
}

function renderBreadcrumb(entry) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://miebau.es/' },
      { '@type': 'ListItem', position: 2, name: 'Exámenes', item: 'https://miebau.es/examenes' },
      { '@type': 'ListItem', position: 3, name: `${entry.asignatura} · ${entry.comunidad}`, item: `https://miebau.es${entry.url}` },
    ],
  }).replace(/</g, '\\u003c');
}

function renderBlocks(blocks) {
  return blocks.map((block) => `              <li>${escapeHtml(block)}</li>`).join('\n');
}

function renderSources(data, entry) {
  return entry.source_ids.map((sourceId) => {
    const source = data.sources.find((item) => item.id === sourceId);
    return [
      '            <li>',
      `              <a href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`,
      `              <span class="source-status source-status-verified">Fuente oficial verificada · ${escapeHtml(source.period)}</span>`,
      `              <p>${escapeHtml(source.scope)}</p>`,
      '            </li>',
    ].join('\n');
  }).join('\n');
}

function renderProfile(data, entry) {
  const details = entry.contenido.datos_comunidad_asignatura;
  const canonical = `https://miebau.es${entry.url}`;
  const officialName = entry.nombre_oficial_vigente && entry.nombre_oficial_vigente !== entry.asignatura
    ? `\n        <p><strong>Denominación oficial vigente:</strong> ${escapeHtml(entry.nombre_oficial_vigente)}.</p>`
    : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#5a43f2">
  <meta name="robots" content="noindex,follow">
  <title>${escapeHtml(entry.seo.title)}</title>
  <meta name="description" content="${escapeHtml(entry.seo.meta_description)}">
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
      <span class="eyebrow">Estructura oficial · ${escapeHtml(details.curso_referencia)}</span>
      <h1>${escapeHtml(entry.seo.h1)}</h1>
      <p>Formato, duración y criterios comprobados en documentación oficial del Distrito Universitario de la Región de Murcia.</p>
    </header>

    <section class="contact-grid profile-page-grid">
      <article class="card prose">
        <h2>Cómo es el examen</h2>
        <p>${escapeHtml(entry.contenido.intro)}</p>${officialName}

        <h2>Estructura verificada para 2026</h2>
        <dl class="profile-facts">
          <div><dt>Duración</dt><dd>${details.duracion_minutos} minutos</dd></div>
          <div><dt>Ejercicios</dt><dd>${escapeHtml(details.numero_ejercicios)}</dd></div>
          <div><dt>Modelo</dt><dd>${escapeHtml(details.modelo_examen_vigente)}</dd></div>
        </dl>

        <h3>Bloques y puntuación</h3>
        <ul>
${renderBlocks(details.bloques_o_temario_destacado)}
        </ul>
        <p><strong>Indicaciones específicas:</strong> ${escapeHtml(details.notas_especificas)}</p>

        <h2>Fuentes oficiales</h2>
        <p>La duración se contrasta con la información general PAU 2026 y la estructura con el documento específico de la materia.</p>
        <ul class="profile-source-list">
${renderSources(data, entry)}
        </ul>

        <h2>Exámenes y ponderaciones</h2>
        <p><strong>Banco de exámenes:</strong> la integración del visor externo permanece pendiente de verificar, por lo que todavía no se incrusta ningún widget.</p>
        <p><strong>Ponderaciones 2026-2027:</strong> pendiente de verificar. Esta ficha no asigna coeficientes hasta disponer de una tabla oficial comprobada para la Región de Murcia.</p>
        <p class="profile-global-link"><a href="/examenes">Ver todos los exámenes</a> · <a href="/ponderaciones#comunidades">Consultar ponderaciones por comunidad</a></p>
      </article>

      <aside class="card profile-sidebar">
        <div class="card-title">Datos de la ficha</div>
        <dl class="profile-facts">
          <div><dt>Comunidad autónoma</dt><dd>${escapeHtml(entry.comunidad)}</dd></div>
          <div><dt>Asignatura</dt><dd>${escapeHtml(entry.nombre_oficial_vigente || entry.asignatura)}</dd></div>
          <div><dt>Referencia</dt><dd>${escapeHtml(details.curso_referencia)}</dd></div>
          <div><dt>Indexación</dt><dd>Vista previa · no indexable</dd></div>
        </dl>
        <span class="source-status source-status-verified">Estructura verificada</span>
        <a class="btn btn-primary" href="/examenes">Volver a Exámenes</a>
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

async function expectedFiles(data) {
  return data.entries.map((entry) => ({
    filePath: outputPathFor(entry),
    content: renderProfile(data, entry),
  }));
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

  console.log(`OK: ${files.length} fichas de exámenes generadas o verificadas.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

export { expectedFiles, outputPathFor, renderProfile, validateData, wordCount };
