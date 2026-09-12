import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const api = require('../js/forms.js');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('el endpoint es el de la API pública de Web3Forms', () => {
  assert.equal(api.WEB3FORMS_ENDPOINT, 'https://api.web3forms.com/submit');
});

test('el payload lleva la access key, descarta los campos internos de Netlify y añade el asunto', () => {
  const entries = [
    ['form-name', 'contacto'],
    ['bot-field', ''],
    ['nombre', 'Ana'],
    ['correo', 'ana@example.com'],
    ['mensaje', 'Hola'],
  ];
  const payload = api.buildWeb3FormsPayload(entries, { subject: api.subjectFor('contacto', entries) });

  assert.equal(payload.access_key, 'c4fda362-0900-4250-89ee-9dc680092943');
  assert.equal(payload.nombre, 'Ana');
  assert.equal(payload.correo, 'ana@example.com');
  assert.equal(payload.mensaje, 'Hola');
  assert.equal(payload.subject, 'Nuevo mensaje de contacto — Miebau');
  assert(!('form-name' in payload), 'form-name era solo para la detección de Netlify');
  assert(!('bot-field' in payload), 'el honeypot no debe reenviarse a Web3Forms');
});

test('el asunto de aviso-ponderaciones incluye la universidad cuando el formulario la lleva', () => {
  const entries = [['universidad', 'UNED'], ['email', 'x@example.com']];
  assert.equal(api.subjectFor('aviso-ponderaciones', entries), 'Aviso de ponderaciones — Miebau (UNED)');
  assert.equal(api.subjectFor('contacto', []), 'Nuevo mensaje de contacto — Miebau');
});

test('el honeypot relleno se detecta sin necesidad de llamar a la red', () => {
  assert.equal(api.isHoneypotFilled([['bot-field', '']]), false);
  assert.equal(api.isHoneypotFilled([['bot-field', 'soy un bot']]), true);
});

test('contacto.html, el footer (newsletter) y las 82 fichas de ponderaciones ya no usan Netlify Forms', () => {
  const ponderacionesDir = path.join(ROOT, 'ponderaciones');
  const files = [
    path.join(ROOT, 'contacto.html'),
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'js', 'site.js'),
    ...readdirSync(ponderacionesDir).filter((name) => name.endsWith('.html')).map((name) => path.join(ponderacionesDir, name)),
  ];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    assert(!html.includes('data-netlify'), `Netlify Forms residual en ${path.relative(ROOT, file)}`);
    assert(!html.includes('netlify-honeypot'), `Netlify Forms residual en ${path.relative(ROOT, file)}`);
    assert(!html.includes('name="form-name"'), `form-name residual en ${path.relative(ROOT, file)}`);
  }
});

test('las fichas con aviso de ponderaciones migraron a Web3Forms y conservan el honeypot', () => {
  const withNotice = readdirSync(path.join(ROOT, 'ponderaciones'))
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(ROOT, 'ponderaciones', name))
    .filter((file) => readFileSync(file, 'utf8').includes('name="aviso-ponderaciones"'));

  assert(withNotice.length > 0, 'no se encontró ninguna ficha con el formulario de aviso');
  for (const file of withNotice) {
    const html = readFileSync(file, 'utf8');
    assert(html.includes('data-web3forms="aviso-ponderaciones"'), `Falta data-web3forms en ${path.relative(ROOT, file)}`);
    assert.match(html, /<p hidden>[^]*?<input name="bot-field">[^]*?<\/p>/, `Falta el honeypot en ${path.relative(ROOT, file)}`);
    assert(html.includes('<p class="form-note" aria-live="polite"></p>'), `Falta la confirmación en ${path.relative(ROOT, file)}`);
  }
});
