import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderFooter, renderNav } from './build-nav-footer.mjs';
import { COMMUNITIES, FEATURED_HOME, GROUPS, groupOf } from './examenes-taxonomia.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const HOME_FEATURED_START = '<!-- home-examenes:generated:start -->';
export const HOME_FEATURED_END = '<!-- home-examenes:generated:end -->';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function communitySlug(entry) {
  return entry.slug.split('/')[0];
}

export function asignaturaSlug(entry) {
  return entry.slug.split('/')[1];
}

export function communityUrl(key) {
  return `/examenes/${key}`;
}

// Archivo hermano de la carpeta (examenes/<comunidad>.html), no examenes/<comunidad>/index.html:
// Cloudflare Pages lo sirve sin barra final, igual que la URL canónica.
export function communityOutputPath(key) {
  return path.join(ROOT, 'examenes', `${key}.html`);
}

export function communityKeys(data) {
  return [...new Set(data.entries.map(communitySlug))];
}

export function entriesOfCommunity(data, key) {
  return data.entries.filter((entry) => communitySlug(entry) === key);
}

export function examAnchor(entry) {
  return `Examen de ${entry.asignatura}`;
}

function breadcrumb(community, key) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://miebau.es/' },
      { '@type': 'ListItem', position: 2, name: 'Exámenes', item: 'https://miebau.es/examenes' },
      { '@type': 'ListItem', position: 3, name: community.name, item: `https://miebau.es${communityUrl(key)}` },
    ],
  }).replace(/</g, '\\u003c');
}

function subjectSource(data, entry) {
  const sourceId = entry.source_ids[entry.source_ids.length - 1];
  const source = data.sources.find((item) => item.id === sourceId);
  if (!source?.scope) throw new Error(`Falta la fuente específica de ${entry.slug}`);
  return source;
}

function renderGroup(data, community, group, entries) {
  const items = group.slugs
    .map((slug) => entries.find((entry) => asignaturaSlug(entry) === slug))
    .filter(Boolean)
    .map((entry) => `            <li>
              <a href="${escapeHtml(entry.url)}"><strong>${escapeHtml(examAnchor(entry))}</strong> en ${escapeHtml(community.withArticle)}</a>
              <p>${escapeHtml(subjectSource(data, entry).scope)}</p>
            </li>`)
    .join('\n');

  return `        <h2>${escapeHtml(group.label)}</h2>
        <p>${escapeHtml(group.description)}</p>
        <ul class="profile-source-list">
${items}
        </ul>`;
}

export function renderCommunityPage(data, key) {
  const community = COMMUNITIES[key];
  if (!community) throw new Error(`Comunidad sin configurar: ${key}`);
  const entries = entriesOfCommunity(data, key);
  const url = `https://miebau.es${communityUrl(key)}`;
  const title = `Exámenes PAU en ${community.withArticle}: ${entries.length} asignaturas | MIEBAU`;
  const description = `Índice de exámenes PAU 2026 en ${community.withArticle}: estructura verificada de ${entries.length} asignaturas, agrupadas en comunes, ciencias, sociales y artes y humanidades.`;
  const others = Object.entries(COMMUNITIES).filter(([otherKey]) => otherKey !== key);
  const groups = GROUPS.map((group) => renderGroup(data, community, group, entries)).join('\n\n');
  const ponderacionLinks = community.ponderaciones
    .map((uni) => `<a href="${escapeHtml(uni.href)}">Ponderaciones de ${escapeHtml(uni.name)}</a>`)
    .join(' · ');
  const otherLinks = others
    .map(([otherKey, other]) => `<a href="${communityUrl(otherKey)}">Exámenes PAU en ${escapeHtml(other.withArticle)}</a>`)
    .join(' · ');
  const ogTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#5a43f2">
  <title>${ogTitle}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="Miebau"><meta property="og:title" content="${ogTitle}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://miebau.es/assets/miniatura.jpg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${ogTitle}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="https://miebau.es/assets/miniatura.jpg">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/site.js" defer></script>
  <script type="application/ld+json">${breadcrumb(community, key)}</script>
</head>
<body>
  ${renderNav('examenes')}
  <main class="page">
    <header class="content-hero">
      <span class="eyebrow">Índice por comunidad · PAU 2026</span>
      <h1>Exámenes PAU en ${escapeHtml(community.withArticle)}</h1>
      <p>${entries.length} asignaturas con estructura, duración y criterios comprobados en documentación oficial.</p>
    </header>

    <section class="contact-grid profile-page-grid">
      <article class="card prose">
        <p>${escapeHtml(community.intro)}</p>

${groups}

        <h2>Sigue explorando</h2>
        <p class="profile-global-link">${ponderacionLinks} · <a href="/calculadora">Calculadora de nota de admisión</a></p>
        <p class="profile-global-link">${otherLinks} · <a href="/examenes">Todos los exámenes</a></p>
      </article>

      <aside class="card profile-sidebar">
        <div class="card-title">Datos del índice</div>
        <dl class="profile-facts">
          <div><dt>Comunidad autónoma</dt><dd>${escapeHtml(community.name)}</dd></div>
          <div><dt>Asignaturas</dt><dd>${entries.length}</dd></div>
          <div><dt>Referencia</dt><dd>PAU 2026</dd></div>
        </dl>
        <span class="source-status source-status-verified">Estructura verificada</span>
        <a class="btn btn-primary" href="/examenes">Volver a Exámenes</a>
      </aside>
    </section>
  </main>
  ${renderFooter()}
</body>
</html>
`;
}

export function renderHomeFeatured(data) {
  const keys = communityKeys(data);
  const cards = FEATURED_HOME.map((slug) => {
    const links = keys
      .map((key) => entriesOfCommunity(data, key).find((entry) => asignaturaSlug(entry) === slug))
      .filter(Boolean);
    const first = links[0];
    return `        <article class="feature-card">
          <h3>${escapeHtml(first.asignatura)}</h3>
          <p>${escapeHtml(groupOf(slug).label)} · estructura PAU 2026 verificada.</p>
          <div class="region-quick-links">
${links.map((entry) => `            <a class="region-quick-link" href="${escapeHtml(entry.url)}">${escapeHtml(examAnchor(entry))} en ${escapeHtml(COMMUNITIES[communitySlug(entry)].withArticle)}</a>`).join('\n')}
          </div>
        </article>`;
  }).join('\n');
  const communityLinks = keys
    .map((key) => `<a href="${communityUrl(key)}">Exámenes PAU en ${escapeHtml(COMMUNITIES[key].withArticle)}</a>`)
    .join(' · ');

  return `${HOME_FEATURED_START}
    <section class="card" aria-labelledby="homeExamenesTitle">
      <h2 class="card-title" id="homeExamenesTitle">Exámenes de las asignaturas troncales</h2>
      <p>Estructura, duración y criterios de las materias que más alumnos preparan, ya verificados para la PAU 2026.</p>
      <div class="features">
${cards}
      </div>
      <p class="profile-global-link">${communityLinks} · <a href="/examenes">Ver todos los exámenes</a></p>
    </section>
    ${HOME_FEATURED_END}`;
}
