import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = path.join(ROOT, 'data', 'ponderaciones-2026-2027.json');
const PROFILE_DIR = path.join(ROOT, 'ponderaciones');
const GENERATED_START = '<!-- ponderaciones-profile:generated:start -->';
const GENERATED_END = '<!-- ponderaciones-profile:generated:end -->';
const FAQ_START = '<!-- ponderaciones-faq:generated:start -->';
const FAQ_END = '<!-- ponderaciones-faq:generated:end -->';
const FAQ_JSON_LD_START = '<!-- ponderaciones-faq-jsonld:generated:start -->';
const FAQ_JSON_LD_END = '<!-- ponderaciones-faq-jsonld:generated:end -->';

const FIXED_FAQS = [
  {
    question: '¿Qué es una ponderación en la EvAU/PAU?',
    answer: 'Es el coeficiente (0,1 o 0,2 según la universidad y la titulación) que se aplica a la nota de una materia de modalidad examinada en la fase voluntaria de la EvAU. Sirve para calcular la nota de admisión a un grado concreto, no la nota de acceso general.',
  },
  {
    question: '¿Cómo se calcula mi nota de admisión con la ponderación?',
    answer: 'Nota de admisión = nota de acceso (0-10, resultado de la fase general y el expediente) + (a × M1) + (b × M2), donde M1 y M2 son las notas de hasta dos materias de modalidad examinadas y a, b son sus coeficientes de ponderación. Solo cuentan las materias con nota igual o superior a 5.',
  },
];

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

function uniqueHighWeightSubjects(records) {
  const subjects = [];
  const seen = new Set();
  for (const record of records) {
    if (record.coefficient !== 0.2 || seen.has(record.subject)) continue;
    seen.add(record.subject);
    subjects.push(record.subject);
  }
  return subjects;
}

function degreeWithMostRecords(records) {
  const groups = new Map();
  for (const record of records) {
    if (!groups.has(record.degree)) groups.set(record.degree, []);
    groups.get(record.degree).push(record);
  }
  let selected = null;
  for (const [degree, degreeRecords] of groups) {
    if (!selected || degreeRecords.length > selected.records.length) {
      selected = { degree, records: degreeRecords };
    }
  }
  return selected;
}

function buildFaqEntries(university, records) {
  const entries = FIXED_FAQS.map((entry) => ({ ...entry }));
  if (!records.length) {
    entries.push({
      question: `¿Cuándo se publicarán las ponderaciones de ${university.name}?`,
      answer: `Todavía no hay una fecha oficial confirmada para la publicación de las ponderaciones de ${university.name}. Puedes solicitar un aviso en el formulario de esta ficha.`,
      noticeLink: true,
    });
    return entries;
  }

  const highWeightSubjects = uniqueHighWeightSubjects(records);
  if (highWeightSubjects.length) {
    entries.push({
      question: `¿Qué materias dan más nota en ${university.name}?`,
      answer: `Las materias con coeficiente 0,2 publicadas para ${university.name} son: ${highWeightSubjects.join(', ')}.`,
    });
  }

  const selectedDegree = degreeWithMostRecords(records);
  if (selectedDegree) {
    const weights = selectedDegree.records
      .map((record) => `${record.subject}: ${coefficientText(record.coefficient)}`)
      .join('; ');
    entries.push({
      question: `¿Qué ponderación tiene cada materia para estudiar ${selectedDegree.degree} en ${university.name}?`,
      answer: `Para estudiar ${selectedDegree.degree} en ${university.name}, las ponderaciones publicadas son: ${weights}.`,
    });
  }

  return entries;
}

function faqJsonLd(entries) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  }).replace(/</g, '\\u003c');
}

function renderFaqJsonLd(entries, baseIndent = '  ') {
  return [
    `${baseIndent}${FAQ_JSON_LD_START}`,
    `${baseIndent}<script type="application/ld+json" id="profileFaqJsonLd">${faqJsonLd(entries)}</script>`,
    `${baseIndent}${FAQ_JSON_LD_END}`,
  ].join('\n');
}

function renderFaqAnswer(entry) {
  const answer = escapeHtml(entry.answer);
  if (!entry.noticeLink) return answer;
  const linkText = 'formulario de esta ficha';
  return answer.replace(linkText, `<a href="#aviso-email">${linkText}</a>`);
}

function renderFaqSection(entries, baseIndent = '        ') {
  const prefix = baseIndent;
  const items = entries.flatMap((entry) => [
    `${prefix}    <div class="profile-faq-item">`,
    `${prefix}      <h3>${escapeHtml(entry.question)}</h3>`,
    `${prefix}      <p>${renderFaqAnswer(entry)}</p>`,
    `${prefix}    </div>`,
  ]);
  return [
    `${prefix}${FAQ_START}`,
    `${prefix}<section class="profile-faq" aria-labelledby="profileFaqTitle">`,
    `${prefix}  <h2 id="profileFaqTitle">Preguntas frecuentes sobre ponderaciones</h2>`,
    `${prefix}  <div class="profile-faq-list">`,
    ...items,
    `${prefix}  </div>`,
    `${prefix}</section>`,
    `${prefix}${FAQ_END}`,
  ].join('\n');
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
  const faqEntries = buildFaqEntries(university, records);
  const faqSection = renderFaqSection(faqEntries);
  const faqSchema = renderFaqJsonLd(faqEntries);
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
${faqSchema}
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
${faqSection}
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

function replaceGeneratedBlock(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  if (start === -1) return null;
  const end = html.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Bloque generado incompleto: ${startMarker}`);
  return `${html.slice(0, start)}${replacement}${html.slice(end + endMarker.length)}`;
}

function upsertPrivateFaqSection(html, section) {
  const replaced = replaceGeneratedBlock(html, FAQ_START, FAQ_END, section.trim());
  if (replaced !== null) return replaced;
  const articleEnd = html.indexOf('      </article>');
  if (articleEnd === -1) throw new Error('No se encontró el final del contenido principal en ficha privada');
  return `${html.slice(0, articleEnd)}\n${section}\n${html.slice(articleEnd)}`;
}

function upsertPrivateFaqJsonLd(html, schema) {
  const replaced = replaceGeneratedBlock(html, FAQ_JSON_LD_START, FAQ_JSON_LD_END, schema.trim());
  if (replaced !== null) return replaced;
  const headEnd = html.indexOf('</head>');
  if (headEnd === -1) throw new Error('No se encontró el final de head en ficha privada');
  return `${html.slice(0, headEnd)}${schema}\n${html.slice(headEnd)}`;
}

async function expectedFiles(data) {
  const files = [];
  for (const university of data.universities) {
    const records = recordsForUniversity(data, university.id);
    const faqEntries = buildFaqEntries(university, records);
    const filePath = path.join(PROFILE_DIR, `${university.id}.html`);
    if (university.type === 'public') {
      files.push({ filePath, content: renderPublicProfile(data, university, records) });
      continue;
    }
    const current = await readFile(filePath, 'utf8');
    const withDecision = records.length
      ? ensureProfileScript(replacePrivateDecisionBlock(current, renderVerifiedSection(data, university, records)))
      : current;
    const withFaq = upsertPrivateFaqSection(withDecision, renderFaqSection(faqEntries));
    const withSchema = upsertPrivateFaqJsonLd(withFaq, renderFaqJsonLd(faqEntries));
    files.push({ filePath, content: withSchema });
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

export { buildFaqEntries, recordsForUniversity, renderPublicProfile, renderVerifiedSection };
