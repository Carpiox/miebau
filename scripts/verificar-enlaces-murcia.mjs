#!/usr/bin/env node
// Verifica los enlaces de data/murcia/pau2026_murcia.json contra los PDF oficiales de la UMU.
//
// Para cada enlace (examen y criterios, ordinaria y extraordinaria) y para el documento oficial
// de estructura de las pruebas:
//   1. descarga el PDF (pausa entre descargas, reintentos ante errores de red),
//   2. comprueba HTTP 200 y que es un PDF (cabecera %PDF-),
//   3. extrae el texto de la primera página y valida año 2026, convocatoria (junio = ordinaria,
//      julio = extraordinaria) y materia,
//   4. guarda el texto completo en data/murcia/textos/<codigo>-<ordinaria|extraordinaria>.txt
//      (criterios: <codigo>-<convocatoria>-criterios.txt),
//   5. escribe el estado en data/murcia/verificacion.json (reanudable) y el informe verificacion.md.
//
// Uso:
//   node scripts/verificar-enlaces-murcia.mjs                 # todo, reanudando lo ya verificado
//   node scripts/verificar-enlaces-murcia.mjs --only 301,306  # solo esos códigos
//   node scripts/verificar-enlaces-murcia.mjs --force         # vuelve a verificar todo
//   node scripts/verificar-enlaces-murcia.mjs --revalidar     # reevalúa data/murcia/textos SIN descargar y regenera informe y estado
//   node scripts/verificar-enlaces-murcia.mjs --report-only   # regenera verificacion.md sin descargar ni reevaluar
//
// Opciones: --json <ruta>  --out-dir <dir>  --delay <ms, 1500>  --report <ruta>
//           --keep-pdf (guarda los PDF en <out-dir>/pdf)  --engine auto|pdftotext|pdfjs
//           --solo-fichas (solo los enlaces que hoy tienen las fichas y difieren del JSON de la UMU)
//           --structure-url <url> (solo para pruebas)
//
// Extracción de texto: usa `pdftotext` (poppler) si está instalado; si no, `pdfjs-dist`
// (npm install --no-save pdfjs-dist). Instalar poppler: macOS `brew install poppler`,
// Debian/Ubuntu `sudo apt install poppler-utils`, Windows `scoop install poppler`.
// Requiere Node 18+.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_STRUCTURE_URL = 'https://www.um.es/documents/d/estudios/co-pau2026-1-doc-4-estructura-de-las-pruebas-de-acceso';
const STRUCTURE_KEY = 'estructura-pruebas';
const USER_AGENT = 'miebau-verificador-enlaces/1.0 (+https://miebau.es)';
const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'a', 'al', 'en', 'ii', 'i']);

// ------------------------------------------------------------------ argumentos
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback);

const jsonPath = path.resolve(ROOT, option('--json', 'data/murcia/pau2026_murcia.json'));
const outDir = path.resolve(ROOT, option('--out-dir', 'data/murcia'));
const reportPath = path.resolve(ROOT, option('--report', 'verificacion.md'));
const delayMs = Number(option('--delay', '1500'));
const only = option('--only', null)?.split(',').map((code) => code.trim()).filter(Boolean) ?? null;
const engineOption = option('--engine', 'auto');
const STRUCTURE_URL = option('--structure-url', DEFAULT_STRUCTURE_URL);
const SEO_PATH = path.join(ROOT, 'data', 'examenes-seo.json');
// Slugs de las fichas que no coinciden con el slug del JSON de la UMU.
const SLUG_ALIAS = { filosofia: 'historia-de-la-filosofia' };
const textDir = path.join(outDir, 'textos');
const pdfDir = path.join(outDir, 'pdf');
const statePath = path.join(outDir, 'verificacion.json');

