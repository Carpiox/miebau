import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

import { outputPathFor, renderProfile, validateData, wordCount } from '../scripts/build-examenes-profiles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = validateData(JSON.parse(readFileSync(path.join(ROOT, 'data', 'examenes-seo.json'), 'utf8')));
const redirects = readFileSync(path.join(ROOT, '_redirects'), 'utf8');
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

test('los lotes contienen exactamente las prioridades 1-30 y sus fuentes oficiales', () => {
  assert.deepEqual(data.entries.map((entry) => entry.prioridad), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(data.entries.slice(10).length, 20);
  assert.equal(data.sources.length, 32);
  assert(data.sources.every((source) => source.status === 'verified'));
  assert(data.sources.every((source) => /^https:\/\/(?:www\.)?(?:um\.es|carm\.es|ucm\.es)\//.test(source.sourceUrl)));
});

test('las introducciones son originales, completas y no contienen marcadores', () => {
  assert(data.entries.every((entry) => {
    const count = wordCount(entry.contenido.intro);
    return count >= 150 && count <= 200;
  }));
  assert(!JSON.stringify(data).includes('TODO'));
});

test('duración, estructura y fuentes están verificadas sin inventar datos pendientes', () => {
  for (const entry of data.entries) {
    const details = entry.contenido.datos_comunidad_asignatura;
    assert.equal(details.duracion_minutos, 90);
    assert.notEqual(details.modelo_examen_vigente, 'pendiente_de_verificar');
    assert.notEqual(details.numero_ejercicios, 'pendiente_de_verificar');
    assert(details.bloques_o_temario_destacado.length > 0);
    assert.equal(details.ponderaciones_2026_2027, 'pendiente_de_verificar');
    assert.equal(details.num_convocatorias_disponibles, 'pendiente_de_verificar');
    assert(
      entry.widget_embed_url === 'pendiente_de_verificar' || /^https:\/\/[^\s]+$/.test(entry.widget_embed_url),
      `widget_embed_url inválido en ${entry.slug}`,
    );
    assert.equal(entry.source_ids.length, 2);
  }
});

test('los enlaces oficiales confirmados se muestran y los estados sin URL no generan botones', () => {
  for (const entry of data.entries) {
    const html = readFileSync(outputPathFor(entry), 'utf8');
    for (const [key, label] of [['ordinaria', 'Ordinaria'], ['extraordinaria', 'Extraordinaria']]) {
      const url = entry.enlace_oficial_examen?.[key];
      if (/^https:\/\/[^\s]+$/.test(url || '')) {
        assert(
          html.includes(`href="${url.replace(/&/g, '&amp;')}"`),
          `Falta el enlace oficial ${key} en ${entry.slug}`,
        );
        assert(html.includes(`Ver examen oficial (PDF) — ${label}`));
      } else {
        assert(!html.includes(`Ver examen oficial (PDF) — ${label}`), `Botón ${key} incorrecto en ${entry.slug}`);
      }
    }
    assert(!html.includes('no_disponible'));
    assert(!html.includes('pendiente_de_verificar'));
  }

  const dataWithUnavailableLinks = structuredClone(data);
  const withoutLinks = dataWithUnavailableLinks.entries[0];
  withoutLinks.enlace_oficial_examen = {
    ordinaria: 'no_disponible',
    extraordinaria: 'pendiente_de_verificar',
  };
  assert.doesNotThrow(() => validateData(dataWithUnavailableLinks));
  const htmlWithoutLinks = renderProfile(data, withoutLinks);
  assert(!htmlWithoutLinks.includes('official-exam-links'));
  assert(!htmlWithoutLinks.includes('Ver examen oficial (PDF)'));
});

test('las denominaciones oficiales actuales se conservan en Empresa, Filosofía e Inglés', () => {
  for (const priority of [9, 24]) {
    assert.equal(data.entries.find((entry) => entry.prioridad === priority).nombre_oficial_vigente, 'Empresa y Diseño de Modelos de Negocio');
  }
  for (const priority of [10, 25]) {
    assert.equal(data.entries.find((entry) => entry.prioridad === priority).nombre_oficial_vigente, 'Historia de la Filosofía');
  }
  assert.equal(data.entries.find((entry) => entry.prioridad === 20).nombre_oficial_vigente, 'Inglés II');
});

test('el build está actualizado y es reproducible', () => {
  const result = spawnSync(process.execPath, ['scripts/build-examenes-profiles.mjs', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('cada ficha entrega SEO y contenido completo en el HTML inicial', () => {
  for (const entry of data.entries) {
    const html = readFileSync(outputPathFor(entry), 'utf8');
    assert.doesNotMatch(html, /<meta\s+name="robots"[^>]*content="[^"]*noindex/i);
    assert(html.includes(`<link rel="canonical" href="https://miebau.es${entry.url}">`));
    assert(html.includes(`<h1>${entry.seo.h1}</h1>`));
    assert(html.includes(entry.contenido.intro));
    assert(html.includes(entry.contenido.datos_comunidad_asignatura.modelo_examen_vigente));
    assert.match(html, /Fuente oficial verificada · PAU 2026/);
    for (const sourceId of entry.source_ids) {
      const source = data.sources.find((item) => item.id === sourceId);
      assert(html.includes(source.sourceUrl.replace(/&/g, '&amp;')), `Falta la fuente ${sourceId} en ${entry.slug}`);
    }
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(!html.includes('TODO'));
  }
});

test('las URLs limpias usan rewrites 200 exactos y sin reglas inversas', () => {
  const rules = redirects.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const entry of data.entries) {
    const expected = `${entry.url} ${entry.url}.html 200`;
    assert.equal(rules.filter((line) => line === expected).length, 1, `Rewrite incorrecto para ${entry.url}`);
    assert(!rules.some((line) => line.startsWith(`${entry.url}.html ${entry.url} `)), `Regla inversa con riesgo de bucle para ${entry.url}`);
  }
});

test('las 30 rutas limpias del lote aparecen una vez en el sitemap', () => {
  for (const entry of data.entries) {
    const expected = `  <url><loc>https://miebau.es${entry.url}</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`;
    assert.equal(sitemap.split(expected).length - 1, 1, `Entrada de sitemap ausente o duplicada para ${entry.url}`);
    assert(!sitemap.includes(`https://miebau.es${entry.url}.html`));
  }
});

test('las fichas no dependen de un framework ni de contenido renderizado por JavaScript', () => {
  for (const entry of data.entries) {
    const html = readFileSync(outputPathFor(entry), 'utf8');
    assert.match(html, /<article class="card prose">[\s\S]*<h2>Cómo es el examen<\/h2>/);
    assert.match(html, /<h2>Estructura verificada para 2026<\/h2>[\s\S]*<dl class="profile-facts">/);
    assert(!/astro|__next|react/i.test(html));
  }
});
