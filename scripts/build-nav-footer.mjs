#!/usr/bin/env node
// Fuente única del nav y el footer del sitio. Antes se construían en runtime
// en js/site.js (header()/footer(), sustituyendo <nav class="navbar"></nav> y
// <footer></footer> vacíos por HTML inyectado con JS) — invisibles para
// cualquier crawler que no ejecute JavaScript (Ahrefs, y potencialmente el
// primer pase de Googlebot). Ahora el nav/footer real se sirve estático desde
// el HTML de cada página; js/site.js solo engancha comportamiento (toggle
// móvil) sobre el markup ya presente.
//
// Este script mantiene sincronizadas las 17 páginas de nivel superior (las
// que no genera ningún otro script). Los generadores de fichas
// (build-examenes-profiles.mjs, build-notas-corte-profiles.mjs,
// build-ponderaciones-profiles.mjs) importan renderNav/renderFooter de aquí
// y son responsables de aplicarlo a sus propias fichas.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const NAV_ITEMS = [
  { key: 'calculadora', href: '/calculadora', label: 'Calculadora' },
  { key: 'ponderaciones', href: '/ponderaciones', label: 'Ponderaciones' },
  { key: 'examenes', href: '/examenes', label: 'Exámenes' },
  { key: 'notas-de-corte', href: '/notas-de-corte', label: 'Notas de corte' },
  { key: 'guias', href: '/guias', label: 'Guías' },
  { key: 'premium', href: '/premium', label: 'Premium' },
  { key: 'sobre-nosotros', href: '/sobre-nosotros', label: 'Sobre nosotros' },
];

const LOGO = '<span class="brand-mark" aria-hidden="true">✓</span><span>mi<span style="color:var(--primary)">ebau</span></span>';

// Coincide con: los dos placeholders vacíos que existen hoy en el repo (con
// y sin aria-label), el footer "legado" que arrastraban index.html y
// examenes.html (markup distinto, clase .footer-inner, que footer() pisaba
// en runtime), y el propio nav/footer ya renderizado por este script — así
// --check y una re-ejecución son idempotentes en vez de fallar al no
// encontrar ya el placeholder original.
const NAV_PLACEHOLDER = /<nav class="navbar"(?: aria-label="Navegación principal")?><\/nav>|<nav class="navbar site-nav" aria-label="Navegación principal">[\s\S]*?<\/nav>/;
const FOOTER_PLACEHOLDER = /<footer><\/footer>|<footer><div class="footer-inner">[\s\S]*?<\/footer>|<footer class="site-footer">[\s\S]*?<\/footer>/;

export function renderNav(activeKey = null) {
  const items = NAV_ITEMS.map(({ key, href, label }) => {
    const cls = key === activeKey ? ' class="active"' : '';
    return `<li><a${cls} href="${href}">${label}</a></li>`;
  }).join('');
  return `<nav class="navbar site-nav" aria-label="Navegación principal"><div class="navbar-inner"><a class="navbar-brand" href="/" aria-label="Miebau, inicio">${LOGO}</a><button class="nav-toggle" id="navToggle" type="button" aria-label="Abrir menú" aria-expanded="false"><span></span></button><ul class="navbar-links" id="siteMenu">${items}</ul><div class="nav-actions"><a class="btn btn-primary nav-cta" href="/calculadora">Calcular mi nota</a></div></div></nav>`;
}

