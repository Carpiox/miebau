// Agrupación editorial de asignaturas para el enlazado interno de /examenes.
// Es una clasificación de navegación (no un dato de examen): no afecta a la
// estructura, ponderaciones ni convocatorias verificadas de cada ficha.

export const GROUPS = [
  {
    key: 'comunes',
    label: 'Comunes',
    description: 'Las cursa todo el alumnado de 2.º de Bachillerato, sea cual sea su modalidad.',
    slugs: ['lengua-castellana-y-literatura-ii', 'ingles', 'historia-de-espana', 'filosofia'],
  },
  {
    key: 'ciencias',
    label: 'Ciencias',
    description: 'Materias de la modalidad de Ciencias y Tecnología.',
    slugs: ['matematicas-ii', 'fisica', 'quimica', 'biologia', 'dibujo-tecnico-ii'],
  },
  {
    key: 'sociales',
    label: 'Sociales',
    description: 'Materias de la modalidad de Ciencias Sociales.',
    slugs: ['matematicas-aplicadas-a-las-ciencias-sociales-ii', 'economia-de-la-empresa', 'geografia'],
  },
  {
    key: 'artes-humanidades',
    label: 'Artes y Humanidades',
    description: 'Materias de las modalidades de Humanidades y Artes.',
    slugs: ['historia-del-arte', 'latin-ii', 'griego-ii'],
  },
];

export function groupOf(asignaturaSlug) {
  return GROUPS.find((group) => group.slugs.includes(asignaturaSlug));
}

// Asignaturas relacionadas (2-3 por materia) y una frase propia por materia.
// `frase(links)` recibe los enlaces ya renderizados, en el orden de `relacionadas`.
export const RELATED = {
  'matematicas-ii': {
    relacionadas: ['fisica', 'quimica'],
    frase: ([a, b]) => `Matemáticas II es la base de los cálculos que aparecen en ${a} y en ${b}, así que conviene comparar cómo reparte cada prueba el peso entre problemas y cuestiones.`,
  },
  'matematicas-aplicadas-a-las-ciencias-sociales-ii': {
    relacionadas: ['economia-de-la-empresa', 'geografia'],
    frase: ([a, b]) => `Quien cursa esta matemática suele combinarla con ${a} o con ${b}; mirar cómo se plantean ahí los datos y las tablas ayuda a entrenar la interpretación de gráficos.`,
  },
  'lengua-castellana-y-literatura-ii': {
    relacionadas: ['historia-de-espana', 'filosofia'],
    frase: ([a, b]) => `El comentario de texto de Lengua se practica igual de bien con los textos de ${a} y de ${b}, que también piden argumentar por escrito.`,
  },
  'historia-de-espana': {
    relacionadas: ['geografia', 'historia-del-arte'],
    frase: ([a, b]) => `Para situar los procesos históricos en el territorio y en su cultura visual, repasa también ${a} y ${b}.`,
  },
  ingles: {
    relacionadas: ['lengua-castellana-y-literatura-ii', 'historia-de-espana'],
    frase: ([a, b]) => `Para comparar cómo se estructura una prueba de comprensión y redacción, mira también ${a} y ${b}.`,
  },
  fisica: {
    relacionadas: ['matematicas-ii', 'quimica'],
    frase: ([a, b]) => `Los problemas de Física se apoyan en el cálculo de ${a} y comparten enfoque de resolución con ${b}.`,
  },
  quimica: {
    relacionadas: ['biologia', 'fisica'],
    frase: ([a, b]) => `Química conecta con la bioquímica de ${a} y con la parte cuantitativa de ${b}; es útil ver las tres estructuras juntas al planificar el estudio.`,
  },
  biologia: {
    relacionadas: ['quimica', 'fisica'],
    frase: ([a, b]) => `Para las preguntas de biología molecular ayuda entender bien ${a}, y para las de procesos energéticos, ${b}.`,
  },
  'economia-de-la-empresa': {
    relacionadas: ['matematicas-aplicadas-a-las-ciencias-sociales-ii', 'geografia'],
    frase: ([a, b]) => `La parte de análisis de datos de Economía de la Empresa se entrena con ${a}, y el contexto territorial y de mercados con ${b}.`,
  },
  filosofia: {
    relacionadas: ['lengua-castellana-y-literatura-ii', 'historia-de-espana'],
    frase: ([a, b]) => `Historia de la Filosofía exige redactar y argumentar con precisión, como en ${a}, y situar a cada autor en su época, como en ${b}.`,
  },
  'dibujo-tecnico-ii': {
    relacionadas: ['matematicas-ii', 'fisica'],
    frase: ([a, b]) => `Dibujo Técnico II trabaja la geometría que también se evalúa en ${a}, y el razonamiento espacial que aparece en ${b}.`,
  },
  geografia: {
    relacionadas: ['historia-de-espana', 'economia-de-la-empresa'],
    frase: ([a, b]) => `Geografía gana sentido junto a ${a}, por los procesos de poblamiento y territorio, y junto a ${b}, por la parte económica.`,
  },
  'historia-del-arte': {
    relacionadas: ['historia-de-espana', 'latin-ii'],
    frase: ([a, b]) => `Para ubicar cada obra en su contexto, combina este repaso con ${a}, y para el vocabulario clásico, con ${b}.`,
  },
  'latin-ii': {
    relacionadas: ['griego-ii', 'historia-del-arte'],
    frase: ([a, b]) => `Latín II se estudia a menudo junto a ${a}, y su legado cultural se ve en ${b}.`,
  },
  'griego-ii': {
    relacionadas: ['latin-ii', 'historia-del-arte'],
    frase: ([a, b]) => `Griego II y ${a} comparten método de traducción y análisis morfológico; el mundo clásico se completa con ${b}.`,
  },
};

