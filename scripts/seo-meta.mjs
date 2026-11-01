// Metadatos sociales (Open Graph + Twitter Cards) compartidos por todos los
// generadores. Antes solo se generaban en HTML estático para 17 páginas de
// nivel superior y las 68 notas de corte; el resto (fichas de exámenes y de
// ponderaciones) dependía de js/seo.js, invisible para los bots sociales que
// no ejecutan JavaScript.
export const SITE_URL = 'https://miebau.es';
export const OG_IMAGE_PATH = '/assets/og-miebau.jpg';
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = 'Miebau · Tu EvAU, con todo claro';
const LEGACY_OG_IMAGE_URL = `${SITE_URL}/assets/miniatura.jpg`;

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Recibe textos YA escapados para HTML (tal y como van dentro de <title> y de
// la meta description) para no escapar dos veces.
export function socialMetaBlock({ escapedTitle, escapedDescription, url }) {
  return [
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="es_ES">',
    '<meta property="og:site_name" content="Miebau">',
    `<meta property="og:title" content="${escapedTitle}">`,
    `<meta property="og:description" content="${escapedDescription}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE_URL}">`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}">`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">`,
    `<meta property="og:image:alt" content="${escapeAttr(OG_IMAGE_ALT)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapedTitle}">`,
    `<meta name="twitter:description" content="${escapedDescription}">`,
    `<meta name="twitter:image" content="${OG_IMAGE_URL}">`,
    `<meta name="twitter:image:alt" content="${escapeAttr(OG_IMAGE_ALT)}">`,
  ].map((line) => `  ${line}`).join('\n');
}

// Para plantillas que tienen título y descripción en bruto.
export function renderSocialMeta({ title, description, url }) {
  const esc = (value) => escapeAttr(value);
  return socialMetaBlock({ escapedTitle: esc(title), escapedDescription: esc(description), url });
}

const SOCIAL_TAG_RE = /[ \t]*<meta (?:property="og:|name="twitter:)[^>]*>[ \t]*\n?/g;

// Para fichas cuyo <head> no regenera el generador (las privadas de
// ponderaciones): lee título, descripción y canonical del propio HTML,
// elimina cualquier bloque social previo y lo deja justo tras el canonical.
// Idempotente.
export function ensureSocialMeta(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const url = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!title || !description || !url) throw new Error('Faltan title, description o canonical para generar las metas sociales');
  const stripped = html.replace(SOCIAL_TAG_RE, '');
  const block = socialMetaBlock({ escapedTitle: title, escapedDescription: description, url });
  return stripped.replace(/(<link rel="canonical" href="[^"]*"\s*\/?>)/, `$1\n${block}`);
}

// Para las páginas de nivel superior, cuyo texto social se escribe a mano:
// solo cambia la imagen (500x500 con summary_large_image se recortaba al
// compartir) y añade dimensiones y alt. Idempotente.
export function upgradeOgImage(html) {
  let out = html.split(LEGACY_OG_IMAGE_URL).join(OG_IMAGE_URL);
  if (!out.includes('og:image:width')) {
    out = out.replace(/<meta property="og:image" content="[^"]*"(\s*\/?)>/, (tag, closer) => {
      const c = closer.includes('/') ? ' />' : '>';
      return `${tag}<meta property="og:image:width" content="${OG_IMAGE_WIDTH}"${c}<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}"${c}<meta property="og:image:alt" content="${escapeAttr(OG_IMAGE_ALT)}"${c}`;
    });
  }
  if (!out.includes('twitter:image:alt')) {
    out = out.replace(/<meta name="twitter:image" content="[^"]*"(\s*\/?)>/, (tag, closer) => `${tag}<meta name="twitter:image:alt" content="${escapeAttr(OG_IMAGE_ALT)}"${closer.includes('/') ? ' />' : '>'}`);
  }
  return out;
}
