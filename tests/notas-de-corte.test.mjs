import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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
    assert.doesNotMatch(html, /<meta\s+name="robots"[^>]*content="[^"]*noindex/i, `${entry.slug} no debería llevar noindex: ya está verificado`);
    assert(!html.includes('TODO'));
    assert(!/astro|__next|react/i.test(html));
  }
});

test('las rutas limpias no llevan rewrite explícito a .html y están una vez en el sitemap', () => {
  const rules = redirects.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const entry of data.entries) {
    assert(existsSync(outputPathFor(entry)), `Falta la ficha estática de ${entry.url}`);
    const forbiddenRule = `${entry.url} ${entry.url}.html 200`;
    assert(
      !rules.includes(forbiddenRule),
      `_redirects no debe rewritear ${entry.url} a su .html: Cloudflare Pages ya sirve *.html en la ruta limpia automáticamente y una regla explícita aquí produce un bucle de redirección`,
    );

    const expectedSitemapEntry = `<loc>https://miebau.es${entry.url}</loc>`;
    assert.equal(sitemap.split(expectedSitemapEntry).length - 1, 1, `Entrada de sitemap ausente o duplicada para ${entry.url}`);
    assert(!sitemap.includes(`https://miebau.es${entry.url}.html`));
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
    assert(data.entries.some((entry) => entry.url === item.url && entry.grado === item.grado), `Entrada embebida no coincide con el dataset: ${item.url}`);
  }
});

test('la sección de últimas notas de corte respeta prioridad y enlaza a fichas existentes', () => {
  const startMarker = '<!-- notas-corte-latest:generated:start -->';
  const endMarker = '<!-- notas-corte-latest:generated:end -->';
  const latestBlock = hubHtml.slice(
    hubHtml.indexOf(startMarker) + startMarker.length,
    hubHtml.indexOf(endMarker),
  );
  const expected = [...data.entries].sort((left, right) => right.prioridad - left.prioridad).slice(0, 20);
  const hrefs = [...latestBlock.matchAll(/<a class="exam-link" href="([^"]+)">/g)].map((match) => match[1]);

  assert.deepEqual(hrefs, expected.map((entry) => entry.url));
  for (const entry of expected) {
    assert(existsSync(outputPathFor(entry)), `No existe la ficha estática de ${entry.url}`);
  }
});
