// Auditoría de contenido de las fichas /examenes/<comunidad>/<asignatura>.
// Solo lectura: no modifica ninguna ficha. Con --out <ruta> escribe el informe en Markdown;
// sin él imprime las tablas por consola.
//
//   node scripts/audit-contenido.mjs [--out informe-contenido.md] [--json]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_WORDS = 300;
const SHINGLE = 5;
const SIM_FLAG = 0.6;
const REPEAT_MIN_PAGES = 3;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

const argv = process.argv.slice(2);
const outPath = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null;

// ---------------------------------------------------------------- carga
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'examenes-seo.json'), 'utf8'));

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function bodyHtml(html) {
  let main = (html.match(/<main\b[\s\S]*<\/main>/) || [''])[0];
  main = main.replace(/<(script|style|nav|footer)\b[\s\S]*?<\/\1>/g, '');
  // Bloque "Sigue explorando": desde su h2 hasta el cierre del <article>.
  main = main.replace(/<h2>Sigue explorando exámenes<\/h2>[\s\S]*?(?=<\/article>)/, '');
  return main;
}

function fragmentsOf(html) {
  // Un fragmento por elemento de bloque, para no unir texto de elementos distintos.
  return html
    .replace(/<\/(p|li|h[1-6]|dt|dd|div|a|span|section|header|article|aside|ul|dl)>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) => decode(line).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const words = (text) => text.split(/\s+/).filter(Boolean);
const norm = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

const fichas = data.entries.map((entry) => {
  const file = path.join(ROOT, 'examenes', `${entry.slug}.html`);
  const html = readFileSync(file, 'utf8');
  const body = bodyHtml(html);
  const fragments = fragmentsOf(body);
  const text = fragments.join(' ');
  const sentences = fragments
    .flatMap((fragment) => fragment.split(/(?<=[.!?])\s+/))
    .map(norm)
    .filter((sentence) => words(sentence).length >= 3);
  const tokens = words(norm(text));
  const shingles = new Set();
  for (let i = 0; i + SHINGLE <= tokens.length; i += 1) shingles.add(tokens.slice(i, i + SHINGLE).join(' '));
  const [comunidad, asignatura] = entry.slug.split('/');
  return {
    entry,
    url: entry.url,
    comunidad,
    asignatura,
    palabras: words(text).length,
    headings: (body.match(/<h[23]\b/g) || []).length,
    enlaces: [...body.matchAll(/<a\b[^>]*?href="(\/[^"]*)"/g)].length,
    sentences,
    shingles,
    html,
  };
});

// ---------------------------------------------------------------- 1. palabras
const porPalabras = [...fichas].sort((a, b) => a.palabras - b.palabras);

// ---------------------------------------------------------------- 2. duplicación
const jaccard = (a, b) => {
  let inter = 0;
  for (const item of a) if (b.has(item)) inter += 1;
  return inter / (a.size + b.size - inter);
};

const pares = [];
for (let i = 0; i < fichas.length; i += 1) {
  for (let j = i + 1; j < fichas.length; j += 1) {
    const a = fichas[i];
    const b = fichas[j];
    const tipo = a.asignatura === b.asignatura ? 'misma asignatura, distinta comunidad'
      : a.comunidad === b.comunidad ? 'misma comunidad, distinta asignatura'
        : 'distinta comunidad y asignatura';
    pares.push({ a: a.url, b: b.url, tipo, sim: jaccard(a.shingles, b.shingles) });
  }
}
pares.sort((x, y) => y.sim - x.sim);
const media = (list) => (list.length ? list.reduce((sum, item) => sum + item.sim, 0) / list.length : 0);
const porTipo = [...new Set(pares.map((par) => par.tipo))].map((tipo) => {
  const list = pares.filter((par) => par.tipo === tipo);
  return { tipo, n: list.length, media: media(list), max: Math.max(...list.map((p) => p.sim)) };
});
const paresAltos = pares.filter((par) => par.sim > SIM_FLAG);

// ---------------------------------------------------------------- 3. plantilla vs único
const sentenceDocs = new Map();
for (const ficha of fichas) {
  for (const sentence of new Set(ficha.sentences)) {
    sentenceDocs.set(sentence, (sentenceDocs.get(sentence) || 0) + 1);
  }
}
for (const ficha of fichas) {
  const total = ficha.sentences.length;
  const repetidas = ficha.sentences.filter((sentence) => sentenceDocs.get(sentence) >= REPEAT_MIN_PAGES);
  ficha.frases = total;
  ficha.frasesRepetidas = repetidas.length;
  ficha.pctPlantilla = total ? repetidas.length / total : 0;
  const palabrasRepetidas = repetidas.reduce((sum, sentence) => sum + words(sentence).length, 0);
  const palabrasTotal = ficha.sentences.reduce((sum, sentence) => sum + words(sentence).length, 0);
  ficha.pctPlantillaPalabras = palabrasTotal ? palabrasRepetidas / palabrasTotal : 0;
  ficha.palabrasUnicas = palabrasTotal - palabrasRepetidas;
}

// ---------------------------------------------------------------- 4. metadatos
for (const ficha of fichas) {
  ficha.title = ficha.html.match(/<title>([\s\S]*?)<\/title>/)[1];
  ficha.description = decode(ficha.html.match(/<meta name="description" content="([^"]*)"/)[1]);
  ficha.title = decode(ficha.title);
}
const dupes = (key) => {
  const map = new Map();
  for (const ficha of fichas) map.set(ficha[key], [...(map.get(ficha[key]) || []), ficha.url]);
  return [...map.entries()].filter(([, urls]) => urls.length > 1);
};
const titleStem = (ficha) => norm(ficha.title.replace(/\|.*$/, ''))
  .replace(/\b(region de murcia|comunidad de madrid|murcia|madrid|evau|pau|examenes?|de|la|el)\b/g, ' ')
  .replace(/\s+/g, ' ').trim();
const titulosParecidos = fichas
  .filter((ficha) => ficha.comunidad === 'region-de-murcia')
  .map((a) => {
    const b = fichas.find((other) => other.comunidad === 'comunidad-de-madrid' && other.asignatura === a.asignatura);
    return { a, b, sim: jaccard(new Set(words(titleStem(a))), new Set(words(titleStem(b)))) };
  });

// ---------------------------------------------------------------- resumen para decidir prioridad
for (const ficha of fichas) {
  const maxPar = pares.filter((par) => par.a === ficha.url || par.b === ficha.url).sort((x, y) => y.sim - x.sim)[0];
  ficha.parMasParecido = maxPar ? { url: maxPar.a === ficha.url ? maxPar.b : maxPar.a, sim: maxPar.sim } : null;
  // Puntuación de prioridad: cuanto menos texto único, más plantilla y más parecido a otra, más urgente.
  ficha.prioridad = (1 - Math.min(ficha.palabrasUnicas / MIN_WORDS, 1)) * 0.4
    + ficha.pctPlantillaPalabras * 0.3
    + (ficha.parMasParecido?.sim || 0) * 0.3;
}
const ranking = [...fichas].sort((a, b) => b.prioridad - a.prioridad);

// ---------------------------------------------------------------- salida
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const lines = [];
const out = (line = '') => lines.push(line);
const short = (url) => url.replace('/examenes/', '');
const cell = (value) => String(value).replace(/\|/g, '\\|');

out('## 1. Palabras por ficha (texto visible del cuerpo, sin nav, footer, script, style ni "Sigue explorando")');
out();
out('| URL | Palabras | h2/h3 | Enlaces internos | Aviso |');
out('|---|---:|---:|---:|---|');
for (const ficha of porPalabras) {
  out(`| ${short(ficha.url)} | ${ficha.palabras} | ${ficha.headings} | ${ficha.enlaces} | ${ficha.palabras < MIN_WORDS ? `< ${MIN_WORDS}` : ''} |`);
}
out();
out(`Fichas por debajo de ${MIN_WORDS} palabras: **${porPalabras.filter((f) => f.palabras < MIN_WORDS).length} de ${fichas.length}**. Mínimo ${porPalabras[0].palabras}, máximo ${porPalabras.at(-1).palabras}, media ${Math.round(porPalabras.reduce((s, f) => s + f.palabras, 0) / fichas.length)}.`);
out();
out(`## 2. Duplicación entre fichas (Jaccard sobre shingles de ${SHINGLE} palabras)`);
out();
out('### Los 15 pares más parecidos');
out();
out('| # | Ficha A | Ficha B | Similitud | Tipo de par |');
out('|---:|---|---|---:|---|');
pares.slice(0, 15).forEach((par, index) => out(`| ${index + 1} | ${short(par.a)} | ${short(par.b)} | ${pct(par.sim)} | ${par.tipo} |`));
out();
out('### Media por tipo de par');
out();
out('| Tipo de par | Pares | Similitud media | Similitud máxima |');
out('|---|---:|---:|---:|');
for (const row of porTipo) out(`| ${row.tipo} | ${row.n} | ${pct(row.media)} | ${pct(row.max)} |`);
out();
out(`Pares con más de ${SIM_FLAG * 100}% de similitud: **${paresAltos.length}**${paresAltos.length ? ':' : '.'}`);
for (const par of paresAltos) out(`- ${short(par.a)} ↔ ${short(par.b)}: ${pct(par.sim)}`);
out();
out(`## 3. Texto plantilla (frases idénticas en ${REPEAT_MIN_PAGES} o más fichas)`);
out();
out('| URL | Frases | Frases repetidas | % frases plantilla | % palabras plantilla | Palabras únicas |');
out('|---|---:|---:|---:|---:|---:|');
for (const ficha of [...fichas].sort((a, b) => b.pctPlantillaPalabras - a.pctPlantillaPalabras)) {
  out(`| ${short(ficha.url)} | ${ficha.frases} | ${ficha.frasesRepetidas} | ${pct(ficha.pctPlantilla)} | ${pct(ficha.pctPlantillaPalabras)} | ${ficha.palabrasUnicas} |`);
}
const avg = (key) => fichas.reduce((sum, f) => sum + f[key], 0) / fichas.length;
out();
out(`Media: ${pct(avg('pctPlantilla'))} de las frases y ${pct(avg('pctPlantillaPalabras'))} de las palabras son plantilla; palabras únicas por ficha de media: ${Math.round(avg('palabrasUnicas'))}.`);
out();
out('### Frases repetidas más frecuentes');
out();
const topSentences = [...sentenceDocs.entries()].filter(([, n]) => n >= REPEAT_MIN_PAGES)
  .sort((a, b) => words(b[0]).length * b[1] - words(a[0]).length * a[1]).slice(0, 12);
for (const [sentence, n] of topSentences) out(`- (${n} fichas) ${sentence.length > 160 ? `${sentence.slice(0, 157)}…` : sentence}`);
out();
out('## 4. Metadatos');
out();
out(`| URL | Title | Long. | Meta description | Long. | Avisos |`);
out('|---|---|---:|---|---:|---|');
for (const ficha of fichas) {
  const avisos = [];
  if (ficha.title.length > TITLE_MAX) avisos.push(`title > ${TITLE_MAX}`);
  if (ficha.description.length < DESC_MIN) avisos.push(`desc < ${DESC_MIN}`);
  if (ficha.description.length > DESC_MAX) avisos.push(`desc > ${DESC_MAX}`);
  out(`| ${short(ficha.url)} | ${cell(ficha.title)} | ${ficha.title.length} | ${cell(ficha.description)} | ${ficha.description.length} | ${avisos.join(', ')} |`);
}
out();
const dupTitles = dupes('title');
const dupDescs = dupes('description');
out(`Títulos duplicados exactos: **${dupTitles.length}**. Descripciones duplicadas exactas: **${dupDescs.length}**.`);
for (const [value, urls] of [...dupTitles, ...dupDescs]) out(`- "${value}": ${urls.map(short).join(', ')}`);
out();
out('### Títulos de la misma asignatura en las dos comunidades (diferencia solo en la comunidad)');
out();
out('| Asignatura | Title Murcia | Title Madrid | Similitud tras quitar comunidad/"PAU"/"EvAU" |');
out('|---|---|---|---:|');
for (const row of titulosParecidos.sort((x, y) => y.sim - x.sim)) {
  out(`| ${row.a.asignatura} | ${cell(row.a.title)} | ${cell(row.b.title)} | ${pct(row.sim)} |`);
}
const count = (fn) => fichas.filter(fn).length;
out();
out(`Resumen: ${count((f) => f.title.length > TITLE_MAX)} titles > ${TITLE_MAX}; ${count((f) => f.description.length < DESC_MIN)} descriptions < ${DESC_MIN}; ${count((f) => f.description.length > DESC_MAX)} descriptions > ${DESC_MAX}. Por comunidad, descriptions < ${DESC_MIN}: Murcia ${count((f) => f.comunidad === 'region-de-murcia' && f.description.length < DESC_MIN)}, Madrid ${count((f) => f.comunidad === 'comunidad-de-madrid' && f.description.length < DESC_MIN)}.`);
out(`Titles con "EvAU": ${count((f) => /EvAU/.test(f.title))}; con "PAU": ${count((f) => /\bPAU\b/.test(f.title))}. Titles con "Región de Murcia"/"Comunidad de Madrid": ${count((f) => /(Región de Murcia|Comunidad de Madrid)/.test(f.title))}; con "Murcia"/"Madrid" a secas: ${count((f) => !/(Región de Murcia|Comunidad de Madrid)/.test(f.title))}.`);
out();
out('## 5. Prioridad de ampliación (puntuación = 40% falta de texto único + 30% plantilla + 30% similitud con su par más parecido)');
out();
out('| # | URL | Palabras | Únicas | % plantilla | Par más parecido | Similitud | Puntuación |');
out('|---:|---|---:|---:|---:|---|---:|---:|');
ranking.forEach((ficha, index) => out(`| ${index + 1} | ${short(ficha.url)} | ${ficha.palabras} | ${ficha.palabrasUnicas} | ${pct(ficha.pctPlantillaPalabras)} | ${ficha.parMasParecido ? short(ficha.parMasParecido.url) : '-'} | ${ficha.parMasParecido ? pct(ficha.parMasParecido.sim) : '-'} | ${ficha.prioridad.toFixed(3)} |`));

const text = `${lines.join('\n')}\n`;
if (outPath) writeFileSync(path.resolve(ROOT, outPath), text, 'utf8');
else process.stdout.write(text);
