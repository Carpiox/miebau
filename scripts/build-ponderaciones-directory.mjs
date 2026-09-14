#!/usr/bin/env node
// El directorio "universidades por comunidad autónoma" de /ponderaciones se
// generaba 100% en el cliente (js/ponderaciones.js, #pdfGrid) — el HTML
// estático dejaba solo un mensaje "elige una comunidad" sin ningún <a href>
// real. Cualquier crawler que no ejecute JavaScript veía cero enlaces a las
// 82 fichas de universidad desde este directorio: exactamente la misma
// causa raíz que build-nav-footer.mjs ya corrigió para el nav/footer.
//
// Este script genera esa misma lista, ya agrupada por comunidad autónoma y
// con los <a href> reales, como HTML estático dentro de #pdfGrid. El JS de
// cliente (regionFilter/search) sigue existiendo tal cual y sustituye este
// contenido en cuanto la persona interactúa (filtra o busca) — el
// enlazado en sí ya no depende de que se ejecute ningún script.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = path.join(ROOT, 'data', 'ponderaciones-2026-2027.json');
const PONDERACIONES_INDEX_PATH = path.join(ROOT, 'ponderaciones.html');

const DIRECTORY_START = '<!-- ponderaciones-directory:generated:start -->';
const DIRECTORY_END = '<!-- ponderaciones-directory:generated:end -->';
const EMPTY_STATE_PLACEHOLDER = '<p class="catalog-empty-state">Elige una comunidad autónoma para ver sus universidades públicas y privadas. También puedes buscar una universidad directamente.</p>';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function groupByRegion(universities) {
  const regions = [...new Set(universities.map((item) => item.region))].sort((a, b) => a.localeCompare(b, 'es'));
  return regions.map((region) => ({
    region,
    public: universities.filter((item) => item.region === region && item.type === 'public').sort((a, b) => a.name.localeCompare(b.name, 'es')),
    private: universities.filter((item) => item.region === region && item.type !== 'public').sort((a, b) => a.name.localeCompare(b.name, 'es')),
  }));
}

function renderCard(university) {
  const isPrivate = university.type !== 'public';
  const icon = isPrivate ? '◇' : '◈';
  const kindLabel = isPrivate
    ? 'Universidad privada'
    : university.id.endsWith('-publicas') ? 'Cobertura pública regional' : 'Universidad pública';
  const link = university.profile
    ? `<a class="catalog-profile-link" href="${escapeHtml(university.profile)}">Ver ponderaciones →</a>`
    : '';
  return `<article class="pdf-card"><div class="pdf-card-heading"><span class="pdf-icon" aria-hidden="true">${icon}</span><span class="eyebrow">${escapeHtml(university.region)}</span></div><div class="uni-name">${escapeHtml(university.name)}</div><div class="uni-city">${kindLabel} · ${escapeHtml(university.mode || 'Presencial')}</div>${link}</article>`;
}

function renderKindGroup(title, items) {
  if (!items.length) return '';
  return `<section class="university-group"><h3>${escapeHtml(title)}</h3><div class="pdf-grid">${items.map(renderCard).join('')}</div></section>`;
}

export function renderDirectory(data) {
  const groups = groupByRegion(data.universities);
  const sections = groups
    .map(({ region, public: publicUniversities, private: privateUniversities }) => (
      renderKindGroup(`${region} · Universidades públicas`, publicUniversities)
      + renderKindGroup(`${region} · Universidades privadas`, privateUniversities)
    ))
    .join('');
  return `${DIRECTORY_START}${sections}${DIRECTORY_END}`;
}

export function applyDirectory(html, data) {
  const content = renderDirectory(data);
  const start = html.indexOf(DIRECTORY_START);
  if (start !== -1) {
    const end = html.indexOf(DIRECTORY_END, start);
    if (end === -1) throw new Error('Bloque de directorio de ponderaciones incompleto');
    return `${html.slice(0, start)}${content}${html.slice(end + DIRECTORY_END.length)}`;
  }
  if (!html.includes(EMPTY_STATE_PLACEHOLDER)) {
    throw new Error('No se encontró ni el marcador ni el placeholder del directorio de universidades en ponderaciones.html');
  }
  return html.replace(EMPTY_STATE_PLACEHOLDER, content);
}

async function expectedFiles(data) {
  const current = await readFile(PONDERACIONES_INDEX_PATH, 'utf8');
  return [{ filePath: PONDERACIONES_INDEX_PATH, content: applyDirectory(current, data) }];
}

async function main() {
  const data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  const files = await expectedFiles(data);
  const checkOnly = process.argv.includes('--check');
  if (checkOnly) {
    for (const file of files) {
      const current = await readFile(file.filePath, 'utf8');
      if (current !== file.content) throw new Error(`${path.relative(ROOT, file.filePath)} no coincide con el directorio de universidades generado`);
    }
  } else {
    await Promise.all(files.map((file) => writeFile(file.filePath, file.content, 'utf8')));
  }
  console.log(`OK: directorio de ${data.universities.length} universidades por comunidad generado o verificado en ponderaciones.html.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
