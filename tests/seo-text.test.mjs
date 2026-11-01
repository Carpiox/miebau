import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { DESC_MAX, DESC_MIN, TITLE_MAX, pickDescription, pickTitle } from '../scripts/seo-text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 404 es una página de error (noindex, sin descripción propia).
const pages = () => execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n').filter((file) => file !== '404.html');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function metadata() {
  return pages().map((file) => {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    return {
      file,
      title: decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''),
      description: decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''),
    };
  });
}

test(`todos los títulos tienen entre 1 y ${TITLE_MAX} caracteres`, () => {
  for (const { file, title } of metadata()) assert(title.length > 0 && title.length <= TITLE_MAX, `${file}: título de ${title.length} caracteres: ${title}`);
});

test(`todas las descripciones tienen entre ${DESC_MIN} y ${DESC_MAX} caracteres`, () => {
  for (const { file, description } of metadata()) assert(description.length >= DESC_MIN && description.length <= DESC_MAX, `${file}: descripción de ${description.length} caracteres: ${description}`);
});

test('no hay títulos ni descripciones repetidos entre páginas', () => {
  for (const field of ['title', 'description']) {
    const seen = new Map();
    for (const page of metadata()) {
      assert(!seen.has(page[field]), `${field} repetido en ${page.file} y ${seen.get(page[field])}`);
      seen.set(page[field], page.file);
    }
  }
});

test('pickTitle y pickDescription eligen la primera variante válida y fallan si ninguna cabe', () => {
  assert.equal(pickTitle(['x'.repeat(61), 'corto']), 'corto');
  assert.throws(() => pickTitle(['x'.repeat(61)]));
  const ok = 'y'.repeat(130);
  assert.equal(pickDescription(['z'.repeat(100), ok, 'w'.repeat(130)]), ok);
  assert.throws(() => pickDescription(['z'.repeat(100), 'z'.repeat(200)]));
});
