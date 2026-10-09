#!/usr/bin/env node
// Aplica la regla de resolución a los enlaces de examen de las fichas de Murcia que difieren del JSON de la UMU
// (hoy: 306 Matemáticas II ordinaria, 313 Dibujo Técnico II extraordinaria y 322 Química ordinaria).
//
// Requiere haber ejecutado antes la verificación:   node scripts/verificar-enlaces-murcia.mjs --solo-fichas
// (que descarga el enlace de la ficha y el del JSON y deja el resultado en data/murcia/verificacion.json).
//
// Regla (por conflicto, claves <codigo>-<convocatoria>-ficha frente a <codigo>-<convocatoria>):
//   1. Enlace de la ficha ✅ y el del JSON ✅ y es otro archivo:
//        - si es la versión nueva del mismo archivo (el nombre solo cambia en un sufijo -vN): se usa el del JSON
//          (decisión del usuario para 313: «si ambos son julio 2026, prefiere v2»);
//        - si no (examen resuelto, criterios...): la ficha conserva su enlace como examen y el del JSON pasa al
//          campo aparte enlace_oficial_resuelto.
//   2. Enlace de la ficha ❌ y el del JSON ✅: se sustituye por el del JSON.
//   3. Cualquier otro caso (⚠️, error de red, sin resultado, ninguno pasa): no se cambia nada y se avisa.
//
// Uso:
//   node scripts/resolver-conflictos-murcia.mjs              # muestra decisiones y diff, no escribe nada
//   node scripts/resolver-conflictos-murcia.mjs --aplicar    # escribe data/examenes-seo.json
// Después: node scripts/build-examenes-profiles.mjs && node --test tests/*.test.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fichaTargets } from './verificar-enlaces-murcia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEO_PATH = path.join(ROOT, 'data', 'examenes-seo.json');
const JSON_PATH = path.join(ROOT, 'data', 'murcia', 'pau2026_murcia.json');
const STATE_PATH = path.join(ROOT, 'data', 'murcia', 'verificacion.json');

const ICON = { pass: '✅', warn: '⚠️', fail: '❌', error: '🔁' };
const sinVersion = (url) => url.replace(/-v\d+(?=-pdf$|$)/, '');

// Decide qué hacer con un conflicto. `ficha` y `json` son los resultados de verificacion.json (o undefined).
export function decidir(conflicto, ficha, json) {
  const base = { clave: conflicto.key, codigo: conflicto.codigo, convocatoria: conflicto.convocatoria, urlFicha: conflicto.url, urlJson: conflicto.urlJson };
  const estado = (res) => (res ? res.status : 'sin resultado');
  if (!ficha) return { ...base, accion: 'ninguna', motivo: 'el enlace de la ficha no está verificado: ejecuta primero la verificación' };
  if (ficha.status === 'pass') {
    if (!conflicto.urlJson) return { ...base, accion: 'ninguna', motivo: 'el JSON no trae otro enlace' };
    if (!json || json.status !== 'pass') return { ...base, accion: 'ninguna', motivo: `la ficha pasa, pero el enlace del JSON no (${estado(json)}): no se añade nada` };
    if (sinVersion(conflicto.url) === sinVersion(conflicto.urlJson)) {
      return { ...base, accion: 'sustituir', examen: conflicto.urlJson, motivo: 'ambos pasan y el del JSON es una versión nueva del mismo archivo (-vN)' };
    }
    return { ...base, accion: 'anadir-resuelto', resuelto: conflicto.urlJson, motivo: 'ambos pasan y son archivos distintos: la ficha conserva su examen y el del JSON va a enlace_oficial_resuelto' };
  }
  if (ficha.status === 'fail') {
    if (json && json.status === 'pass' && conflicto.urlJson) return { ...base, accion: 'sustituir', examen: conflicto.urlJson, motivo: 'el enlace de la ficha falla y el del JSON pasa' };
    return { ...base, accion: 'ninguna', motivo: `el enlace de la ficha falla y el del JSON tampoco sirve (${estado(json)}): hay que buscar otro` };
  }
  return { ...base, accion: 'ninguna', motivo: `el enlace de la ficha está en ${estado(ficha)}: revisión manual` };
}

// ---------- edición textual de data/examenes-seo.json (no se reformatea nada más)
const obj = (entries, pad) => `{\n${entries.map(([k, v]) => `${pad}  "${k}": ${JSON.stringify(v)}`).join(',\n')}\n${pad}}`;

