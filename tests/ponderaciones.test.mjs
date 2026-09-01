import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { validateFixture } from '../scripts/build-ponderaciones-data.mjs';
import { buildFaqEntries, classifyUniversityCoverage, recordsForUniversity } from '../scripts/build-ponderaciones-profiles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const api = require(path.join(ROOT, 'js', 'ponderaciones.js'));
const fixture = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'fixtures', 'ponderaciones-2026-2027.source.json'), 'utf8'));
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'ponderaciones-2026-2027.json'), 'utf8'));
const html = readFileSync(path.join(ROOT, 'ponderaciones.html'), 'utf8');
const css = readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const jsPath = path.join(ROOT, 'js', 'ponderaciones.js');
const profileBuildPath = path.join(ROOT, 'scripts', 'build-ponderaciones-profiles.mjs');
const redirects = readFileSync(path.join(ROOT, '_redirects'), 'utf8');
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const records = api.flattenRows(data);
const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function visibleText(fragment) {
  return fragment
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function degreeRowsForUniversity(universityId) {
  return data.datasets.flatMap((dataset) => dataset.rows).filter((row) => row.universityIds.includes(universityId));
}

test('1. JavaScript válido', () => {
  const result = spawnSync(process.execPath, ['--check', jsPath], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const profileResult = spawnSync(process.execPath, ['--check', profileBuildPath], { encoding: 'utf8' });
  assert.equal(profileResult.status, 0, profileResult.stderr);
});

test('2. build reproducible y actualizado', () => {
  const result = spawnSync(process.execPath, ['scripts/build-ponderaciones-data.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const profilesResult = spawnSync(process.execPath, ['scripts/build-ponderaciones-profiles.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(profilesResult.status, 0, `${profilesResult.stdout}\n${profilesResult.stderr}`);
});

test('3. referencias JSON válidas', () => {
  const maps = validateFixture(fixture);
  assert.equal(maps.sources.size, 23);
  assert.equal(maps.universities.size, 82);
  assert.equal(maps.datasets.size, 4);
});

test('4. matriz de cobertura y estados honesta', () => {
  assert.equal(data.summary.verifiedSourceCount, 4);
  assert.equal(data.summary.pendingSourceCount, 11);
  assert.equal(data.summary.blockedSourceCount, 8);
  assert.equal(data.summary.privateUniversityCount, 46);
});

test('5. curso 2026-2027 sin contaminación', () => {
  assert.equal(data.period, '2026-2027');
  const serializedDatasets = JSON.stringify(data.datasets);
  assert(!serializedDatasets.includes('2025-2026'));
  assert(!serializedDatasets.includes('2027-2028'));
});

test('6. solo coeficientes 0,1 y 0,2', () => {
  assert(records.length > 8000);
  assert(records.every((record) => record.coefficient === 0.1 || record.coefficient === 0.2));
});

test('7. grados, materias y universidades no vacíos', () => {
  assert(records.every((record) => record.degree && record.subject && record.universityIds.length));
});

test('8. materias normalizadas no duplicadas por dataset ni fila', () => {
  data.datasets.forEach((dataset) => {
    const subjects = dataset.subjects.map(api.normalizeText);
    assert.equal(new Set(subjects).size, subjects.length);
    dataset.rows.forEach((row) => {
      const rowSubjects = row.weights.map((weight) => api.normalizeText(weight.subject));
      assert.equal(new Set(rowSubjects).size, rowSubjects.length);
    });
  });
});

test('9. datasets compartidos se referencian sin duplicarse', () => {
  assert.equal(data.datasets.filter((dataset) => dataset.sourceId === 'cataluna').length, 1);
  assert.equal(data.datasets.filter((dataset) => dataset.sourceId === 'comunidad-valenciana').length, 1);
  assert(data.datasets.find((dataset) => dataset.id === 'cataluna-2026-2027').rows.some((row) => row.universityIds.length > 1));
  assert(data.datasets.find((dataset) => dataset.id === 'comunidad-valenciana-2026-2027').rows.some((row) => row.universityIds.length === 5));
  const privateWithData = data.universities.filter((item) => item.type === 'private' && item.datasetId).map((item) => item.id).sort();
  assert.deepEqual(privateWithData, ['uvic-ucc']);
});

test('10. búsqueda tolerante a tildes', () => {
  const found = api.filterRows(records, { datasetId: 'aragon-2026-2027', query: 'biotecnologia', universityId: '', onlyHigh: false });
  assert(found.length > 0);
  assert(found.some((record) => record.degree.includes('Biotecnología')));
});

test('11. filtro solo 0,2', () => {
  const found = api.filterRows(records, { datasetId: 'islas-baleares-2026-2027', query: '', universityId: '', onlyHigh: true });
  assert(found.length > 0);
  assert(found.every((record) => record.coefficient === 0.2));
});

test('12. CSV respeta formato español y Excel', () => {
  const csv = api.buildCsv(records.slice(0, 3));
  assert(csv.startsWith('\uFEFFUniversidad;Grado;Código;Campus;Centro;Materia;Coeficiente;Fuente;Periodo'));
  assert(csv.includes(';0,2;'));
  assert(csv.endsWith('\r\n'));
});

test('13. estado sin resultados', () => {
  const found = api.filterRows(records, { datasetId: 'aragon-2026-2027', query: 'resultado imposible zzz 999', universityId: '', onlyHigh: false });
  assert.deepEqual(found, []);
  assert(html.includes('No hay ponderaciones que coincidan') || readFileSync(jsPath, 'utf8').includes('No hay ponderaciones que coincidan'));
});

test('14. controles accesibles y usables con teclado', () => {
  for (const id of ['datasetFilter', 'tableUniversityFilter', 'tableSearch', 'onlyHighWeights', 'clearTableFilters', 'downloadTableCsv']) {
    assert(html.includes(`id="${id}"`), `Falta ${id}`);
  }
  assert(html.includes('aria-live="polite"'));
  assert(html.includes('tabindex="0"'));
  assert(html.includes('<caption>'));
  assert(html.includes('<thead>') && html.includes('<tbody id="ponderacionesTableBody">'));
});

test('14b. la tabla global conserva HTML inicial pero empieza cerrada', () => {
  const opening = html.match(/<details[^>]*id="globalTableDetails"[^>]*>/);
  assert(opening, 'Falta el contenedor details de la tabla global');
  assert(!/\sopen(?:\s|=|>)/.test(opening[0]), 'La tabla global no debe aparecer abierta por defecto');
  const details = html.slice(opening.index, html.indexOf('</details>', opening.index) + '</details>'.length);
  assert(details.includes('<summary>Ver ejemplo de la tabla global</summary>'));
  assert(details.includes('id="ponderacionesApp"'));
  assert.equal((details.match(/<tbody id="ponderacionesTableBody">[\s\S]*?<\/tbody>/)?.[0].match(/<tr>/g) || []).length, 5);
});

test('15. móvil con scroll horizontal y primera columna sticky', () => {
  assert(/\.ponderaciones-table-scroll\s*\{[^}]*overflow:auto/.test(css));
  assert(/\.ponderaciones-table tbody th\s*\{[^}]*position:sticky[^}]*left:0/.test(css));
  assert(css.includes('@media (max-width:760px)'));
  assert(css.includes('.profile-page-grid > *,.profile-ponderaciones,.profile-table-card { min-width:0; }'));
  assert(css.includes('.profile-table-card .ponderaciones-table-scroll { max-width:100%; }'));
});

test('16. escritorio con cabecera sticky y ancho estable', () => {
  assert(/\.ponderaciones-table thead th\s*\{[^}]*position:sticky/.test(css));
  assert(/\.ponderaciones-table\s*\{[^}]*min-width:940px/.test(css));
  assert(/max-height:68vh/.test(css));
});

test('17. contenido útil y tabla real sin JavaScript', () => {
  const staticBody = html.match(/<tbody id="ponderacionesTableBody">([\s\S]*?)<\/tbody>/);
  assert(staticBody);
  assert.equal((staticBody[1].match(/<tr>/g) || []).length, 5);
  assert(html.includes('Actualizado 2026-2027 · Fuente oficial'));
  assert(html.includes('Ver PDF oficial'));
  assert(html.includes('<noscript>'));
});

test('18. sin spinner ni contador transitorio a cero', () => {
  assert(!/spinner/i.test(html));
  assert(!html.includes('0 documentos'));
  assert(html.includes('17 comunidades'));
});

test('19. enlaces oficiales y periodo presentes', () => {
  data.sources.filter((source) => source.status === 'verified').forEach((source) => {
    assert(source.sourceUrl.startsWith('https://'));
    assert(source.validFor.includes('2026'));
    assert(source.datasetId);
  });
});

test('20. alcance de archivos respetado', () => {
  const trackedResult = spawnSync('git', ['diff', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  const untrackedResult = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(trackedResult.status, 0, trackedResult.stderr);
  assert.equal(untrackedResult.status, 0, untrackedResult.stderr);
  const changed = [...new Set(`${trackedResult.stdout}\n${untrackedResult.stdout}`.trim().split(/\r?\n/).filter(Boolean).map((item) => item.replace(/\\/g, '/')))];
  const allowed = new Set([
    '_redirects',
    'ponderaciones.html',
    'js/ponderaciones.js',
    'css/style.css',
    'scripts/build-ponderaciones-data.mjs',
    'scripts/build-ponderaciones-profiles.mjs',
    'scripts/fixtures/ponderaciones-2026-2027.source.json',
    'data/ponderaciones-2026-2027.json',
    'reports/ponderaciones-coverage.md',
    'tests/ponderaciones.test.mjs',
    'sitemap.xml',
    ...data.universities.map((item) => `ponderaciones/${item.id}.html`)
  ]);
  assert(changed.every((item) => allowed.has(item)), `Archivo fuera de alcance: ${changed.find((item) => !allowed.has(item))}`);
  assert(!changed.some((item) => item === 'examenes.html'));
  allowed.forEach((item) => assert(readFileSync(path.join(ROOT, item)).length > 0, `Falta el archivo requerido: ${item}`));
});

test('21. existen 82 fichas estáticas y todas tienen perfil limpio', () => {
  assert.equal(data.universities.length, 82);
  data.universities.forEach((university) => {
    assert.equal(university.profile, `/ponderaciones/${university.id}`);
    assert(existsSync(path.join(ROOT, 'ponderaciones', `${university.id}.html`)), `Falta la ficha ${university.id}`);
  });
});

test('22. fichas con datos incluyen la tabla completa en el HTML inicial', () => {
  const idsWithRows = [...new Set(records.flatMap((record) => record.universityIds))];
  const partialIds = data.universities.filter((item) => classifyUniversityCoverage(data, item) === 'partial').map((item) => item.id).sort();
  const verifiedIds = data.universities.filter((item) => classifyUniversityCoverage(data, item) === 'verified').map((item) => item.id);
  assert.equal(idsWithRows.length, 18);
  assert.deepEqual(partialIds, ['uam', 'uc3m', 'uoc']);
  assert.equal(verifiedIds.length, 15);
  idsWithRows.forEach((id) => {
    const profileHtml = readFileSync(path.join(ROOT, 'ponderaciones', `${id}.html`), 'utf8');
    const expectedRows = records.filter((record) => record.universityIds.includes(id)).length;
    const body = profileHtml.match(/<tbody id="profilePonderacionesTableBody">([\s\S]*?)<\/tbody>/);
    assert(body, `Falta la tabla HTML de ${id}`);
    assert.equal((body[1].match(/<tr>/g) || []).length, expectedRows, `Filas incompletas en ${id}`);
    assert(profileHtml.includes('aria-live="polite"'));
    assert(profileHtml.includes('Ver también todas las ponderaciones'));
    if (partialIds.includes(id)) {
      assert(profileHtml.includes('data-coverage="partial"'), `Falta el estado parcial de ${id}`);
      assert(profileHtml.includes('Programas conjuntos verificados · catálogo propio pendiente'));
      assert(profileHtml.includes('name="aviso-ponderaciones"'), `Falta el aviso de catálogo propio en ${id}`);
    } else {
      assert(profileHtml.includes('data-coverage="verified"'), `Falta el estado verificado de ${id}`);
      assert(!profileHtml.includes('name="aviso-ponderaciones"'), `La ficha verificada ${id} conserva el aviso`);
    }
  });
  data.universities.filter((item) => !idsWithRows.includes(item.id) && item.type === 'public').forEach((university) => {
    const profileHtml = readFileSync(path.join(ROOT, 'ponderaciones', `${university.id}.html`), 'utf8');
    assert(profileHtml.includes('name="aviso-ponderaciones"'), `Falta el aviso de ${university.id}`);
    assert(!profileHtml.includes('profilePonderacionesTableBody'), `Se inventó una tabla para ${university.id}`);
  });
});

test('22b. la cobertura propia no se deduce de filas conjuntas', () => {
  for (const id of ['uam', 'uc3m', 'uoc']) {
    const university = data.universities.find((item) => item.id === id);
    const rows = degreeRowsForUniversity(id);
    assert(rows.length > 0, `Faltan las filas parciales de ${id}`);
    assert(rows.every((row) => row.universityIds.length > 1), `${id} tiene alguna fila exclusiva inesperada`);
    assert.equal(classifyUniversityCoverage(data, university), 'partial');
  }
  for (const id of ['uab', 'unizar', 'uvic-ucc']) {
    const university = data.universities.find((item) => item.id === id);
    assert.equal(classifyUniversityCoverage(data, university), 'verified');
    assert(degreeRowsForUniversity(id).some((row) => row.universityIds.length === 1), `${id} no conserva filas propias`);
  }
  data.universities.filter((item) => classifyUniversityCoverage(data, item) === 'verified').forEach((university) => {
    assert.equal(university.status, 'verified');
    assert(university.datasetId, `Falta dataset propio en ${university.id}`);
    assert(degreeRowsForUniversity(university.id).some((row) => row.universityIds.length === 1));
  });
});

test('23. SEO, canonical, sitemap y rewrites cubren las 82 rutas', () => {
  const titles = new Set();
  const descriptions = new Set();
  data.universities.forEach((university) => {
    const profileHtml = readFileSync(path.join(ROOT, 'ponderaciones', `${university.id}.html`), 'utf8');
    const title = profileHtml.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = profileHtml.match(/<meta name="description" content="([^"]+)">/)?.[1];
    const canonical = `https://miebau.es${university.profile}`;
    assert(title && !titles.has(title), `Title ausente o duplicado en ${university.id}`);
    assert(description && !descriptions.has(description), `Description ausente o duplicada en ${university.id}`);
    titles.add(title);
    descriptions.add(description);
    assert(profileHtml.includes(`<link rel="canonical" href="${canonical}">`), `Canonical incorrecto en ${university.id}`);
    assert.equal((profileHtml.match(/<h1>/g) || []).length, 1, `H1 incorrecto en ${university.id}`);
    assert(!/noindex/i.test(profileHtml), `Noindex presente en ${university.id}`);
    assert(sitemap.includes(`<loc>${canonical}</loc>`), `Falta ${canonical} en sitemap`);
    assert(!sitemap.includes(`<loc>${canonical}.html</loc>`), `Versión .html incluida en sitemap para ${university.id}`);
    assert(redirects.includes(`${university.profile} /ponderaciones/${university.id}.html 200`), `Falta rewrite limpio para ${university.id}`);
  });
});

test('24. comunidad primero y enlaces bidireccionales', () => {
  assert(html.indexOf('id="comunidades"') < html.indexOf('id="tabla-global"'));
  assert(html.indexOf('id="tabla-global"') < html.indexOf('id="ponderacionesApp"'));
  assert(html.includes('id="regionQuickLinks"'));
  assert(html.includes('href="/ponderaciones/unizar"'));
  assert(readFileSync(jsPath, 'utf8').includes('catalog-profile-link'));
  assert(data.universities.every((item) => item.profile?.startsWith('/ponderaciones/')));
});

test('24b. el catálogo no publica estados internos y usa un CTA único', () => {
  data.universities.forEach((university) => {
    assert.deepEqual(api.catalogCardView(university), {
      href: university.profile,
      cta: 'Ver ponderaciones →',
    });
  });
  const catalogSource = readFileSync(jsPath, 'utf8').match(/function createCatalogCard[\s\S]*?function createCatalogGroup/)?.[0] || '';
  assert(!catalogSource.includes('source-status'));
  assert(!catalogSource.includes('source-note'));
  assert(!catalogSource.includes('reason'));
  assert(!catalogSource.includes('Ver ficha informativa'));
  assert(!catalogSource.includes('Ver ficha y ponderaciones'));
});

test('25. FAQ visible y FAQPage coinciden sin inventar ponderaciones', () => {
  const fixedQuestions = [
    '¿Qué es una ponderación en la EvAU/PAU?',
    '¿Cómo se calcula mi nota de admisión con la ponderación?',
  ];
  const fixedAnswers = [
    'Es el coeficiente (0,1 o 0,2 según la universidad y la titulación) que se aplica a la nota de una materia de modalidad examinada en la fase voluntaria de la EvAU. Sirve para calcular la nota de admisión a un grado concreto, no la nota de acceso general.',
    'Nota de admisión = nota de acceso (0-10, resultado de la fase general y el expediente) + (a × M1) + (b × M2), donde M1 y M2 son las notas de hasta dos materias de modalidad examinadas y a, b son sus coeficientes de ponderación. Solo cuentan las materias con nota igual o superior a 5.',
  ];

  data.universities.forEach((university) => {
    const profileHtml = readFileSync(path.join(ROOT, 'ponderaciones', `${university.id}.html`), 'utf8');
    const universityRecords = recordsForUniversity(data, university.id);
    const expectedEntries = buildFaqEntries(university, universityRecords);
    const schemaMatch = profileHtml.match(/<script type="application\/ld\+json" id="profileFaqJsonLd">([\s\S]*?)<\/script>/);
    const visibleMatch = profileHtml.match(/<!-- ponderaciones-faq:generated:start -->([\s\S]*?)<!-- ponderaciones-faq:generated:end -->/);
    assert(schemaMatch, `Falta FAQPage en ${university.id}`);
    assert(visibleMatch, `Falta FAQ visible en ${university.id}`);
    assert.equal((profileHtml.match(/"@type":"FAQPage"/g) || []).length, 1, `FAQPage duplicado en ${university.id}`);
    assert.equal((profileHtml.match(/id="profileFaqTitle"/g) || []).length, 1, `FAQ visible duplicado en ${university.id}`);

    const schema = JSON.parse(schemaMatch[1]);
    const schemaEntries = schema.mainEntity.map((entry) => ({
      question: entry.name,
      answer: entry.acceptedAnswer.text,
    }));
    assert.equal(schema['@type'], 'FAQPage');
    assert.deepEqual(schemaEntries, expectedEntries.map(({ question, answer }) => ({ question, answer })), `FAQPage incoherente en ${university.id}`);

    const renderedText = visibleText(visibleMatch[1]);
    expectedEntries.forEach((entry) => {
      assert(renderedText.includes(entry.question), `Pregunta oculta o ausente en ${university.id}: ${entry.question}`);
      assert(renderedText.includes(entry.answer), `Respuesta oculta o ausente en ${university.id}: ${entry.question}`);
    });
    assert.deepEqual(expectedEntries.slice(0, 2).map((entry) => entry.question), fixedQuestions);
    assert.deepEqual(expectedEntries.slice(0, 2).map((entry) => entry.answer), fixedAnswers);

    if (!universityRecords.length) {
      assert.equal(expectedEntries.length, 3, `Número de preguntas incorrecto sin datos en ${university.id}`);
      assert.equal(expectedEntries[2].question, `¿Cuándo se publicarán las ponderaciones de ${university.name}?`);
      assert(visibleMatch[1].includes('href="#aviso-email"'), `El FAQ no enlaza al aviso en ${university.id}`);
      return;
    }

    const highWeightSubjects = [...new Set(universityRecords.filter((record) => record.coefficient === 0.2).map((record) => record.subject))];
    const highWeightQuestion = expectedEntries.find((entry) => entry.question === `¿Qué materias dan más nota en ${university.name}?`);
    if (highWeightSubjects.length) {
      assert(highWeightQuestion, `Falta la pregunta de materias 0,2 en ${university.id}`);
      assert.equal(highWeightQuestion.answer, `Las materias con coeficiente 0,2 publicadas para ${university.name} son: ${highWeightSubjects.join(', ')}.`);
    } else {
      assert(!highWeightQuestion, `Pregunta 0,2 inventada en ${university.id}`);
    }

    const degreeGroups = new Map();
    universityRecords.forEach((record) => {
      if (!degreeGroups.has(record.degree)) degreeGroups.set(record.degree, []);
      degreeGroups.get(record.degree).push(record);
    });
    let selectedDegree = null;
    for (const [degree, degreeRecords] of degreeGroups) {
      if (!selectedDegree || degreeRecords.length > selectedDegree.records.length) selectedDegree = { degree, records: degreeRecords };
    }
    const degreeQuestion = `¿Qué ponderación tiene cada materia para estudiar ${selectedDegree.degree} en ${university.name}?`;
    const degreeAnswer = `Para estudiar ${selectedDegree.degree} en ${university.name}, las ponderaciones publicadas son: ${selectedDegree.records.map((record) => `${record.subject}: ${record.coefficient.toFixed(1).replace('.', ',')}`).join('; ')}.`;
    const degreeEntry = expectedEntries.find((entry) => entry.question === degreeQuestion);
    assert(degreeEntry, `Falta la pregunta de titulación en ${university.id}`);
    assert.equal(degreeEntry.answer, degreeAnswer, `Ponderaciones inventadas en ${university.id}`);
  });
});

let failures = 0;
for (const { name, callback } of tests) {
  try {
    await callback();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
}

console.log(`\n${tests.length - failures}/${tests.length} pruebas superadas.`);
if (failures) process.exitCode = 1;
