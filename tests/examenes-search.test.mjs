import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const api = require('../js/examenes.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'examenes-seo.json'), 'utf8'));
const pageHtml = readFileSync(path.join(ROOT, 'examenes.html'), 'utf8');

test('el buscador usa las 30 entradas reales y conserva los alias de los selects', () => {
  assert.equal(data.entries.length, 30);
  assert.equal(api.filterExamEntries(data.entries, { subject: 'Matemáticas II', community: 'Murcia', year: '2026' }).length, 1);
  assert.equal(api.filterExamEntries(data.entries, { subject: 'Matemáticas Aplicadas a las Ciencias Sociales', community: 'Madrid', year: '2026' }).length, 1);
  assert.equal(api.filterExamEntries(data.entries, { subject: 'Historia de la Filosofía', community: 'Madrid', year: '2026' }).length, 1);
  assert.equal(api.filterExamEntries(data.entries, { subject: 'Empresa y Diseño de Modelos de Negocio', community: 'Murcia', year: '2026' }).length, 1);
});

test('una combinación sin ficha real devuelve el estado vacío existente', () => {
  const results = api.filterExamEntries(data.entries, { subject: 'Biología', community: 'Andalucía', year: '2026' });
  assert.deepEqual(results, []);
  assert(api.renderExamCards(results).includes('No se han encontrado exámenes con esos filtros'));
  assert.equal(api.filterExamEntries(data.entries, { subject: 'Biología', community: 'Murcia', year: '2025' }).length, 0);
});

test('todas las cards enlazan a fichas internas existentes y ninguna usa href="#"', () => {
  const results = api.filterExamEntries(data.entries);
  const cards = api.renderExamCards(results);
  const hrefs = [...cards.matchAll(/<a class="exam-link" href="([^"]+)">/g)].map((match) => match[1]);

  assert.equal(results.length, 30);
  assert.equal(hrefs.length, 30);
  assert(!cards.includes('href="#"'));
  for (const href of hrefs) {
    assert.match(href, /^\/examenes\/(?:region-de-murcia|comunidad-de-madrid)\/[a-z0-9-]+$/);
    assert(data.entries.some((entry) => entry.url === href), `Ruta no declarada en el JSON: ${href}`);
    assert(existsSync(path.join(ROOT, `${href.slice(1)}.html`)), `No existe la ficha estática de ${href}`);
  }
});

test('examenes.html carga el buscador real y no conserva la generación de ejemplo', () => {
  assert(pageHtml.includes('<script src="/js/examenes.js"></script>'));
  assert(pageHtml.includes('<option>2026</option>'));
  assert(!pageHtml.includes("pdf: '#'"));
  assert(!pageHtml.includes('href="${r.pdf}"'));
});
