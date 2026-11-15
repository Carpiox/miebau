// Reglas de indexación compartidas por los generadores. Una sola fuente de
// verdad para decidir qué fichas llevan `noindex` y salen del sitemap.
//
// Decisión del 2026-11-15 (a partir de los exports de Search Console del mismo
// día; ver docs/plan-contenido.md):
//  - Notas de corte: las 68 fichas se consolidan en la tabla de /notas-de-corte
//    y llevan noindex, sin estar en el sitemap ni enlazadas desde el sitio.
//  - Ponderaciones: se mantienen indexables las fichas con datos oficiales y las
//    16 que Google ya tenía indexadas; el resto (sin dato propio) lleva noindex.

export const ROBOTS_NOINDEX_META = '<meta name="robots" content="noindex, follow">';

// Fichas de ponderaciones que Google ya tenía indexadas a 2026-11-15 y que no
// se tocan aunque no tengan datos propios (reciben impresiones y clics).
export const PONDERACIONES_INDEXADAS_2026_11_15 = new Set([
  'universidad-ceu-fernando-iii',
  'universidad-europea-de-andalucia',
  'universidad-alfonso-x-el-sabio-mare-nostrum',
  'universidad-europea-de-canarias',
  'universidad-europea-del-atlantico',
  'universidad-ramon-llull',
  'uvic-ucc',
  'universitat-abat-oliba-ceu',
  'universidad-ceu-cardenal-herrera',
  'universidad-europea-de-valencia',
  'unir',
  'universidad-europea-de-madrid',
  'ucam',
  'universidad-de-deusto',
  'mondragon-unibertsitatea',
  'euneiz',
]);

// `coverage` es el resultado de classifyUniversityCoverage(): 'verified' y
// 'partial' tienen filas oficiales de ponderaciones; el resto, no.
export function ponderacionNoindex(university, coverage) {
  if (coverage === 'verified' || coverage === 'partial') return false;
  return !PONDERACIONES_INDEXADAS_2026_11_15.has(university.id);
}

// Idempotente: deja el HTML con una sola meta robots (o ninguna) justo tras el
// canonical.
export function applyRobotsMeta(html, noindex) {
  const stripped = html.replace(/[ \t]*<meta name="robots"[^>]*>[ \t]*\n?/g, '');
  if (!noindex) return stripped;
  return stripped.replace(/(<link rel="canonical" href="[^"]*"\s*\/?>)/, `$1\n  ${ROBOTS_NOINDEX_META}`);
}
