import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = () => execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n');
const clean = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');

test('la jerarquía de encabezados nunca salta de nivel hacia abajo (H1 → H3, H2 → H4…)', () => {
  for (const file of files()) {
    const levels = [...clean(readFileSync(path.join(ROOT, file), 'utf8')).matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]));
    levels.forEach((level, index) => {
      if (index > 0) assert(level - levels[index - 1] <= 1, `${file}: salto de h${levels[index - 1]} a h${level}`);
    });
  }
});

// Flechas e iconos Unicode decorativos (→ ← ↗ ✦ ⌁ ▦ emoji…) deben ir en un elemento aria-hidden.
// «×» se excluye a propósito: en fórmulas y medidas es un operador con significado.
const DECORATIVE = /[←-⯿\u{1F000}-\u{1FAFF}]/u;
const VOID = new Set(['meta', 'link', 'br', 'hr', 'img', 'input', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr']);

test('los símbolos Unicode decorativos están dentro de un elemento aria-hidden="true"', () => {
  for (const file of files()) {
    const html = clean(readFileSync(path.join(ROOT, file), 'utf8'));
    const stack = [];
    for (const match of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
      if (match[4] !== undefined) {
        if (DECORATIVE.test(match[4]) && !stack.some((item) => item.hidden)) assert.fail(`${file}: símbolo decorativo fuera de aria-hidden: ${match[4].trim().slice(0, 50)}`);
        continue;
      }
      const [, close, tag, attrs] = match;
      if (close) { const index = stack.map((item) => item.tag).lastIndexOf(tag.toLowerCase()); if (index >= 0) stack.length = index; continue; }
      if (VOID.has(tag.toLowerCase()) || /\/$/.test(attrs)) continue;
      stack.push({ tag: tag.toLowerCase(), hidden: /aria-hidden="true"/.test(attrs) });
    }
  }
});
