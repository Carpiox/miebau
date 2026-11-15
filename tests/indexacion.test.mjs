import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

function htmlFiles(dir = ROOT, out = []) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name === '.git' || item.name === 'node_modules') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) htmlFiles(full, out);
    else if (item.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const urlOf = (file) => {
  const relative = path.relative(ROOT, file).replace(/\.html$/, '');
  return relative === 'index' ? '/' : `/${relative}`;
};

test('el sitemap contiene exactamente las páginas sin noindex (ni una más, ni una menos)', () => {
  const inSitemap = new Set([...sitemap.matchAll(/<loc>https:\/\/miebau\.es([^<]*)<\/loc>/g)].map((match) => match[1] || '/'));
  const indexable = new Set();
  for (const file of htmlFiles()) {
    const html = readFileSync(file, 'utf8');
    const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
    const url = urlOf(file);
    if (!noindex) indexable.add(url);
    assert.equal(inSitemap.has(url), !noindex, `${url}: ${noindex ? 'es noindex pero está en el sitemap' : 'es indexable pero no está en el sitemap'}`);
  }
  for (const url of inSitemap) assert(indexable.has(url), `${url} está en el sitemap pero no existe o es noindex`);
  assert.equal(inSitemap.size, new Set([...sitemap.matchAll(/<loc>/g)]).size, 'URLs duplicadas en el sitemap');
});
