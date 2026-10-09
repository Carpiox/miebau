import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { renderProfile, validateData } from '../scripts/build-examenes-profiles.mjs';
import { aplicarDecisiones, decidir } from '../scripts/resolver-conflictos-murcia.mjs';
import { fichaTargets } from '../scripts/verificar-enlaces-murcia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seoText = readFileSync(path.join(ROOT, 'data', 'examenes-seo.json'), 'utf8');
const murcia = JSON.parse(readFileSync(path.join(ROOT, 'data', 'murcia', 'pau2026_murcia.json'), 'utf8'));
const pass = { status: 'pass' };
const fail = { status: 'fail' };

test('la verificación detecta los tres conflictos conocidos entre las fichas y el JSON', () => {
  const claves = fichaTargets(murcia).map((target) => target.key).sort();
  assert.deepEqual(claves, ['306-ordinaria-ficha', '313-extraordinaria-ficha', '322-ordinaria-ficha']);
});

const conflicto = (clave) => fichaTargets(murcia).find((target) => target.key === clave);

test('ficha ✅ y JSON ✅ con otro archivo: la ficha conserva el examen y el del JSON va al campo aparte', () => {
  const decision = decidir(conflicto('306-ordinaria-ficha'), pass, pass);
  assert.equal(decision.accion, 'anadir-resuelto');
  assert.equal(decision.resuelto, conflicto('306-ordinaria-ficha').urlJson);
});

test('ficha ✅ y JSON ✅ con una versión -vN del mismo archivo: se usa la del JSON (313)', () => {
  const decision = decidir(conflicto('313-extraordinaria-ficha'), pass, pass);
  assert.equal(decision.accion, 'sustituir');
  assert(decision.examen.endsWith('313-dibujo-tecnico-ii-v2-pdf'));
});

test('ficha ❌ y JSON ✅: se sustituye; ficha ❌ y JSON ❌: no se cambia nada', () => {
  assert.equal(decidir(conflicto('322-ordinaria-ficha'), fail, pass).accion, 'sustituir');
  assert.equal(decidir(conflicto('322-ordinaria-ficha'), fail, fail).accion, 'ninguna');
});

test('ficha ⚠️, error de red o sin resultado: no se cambia nada', () => {
  for (const ficha of [{ status: 'warn' }, { status: 'error' }, undefined]) {
    assert.equal(decidir(conflicto('322-ordinaria-ficha'), ficha, pass).accion, 'ninguna');
  }
  // ficha ✅ pero el JSON no pasa: tampoco se añade el campo aparte
  assert.equal(decidir(conflicto('306-ordinaria-ficha'), pass, fail).accion, 'ninguna');
});

test('aplicarDecisiones solo toca el bloque de enlaces de las fichas afectadas y el resultado es JSON válido', () => {
  const decisiones = [
    decidir(conflicto('306-ordinaria-ficha'), pass, pass),
    decidir(conflicto('313-extraordinaria-ficha'), pass, pass),
    decidir(conflicto('322-ordinaria-ficha'), fail, pass),
  ];
  const slugDe = (decision) => ({ 306: 'matematicas-ii', 313: 'dibujo-tecnico-ii', 322: 'quimica' })[decision.codigo];
  const { texto, cambios } = aplicarDecisiones(seoText, decisiones, slugDe);
  assert.equal(cambios.length, 3);
  const nuevo = JSON.parse(texto);
  const entry = (slug) => nuevo.entries.find((item) => item.slug === `region-de-murcia/${slug}`);
  assert.deepEqual(Object.keys(entry('matematicas-ii').enlace_oficial_resuelto), ['ordinaria']);
  assert(entry('dibujo-tecnico-ii').enlace_oficial_examen.extraordinaria.endsWith('-v2-pdf'));
  assert(entry('quimica').enlace_oficial_examen.ordinaria.endsWith('quimica-junio-resuelto-pdf'));
  assert.doesNotThrow(() => validateData(nuevo));
  // El resto del archivo queda byte a byte igual: solo cambian líneas de los bloques de enlaces.
  const antes = seoText.split('\n');
  const despues = texto.split('\n');
  const distintas = despues.filter((line) => !antes.includes(line));
  assert(distintas.every((line) => /https:\/\/www\.um\.es|enlace_oficial_resuelto|^\s*[{}],?$|"ordinaria"|"extraordinaria"/.test(line)), `líneas inesperadas: ${distintas.filter((line) => !/https:\/\/www\.um\.es|enlace_oficial_resuelto|^\s*[{}],?$/.test(line))}`);
  // El HTML de la ficha muestra el enlace aparte como botón secundario.
  const html = renderProfile(nuevo, entry('matematicas-ii'));
  assert(html.includes('Ver solución o criterios oficiales (PDF) — Ordinaria'));
  assert(html.includes('Ver examen oficial (PDF) — Ordinaria'));
});

test('sin decisiones aplicables no se modifica el archivo', () => {
  const { texto, cambios } = aplicarDecisiones(seoText, [decidir(conflicto('306-ordinaria-ficha'), undefined, undefined)], () => 'matematicas-ii');
  assert.equal(cambios.length, 0);
  assert.equal(texto, seoText);
});
