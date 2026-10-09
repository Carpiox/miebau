import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', 'tests', 'scripts', 'data', 'assets', 'css', 'js', 'docs', 'reports']);

function htmlFiles(dir = ROOT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

const urlOf = (file) => {
  const route = `/${path.relative(ROOT, file).replace(/\\/g, '/').replace(/\.html$/, '')}`;
  return route === '/index' ? '/' : route;
};

const pages = htmlFiles().map((file) => ({ file, url: urlOf(file), html: readFileSync(file, 'utf8') }));
const indexable = pages.filter((page) => !/<meta[^>]+name="robots"[^>]+noindex/i.test(page.html));
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>https:\/\/miebau\.es([^<]*)<\/loc>/g)].map((match) => match[1] || '/');

test('el sitemap no repite URLs', () => {
  assert.equal(new Set(locs).size, locs.length);
});

test('toda URL del sitemap corresponde a una página real indexable con canónica igual', () => {
  const byUrl = new Map(indexable.map((page) => [page.url, page]));
  for (const loc of locs) {
    const page = byUrl.get(loc);
    assert(page, `${loc} está en el sitemap pero no es una página indexable del repo`);
    assert(page.html.includes(`rel="canonical" href="https://miebau.es${loc === '/' ? '/' : loc}"`), `${loc}: canónica distinta`);
  }
});

test('toda página indexable del repo está en el sitemap (si falta, añádela: docs/mantenimiento-murcia.md)', () => {
  const enSitemap = new Set(locs);
  const faltan = indexable.map((page) => page.url).filter((url) => !enSitemap.has(url));
  assert.deepEqual(faltan, [], `Páginas indexables que faltan en sitemap.xml: ${faltan.join(', ')}`);
});

test('las páginas noindex no están en el sitemap', () => {
  const enSitemap = new Set(locs);
  for (const page of pages.filter((item) => !indexable.includes(item))) assert(!enSitemap.has(page.url), `${page.url} es noindex y está en el sitemap`);
});
