import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = readFileSync(path.join(ROOT, 'js/share.js'), 'utf8');

function setup({ share, clipboard, execCommand = () => false } = {}) {
  const status = { textContent: '', classList: { contains: () => true } };
  const button = {
    attrs: { 'data-share-title': 'Titulo', 'data-share-status': '#st' },
    getAttribute(k) { return this.attrs[k] ?? null; },
  };
  let onClick;
  const document = {
    title: 'Pagina', body: { appendChild() {}, removeChild() {} },
    addEventListener(type, fn) { if (type === 'click') onClick = fn; },
    querySelector(sel) { return sel === 'link[rel="canonical"]' ? { href: 'https://miebau.es/' } : sel === '#st' ? status : null; },
    createElement: () => ({ style: {}, setAttribute() {}, select() {} }),
    execCommand,
  };
  const window = { requestAnimationFrame: (fn) => fn() };
  const navigator = { share, clipboard };
  const context = vm.createContext({ window, document, navigator, location: { origin: 'https://miebau.es', pathname: '/' }, setTimeout: () => 0, clearTimeout() {}, WeakMap, Promise });
  vm.runInContext(SOURCE, context);
  const click = async () => {
    const event = { target: { closest: () => button }, preventDefault() {} };
    onClick(event);
    await new Promise((resolve) => setImmediate(resolve));
  };
  return { status, click };
}

test('usa la Web Share API con la URL canónica y título del botón', async () => {
  const calls = [];
  const { click, status } = setup({ share: async (data) => { calls.push(data); } });
  await click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://miebau.es/');
  assert.equal(calls[0].title, 'Titulo');
  assert.match(status.textContent, /Gracias/);
});

test('cancelar el diálogo de compartir no muestra error ni copia el enlace', async () => {
  let copied = false;
  const { click, status } = setup({
    share: async () => { throw Object.assign(new Error('cancel'), { name: 'AbortError' }); },
    clipboard: { writeText: async () => { copied = true; } },
  });
  await click();
  assert.equal(copied, false);
  assert.equal(status.textContent, '');
});

test('sin Web Share API copia el enlace y avisa «Enlace copiado»', async () => {
  let text = null;
  const { click, status } = setup({ clipboard: { writeText: async (value) => { text = value; } } });
  await click();
  assert.equal(text, 'https://miebau.es/');
  assert.equal(status.textContent, 'Enlace copiado');
});

test('si falla Web Share (no por cancelar) cae al portapapeles', async () => {
  let text = null;
  const { click, status } = setup({ share: async () => { throw new Error('NotAllowedError'); }, clipboard: { writeText: async (value) => { text = value; } } });
  await click();
  assert.equal(text, 'https://miebau.es/');
  assert.equal(status.textContent, 'Enlace copiado');
});

test('si el portapapeles falla usa execCommand y, si tampoco, enseña el enlace', async () => {
  const a = setup({ clipboard: { writeText: async () => { throw new Error('denied'); } }, execCommand: () => true });
  await a.click();
  assert.equal(a.status.textContent, 'Enlace copiado');
  const b = setup({ clipboard: { writeText: async () => { throw new Error('denied'); } }, execCommand: () => false });
  await b.click();
  assert.match(b.status.textContent, /Copia este enlace: https:\/\/miebau\.es\//);
});

test('los botones de compartir de la home y /examenes son botones reales con zona aria-live', () => {
  for (const file of ['index.html', 'examenes.html']) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    assert(/<button class="btn [^"]*" type="button" data-share /.test(html), `${file}: botón sin type="button" y data-share`);
    assert(!/onclick="navigator\.share/.test(html), `${file}: queda un onclick inline`);
    const target = html.match(/data-share-status="#([^"]+)"/)[1];
    assert(new RegExp(`id="${target}" role="status" aria-live="polite"`).test(html), `${file}: falta la región aria-live #${target}`);
  }
});
