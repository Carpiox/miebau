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
    slugs: [
      'matematicas-ii',
      'fisica',
      'quimica',
      'biologia',
      'ciencias-generales',
      'geologia-y-ciencias-ambientales',
      'tecnologia-e-ingenieria-ii',
      'dibujo-tecnico-ii',
    ],
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
    slugs: [
      'historia-del-arte',
      'latin-ii',
      'griego-ii',
      'aleman',
      'analisis-musical-ii',
      'artes-escenicas-ii',
      'coro-y-tecnica-vocal-ii',
      'dibujo-artistico-ii',
      'dibujo-tecnico-aplicado-a-las-artes-plasticas-y-al-diseno-ii',
      'diseno',
      'frances',
      'fundamentos-artisticos',
      'historia-de-la-musica-y-de-la-danza',
      'italiano',
      'literatura-dramatica',
      'movimientos-culturales-y-artisticos',
      'portugues',
      'tecnicas-de-expresion-grafico-plastica',
    ],
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
  aleman: {
    relacionadas: ['frances', 'ingles'],
    frase: ([a, b]) => `Alemán comparte con ${a} el trabajo de comprensión, gramática y redacción; ${b} permite contrastar otro formato de lengua extranjera.`,
  },
  'analisis-musical-ii': {
    relacionadas: ['coro-y-tecnica-vocal-ii', 'artes-escenicas-ii'],
    frase: ([a, b]) => `La escucha y lectura de Análisis Musical II se complementan con la práctica vocal de ${a} y con el estudio del sonido escénico en ${b}.`,
  },
  'artes-escenicas-ii': {
    relacionadas: ['coro-y-tecnica-vocal-ii', 'fundamentos-artisticos'],
    frase: ([a, b]) => `Para ampliar los recursos de una puesta en escena, consulta el trabajo corporal y sonoro de ${a} y los contextos creativos de ${b}.`,
  },
  'ciencias-generales': {
    relacionadas: ['biologia', 'fisica', 'quimica'],
    frase: ([a, b, c]) => `Ciencias Generales integra cuestiones que se desarrollan con más profundidad en ${a}, ${b} y ${c}; comparar sus pruebas ayuda a ordenar cada razonamiento.`,
  },
  'coro-y-tecnica-vocal-ii': {
    relacionadas: ['analisis-musical-ii', 'artes-escenicas-ii'],
    frase: ([a, b]) => `La audición y la partitura enlazan Coro y Técnica Vocal II con ${a}, mientras la expresión interpretativa encuentra continuidad en ${b}.`,
  },
  'dibujo-artistico-ii': {
    relacionadas: ['fundamentos-artisticos', 'historia-del-arte', 'diseno'],
    frase: ([a, b, c]) => `La práctica gráfica de Dibujo Artístico II gana referencias con ${a} y ${b}, y puede aplicarse a la resolución de proyectos en ${c}.`,
  },
  'dibujo-tecnico-aplicado-a-las-artes-plasticas-y-al-diseno-ii': {
    relacionadas: ['diseno', 'dibujo-artistico-ii', 'dibujo-tecnico-ii'],
    frase: ([a, b, c]) => `Esta materia lleva la geometría al proyecto de ${a}, dialoga con la representación expresiva de ${b} y comparte precisión constructiva con ${c}.`,
  },
  diseno: {
    relacionadas: ['dibujo-tecnico-aplicado-a-las-artes-plasticas-y-al-diseno-ii', 'dibujo-artistico-ii'],
    frase: ([a, b]) => `Los proyectos de Diseño se apoyan en la representación constructiva de ${a} y en los recursos gráficos y compositivos de ${b}.`,
  },
  frances: {
    relacionadas: ['aleman', 'ingles'],
    frase: ([a, b]) => `Francés puede compararse con ${a} por su combinación de lengua y escritura, y con ${b} por las estrategias de comprensión textual.`,
  },
  'fundamentos-artisticos': {
    relacionadas: ['historia-del-arte', 'dibujo-artistico-ii', 'diseno'],
    frase: ([a, b, c]) => `Fundamentos Artísticos aporta contexto para ${a}, referentes visuales para ${b} y criterios de análisis útiles en ${c}.`,
  },
  'geologia-y-ciencias-ambientales': {
    relacionadas: ['ciencias-generales', 'biologia', 'quimica'],
    frase: ([a, b, c]) => `Los procesos terrestres de Geología y Ciencias Ambientales se conectan con la visión integrada de ${a}, los ecosistemas de ${b} y el estudio de materiales en ${c}.`,
  },
  'historia-de-la-musica-y-de-la-danza': {
    relacionadas: ['analisis-musical-ii', 'coro-y-tecnica-vocal-ii', 'artes-escenicas-ii'],
    frase: ([a, b, c]) => `El recorrido histórico de esta materia se escucha con más detalle en ${a}, se lleva a la práctica vocal en ${b} y dialoga con cuerpo y escena en ${c}.`,
  },
  italiano: {
    relacionadas: ['frances', 'aleman', 'ingles'],
    frase: ([a, b, c]) => `Italiano comparte estrategias de comprensión y escritura con ${a} y ${b}; contrastarlas con el formato de ${c} ayuda a afinar la gestión del tiempo.`,
  },
  'literatura-dramatica': {
    relacionadas: ['artes-escenicas-ii', 'lengua-castellana-y-literatura-ii', 'fundamentos-artisticos'],
    frase: ([a, b, c]) => `El texto teatral de Literatura Dramática cobra dimensión práctica en ${a}, exige la precisión escrita de ${b} y puede enriquecerse con los referentes de ${c}.`,
  },
  'movimientos-culturales-y-artisticos': {
    relacionadas: ['fundamentos-artisticos', 'historia-del-arte', 'diseno'],
    frase: ([a, b, c]) => `Para situar los lenguajes contemporáneos, combina esta ficha con las bases de ${a}, la perspectiva cronológica de ${b} y la aplicación proyectual de ${c}.`,
  },
  portugues: {
    relacionadas: ['italiano', 'frances', 'aleman'],
    frase: ([a, b, c]) => `Portugués puede prepararse junto a ${a}, ${b} y ${c} para comparar cómo cada lengua reparte comprensión, gramática y producción escrita.`,
  },
  'tecnicas-de-expresion-grafico-plastica': {
    relacionadas: ['dibujo-artistico-ii', 'diseno', 'fundamentos-artisticos'],
    frase: ([a, b, c]) => `La experimentación material de esta asignatura amplía los recursos de ${a}, fortalece la presentación de proyectos en ${b} y se apoya en los conceptos visuales de ${c}.`,
  },
  'tecnologia-e-ingenieria-ii': {
    relacionadas: ['dibujo-tecnico-ii', 'fisica', 'matematicas-ii'],
    frase: ([a, b, c]) => `Los sistemas de Tecnología e Ingeniería II requieren la representación precisa de ${a}, los principios de ${b} y las herramientas de cálculo de ${c}.`,
  },
};

