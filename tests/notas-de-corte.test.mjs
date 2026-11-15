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

test('el hub muestra el copy real, la cobertura y una tabla estática con todas las notas', () => {
  assert(hubHtml.includes('Notas de corte de la Universidad de Murcia (curso 2025-2026)'));
  assert(hubHtml.includes('¿Qué es la nota de corte?'));
  assert(hubHtml.includes('Cómo calcular tu nota para compararla con la nota de corte'));
  assert(hubHtml.includes('"@type":"FAQPage"'));
  assert(!hubHtml.includes('Próximamente'), 'el hub ya no debe presentarse como una función futura: tiene datos reales');
  assert(!hubHtml.includes('MIEBAU_CUTOFF_DATA'), 'los datos ya no se embeben como array: la tabla estática es la fuente');

  const coverageMatch = hubHtml.match(/id="cutoffCoverageBadge">(?:<!--[^>]*-->)?([^<]+)/);
  assert(coverageMatch, 'falta el badge de cobertura');
  assert.equal(coverageMatch[1], `${data.entries.length} notas de corte publicadas`);

  const rows = [...hubHtml.matchAll(/<tr data-grado="([^"]*)"[^>]*data-nota="([^"]*)">([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, data.entries.length, 'la tabla debe tener una fila por entrada del dataset');
  const decode = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  for (const entry of data.entries) {
    const row = rows.find((candidate) => decode(candidate[1]) === entry.grado);
    assert(row, `Falta la fila de ${entry.grado}`);
    assert.equal(Number(row[2]), Number(entry.nota));
    assert(row[3].includes(formatNota(entry.nota)), `La nota mostrada no coincide en ${entry.grado}`);
    assert(row[3].includes(entry.turno.replace(/&/g, '&amp;')), `El cupo mostrado no coincide en ${entry.grado}`);
  }
});

test('la tabla del hub va ordenada por nota, no enlaza a fichas noindex y cita la fuente oficial', () => {
  const startMarker = '<!-- notas-corte-table:generated:start -->';
  const endMarker = '<!-- notas-corte-table:generated:end -->';
  const block = hubHtml.slice(hubHtml.indexOf(startMarker) + startMarker.length, hubHtml.indexOf(endMarker));
  const notes = [...block.matchAll(/data-nota="([^"]+)"/g)].map((match) => Number(match[1]));
  assert.deepEqual(notes, [...notes].sort((a, b) => b - a));
  assert(!/href="\/notas-de-corte\//.test(block), 'la tabla no debe enlazar a fichas noindex');
  for (const source of data.sources) assert(block.includes(source.sourceUrl), `Falta la fuente ${source.id}`);
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
