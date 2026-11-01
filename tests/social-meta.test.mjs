import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_URL, OG_IMAGE_WIDTH } from '../scripts/seo-meta.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOINDEX_PAGES = new Set(['404.html', 'proximamente.html']);
const pages = () => execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n').filter((file) => !NOINDEX_PAGES.has(file));

function jpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }
  throw new Error('No se pudo leer el tamaño del JPEG');
}

test('la imagen social existe y mide 1200x630', () => {
  const size = jpegSize(readFileSync(path.join(ROOT, OG_IMAGE_PATH)));
  assert.deepEqual(size, { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT });
  assert.equal(OG_IMAGE_URL, `https://miebau.es${OG_IMAGE_PATH}`);
});

test('todas las páginas indexables traen Open Graph y Twitter Cards estáticas y bien formadas', () => {
  const required = [
    ['meta property="og:title"', 1], ['meta property="og:description"', 1], ['meta property="og:url"', 1],
    [`meta property="og:image" content="${OG_IMAGE_URL}"`, 1], ['meta property="og:image:width" content="1200"', 1],
    ['meta property="og:image:height" content="630"', 1], ['meta property="og:image:alt"', 1],
    ['meta name="twitter:card" content="summary_large_image"', 1], ['meta name="twitter:title"', 1],
    ['meta name="twitter:description"', 1], [`meta name="twitter:image" content="${OG_IMAGE_URL}"`, 1],
  ];
  for (const file of pages()) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    for (const [needle, count] of required) {
      assert.equal(html.split(`<${needle}`).length - 1, count, `${file}: ${needle} debe aparecer ${count} vez`);
    }
    assert(!/meta-og:|name="og:|property="twitter:/.test(html), `${file}: metas sociales mal formadas`);
    assert(!html.includes('miniatura.jpg'), `${file}: sigue usando la imagen 500x500`);
    const og = html.match(/<meta property="og:title" content="([^"]*)"/)[1];
    assert(og.length > 0, `${file}: og:title vacío`);
  }
});