// Relaciones propias de una comunidad cuando alguna asignatura relacionada no existe allí
// (p. ej. Ciencias Generales no tiene ficha en Murcia). Sustituyen a RELATED solo en esa comunidad.
export const RELATED_OVERRIDES = {
  'region-de-murcia': {
    'geologia-y-ciencias-ambientales': {
      relacionadas: ['biologia', 'quimica'],
      frase: ([a, b]) => `Geología y Ciencias Ambientales comparte con ${a} el estudio de los ecosistemas y con ${b} el de la composición de minerales y rocas.`,
    },
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
    intro: 'Este índice reúne las asignaturas de la PAU 2026 en el Distrito Universitario de la Región de Murcia de las que Miebau tiene ya verificada la estructura del examen: las materias comunes, las de las modalidades de Ciencias, Sociales y Artes y Humanidades, y varias optativas de idiomas, artes y tecnología. Cada ficha resume cuántas preguntas tiene el examen, cuáles son obligatorias y cuáles admiten elección, qué puntuación lleva cada bloque y cuánto dura; todas se cotejan con documentación oficial murciana. Si estás decidiendo a qué materias dedicar tus horas de estudio, empieza por las comunes, que cursa todo el alumnado, y baja después a las de tu modalidad. Las ponderaciones de admisión de las universidades murcianas todavía no se publican en Miebau porque falta verificarlas contra la fuente oficial.',
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