export function renderFooter() {
  return `<footer class="site-footer"><div class="site-footer-inner"><div class="footer-top"><div class="footer-intro"><a class="navbar-brand" href="/">${LOGO}</a><p>Herramientas claras para tomar decisiones con calma antes, durante y después de la EvAU.</p><div class="social-links" aria-label="Redes sociales"><a href="/proximamente" aria-label="Instagram">IG</a><a href="/proximamente" aria-label="TikTok">TT</a><a href="/proximamente" aria-label="X">X</a></div></div><div class="footer-column"><div class="footer-heading">Herramientas</div><a href="/calculadora">Calculadora</a><a href="/ponderaciones">Ponderaciones</a><a href="/examenes">Exámenes</a><a href="/notas-de-corte">Notas de corte</a><a href="/calendario-ebau">Calendario EBAU</a></div><div class="footer-column"><div class="footer-heading">Premium</div><a href="/premium">Miebau Premium</a><a href="/precios">Precios</a><a href="/preguntas-frecuentes">Preguntas frecuentes</a></div><div class="footer-column"><div class="footer-heading">Sobre nosotros</div><a href="/sobre-nosotros">Sobre nosotros</a><a href="/guias">Guías</a><a href="/contacto">Contacto</a></div><div class="footer-column"><div class="footer-heading">Legal</div><a href="/aviso-legal">Aviso legal</a><a href="/politica-privacidad">Privacidad</a><a href="/politica-cookies">Cookies</a></div></div><section class="newsletter" aria-labelledby="newsletterTitle"><div><h3 id="newsletterTitle">Una nota menos de incertidumbre</h3><p>Recibe novedades y guías prácticas para preparar la EvAU.</p></div><div><form class="newsletter-form" data-web3forms="newsletter" name="newsletter"><input type="text" name="bot-field" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><input type="email" name="email" aria-label="Tu correo electrónico" placeholder="tu@email.com" required><button class="btn btn-primary" type="submit">Suscribirme</button></form><p class="newsletter-note" aria-live="polite"></p><p class="newsletter-consent">Al suscribirte aceptas recibir estos correos. Consulta la <a href="/politica-privacidad">política de privacidad</a>.</p></div></section><div class="footer-bottom"><span>© 2026 Miebau. Todos los derechos reservados.</span><span>Hecho para estudiantes que quieren decidir mejor.</span></div></div></footer>`;
}

export function applyNavFooter(html, activeKey) {
  if (!NAV_PLACEHOLDER.test(html)) throw new Error('No se encontró el placeholder de <nav> en el HTML');
  if (!FOOTER_PLACEHOLDER.test(html)) throw new Error('No se encontró el placeholder de <footer> en el HTML');
  return html.replace(NAV_PLACEHOLDER, renderNav(activeKey)).replace(FOOTER_PLACEHOLDER, renderFooter());
}

// Páginas de nivel superior que no genera ningún otro script: activeKey debe
// coincidir con NAV_ITEMS o ser null si la página no es un ítem del nav.
export const TOP_LEVEL_PAGES = [
  { file: 'index.html', activeKey: null },
  { file: 'calculadora.html', activeKey: 'calculadora' },
  { file: 'ponderaciones.html', activeKey: 'ponderaciones' },
  { file: 'examenes.html', activeKey: 'examenes' },
  { file: 'notas-de-corte.html', activeKey: 'notas-de-corte' },
  { file: 'guias.html', activeKey: 'guias' },
  { file: 'premium.html', activeKey: 'premium' },
  { file: 'sobre-nosotros.html', activeKey: 'sobre-nosotros' },
  { file: 'contacto.html', activeKey: null },
  { file: 'precios.html', activeKey: null },
  { file: 'preguntas-frecuentes.html', activeKey: null },
  { file: 'aviso-legal.html', activeKey: null },
  { file: 'politica-privacidad.html', activeKey: null },
  { file: 'politica-cookies.html', activeKey: null },
  { file: 'calendario-ebau.html', activeKey: null },
  { file: 'proximamente.html', activeKey: null },
  { file: '404.html', activeKey: null },
];

async function expectedFiles() {
  const files = [];
  for (const { file, activeKey } of TOP_LEVEL_PAGES) {
    const filePath = path.join(ROOT, file);
    const current = await readFile(filePath, 'utf8');
    files.push({ filePath, content: applyNavFooter(current, activeKey) });
  }
  return files;
}

async function main() {
  const files = await expectedFiles();
  const checkOnly = process.argv.includes('--check');
  if (checkOnly) {
    for (const file of files) {
      const current = await readFile(file.filePath, 'utf8');
      if (current !== file.content) throw new Error(`${path.relative(ROOT, file.filePath)} no coincide con el nav/footer canónico`);
    }
  } else {
    await Promise.all(files.map((file) => writeFile(file.filePath, file.content, 'utf8')));
  }
  console.log(`OK: nav/footer generados o verificados en ${files.length} páginas de nivel superior.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