// ------------------------------------------------------------------ utilidades
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const norm = (value = '') => String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const tokensOf = (value) => norm(value).split(' ').filter((token) => token.length >= 3 && !STOPWORDS.has(token));
const hasWord = (text, word) => new RegExp(`\\b${word}\\b`).test(text);

function writeJsonAtomic(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  renameSync(tmp, file);
}

// ------------------------------------------------------------------ extracción de texto
let pdfjsPromise = null;

function pdftotextAvailable() {
  const probe = spawnSync('pdftotext', ['-v'], { encoding: 'utf8' });
  return !probe.error;
}

async function loadPdfjs() {
  pdfjsPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjsPromise;
}

async function extractWithPdfjs(buffer) {
  const pdfjs = await loadPdfjs();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, verbosity: 0 }).promise;
  const pages = [];
  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    const content = await page.getTextContent();
    let line = '';
    let text = '';
    for (const item of content.items) {
      line += item.str;
      if (item.hasEOL) { text += `${line}\n`; line = ''; } else if (item.str && !line.endsWith(' ')) line += ' ';
    }
    pages.push(`${text}${line}`.trim());
  }
  return { first: pages[0] ?? '', full: pages.join('\n\f'), pages: document.numPages };
}

function extractWithPdftotext(buffer) {
  const dir = mkdtempSync(path.join(tmpdir(), 'murcia-pdf-'));
  const file = path.join(dir, 'doc.pdf');
  try {
    writeFileSync(file, buffer);
    const run = (args) => spawnSync('pdftotext', ['-layout', '-enc', 'UTF-8', ...args, file, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const first = run(['-f', '1', '-l', '1']);
    const full = run([]);
    if (first.error || full.error || full.status !== 0) throw new Error(`pdftotext falló: ${(full.stderr || full.error?.message || '').trim()}`);
    const info = spawnSync('pdfinfo', [file], { encoding: 'utf8' });
    const pages = Number((info.stdout?.match(/^Pages:\s+(\d+)/m) || [])[1]) || null;
    return { first: first.stdout.trim(), full: full.stdout, pages };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function extractText(buffer, engine) {
  return engine === 'pdfjs' ? extractWithPdfjs(buffer) : extractWithPdftotext(buffer);
}

function pickEngine() {
  if (engineOption === 'pdftotext' || engineOption === 'pdfjs') return engineOption;
  return pdftotextAvailable() ? 'pdftotext' : 'pdfjs';
}

// ------------------------------------------------------------------ descarga
let lastRequestAt = 0;

async function download(url) {
  const wait = lastRequestAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) await sleep(3000 * attempt);
    try {
      const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': USER_AGENT, accept: 'application/pdf,*/*' }, signal: AbortSignal.timeout(60000) });
      const buffer = Buffer.from(await response.arrayBuffer());
      lastRequestAt = Date.now();
      // 5xx y 429 son transitorios: se tratan como error de red y se reintentan en la siguiente ejecución.
      if (response.status >= 500 || response.status === 429) { lastError = new Error(`HTTP ${response.status}`); continue; }
      return { http: response.status, finalUrl: response.url, contentType: response.headers.get('content-type') || '', buffer };
    } catch (error) {
      lastRequestAt = Date.now();
      lastError = error;
    }
  }
  throw lastError;
}

// ------------------------------------------------------------------ validaciones
const YEAR = /(?<!\d)20\d\d(?!\d)/g;
const HEADER_CHARS = 300;

// El año se valida sobre la cabecera (primeros ~300 caracteres), donde la UMU escribe "PAU2026 – JUNIO".
// Límites de dígito, no de palabra: "PAU2026" no tiene límite de palabra antes del 2026.
export function checkYear(first) {
  const header = first.slice(0, HEADER_CHARS);
  const yearsOf = (text) => [...new Set(text.match(YEAR) || [])];
  const headerYears = yearsOf(header);
  const pageYears = yearsOf(first);
  if (/PAU\s*2026(?!\d)/i.test(header)) return { result: 'ok', note: null };
  if (headerYears.includes('2026')) return { result: 'ok', note: null };
  if (headerYears.length) return { result: 'fail', note: `la cabecera indica ${headerYears.join(', ')} y no 2026` };
  if (pageYears.includes('2026')) return { result: 'ok', note: 'consta 2026 fuera de la cabecera' };
  if (pageYears.length) return { result: 'warn', note: `la cabecera no indica año; el cuerpo menciona ${pageYears.join(', ')}` };
  return { result: 'warn', note: 'la primera página no contiene ningún año' };
}

export function checkConvocatoria(first, expected) {
  const text = norm(first);
  const ordinaria = hasWord(text, 'junio') || hasWord(text, 'ordinaria');
  const extraordinaria = hasWord(text, 'julio') || hasWord(text, 'extraordinaria');
  const mine = expected === 'ordinaria' ? ordinaria : extraordinaria;
  const other = expected === 'ordinaria' ? extraordinaria : ordinaria;
  const label = expected === 'ordinaria' ? 'junio/ordinaria' : 'julio/extraordinaria';
  if (mine && !other) return { result: 'ok', note: null };
  if (!mine && other) return { result: 'fail', note: `parece de la otra convocatoria; no consta ${label}` };
  if (mine && other) return { result: 'warn', note: 'la primera página menciona ambas convocatorias' };
  return { result: 'warn', note: `no consta ${label} en la primera página` };
}

export function checkMateria(first, materia) {
  const text = ` ${norm(first)} `;
  const ratio = (tokens) => (tokens.length ? tokens.filter((token) => text.includes(` ${token}`)).length / tokens.length : 0);
  const byName = ratio(tokensOf(materia.materia));
  const bySlug = ratio(tokensOf(materia.slug.replace(/-/g, ' ')));
  const best = Math.max(byName, bySlug);
  if (best >= 0.75) return { result: 'ok', note: null };
  // El código oficial de la materia ("307 - MATEMÁTICAS CCSS") junto a una coincidencia parcial del nombre basta.
  const codeInHeader = new RegExp(`(?<!\\d)${materia.codigo}(?!\\d)`).test(first.slice(0, HEADER_CHARS));
  if (best >= 0.5 && codeInHeader) return { result: 'ok', note: null };
  if (best >= 0.5) return { result: 'warn', note: `coincidencia parcial con "${materia.materia}"` };
  return { result: 'fail', note: `no aparece "${materia.materia}" en la primera página` };
}

function detectKinds(first, url) {
  const text = `${norm(first)} ${norm(url)}`;
  const kinds = [];
  if (/\bcriterios\b/.test(text)) kinds.push('criterios');
  if (/\b(resuelto|resuelta|soluciones?)\b/.test(text)) kinds.push('resuelto');
  if (/\b(opcion|pregunta|ejercicio|problema|cuestion|instrucciones)\b/.test(text)) kinds.push('enunciado');
  return kinds;
}

function combine(...results) {
  if (results.some((r) => r.result === 'fail')) return 'fail';
  if (results.some((r) => r.result === 'warn')) return 'warn';
  return 'pass';
}

// ------------------------------------------------------------------ verificación de un enlace
async function verifyLink(target, engine, keepPdf) {
  const base = { key: target.key, url: target.url, codigo: target.codigo, materia: target.materia, convocatoria: target.convocatoria, tipoEnlace: target.tipoEnlace, checkedAt: new Date().toISOString(), notes: [] };
  let response;
  try {
    response = await download(target.url);
  } catch (error) {
    return { ...base, status: 'error', notes: [`error de red: ${error.message}`] };
  }
  const result = { ...base, http: response.http, finalUrl: response.finalUrl, contentType: response.contentType, bytes: response.buffer.length };
  const isPdf = response.buffer.subarray(0, 5).toString('latin1') === '%PDF-';
  result.isPdf = isPdf;
  if (response.http !== 200) return { ...result, status: 'fail', notes: [`HTTP ${response.http}`] };
  if (!isPdf) return { ...result, status: 'fail', notes: [`no es un PDF (content-type: ${response.contentType || 'desconocido'})`] };
  result.sha256 = createHash('sha256').update(response.buffer).digest('hex');
  if (!/pdf/i.test(response.contentType)) result.notes.push(`content-type inesperado: ${response.contentType || 'vacío'}`);
  if (keepPdf) {
    mkdirSync(pdfDir, { recursive: true });
    if (!existsSync(path.join(pdfDir, '.gitignore'))) writeFileSync(path.join(pdfDir, '.gitignore'), '*\n!.gitignore\n', 'utf8');
    writeFileSync(path.join(pdfDir, `${target.key}.pdf`), response.buffer);
  }

  let extracted;
  try {
    extracted = await extractText(response.buffer, engine);
  } catch (error) {
    return { ...result, status: 'error', notes: [...result.notes, `no se pudo extraer el texto (${engine}): ${error.message}`] };
  }
  mkdirSync(textDir, { recursive: true });
  writeFileSync(path.join(textDir, `${target.key}.txt`), `${extracted.full.trimEnd()}\n`, 'utf8');
  result.pages = extracted.pages;
  result.textChars = extracted.full.length;
  result.snippet = extracted.first.replace(/\s+/g, ' ').slice(0, 200);

  const evaluation = evaluateText(target, extracted.first);
  return { ...result, ...evaluation, notes: [...result.notes, ...evaluation.notes] };
}

// Evalúa la primera página ya extraída. Se usa al descargar y en --revalidar.
export function evaluateText(target, first) {
  const out = { notes: [] };
  out.snippet = first.replace(/\s+/g, ' ').slice(0, 200);
  if (first.replace(/\s+/g, '').length < 40) {
    return { ...out, status: 'warn', checks: {}, notes: ['la primera página casi no tiene texto (¿PDF escaneado?): revisión manual'] };
  }
  const year = checkYear(first);
  let convocatoria = target.convocatoria ? checkConvocatoria(first, target.convocatoria) : { result: 'ok', note: null };
  // Los criterios suelen ser comunes a ambas convocatorias: que no mencionen junio/julio no es un fallo.
  if (target.tipoEnlace === 'criterios') {
    if (convocatoria.result === 'warn' && !/ambas/.test(convocatoria.note || '')) convocatoria = { result: 'ok', note: null };
    else if (convocatoria.result === 'fail') convocatoria = { ...convocatoria, result: 'warn' };
  }
  const materia = target.materia ? checkMateria(first, target.materiaRef) : { result: 'ok', note: null };
  out.checks = { anio: year.result, convocatoria: convocatoria.result, materia: materia.result };
  out.detectado = detectKinds(first, target.url);
  for (const check of [year, convocatoria, materia]) if (check.note) out.notes.push(check.note);
  if (target.tipoEnlace === 'examen' && /criterios/.test(norm(target.url))) out.notes.push('la URL contiene "criterios": confirmar que incluye el enunciado del examen');
  out.status = target.estructura ? (year.result === 'fail' ? 'fail' : 'pass') : combine(year, convocatoria, materia);
  return out;
}

// ------------------------------------------------------------------ objetivos
function buildTargets(data) {
  const targets = [];
  for (const materia of data.materias) {
    if (only && !only.includes(String(materia.codigo))) continue;
    for (const [convocatoria, bloque] of [['ordinaria', materia.ordinaria_junio_2026], ['extraordinaria', materia.extraordinaria_julio_2026]]) {
      for (const [tipoEnlace, url] of [['examen', bloque?.examen], ['criterios', bloque?.criterios]]) {
        const key = `${materia.codigo}-${convocatoria}${tipoEnlace === 'criterios' ? '-criterios' : ''}`;
        targets.push({ key, url: url || null, codigo: materia.codigo, materia: materia.materia, materiaRef: materia, convocatoria, tipoEnlace });
      }
    }
  }
  targets.push(...fichaTargets(data));
  if (!only) targets.push({ key: STRUCTURE_KEY, url: STRUCTURE_URL, codigo: null, materia: null, convocatoria: null, tipoEnlace: 'estructura', estructura: true });
  return targets;
}

// Enlaces de examen que hoy publican las fichas de Murcia y que difieren de los del JSON de la UMU.
// Clave: <codigo>-<convocatoria>-ficha. Las materias se casan por slug (con alias) y se resuelve el código.
export function fichaTargets(data, seoPath = SEO_PATH) {
  if (!existsSync(seoPath)) return [];
  const seo = JSON.parse(readFileSync(seoPath, 'utf8'));
  const targets = [];
  for (const entry of seo.entries.filter((item) => item.slug.startsWith('region-de-murcia/'))) {
    const slug = entry.slug.split('/')[1];
    const materia = data.materias.find((item) => item.slug === (SLUG_ALIAS[slug] ?? slug));
    if (!materia || (only && !only.includes(String(materia.codigo)))) continue;
    for (const [convocatoria, bloque] of [['ordinaria', materia.ordinaria_junio_2026], ['extraordinaria', materia.extraordinaria_julio_2026]]) {
      const urlFicha = entry.enlace_oficial_examen?.[convocatoria];
      if (!urlFicha || urlFicha === bloque?.examen) continue;
      targets.push({ key: `${materia.codigo}-${convocatoria}-ficha`, url: urlFicha, codigo: materia.codigo, materia: materia.materia, materiaRef: materia, convocatoria, tipoEnlace: 'examen', ficha: true, urlJson: bloque?.examen || null });
    }
  }
  return targets;
}

// ------------------------------------------------------------------ informe
const ICON = { pass: '✅ pasa', warn: '⚠️ revisar', fail: '❌ falla', error: '🔁 error de red' };
const mark = (value) => ({ ok: '✔', warn: '⚠', fail: '✘' }[value] || '–');
const shortUrl = (url) => (url ? url.replace('https://www.um.es/documents/d/estudios/', '…/') : '—');

function summarize(targets, state) {
  const counts = { pass: 0, warn: 0, fail: 0, error: 0, pendiente: 0, sinEnlace: 0 };
  for (const target of targets) {
    if (!target.url) { if (target.tipoEnlace === 'examen') counts.sinEnlace += 1; continue; }
    const res = state.resultados[target.key];
    if (!res || res.url !== target.url) counts.pendiente += 1; else counts[res.status] += 1;
  }
  return counts;
}

function renderReport(data, targets, state, engine) {
  const counts = summarize(targets, state);
  const lines = [];
  const out = (line = '') => lines.push(line);
  const result = (target) => { const res = state.resultados[target.key]; return res && res.url === target.url ? res : null; };

  out('# Verificación de enlaces PAU 2026 · Región de Murcia');
  out();
  out(`Generado: ${new Date().toISOString()} · Fuente: \`${path.relative(ROOT, jsonPath)}\` · Extracción de texto: \`${engine}\` · Pausa entre descargas: ${delayMs} ms`);
  out();
  out('**Regla de publicación:** solo se pueden publicar los enlaces con resultado ✅ pasa. ⚠️ revisar exige mirar el PDF a mano; ❌ falla y 🔁 error de red no se publican.');
  out();
  out('## Resumen');
  out();
  out(`| ✅ pasan | ⚠️ revisar | ❌ fallan | 🔁 error de red | ⏳ pendientes | sin enlace al examen en el JSON |`);
  out('|---:|---:|---:|---:|---:|---:|');
  out(`| ${counts.pass} | ${counts.warn} | ${counts.fail} | ${counts.error} | ${counts.pendiente} | ${counts.sinEnlace} |`);
  out();
  out('## Publicabilidad por materia (solo el enlace al examen)');
  out();
  out('| Código | Materia | Estado en el JSON | Ordinaria (junio) | Extraordinaria (julio) |');
  out('|---:|---|---|---|---|');
  const state_ = (target) => (!target.url ? 'sin enlace' : !result(target) ? 'pendiente' : ICON[result(target).status]);
  for (const materia of data.materias) {
    if (only && !only.includes(String(materia.codigo))) continue;
    const ord = targets.find((t) => t.key === `${materia.codigo}-ordinaria`);
    const ext = targets.find((t) => t.key === `${materia.codigo}-extraordinaria`);
    out(`| ${materia.codigo} | ${materia.materia} | ${materia.estado} | ${state_(ord)} | ${state_(ext)} |`);
  }
  out();
  out('## Detalle por enlace');
  out();
  out('| Clave | Enlace | HTTP | PDF | Pág. | Año | Conv. | Materia | Contenido detectado | Resultado |');
  out('|---|---|---:|:-:|---:|:-:|:-:|:-:|---|---|');
  for (const target of targets) {
    if (!target.url) continue;
    const res = result(target);
    if (!res) { out(`| ${target.key} | ${shortUrl(target.url)} | | | | | | | | ⏳ pendiente |`); continue; }
    out(`| ${target.key} | ${shortUrl(target.url)} | ${res.http ?? '—'} | ${res.isPdf === undefined ? '–' : res.isPdf ? '✔' : '✘'} | ${res.pages ?? '—'} | ${mark(res.checks?.anio)} | ${mark(res.checks?.convocatoria)} | ${mark(res.checks?.materia)} | ${(res.detectado || []).join(', ') || '—'} | ${ICON[res.status]} |`);
  }
  out();
  out('## Enlaces que requieren atención');
  out();
  let attention = 0;
  for (const target of targets) {
    const res = target.url ? result(target) : null;
    if (!res || res.status === 'pass') continue;
    attention += 1;
    out(`### ${target.key} — ${ICON[res.status]}`);
    out();
    out(`- URL: ${target.url}`);
    if (res.finalUrl && res.finalUrl !== target.url) out(`- URL final tras redirecciones: ${res.finalUrl}`);
    for (const note of res.notes || []) out(`- ${note}`);
    if (res.snippet) out(`- Primeras palabras del PDF: «${res.snippet.slice(0, 160)}»`);
    out();
  }
  if (!attention) { out('Ninguno.'); out(); }
  const conflictos = targets.filter((t) => t.ficha);
  if (conflictos.length) {
    out('## Conflictos: enlace de la ficha frente al del JSON de la UMU');
    out();
    out('| Clave | Enlace de la ficha (repo) | Resultado | Enlace del JSON | Resultado |');
    out('|---|---|---|---|---|');
    for (const target of conflictos) {
      const json = targets.find((t) => t.key === target.key.replace(/-ficha$/, ''));
      const resFicha = result(target);
      const resJson = json ? result(json) : null;
      out(`| ${target.key} | ${shortUrl(target.url)} | ${resFicha ? ICON[resFicha.status] : '⏳ pendiente'} | ${shortUrl(target.urlJson)} | ${resJson ? ICON[resJson.status] : '⏳ pendiente'} |`);
    }
    out();
    out('Para aplicar la regla de resolución: `node scripts/resolver-conflictos-murcia.mjs` (muestra el diff) y `--aplicar`.');
    out();
  }
  out('## Enlaces sin URL en el JSON');
  out();
  const missing = data.materias.filter((m) => (!only || only.includes(String(m.codigo))) && (!m.ordinaria_junio_2026?.examen || !m.extraordinaria_julio_2026?.examen));
  if (!missing.length) out('Ninguno.');
  for (const materia of missing) {
    const faltan = [!materia.ordinaria_junio_2026?.examen && 'ordinaria', !materia.extraordinaria_julio_2026?.examen && 'extraordinaria'].filter(Boolean).join(' y ');
    out(`- ${materia.codigo} ${materia.materia} (${materia.estado}): falta ${faltan}. ${(materia.avisos || []).join(' ')}`);
  }
  out();
  out('## Avisos originales del JSON');
  out();
  for (const materia of data.materias) {
    if (only && !only.includes(String(materia.codigo))) continue;
    for (const aviso of materia.avisos || []) out(`- ${materia.codigo} ${materia.materia}: ${aviso}`);
  }
  out();
  const structure = targets.find((t) => t.key === STRUCTURE_KEY);
  if (structure) {
    const res = result(structure);
    out('## Documento oficial de estructura de las pruebas');
    out();
    out(`- URL: ${STRUCTURE_URL}`);
    out(res ? `- Resultado: ${ICON[res.status]} · HTTP ${res.http ?? '—'} · ${res.pages ?? '?'} páginas · ${res.textChars ?? 0} caracteres de texto` : '- Resultado: ⏳ pendiente');
    if (res?.notes?.length) for (const note of res.notes) out(`- ${note}`);
    out(`- Texto completo en \`${path.relative(ROOT, path.join(textDir, `${STRUCTURE_KEY}.txt`))}\``);
    out();
  }
  out('## Cómo se valida');
  out();
  out('- **HTTP 200** tras seguir redirecciones, y cabecera `%PDF-` (no basta el content-type).');
  out('- **Año**: se mira la cabecera (primeros 300 caracteres). "PAU2026" o 2026 (con límites de dígito) = ✔ aunque el cuerpo cite otros años. Falla solo si la cabecera indica otro año; si no hay año, revisar.');
  out('- **Convocatoria**: ordinaria = "junio"/"ordinaria"; extraordinaria = "julio"/"extraordinaria". Falla si solo consta la otra; revisar si constan ambas o ninguna.');
  out('- **Materia**: al menos el 75% de las palabras significativas del nombre (o del slug) deben aparecer en la primera página; 50-75% = revisar.');
  out('- "Contenido detectado" (criterios, resuelto, enunciado) es orientativo y no cuenta para el resultado.');
  out();
  return `${lines.join('\n')}\n`;
}


// Reevalúa todo desde los textos ya guardados, sin red. La primera página es lo anterior al primer salto
// de página (\f) que escriben tanto pdftotext como el extractor de pdfjs de este script.
function revalidate(targets, state) {
  let done = 0;
  let missing = 0;
  for (const target of targets) {
    if (!target.url) continue;
    const file = path.join(textDir, `${target.key}.txt`);
    const previous = state.resultados[target.key] && state.resultados[target.key].url === target.url ? state.resultados[target.key] : null;
    if (!existsSync(file)) {
      // Sin texto no hay nada que reevaluar; se conservan los fallos de descarga (404, no PDF) ya registrados.
      if (!previous) missing += 1;
      continue;
    }
    const full = readFileSync(file, 'utf8');
    const first = full.split('\f')[0];
    const evaluation = evaluateText(target, first);
    const base = previous ?? { key: target.key, url: target.url, codigo: target.codigo, materia: target.materia, convocatoria: target.convocatoria, tipoEnlace: target.tipoEnlace, http: null, isPdf: true, notes: [] };
    const carried = (base.notes || []).filter((note) => /^content-type inesperado|^estado reconstruido/.test(note));
    if (!previous) carried.push('estado reconstruido desde el texto guardado (sin datos de la descarga)');
    state.resultados[target.key] = {
      ...base,
      pages: full.split('\f').length - (full.trimEnd().endsWith('\f') ? 1 : 0),
      textChars: full.length,
      ...evaluation,
      notes: [...carried, ...evaluation.notes],
      revalidatedAt: new Date().toISOString(),
    };
    done += 1;
  }
  return { done, missing };
}

// ------------------------------------------------------------------ main
async function main() {
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const targets = buildTargets(data);
  const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { resultados: {} };
  state.resultados ??= {};
  const engine = pickEngine();
  const writeReport = () => { mkdirSync(path.dirname(reportPath), { recursive: true }); writeFileSync(reportPath, renderReport(data, targets, state, engine), 'utf8'); };

  if (flag('--revalidar')) {
    const { done, missing } = revalidate(targets, state);
    state.actualizado = new Date().toISOString();
    writeJsonAtomic(statePath, state);
    writeReport();
    const counts = summarize(targets, state);
    console.log(`Revalidados ${done} textos${missing ? `; ${missing} enlaces sin texto guardado` : ''}`);
    console.log(`✅ pasan: ${counts.pass} · ⚠️ revisar: ${counts.warn} · ❌ fallan: ${counts.fail} · 🔁 error de red: ${counts.error} · ⏳ pendientes: ${counts.pendiente} · sin enlace: ${counts.sinEnlace}`);
    console.log(`Informe: ${path.relative(ROOT, reportPath)} · Estado: ${path.relative(ROOT, statePath)}`);
    return;
  }
  if (flag('--report-only')) {
    writeReport();
    console.log(`Informe regenerado: ${path.relative(ROOT, reportPath)}`);
    return;
  }
  if (engine === 'pdftotext' && !pdftotextAvailable()) throw new Error('pdftotext no está instalado. Instala poppler o usa: npm install --no-save pdfjs-dist');
  if (engine === 'pdfjs') await loadPdfjs().catch(() => { throw new Error('Falta pdftotext y pdfjs-dist. Instala poppler (brew install poppler / apt install poppler-utils) o ejecuta: npm install --no-save pdfjs-dist'); });

  // --solo-fichas verifica solo los enlaces de las fichas, pero el informe sigue cubriendo todo.
  const pending = targets.filter((target) => !flag('--solo-fichas') || target.ficha).filter((target) => {
    if (!target.url) return false;
    const previous = state.resultados[target.key];
    const done = previous && previous.url === target.url && previous.status !== 'error';
    return flag('--force') || !done;
  });
  console.log(`Motor de texto: ${engine} · ${targets.filter((t) => t.url).length} enlaces, ${pending.length} por verificar, pausa ${delayMs} ms`);

  let interrupted = false;
  process.on('SIGINT', () => { interrupted = true; console.log('\nInterrumpido: se guarda el progreso y se genera el informe…'); });

  let index = 0;
  for (const target of pending) {
    if (interrupted) break;
    index += 1;
    const result = await verifyLink(target, engine, flag('--keep-pdf'));
    state.resultados[target.key] = result;
    state.actualizado = new Date().toISOString();
    writeJsonAtomic(statePath, state);
    console.log(`[${index}/${pending.length}] ${target.key.padEnd(28)} ${ICON[result.status]}${result.notes?.length ? ` — ${result.notes[0]}` : ''}`);
  }

  writeReport();
  const counts = summarize(targets, state);
  console.log('\n=== Resumen ===');
  console.log(`✅ pasan: ${counts.pass} · ⚠️ revisar: ${counts.warn} · ❌ fallan: ${counts.fail} · 🔁 error de red: ${counts.error} · ⏳ pendientes: ${counts.pendiente} · sin enlace: ${counts.sinEnlace}`);
  console.log(`Informe: ${path.relative(ROOT, reportPath)} · Estado: ${path.relative(ROOT, statePath)} · Textos: ${path.relative(ROOT, textDir)}/`);
  if (counts.error || counts.pendiente) console.log('Quedan enlaces sin verificar: vuelve a ejecutar el mismo comando para reanudar.');
  process.exitCode = counts.fail || counts.error || counts.pendiente ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 2;
  });
}
