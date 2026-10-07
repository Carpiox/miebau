import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { ADSENSE_SCRIPT } from '../scripts/build-nav-footer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');

test('ads.txt contiene exactamente la línea del publisher de AdSense', () => {
  assert.equal(read('ads.txt'), 'google.com, pub-2269622537984613, DIRECT, f08c47fec0942fa0\n');
});

test('ads.txt no está bloqueado ni reescrito por robots.txt, _redirects o _headers', () => {
  assert(!/ads\.txt/i.test(read('robots.txt')));
  assert(!/^\s*\/\*|ads\.txt/m.test(read('_redirects').replace(/^#.*$/gm, '')), '_redirects no debe tener reglas que afecten a ads.txt');
  assert.equal(execSync('git ls-files _headers', { cwd: ROOT }).toString().trim(), '');
});

test('todas las páginas HTML llevan el script de AdSense una sola vez, dentro de <head>', () => {
  const files = execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n');
  assert(files.length >= 199);
  for (const file of files) {
    const html = read(file);
    assert.equal(html.split(ADSENSE_SCRIPT).length - 1, 1, `${file}: script ausente o duplicado`);
    assert(html.indexOf(ADSENSE_SCRIPT) < html.indexOf('</head>'), `${file}: script fuera de <head>`);
  }
});
