import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageHtml = readFileSync(path.join(ROOT, 'contacto.html'), 'utf8');
const formMatch = pageHtml.match(/<form class="card"[\s\S]*?<\/form>/);

test('el formulario de contacto usa Netlify Forms y conserva sus cuatro campos', () => {
  assert(formMatch, 'No se encontró el formulario de contacto');
  const formHtml = formMatch[0];

  assert.match(formHtml, /<form class="card"(?=[^>]*\bname="contacto")(?=[^>]*\bmethod="POST")(?=[^>]*\bdata-netlify="true")(?=[^>]*\bnetlify-honeypot="bot-field")[^>]*>/);
  assert(formHtml.includes('<input type="hidden" name="form-name" value="contacto">'));
  assert.match(formHtml, /<p hidden>[^]*?<input name="bot-field">[^]*?<\/p>/);

  assert.match(formHtml, /<input[^>]*\bid="nombre"[^>]*\bname="nombre"[^>]*>/);
  assert.match(formHtml, /<input[^>]*\bid="correo"[^>]*\bname="correo"[^>]*\btype="email"[^>]*>/);
  assert.match(formHtml, /<select[^>]*\bid="asunto"[^>]*\bname="asunto"[^>]*>/);
  assert.match(formHtml, /<textarea[^>]*\bid="mensaje"[^>]*\bname="mensaje"[^>]*>/);

  assert(!formHtml.includes('onsubmit='));
  assert(!formHtml.includes('preventDefault'));
  assert(!formHtml.includes('data-message'));
});