export function aplicarDecisiones(seoText, decisiones, slugDe) {
  const lines = seoText.split('\n');
  const cambios = [];
  const porSlug = new Map();
  for (const decision of decisiones.filter((item) => item.accion !== 'ninguna')) {
    const slug = slugDe(decision);
    porSlug.set(slug, [...(porSlug.get(slug) ?? []), decision]);
  }
  for (const [slug, lista] of porSlug) {
    const slugLine = lines.findIndex((line) => line.includes(`"slug": "region-de-murcia/${slug}"`));
    if (slugLine < 0) throw new Error(`No se encuentra la ficha ${slug}`);
    const start = lines.findIndex((line, index) => index > slugLine && /^\s*"enlace_oficial_examen":\s*\{$/.test(line));
    if (start < 0) throw new Error(`La ficha ${slug} no tiene enlace_oficial_examen`);
    const pad = lines[start].match(/^\s*/)[0];
    let end = start + 1;
    // Los valores son planos: el primer cierre de llave es el del bloque (algunas fichas antiguas lo sangran distinto).
    while (!/^\s*\}/.test(lines[end])) end += 1;
    const examen = JSON.parse(`{${lines.slice(start, end + 1).join('\n').replace(/,\s*$/, '')}}`).enlace_oficial_examen;
    // ¿ya existe un bloque enlace_oficial_resuelto justo después?
    const resueltoStart = /^\s*"enlace_oficial_resuelto":\s*\{$/.test(lines[end + 1] ?? '') ? end + 1 : -1;
    const resuelto = {};
    for (const decision of lista) {
      if (decision.accion === 'sustituir') examen[decision.convocatoria] = decision.examen;
      if (decision.accion === 'anadir-resuelto') resuelto[decision.convocatoria] = decision.resuelto;
    }
    const before = lines.slice(start, end + 1).join('\n');
    const nuevoExamen = `${pad}"enlace_oficial_examen": ${obj(Object.entries(examen), pad)}`;
    const tieneMas = lines[end].endsWith(',');
    let replacement = nuevoExamen;
    if (Object.keys(resuelto).length) {
      if (resueltoStart >= 0) throw new Error(`La ficha ${slug} ya tiene enlace_oficial_resuelto: revísalo a mano`);
      replacement += `,\n${pad}"enlace_oficial_resuelto": ${obj(Object.entries(resuelto), pad)}`;
    }
    if (tieneMas) replacement += ',';
    lines.splice(start, end - start + 1, ...replacement.split('\n'));
    cambios.push({ slug, antes: before, despues: replacement });
  }
  return { texto: lines.join('\n'), cambios };
}

function main() {
  const aplicar = process.argv.includes('--aplicar');
  const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  const state = JSON.parse(readFileSync(STATE_PATH, 'utf8')).resultados ?? {};
  const conflictos = fichaTargets(data);
  if (!conflictos.length) {
    console.log('No hay enlaces de fichas que difieran del JSON de la UMU: nada que resolver.');
    return;
  }
  const decisiones = conflictos.map((conflicto) => decidir(conflicto, state[conflicto.key], state[conflicto.key.replace(/-ficha$/, '')]));
  console.log('Conflictos entre las fichas y el JSON de la UMU\n');
  for (const decision of decisiones) {
    const ficha = state[decision.clave];
    const json = state[decision.clave.replace(/-ficha$/, '')];
    console.log(`${decision.clave}`);
    console.log(`  ficha ${ICON[ficha?.status] ?? '⏳'}  ${decision.urlFicha}`);
    console.log(`  JSON  ${ICON[json?.status] ?? '⏳'}  ${decision.urlJson}`);
    console.log(`  → ${decision.accion}: ${decision.motivo}\n`);
  }
  const slugDe = (decision) => {
    const materia = data.materias.find((item) => item.codigo === decision.codigo);
    const alias = { 'historia-de-la-filosofia': 'filosofia' };
    return alias[materia.slug] ?? materia.slug;
  };
  const seoText = readFileSync(SEO_PATH, 'utf8');
  const { texto, cambios } = aplicarDecisiones(seoText, decisiones, slugDe);
  if (!cambios.length) {
    console.log('Ninguna decisión modifica los datos.');
    return;
  }
  console.log('Diff propuesto en data/examenes-seo.json\n');
  for (const cambio of cambios) {
    console.log(`@@ region-de-murcia/${cambio.slug}`);
    for (const line of cambio.antes.split('\n')) console.log(`- ${line}`);
    for (const line of cambio.despues.split('\n')) console.log(`+ ${line}`);
    console.log();
  }
  JSON.parse(texto);
  if (aplicar) {
    writeFileSync(SEO_PATH, texto, 'utf8');
    console.log('Aplicado. Ahora: node scripts/build-examenes-profiles.mjs && node --test tests/*.test.mjs');
  } else {
    console.log('Vista previa: no se ha escrito nada. Añade --aplicar para escribirlo.');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
