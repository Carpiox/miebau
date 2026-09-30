import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { COMMUNITIES, FEATURED_HOME, GROUPS } from '../scripts/examenes-taxonomia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'examenes-seo.json'), 'utf8'));
const sitemap = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');
const hrefs = (html) => [...html.matchAll(/<a\b[^>]*?href="([^"]*)"/g)].map((match) => match[1]);
const bodyOf = (html) => html.replace(/<(nav|footer)\b[\s\S]*?<\/\1>/g, '');
const fileForUrl = (url) => (url === '/' ? 'index.html' : `${url.replace(/^\//, '')}.html`);

const communityKeys = Object.keys(COMMUNITIES);

test('la taxonomía cubre exactamente las asignaturas del dataset, cada una en un solo grupo', () => {
  const slugs = [...new Set(data.entries.map((entry) => entry.slug.split('/')[1]))].sort();
  const grouped = GROUPS.flatMap((group) => group.slugs).sort();
  assert.deepEqual(grouped, slugs);
  assert.deepEqual(GROUPS.find((group) => group.key === 'comunes').slugs.sort(), [
    'filosofia', 'historia-de-espana', 'ingles', 'lengua-castellana-y-literatura-ii',
  ]);
});

test('cada comunidad tiene índice estático, canónico, indexable y en el sitemap una sola vez', () => {
  for (const key of communityKeys) {
    const html = read(`examenes/${key}.html`);
    const url = `https://miebau.es/examenes/${key}`;
    assert(html.includes(`<link rel="canonical" href="${url}">`));
    assert(!/name="robots"/.test(html), `${key} no debe llevar meta robots`);
    assert.equal((html.match(/<h1/g) || []).length, 1);
    assert.equal(sitemap.split(`<loc>${url}</loc>`).length - 1, 1);
    const entries = data.entries.filter((entry) => entry.slug.startsWith(`${key}/`));
    for (const entry of entries) {
      assert(hrefs(html).includes(entry.url), `${key} no enlaza a ${entry.url}`);
    }
    for (const group of GROUPS) assert(html.includes(`<h2>${group.label}</h2>`), `Falta grupo ${group.label} en ${key}`);
  }
});

test('las intros de los índices de comunidad no comparten frases', () => {
  const sentences = communityKeys.map((key) => new Set(COMMUNITIES[key].intro.split(/(?<=[.!?])\s+/)));
  for (const sentence of sentences[0]) assert(!sentences[1].has(sentence), `Frase repetida: ${sentence}`);
});

test('cada ficha enlaza a su índice, a la calculadora, a relacionadas y a ponderaciones', () => {
  for (const entry of data.entries) {
    const [key] = entry.slug.split('/');
    const html = read(`examenes/${entry.slug}.html`);
    const links = hrefs(bodyOf(html));
    assert(links.includes(`/examenes/${key}`), `${entry.slug}: sin enlace al índice de comunidad`);
    assert(links.includes('/calculadora'), `${entry.slug}: sin enlace a la calculadora`);
    assert(html.includes('<h2>Asignaturas relacionadas</h2>'));
    assert(html.includes(`<h3>Otras asignaturas de ${entry.comunidad}</h3>`));
    for (const uni of COMMUNITIES[key].ponderaciones.slice(0, 1)) assert(links.includes(uni.href));
    const siblings = links.filter((href) => href.startsWith(`/examenes/${key}/`) && href !== entry.url);
    assert.equal(new Set(siblings).size, 14, `${entry.slug}: deben enlazarse las otras 14 asignaturas`);
  }
});

test('los párrafos de asignaturas relacionadas no se repiten entre fichas de la misma comunidad', () => {
  for (const key of communityKeys) {
    const seen = new Set();
    for (const entry of data.entries.filter((item) => item.slug.startsWith(`${key}/`))) {
      const html = read(`examenes/${entry.slug}.html`);
      const paragraph = html.match(/<h2>Asignaturas relacionadas<\/h2>\s*<p>([\s\S]*?)<\/p>/)[1];
      assert(!seen.has(paragraph), `Párrafo duplicado en ${entry.slug}`);
      seen.add(paragraph);
    }
  }
});

test('la home y el hub /examenes enlazan con HTML estático a los índices y a las troncales', () => {
  const home = read('index.html');
  const hub = read('examenes.html');
  for (const key of communityKeys) {
    assert(hrefs(bodyOf(home)).includes(`/examenes/${key}`));
    assert(hrefs(bodyOf(hub)).includes(`/examenes/${key}`));
  }
  for (const slug of FEATURED_HOME) {
    for (const key of communityKeys) {
      assert(hrefs(bodyOf(home)).includes(`/examenes/${key}/${slug}`), `Home sin ${key}/${slug}`);
    }
  }
});

test('ninguna página de exámenes usa anchors genéricos, enlaces rotos ni URLs .html', () => {
  const files = [
    'index.html', 'examenes.html',
    ...communityKeys.map((key) => `examenes/${key}.html`),
    ...data.entries.map((entry) => `examenes/${entry.slug}.html`),
  ];
  for (const file of files) {
    const html = read(file);
    for (const match of html.matchAll(/<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const [, href, text] = match;
      assert(!/^\s*(haz clic aquí|clic aquí|click aquí|aquí|pincha aquí|ver más)\s*$/i.test(text.replace(/<[^>]+>/g, '')), `${file}: anchor genérico "${text}"`);
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const clean = href.split('#')[0];
      if (!clean) continue;
      assert(!clean.endsWith('.html'), `${file}: enlace a .html ${href}`);
      if (/\.(css|js|svg|png|jpg|webmanifest)$/.test(clean)) continue;
      assert(existsSync(path.join(ROOT, fileForUrl(clean))), `${file}: enlace roto ${href}`);
    }
  }
});

test('cada ficha recibe al menos 5 enlaces entrantes desde el cuerpo de otras páginas', () => {
  const pages = [
    'index.html', 'examenes.html',
    ...communityKeys.map((key) => `examenes/${key}.html`),
    ...data.entries.map((entry) => `examenes/${entry.slug}.html`),
  ];
  const inbound = new Map(data.entries.map((entry) => [entry.url, new Set()]));
  for (const file of pages) {
    const self = `/${file.replace(/\.html$/, '')}`;
    for (const href of hrefs(bodyOf(read(file)))) {
      if (inbound.has(href) && href !== self) inbound.get(href).add(file);
    }
  }
  for (const [url, sources] of inbound) assert(sources.size >= 5, `${url}: solo ${sources.size} entrantes`);
});
