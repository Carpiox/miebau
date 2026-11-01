import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { FONT_LINKS } from '../scripts/build-nav-footer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('css/style.css no usa @import (bloqueaba el render en cadena)', () => {
  assert(!/@import/.test(readFileSync(path.join(ROOT, 'css/style.css'), 'utf8')));
});

test('todas las páginas cargan Google Fonts con preconnect + <link> display=swap antes de la hoja de estilos propia', () => {
  const files = execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n');
  const block = FONT_LINKS.split('\n  ');
  assert.equal(block.length, 3);
  for (const file of files) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    for (const line of block) assert.equal(html.split(line).length - 1, 1, `${file}: falta o se repite ${line.slice(0, 60)}`);
    assert(html.includes('display=swap'), `${file}: sin display=swap`);
    const fonts = html.indexOf('fonts.googleapis.com/css2');
    const own = html.search(/<link rel="stylesheet" href="[^"]*style\.css/);
    assert(fonts > -1 && own > fonts, `${file}: Google Fonts debe ir antes de style.css`);
    assert(html.indexOf('rel="preconnect" href="https://fonts.googleapis.com"') < fonts, `${file}: el preconnect debe ir antes`);
  }
});
