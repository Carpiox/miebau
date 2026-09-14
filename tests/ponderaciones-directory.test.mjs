import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

import { applyDirectory, renderDirectory } from '../scripts/build-ponderaciones-directory.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'ponderaciones-2026-2027.json'), 'utf8'));
const html = readFileSync(path.join(ROOT, 'ponderaciones.html'), 'utf8');

test('el directorio de universidades por comunidad ya está en el HTML estático de ponderaciones.html', () => {
  assert(html.includes('<!-- ponderaciones-directory:generated:start -->'));
  assert(html.includes('<!-- ponderaciones-directory:generated:end -->'));
  assert(!html.includes('Elige una comunidad autónoma para ver sus universidades públicas y privadas. También puedes buscar una universidad directamente.'), 'el placeholder solo-JS debe haber sido sustituido por el directorio real');
});

test('las 82 universidades tienen un <a href> real a su ficha, agrupadas por comunidad', () => {
  for (const university of data.universities) {
    assert(university.profile, `Falta el campo profile de ${university.id}`);
    assert(html.includes(`<a class="catalog-profile-link" href="${university.profile}">Ver ponderaciones →</a>`), `Falta el enlace real a ${university.id} en el directorio`);
  }
});

test('las universidades sin hermanas en su comunidad ya no son huérfanas (uniovi, uclm, uex)', () => {
  for (const id of ['uniovi', 'uclm', 'uex']) {
    const university = data.universities.find((item) => item.id === id);
    assert(university, `No existe la universidad ${id} en el dataset`);
    assert(html.includes(`href="${university.profile}"`), `${id} sigue sin un enlace real en ponderaciones.html`);
  }
});

test('el directorio agrupa por comunidad y separa públicas de privadas', () => {
  const regions = [...new Set(data.universities.map((item) => item.region))];
  for (const region of regions) {
    const hasPublic = data.universities.some((item) => item.region === region && item.type === 'public');
    const hasPrivate = data.universities.some((item) => item.region === region && item.type !== 'public');
    if (hasPublic) assert(html.includes(`<h3>${region} · Universidades públicas</h3>`), `Falta el grupo público de ${region}`);
    if (hasPrivate) assert(html.includes(`<h3>${region} · Universidades privadas</h3>`), `Falta el grupo privado de ${region}`);
  }
});

test('build-ponderaciones-directory.mjs --check es idempotente y no depende de que se ejecute JS', () => {
  assert.equal(applyDirectory(html, data), html, 'una segunda pasada de applyDirectory cambia el HTML: el marcador no es idempotente');
  assert(renderDirectory(data).startsWith('<!-- ponderaciones-directory:generated:start -->'));
  assert(renderDirectory(data).endsWith('<!-- ponderaciones-directory:generated:end -->'));

  const jsSource = readFileSync(path.join(ROOT, 'js', 'ponderaciones.js'), 'utf8');
  assert(jsSource.includes("doc.getElementById('regionQuickLinks')"), 'el JS de cliente sigue existiendo para el filtro interactivo');
});
