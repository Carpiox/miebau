import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

import { applyNavFooter, renderFooter, renderNav, TOP_LEVEL_PAGES } from '../scripts/build-nav-footer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function allHtmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) allHtmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

test('las 17 páginas de nivel superior llevan el nav/footer canónico con el activeKey esperado', () => {
  for (const { file, activeKey } of TOP_LEVEL_PAGES) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    assert(html.includes(renderNav(activeKey)), `nav incorrecto o desactualizado en ${file}`);
    assert(html.includes(renderFooter()), `footer incorrecto o desactualizado en ${file}`);
  }
});

test('build-nav-footer.mjs --check es idempotente sobre las 17 páginas', () => {
  for (const { file, activeKey } of TOP_LEVEL_PAGES) {
    const html = readFileSync(path.join(ROOT, file), 'utf8');
    assert.equal(applyNavFooter(html, activeKey), html, `una segunda pasada de applyNavFooter cambia ${file}: el placeholder no es idempotente`);
  }
});

test('ninguna página del repo conserva el placeholder vacío de nav/footer (ni el footer legado de index/examenes)', () => {
  const files = allHtmlFiles(ROOT);
  assert(files.length > 190, 'la búsqueda de HTML no encontró el número esperado de archivos');
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    assert(!/<nav class="navbar"( aria-label="Navegación principal")?><\/nav>/.test(html), `placeholder de nav vacío en ${path.relative(ROOT, file)}`);
    assert(!html.includes('<footer></footer>'), `placeholder de footer vacío en ${path.relative(ROOT, file)}`);
    assert(!html.includes('class="footer-inner"'), `footer legado sin migrar en ${path.relative(ROOT, file)}`);
  }
});

test('las fichas generadas marcan el activeKey correcto en el nav (examenes, ponderaciones, notas-de-corte)', () => {
  const samples = [
    { dir: 'examenes/region-de-murcia', activeKey: 'examenes' },
    { dir: 'ponderaciones', activeKey: 'ponderaciones' },
    { dir: 'notas-de-corte', activeKey: 'notas-de-corte' },
  ];
  for (const { dir, activeKey } of samples) {
    const files = readdirSync(path.join(ROOT, dir)).filter((name) => name.endsWith('.html'));
    assert(files.length > 0, `no hay fichas en ${dir}`);
    for (const name of files) {
      const html = readFileSync(path.join(ROOT, dir, name), 'utf8');
      assert(html.includes(renderNav(activeKey)), `nav incorrecto en ${dir}/${name}`);
      assert(html.includes(renderFooter()), `footer incorrecto en ${dir}/${name}`);
    }
  }
});

test('js/site.js ya no construye el nav/footer con outerHTML: solo engancha el toggle móvil', () => {
  const siteJs = readFileSync(path.join(ROOT, 'js', 'site.js'), 'utf8');
  assert(!siteJs.includes('.outerHTML ='), 'site.js ya no debe construir markup con outerHTML');
  assert(!siteJs.includes('function header()'), 'header() como constructor de markup ya no debe existir');
  assert(!siteJs.includes('function footer()'), 'footer() como constructor de markup ya no debe existir');
  assert(siteJs.includes("getElementById('navToggle')"), 'wireNav debe engancharse al #navToggle ya presente en el HTML');
  assert(siteJs.includes("getElementById('siteMenu')"), 'wireNav debe engancharse al #siteMenu ya presente en el HTML');
});
