/* Data-driven SEO layer. Add future page routes here instead of duplicating metadata. */
(function () {
  const base = 'https://miebau.es';
  const page = location.pathname.split('/').pop() || 'index.html';
  const routes = {
    'index.html': { path: '/', crumb: 'Inicio' },
    'calculadora.html': { path: '/calculadora', crumb: 'Calculadora EvAU' },
    'ponderaciones.html': { path: '/ponderaciones', crumb: 'Ponderaciones' },
    'examenes.html': { path: '/examenes', crumb: 'Exámenes EvAU' },
    'notas-de-corte.html': { path: '/notas-de-corte', crumb: 'Notas de corte', noindex: true },
    'calendario-ebau.html': { path: '/calendario-ebau', crumb: 'Calendario EBAU', noindex: true },
    'guias.html': { path: '/guias', crumb: 'Guías' },
    'sobre-nosotros.html': { path: '/sobre-nosotros', crumb: 'Sobre nosotros' },
    'contacto.html': { path: '/contacto', crumb: 'Contacto' },
    'premium.html': { path: '/premium', crumb: 'Premium' },
    'precios.html': { path: '/precios', crumb: 'Precios' },
    'preguntas-frecuentes.html': { path: '/preguntas-frecuentes', crumb: 'Preguntas frecuentes' },
    'aviso-legal.html': { path: '/aviso-legal', crumb: 'Aviso legal' },
    'politica-privacidad.html': { path: '/politica-privacidad', crumb: 'Política de privacidad' },
    'politica-cookies.html': { path: '/politica-cookies', crumb: 'Política de cookies' },
    'proximamente.html': { path: '/proximamente', crumb: 'Próximamente', noindex: true },
    '404.html': { path: '/404', crumb: 'Página no encontrada', noindex: true }
  };
  const isProfileHtmlPage = location.pathname.indexOf('/ponderaciones/') === 0 && page.endsWith('.html');
  const profileSlug = page.replace(/\.html$/, '');
  const route = isProfileHtmlPage
    ? { path: '/ponderaciones/' + profileSlug, crumb: document.title }
    : (routes[page] || { path: location.pathname, crumb: document.title });
  const canonical = base + route.path;
  const description = document.querySelector('meta[name="description"]')?.content || 'Herramientas claras para preparar la EvAU.';
  const addMeta = (selector, attributes) => {
    if (document.head.querySelector(selector)) return;
    const el = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
    document.head.appendChild(el);
  };
  if (!document.querySelector('link[rel="canonical"]')) {
    const link = document.createElement('link'); link.rel = 'canonical'; link.href = canonical; document.head.appendChild(link);
  }
  [['property', 'og:type', 'website'], ['property', 'og:locale', 'es_ES'], ['property', 'og:site_name', 'Miebau'], ['property', 'og:title', document.title], ['property', 'og:description', description], ['property', 'og:url', canonical], ['property', 'og:image', base + '/assets/miniatura.jpg'], ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', document.title], ['name', 'twitter:description', description], ['name', 'twitter:image', base + '/assets/miniatura.jpg']].forEach(([key, name, content]) => addMeta(`meta[${key}="${name}"]`, { [key]: name, content }));
  if (route.noindex) addMeta('meta[name="robots"]', { name: 'robots', content: 'noindex, follow' });
  const addLink = (rel, href) => { if (!document.querySelector(`link[rel="${rel}"]`)) { const link = document.createElement('link'); link.rel = rel; link.href = href; document.head.appendChild(link); } };
  addLink('manifest', '/manifest.webmanifest');
  addLink('apple-touch-icon', '/assets/favicon.svg');
  const schema = page === 'index.html' ? [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Miebau', url: base, inLanguage: 'es-ES' }] : [{ '@context': 'https://schema.org', '@type': 'WebPage', name: document.title, url: canonical, inLanguage: 'es-ES', isPartOf: { '@type': 'WebSite', name: 'Miebau', url: base } }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: base + '/' }, { '@type': 'ListItem', position: 2, name: route.crumb, item: canonical }] }];
  if (page === 'preguntas-frecuentes.html') schema.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: '¿Cómo se calcula la nota de admisión?', acceptedAnswer: { '@type': 'Answer', text: 'La calculadora combina nota media de Bachillerato, fase obligatoria y materias voluntarias con ponderación.' } }, { '@type': 'Question', name: '¿Qué son las ponderaciones?', acceptedAnswer: { '@type': 'Answer', text: 'Son coeficientes que multiplican notas de materias voluntarias para aumentar la nota de admisión.' } }, { '@type': 'Question', name: '¿Miebau tiene coste?', acceptedAnswer: { '@type': 'Answer', text: 'Las herramientas actuales de Miebau son gratuitas.' } }] });
  schema.forEach((data) => { const script = document.createElement('script'); script.type = 'application/ld+json'; script.textContent = JSON.stringify(data); document.head.appendChild(script); });
}());
