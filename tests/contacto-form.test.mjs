import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageHtml = readFileSync(path.join(ROOT, 'contacto.html'), 'utf8');
const formMatch = pageHtml.match(/<form class="card"[\s\S]*?<\/form>/);

test('el formulario de contacto usa Web3Forms y conserva sus cuatro campos', () => {
  assert(formMatch, 'No se encontró el formulario de contacto');
  const formHtml = formMatch[0];

  assert.match(formHtml, /<form class="card"(?=[^>]*\bname="contacto")(?=[^>]*\bmethod="POST")(?=[^>]*\bdata-web3forms="contacto")[^>]*>/);
  assert(!formHtml.includes('data-netlify'), 'Netlify Forms ya no funciona en Cloudflare Pages: no debe quedar data-netlify');
  assert(!formHtml.includes('name="form-name"'), 'form-name era exclusivo de la detección de Netlify, ya no hace falta');
  assert.match(formHtml, /<p hidden>[^]*?<input name="bot-field">[^]*?<\/p>/, 'se conserva el honeypot, ahora comprobado en js/forms.js');
  assert(formHtml.includes('<p class="form-note" aria-live="polite"></p>'), 'falta el elemento donde js/forms.js muestra la confirmación/error');

  assert.match(formHtml, /<input[^>]*\bid="nombre"[^>]*\bname="nombre"[^>]*>/);
  assert.match(formHtml, /<input[^>]*\bid="correo"[^>]*\bname="correo"[^>]*\btype="email"[^>]*>/);
  assert.match(formHtml, /<select[^>]*\bid="asunto"[^>]*\bname="asunto"[^>]*>/);
  assert.match(formHtml, /<textarea[^>]*\bid="mensaje"[^>]*\bname="mensaje"[^>]*>/);

  assert(!formHtml.includes('onsubmit='));
  assert(!formHtml.includes('preventDefault'));
  assert(!formHtml.includes('data-message'));
});

test('js/site.js carga js/forms.js en todas las páginas', () => {
  const siteJs = readFileSync(path.join(ROOT, 'js', 'site.js'), 'utf8');
  assert(siteJs.includes("'/js/forms.js'"), 'js/forms.js debe formar parte del loader dinámico de scripts de site.js');
  assert(!siteJs.includes("fetch('/', { method: 'POST'"), 'no debe quedar el POST directo a Netlify Forms en el footer');
});
