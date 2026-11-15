import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

import { formatNota, outputPathFor, validateData } from '../scripts/build-notas-corte-profiles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = validateData(JSON.parse(readFileSync(path.join(ROOT, 'data', 'notas-corte-2026.json'), 'utf8')));
const hubHtml = readFileSync(path.join(ROOT, 'notas-de-corte.html'), 'utf8');
const redirects = readFileSync(path.join(ROOT, '_redirects'), 'utf8');
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

test('cada entrada tiene fuente verificada y ningún dato inventado', () => {
  assert(data.entries.length > 0, 'debe haber al menos una nota de corte publicada');
  for (const entry of data.entries) {
    const source = data.sources.find((item) => item.id === entry.sourceId);
    assert(source, `sourceId inexistente en ${entry.slug}`);
    assert.equal(source.status, 'verified');
    assert.match(source.sourceUrl, /^https:\/\//);
    assert.match(entry.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert(Number(entry.nota) > 0 && Number(entry.nota) <= 14, `nota fuera de rango en ${entry.slug}`);
  }
  assert(!JSON.stringify(data).includes('pendiente_de_verificar'), 'no debe haber marcadores de pendiente: o se publica verificado o no se publica');
});

test('el build está actualizado y es reproducible', () => {
  const result = spawnSync(process.execPath, ['scripts/build-notas-corte-profiles.mjs', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('cada ficha existe, tiene SEO propio y cita la fuente oficial', () => {
  for (const entry of data.entries) {
    const filePath = outputPathFor(entry);
    assert(existsSync(filePath), `Falta la ficha estática de ${entry.slug}`);
    const html = readFileSync(filePath, 'utf8');
    const source = data.sources.find((item) => item.id === entry.sourceId);

    assert(html.includes(`<link rel="canonical" href="https://miebau.es${entry.url}">`));
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(html.includes(formatNota(entry.nota)));
    assert(html.includes(source.sourceUrl));
    assert.match(html, /<meta name="robots" content="noindex, follow">/, `${entry.slug} debe llevar noindex: las fichas se consolidan en la tabla del hub`);
    assert(!html.includes('Más notas de corte de'), `${entry.slug} no debe enlazar a fichas hermanas`);
    assert(!html.includes('TODO'));
    assert(!/astro|__next|react/i.test(html));
  }
});

test('las rutas limpias no llevan rewrite explícito a .html y NO están en el sitemap (noindex)', () => {
  const rules = redirects.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const entry of data.entries) {
    assert(existsSync(outputPathFor(entry)), `Falta la ficha estática de ${entry.url}`);
    const forbiddenRule = `${entry.url} ${entry.url}.html 200`;
    assert(
      !rules.includes(forbiddenRule),
      `_redirects no debe rewritear ${entry.url} a su .html: Cloudflare Pages ya sirve *.html en la ruta limpia automáticamente y una regla explícita aquí produce un bucle de redirección`,
    );

    assert(!sitemap.includes(`https://miebau.es${entry.url}`), `${entry.url} es noindex y no debe estar en el sitemap`);
  }
  assert(sitemap.includes('<loc>https://miebau.es/notas-de-corte</loc>'), 'el hub debe estar en el sitemap ahora que tiene contenido real');
});

test('el hub muestra el copy real y la cobertura y el dataLayer del filtro no mienten', () => {
  assert(hubHtml.includes('Notas de corte EvAU: la guía antes de elegir grado'));
  assert(hubHtml.includes('¿Qué es la nota de corte?'));
  assert(hubHtml.includes('¿Cómo se calcula tu nota de admisión?'));
  assert(hubHtml.includes('"@type":"FAQPage"'));
  assert(!hubHtml.includes('Próximamente'), 'el hub ya no debe presentarse como una función futura: tiene datos reales');

  const coverageMatch = hubHtml.match(/id="cutoffCoverageBadge">(?:<!--[^>]*-->)?([^<]+)/);
  assert(coverageMatch, 'falta el badge de cobertura');
  assert.equal(coverageMatch[1], `${data.entries.length} notas de corte publicadas`);

  const dataMatch = hubHtml.match(/window\.MIEBAU_CUTOFF_DATA = (\[.*?\]);/s);
  assert(dataMatch, 'falta el array MIEBAU_CUTOFF_DATA embebido');
  const embedded = JSON.parse(dataMatch[1]);
  assert.equal(embedded.length, data.entries.length);
  for (const item of embedded) {
    assert(!('url' in item), `La entrada embebida de ${item.grado} no debe enlazar a una ficha noindex`);
    assert(data.entries.some((entry) => entry.grado === item.grado && entry.nota === item.nota && entry.turno === item.turno), `Entrada embebida no coincide con el dataset: ${item.grado}`);
  }
});

test('la sección de últimas notas de corte respeta prioridad y no enlaza a fichas noindex', () => {
  const startMarker = '<!-- notas-corte-latest:generated:start -->';
  const endMarker = '<!-- notas-corte-latest:generated:end -->';
  const latestBlock = hubHtml.slice(
    hubHtml.indexOf(startMarker) + startMarker.length,
    hubHtml.indexOf(endMarker),
  );
  const expected = [...data.entries].sort((left, right) => right.prioridad - left.prioridad).slice(0, 20);
  const titles = [...latestBlock.matchAll(/<div class="exam-title">([^<]+)<\/div>/g)].map((match) => match[1]);

  assert.deepEqual(titles, expected.map((entry) => entry.grado));
  assert(!/href="\/notas-de-corte\//.test(latestBlock), 'el bloque de últimas notas no debe enlazar a fichas noindex');
});

test('ninguna página del sitio enlaza a las fichas noindex de notas de corte (salvo ellas mismas con el hub)', () => {
  const slugs = data.entries.map((entry) => entry.url);
  const htmlFiles = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.name === '.git' || item.name === 'node_modules') continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.name.endsWith('.html')) htmlFiles.push(full);
    }
  };
  walk(ROOT);
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    for (const url of slugs) {
      assert(!html.includes(`href="${url}"`), `${path.relative(ROOT, file)} enlaza a ${url}, que es noindex`);
    }
  }
});
