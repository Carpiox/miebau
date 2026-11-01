// Límites y utilidades para <title> y meta description. Los generadores
// proponen varias variantes de más a menos largas y se queda la primera que
// cabe; si ninguna cabe, falla en lugar de publicar una metadata fuera de rango.
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 155;

export function pickTitle(candidates, { label = 'título' } = {}) {
  const fit = candidates.find((text) => text.length <= TITLE_MAX);
  if (fit) return fit;
  throw new Error(`Ninguna variante de ${label} cabe en ${TITLE_MAX} caracteres: ${candidates.at(-1)} (${candidates.at(-1).length})`);
}

export function pickDescription(candidates, { label = 'descripción' } = {}) {
  const fit = candidates.find((text) => text.length >= DESC_MIN && text.length <= DESC_MAX);
  if (fit) return fit;
  throw new Error(`Ninguna variante de ${label} cabe en ${DESC_MIN}-${DESC_MAX} caracteres: ${candidates.map((text) => text.length).join(', ')} · ${candidates[0]}`);
}

export const inDescriptionRange = (text) => typeof text === 'string' && text.length >= DESC_MIN && text.length <= DESC_MAX;
export const inTitleRange = (text) => typeof text === 'string' && text.length > 0 && text.length <= TITLE_MAX;
