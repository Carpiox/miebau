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
import { upgradeOgImage } from './seo-meta.mjs';

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
  return `<footer class="site-footer"><div class="site-footer-inner"><div class="footer-top"><div class="footer-intro"><a class="navbar-brand" href="/">${LOGO}</a><p>Herramientas claras para tomar decisiones con calma antes, durante y después de la EvAU.</p><div class="social-links" aria-label="Redes sociales"><a href="/proximamente" aria-label="Instagram">IG</a><a href="/proximamente" aria-label="TikTok">TT</a><a href="/proximamente" aria-label="X">X</a></div></div><div class="footer-column"><div class="footer-heading">Herramientas</div><a href="/calculadora">Calculadora</a><a href="/ponderaciones">Ponderaciones</a><a href="/examenes">Exámenes</a><a href="/notas-de-corte">Notas de corte</a><a href="/calendario-ebau">Calendario EBAU</a></div><div class="footer-column"><div class="footer-heading">Premium</div><a href="/premium">Miebau Premium</a><a href="/precios">Precios</a><a href="/preguntas-frecuentes">Preguntas frecuentes</a></div><div class="footer-column"><div class="footer-heading">Sobre nosotros</div><a href="/sobre-nosotros">Sobre nosotros</a><a href="/guias">Guías</a><a href="/contacto">Contacto</a></div><div class="footer-column"><div class="footer-heading">Legal</div><a href="/aviso-legal">Aviso legal</a><a href="/politica-privacidad">Privacidad</a><a href="/politica-cookies">Cookies</a></div></div><section class="newsletter" aria-labelledby="newsletterTitle"><div><h2 id="newsletterTitle">Una nota menos de incertidumbre</h2><p>Recibe novedades y guías prácticas para preparar la EvAU.</p></div><div><form class="newsletter-form" data-web3forms="newsletter" name="newsletter"><input type="text" name="bot-field" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><input type="email" name="email" aria-label="Tu correo electrónico" placeholder="tu@email.com" required><button class="btn btn-primary" type="submit">Suscribirme</button></form><p class="newsletter-note" aria-live="polite"></p><p class="newsletter-consent">Al suscribirte aceptas recibir estos correos. Consulta la <a href="/politica-privacidad">política de privacidad</a>.</p></div></section><div class="footer-bottom"><span>© 2026 Miebau. Todos los derechos reservados.</span><button type="button" class="footer-cookie-btn" data-consent-open>Configurar cookies</button><span>Hecho para estudiantes que quieren decidir mejor.</span></div></div></footer>`;
}

// Google AdSense. El <head> estático YA NO carga adsbygoogle.js: ese script
// (y GA4) solo se cargan tras el consentimiento, desde js/consent.js →
// js/integrations.js. Aquí solo va la etiqueta de verificación de propiedad
// de AdSense, que no descarga ni guarda nada.
export const ADSENSE_CLIENT = 'ca-pub-2269622537984613';
export const ADSENSE_META = `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`;
// Cargador antiguo, solo para migrar páginas que todavía lo llevan.
const LEGACY_ADSENSE_SCRIPT_RE = /\n?[ \t]*<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]*"[^>]*><\/script>/g;

// Idempotente: quita el cargador antiguo (si existe) y deja la etiqueta de
// verificación justo antes de </head> una sola vez.
export function ensureAdsScript(html) {
  const withoutScript = html.replace(LEGACY_ADSENSE_SCRIPT_RE, '');
  if (withoutScript.includes(ADSENSE_META)) return withoutScript;
  if (!withoutScript.includes('</head>')) throw new Error('No se encontró </head> para insertar la etiqueta de AdSense');
  return withoutScript.replace(/\n?<\/head>/, `\n  ${ADSENSE_META}\n</head>`);
}

// Google Fonts. Antes: @import dentro de css/style.css (cadena CSS → CSS de
// Google → fuentes, bloquea el render y sin preconnect). Ahora: preconnect +
// <link rel="stylesheet"> con display=swap, ANTES de la hoja de estilos propia.
export const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&amp;family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap">',
].join('\n  ');

// Idempotente: inserta los enlaces justo antes de la hoja de estilos propia.
export function ensureFontLinks(html) {
  if (html.includes('fonts.googleapis.com/css2')) return html;
  const own = html.match(/[ \t]*<link rel="stylesheet" href="[^"]*style\.css[^"]*"\s*\/?>/);
  if (!own) throw new Error('No se encontró la hoja de estilos propia para insertar Google Fonts');
  const indent = own[0].match(/^[ \t]*/)[0];
  const lines = FONT_LINKS.split('\n  ').map((line) => `${indent}${line}`).join('\n');
  return html.replace(own[0], `${lines}\n${own[0]}`);
}

export function applyNavFooter(html, activeKey) {
  if (!NAV_PLACEHOLDER.test(html)) throw new Error('No se encontró el placeholder de <nav> en el HTML');
  if (!FOOTER_PLACEHOLDER.test(html)) throw new Error('No se encontró el placeholder de <footer> en el HTML');
  return ensureFontLinks(upgradeOgImage(ensureAdsScript(html.replace(NAV_PLACEHOLDER, renderNav(activeKey)).replace(FOOTER_PLACEHOLDER, renderFooter()))));
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