// Universidades con ficha de ponderaciones en el proyecto, por comunidad.
export const COMMUNITIES = {
  'region-de-murcia': {
    name: 'Región de Murcia',
    withArticle: 'la Región de Murcia',
    short: 'Murcia',
    ponderaciones: [
      { name: 'Universidad de Murcia', href: '/ponderaciones/umu' },
      { name: 'UCAM', href: '/ponderaciones/ucam' },
    ],
    intro: 'Este índice reúne las 15 asignaturas troncales de las que Miebau tiene ya verificada la estructura de la PAU 2026 en el Distrito Universitario de la Región de Murcia. Cada ficha resume cuántas preguntas tiene el examen, cuáles son obligatorias y cuáles admiten elección, qué puntuación lleva cada bloque y cuánto dura; todas se cotejan con documentación oficial murciana. Si estás decidiendo a qué materias dedicar tus horas de estudio, empieza por las comunes, que cursa todo el alumnado, y baja después a las de tu modalidad. Las ponderaciones de admisión de las universidades murcianas todavía no se publican en Miebau porque falta verificarlas contra la fuente oficial.',
  },
  'comunidad-de-madrid': {
    name: 'Comunidad de Madrid',
    withArticle: 'la Comunidad de Madrid',
    short: 'Madrid',
    ponderaciones: [
      { name: 'Universidad Complutense de Madrid', href: '/ponderaciones/ucm' },
      { name: 'Universidad Autónoma de Madrid', href: '/ponderaciones/uam' },
      { name: 'Universidad Carlos III de Madrid', href: '/ponderaciones/uc3m' },
      { name: 'Universidad Politécnica de Madrid', href: '/ponderaciones/upm' },
    ],
    intro: 'En Madrid la prueba se organiza a nivel de distrito universitario, y las fichas de este índice se apoyan en documentación oficial de la PAU 2026 publicada por las universidades públicas madrileñas. Para cada asignatura recogemos el formato del ejercicio, el reparto de puntos entre preguntas, las opciones entre las que hay que elegir y los 90 minutos de los que dispones. Es útil para comparar de un vistazo qué materias piden más redacción, cuáles más cálculo y cuáles combinan ambas cosas antes de decidir tu plan de repaso. Las tablas de ponderaciones madrileñas para 2026-2027 siguen pendientes de verificar y por eso no se trasladan a estas páginas.',
  },
};

export const FEATURED_HOME = [
  'matematicas-ii',
  'historia-de-espana',
  'quimica',
  'lengua-castellana-y-literatura-ii',
  'ingles',
];
