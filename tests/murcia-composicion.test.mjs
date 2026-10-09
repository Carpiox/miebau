import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');
const norm = (text) => text.replace(/\s+/g, ' ').trim();
const composicion = JSON.parse(read('data/murcia/composicion.json'));
const seo = JSON.parse(read('data/examenes-seo.json'));
const verificacion = JSON.parse(read('data/murcia/verificacion.json')).resultados;
const murcia = JSON.parse(read('data/murcia/pau2026_murcia.json'));

const citasDe = (materia) => [
  ...materia.bloques,
  materia.eleccion_general,
  materia.tiempo_por_parte,
  materia.material_permitido,
  materia.video,
  materia.penalizacion_ortografia,
].filter((dato) => dato && dato.cita);

test('cada cita de composicion.json aparece literalmente en el texto del PDF citado', () => {
  assert(composicion.materias.length >= 16);
  for (const materia of composicion.materias) {
    for (const dato of citasDe(materia)) {
      const texto = norm(read(dato.fuente));
      assert(texto.includes(norm(dato.cita)), `${materia.codigo}: cita no encontrada en ${dato.fuente}: «${dato.cita}»`);
    }
  }
});

test('el comprobador de citas rechaza una cita inventada', () => {
  const texto = norm(read('data/murcia/textos/305-ordinaria.txt'));
  assert(!texto.includes(norm('Este examen dura 120 minutos y permite calculadora')));
});

test('la duración de 90 minutos cita el documento oficial de estructura', () => {
  const doc = norm(read('data/murcia/textos/estructura-pruebas.txt'));
  for (const materia of composicion.materias) {
    assert.equal(materia.duracion_minutos.valor, 90);
    assert(doc.includes(norm(materia.duracion_minutos.cita)));
  }
});

test('los puntos de los bloques de cada materia suman 10', () => {
  for (const materia of composicion.materias) {
    const total = materia.bloques.reduce((suma, bloque) => suma + (bloque.puntos ?? 0), 0);
    assert(Math.abs(total - 10) < 1e-9, `${materia.codigo}: suman ${total}`);
  }
});

test('lo que no consta en el PDF queda en null, con su fuente', () => {
  for (const materia of composicion.materias) {
    if (materia.material_permitido.valor === null) assert(materia.material_permitido.fuente.startsWith('no consta en '));
  }
});

test('las fichas nuevas solo enlazan PDF verificados (✅) y respetan las exclusiones', () => {
  const slugs = new Set(composicion.materias.map((materia) => materia.slug));
  for (const materia of composicion.materias) {
    const entry = seo.entries.find((item) => item.slug === `region-de-murcia/${materia.slug}`);
    assert(entry, `Falta la ficha de ${materia.slug}`);
    assert.equal(entry.indexacion, 'index');
    const original = murcia.materias.find((item) => item.codigo === materia.codigo);
    for (const [convocatoria, url] of Object.entries(entry.enlace_oficial_examen)) {
      assert(url.startsWith('https://www.um.es/documents/d/estudios/'));
      const key = `${materia.codigo}-${convocatoria}`;
      assert.equal(verificacion[key]?.status, 'pass', `${key} no pasa la verificación`);
      assert.equal(url, original[convocatoria === 'ordinaria' ? 'ordinaria_junio_2026' : 'extraordinaria_julio_2026'].examen);
    }
  }
  // Portugués (334) y Ciencias Generales (332) no tienen enlaces en el JSON: no se crean fichas.
  assert(!slugs.has('portugues') && !slugs.has('ciencias-generales'));
  assert(!seo.entries.some((item) => item.slug === 'region-de-murcia/portugues' || item.slug === 'region-de-murcia/ciencias-generales'));
  // Literatura Dramática (312) y Movimientos Culturales (331): solo ordinaria.
  for (const slug of ['literatura-dramatica', 'movimientos-culturales-y-artisticos']) {
    const entry = seo.entries.find((item) => item.slug === `region-de-murcia/${slug}`);
    assert.deepEqual(Object.keys(entry.enlace_oficial_examen), ['ordinaria']);
  }
});
