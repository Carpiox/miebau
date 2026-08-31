import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_PATH = path.join(ROOT, 'scripts', 'fixtures', 'ponderaciones-2026-2027.source.json');
const DATA_PATH = path.join(ROOT, 'data', 'ponderaciones-2026-2027.json');
const REPORT_PATH = path.join(ROOT, 'reports', 'ponderaciones-coverage.md');
const VALID_STATUSES = new Set(['verified', 'pending', 'blocked', 'no_publication']);
const VALID_COEFFICIENTS = new Set([0.1, 0.2]);

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function uniqueMap(items, label) {
  const result = new Map();
  for (const item of items) {
    assert(item && typeof item.id === 'string' && item.id.trim(), `${label}: id vacío`);
    assert(!result.has(item.id), `${label}: id duplicado "${item.id}"`);
    result.set(item.id, item);
  }
  return result;
}

export function validateFixture(fixture) {
  assert(fixture.schemaVersion === 1, 'schemaVersion debe ser 1');
  assert(fixture.period === '2026-2027', 'El fixture debe pertenecer exclusivamente a 2026-2027');
  assert(/^2026-\d{2}-\d{2}$/.test(fixture.checkedAt), 'checkedAt debe ser una fecha de 2026');
  assert(Array.isArray(fixture.sources) && fixture.sources.length, 'Faltan fuentes');
  assert(Array.isArray(fixture.universities) && fixture.universities.length, 'Faltan universidades');
  assert(Array.isArray(fixture.datasets) && fixture.datasets.length, 'Faltan datasets');

  const sources = uniqueMap(fixture.sources, 'Fuentes');
  const universities = uniqueMap(fixture.universities, 'Universidades');
  const datasets = uniqueMap(fixture.datasets, 'Datasets');

  for (const source of fixture.sources) {
    assert(VALID_STATUSES.has(source.status), `Fuente ${source.id}: estado no válido`);
    assert(source.region && source.name && source.scope && source.sourceType, `Fuente ${source.id}: metadatos incompletos`);
    assert(source.validFor && source.checkedAt, `Fuente ${source.id}: periodo o fecha de revisión ausente`);
    assert(!source.datasetId || datasets.has(source.datasetId), `Fuente ${source.id}: dataset inexistente`);
    for (const universityId of source.institutionIds || []) {
      assert(universities.has(universityId), `Fuente ${source.id}: universidad inexistente ${universityId}`);
    }
    if (source.status === 'verified') {
      assert(/^https:\/\//.test(source.sourceUrl || ''), `Fuente verificada ${source.id}: URL oficial ausente`);
      assert(source.validFor.includes('2026'), `Fuente verificada ${source.id}: validFor no acredita 2026`);
      assert(source.datasetId, `Fuente verificada ${source.id}: dataset ausente`);
      assert(datasets.get(source.datasetId).rows.length > 0, `Fuente verificada ${source.id}: filas ausentes`);
    } else {
      assert(source.reason, `Fuente ${source.id}: falta explicar el estado ${source.status}`);
    }
  }

  for (const university of fixture.universities) {
    assert(['public', 'private'].includes(university.type), `Universidad ${university.id}: tipo no válido`);
    assert(VALID_STATUSES.has(university.status), `Universidad ${university.id}: estado no válido`);
    assert(university.name && university.region && university.scope, `Universidad ${university.id}: metadatos incompletos`);
    assert(!university.sourceId || sources.has(university.sourceId), `Universidad ${university.id}: fuente inexistente`);
    assert(!university.datasetId || datasets.has(university.datasetId), `Universidad ${university.id}: dataset inexistente`);
    if (university.profile) assert(/^\/ponderaciones\/[a-z0-9-]+$/.test(university.profile), `Universidad ${university.id}: perfil no limpio`);
  }

  for (const dataset of fixture.datasets) {
    assert(dataset.period === '2026-2027', `Dataset ${dataset.id}: periodo incorrecto`);
    assert(sources.has(dataset.sourceId), `Dataset ${dataset.id}: fuente inexistente`);
    assert(sources.get(dataset.sourceId).datasetId === dataset.id, `Dataset ${dataset.id}: referencia inversa incoherente`);
    assert(Array.isArray(dataset.subjects) && dataset.subjects.length, `Dataset ${dataset.id}: materias ausentes`);
    assert(Array.isArray(dataset.rows) && dataset.rows.length, `Dataset ${dataset.id}: filas ausentes`);
    assert(Array.isArray(dataset.manualChecks) && dataset.manualChecks.length >= 5, `Dataset ${dataset.id}: faltan 5 comprobaciones manuales`);

    const normalizedSubjects = new Set();
    for (const subject of dataset.subjects) {
      const normalized = normalizeText(subject);
      assert(normalized, `Dataset ${dataset.id}: materia vacía`);
      assert(!normalizedSubjects.has(normalized), `Dataset ${dataset.id}: materia normalizada duplicada "${subject}"`);
      normalizedSubjects.add(normalized);
    }

    const rowKeys = new Set();
    for (const [index, row] of dataset.rows.entries()) {
      assert(typeof row.degree === 'string' && row.degree.trim(), `Dataset ${dataset.id}, fila ${index + 1}: grado vacío`);
      assert(Array.isArray(row.universityIds) && row.universityIds.length, `Dataset ${dataset.id}, fila ${index + 1}: universidad ausente`);
      for (const universityId of row.universityIds) {
        assert(universities.has(universityId), `Dataset ${dataset.id}, fila ${index + 1}: universidad inexistente ${universityId}`);
        assert((sources.get(dataset.sourceId).institutionIds || []).includes(universityId), `Dataset ${dataset.id}, fila ${index + 1}: ${universityId} fuera del alcance oficial`);
      }
      assert(Array.isArray(row.weights) && row.weights.length, `Dataset ${dataset.id}, fila ${index + 1}: ponderaciones ausentes`);
      const rowSubjects = new Set();
      for (const weight of row.weights) {
        assert(VALID_COEFFICIENTS.has(weight.coefficient), `Dataset ${dataset.id}, fila ${index + 1}: coeficiente ${weight.coefficient} no válido`);
        const normalized = normalizeText(weight.subject);
        assert(normalizedSubjects.has(normalized), `Dataset ${dataset.id}, fila ${index + 1}: materia desconocida "${weight.subject}"`);
        assert(!rowSubjects.has(normalized), `Dataset ${dataset.id}, fila ${index + 1}: materia duplicada "${weight.subject}"`);
        rowSubjects.add(normalized);
      }
      const rowKey = [normalizeText(row.degree), [...row.universityIds].sort().join(','), normalizeText(row.campus), normalizeText(row.center), row.code || ''].join('|');
      assert(!rowKeys.has(rowKey), `Dataset ${dataset.id}: fila duplicada sin justificar "${row.degree}"`);
      rowKeys.add(rowKey);
    }

    const degreeNames = new Set(dataset.rows.map((row) => row.degree));
    for (const check of dataset.manualChecks) {
      assert(degreeNames.has(check.degree), `Dataset ${dataset.id}: muestra manual sin fila "${check.degree}"`);
      assert(Number.isInteger(check.page) && check.page > 0, `Dataset ${dataset.id}: página de muestra no válida`);
      assert(check.reviewedAgainst === 'PDF oficial renderizado', `Dataset ${dataset.id}: muestra manual sin contraste visual`);
    }

    const serialized = JSON.stringify(dataset);
    assert(!serialized.includes('2025-2026') && !serialized.includes('2027-2028'), `Dataset ${dataset.id}: contaminación de otro curso`);
  }

  return { sources, universities, datasets };
}

function countWeights(dataset) {
  return dataset.rows.reduce((total, row) => total + row.weights.length, 0);
}

export function buildOutput(fixture) {
  validateFixture(fixture);
  const statusCounts = fixture.sources.reduce((counts, source) => {
    counts[source.status] = (counts[source.status] || 0) + 1;
    return counts;
  }, {});
  const degreeRows = fixture.datasets.reduce((total, dataset) => total + dataset.rows.length, 0);
  const weightRows = fixture.datasets.reduce((total, dataset) => total + countWeights(dataset), 0);
  return {
    schemaVersion: fixture.schemaVersion,
    period: fixture.period,
    checkedAt: fixture.checkedAt,
    summary: {
      sourceCount: fixture.sources.length,
      verifiedSourceCount: statusCounts.verified || 0,
      pendingSourceCount: statusCounts.pending || 0,
      blockedSourceCount: statusCounts.blocked || 0,
      universityCount: fixture.universities.length,
      privateUniversityCount: fixture.universities.filter((item) => item.type === 'private').length,
      datasetCount: fixture.datasets.length,
      degreeRowCount: degreeRows,
      weightRowCount: weightRows,
    },
    sources: fixture.sources,
    universities: fixture.universities,
    datasets: fixture.datasets.map(({ manualChecks, ...dataset }) => dataset),
  };
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function buildReport(fixture, output) {
  const statusLabel = { verified: 'Verificada', pending: 'Pendiente', blocked: 'Bloqueada', no_publication: 'Sin publicación' };
  const lines = [
    '# Cobertura de ponderaciones 2026-2027',
    '',
    `Comprobación cerrada el ${fixture.checkedAt}. Solo se publican coeficientes procedentes de fuentes oficiales y validados por el generador.`,
    '',
    '## Resumen',
    '',
    `- Fuentes catalogadas: ${output.summary.sourceCount}.`,
    `- Fuentes con tabla verificada: ${output.summary.verifiedSourceCount}.`,
    `- Fuentes pendientes: ${output.summary.pendingSourceCount}.`,
    `- Fuentes bloqueadas: ${output.summary.blockedSourceCount}.`,
    `- Universidades y fichas en la matriz: ${output.summary.universityCount} (${output.summary.privateUniversityCount} privadas).`,
    `- Datasets compartidos o propios: ${output.summary.datasetCount}.`,
    `- Titulaciones normalizadas: ${output.summary.degreeRowCount}.`,
    `- Pares materia-coeficiente: ${output.summary.weightRowCount}.`,
    '',
    '## Fuentes',
    '',
    '| Comunidad | Fuente | Estado | Periodo | Alcance o motivo |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const source of fixture.sources) {
    const name = source.sourceUrl ? `[${escapeCell(source.name)}](${source.sourceUrl})` : escapeCell(source.name);
    lines.push(`| ${escapeCell(source.region)} | ${name} | ${statusLabel[source.status]} | ${escapeCell(source.validFor)} | ${escapeCell(source.reason || source.scope)} |`);
  }
  lines.push('', '## Datasets verificados', '');
  for (const dataset of fixture.datasets) {
    lines.push(`### ${dataset.title}`, '');
    lines.push(`- ID: \`${dataset.id}\`.`);
    lines.push(`- Titulaciones: ${dataset.rows.length}; pares materia-coeficiente: ${countWeights(dataset)}; materias normalizadas: ${dataset.subjects.length}.`);
    lines.push(`- Nota de alcance: ${dataset.notes}`);
    lines.push('- Muestras manuales contrastadas con el PDF renderizado:');
    for (const check of dataset.manualChecks) {
      lines.push(`  - Fila ${check.row}, página ${check.page}: ${check.degree} (${check.weightCount} ponderaciones).`);
    }
    lines.push('');
  }
  lines.push(
    '## Criterio de publicación',
    '',
    '- Una fuente con estado `verified` tiene URL oficial, periodo 2026-2027 y al menos una fila validada.',
    '- Los datasets comunes solo se reutilizan cuando la propia fuente identifica las universidades de cada fila.',
    '- Las fichas privadas sin publicación propia no heredan coeficientes de universidades públicas.',
    '- Las fuentes de imagen, autenticación o composición normativa incompleta permanecen pendientes o bloqueadas; no se han rellenado por semejanza.',
    ''
  );
  return `${lines.join('\n')}\n`;
}

async function main() {
  const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
  const output = buildOutput(fixture);
  const dataText = `${JSON.stringify(output)}\n`;
  const reportText = buildReport(fixture, output);
  const checkOnly = process.argv.includes('--check');

  if (checkOnly) {
    const [currentData, currentReport] = await Promise.all([
      readFile(DATA_PATH, 'utf8'),
      readFile(REPORT_PATH, 'utf8'),
    ]);
    assert(currentData === dataText, 'data/ponderaciones-2026-2027.json no coincide con el fixture');
    assert(currentReport === reportText, 'reports/ponderaciones-coverage.md no coincide con el fixture');
  } else {
    await Promise.all([
      mkdir(path.dirname(DATA_PATH), { recursive: true }),
      mkdir(path.dirname(REPORT_PATH), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(DATA_PATH, dataText, 'utf8'),
      writeFile(REPORT_PATH, reportText, 'utf8'),
    ]);
  }

  console.log(`OK: ${output.summary.datasetCount} datasets, ${output.summary.degreeRowCount} titulaciones y ${output.summary.weightRowCount} ponderaciones.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
