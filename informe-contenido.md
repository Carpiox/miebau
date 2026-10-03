# Auditoría de contenido de las fichas de examen

Fecha: 2026-10-03 · Alcance: las 30 fichas `/examenes/<comunidad>/<asignatura>` (15 asignaturas × Región de Murcia y Comunidad de Madrid) tal como están en `main` (`686da43`).
Generado con `node scripts/audit-contenido.mjs --out informe-contenido.md` (solo lectura; el script solo produce las tablas del anexo, el resumen y la sección de ampliación están escritos a mano a partir de ellas).

**Cómo se mide.** Texto visible de `<main>`, sin `<nav>`, `<footer>`, `<script>`, `<style>` ni el bloque "Sigue explorando exámenes". Sí cuenta el hero, el sidebar y el párrafo "Asignaturas relacionadas". Similitud = Jaccard sobre shingles de 5 palabras (minúsculas, sin puntuación). "Plantilla" = frase idéntica (normalizada, ≥3 palabras) en 3 o más fichas. No mide similitud semántica (dos textos con el mismo esqueleto argumental pero palabras distintas puntúan bajo) ni cómo las evalúa Google.

## 1. Resumen de hallazgos

1. **Cantidad de texto: suficiente.** 0 de 30 fichas bajan de 300 palabras (mín. 492, máx. 550, media 523). Cada ficha tiene 7 encabezados h2/h3 y 6 (Murcia) u 8 (Madrid) enlaces internos de cuerpo.
2. **Duplicación entre fichas: baja.** Ningún par supera el 60%; el máximo es 26,9% (Madrid Latín II ↔ Griego II). Medias: misma comunidad y distinta asignatura 22,6%; misma asignatura en distinta comunidad 17,5%; distinta en ambas 12,7%. Las fichas de una misma comunidad se parecen más entre sí que las "gemelas" de una misma asignatura, señal de que lo compartido es la plantilla, no texto copiado.
3. **El valor propio es menor que el total.** De media el **39,7% de las palabras** (53,2% de las frases) es plantilla; quedan **≈299 palabras únicas por ficha** (rango 266–331) y **18 de 30 fichas tienen menos de 300 palabras únicas**. La introducción de ~180 palabras y los datos del examen (modelo, bloques, notas) son prácticamente todo el contenido propio.
4. **Plantilla visible poco útil.** Tres frases aparecen idénticas en las 30 fichas y dos de ellas anuncian que algo no está hecho: "Banco de exámenes: la integración del visor externo permanece pendiente de verificar…" y "Ponderaciones 2026-2027: pendiente de verificar…". Aportan poco al lector y pueden leerse como página inacabada. Mantenerlas es coherente con la regla de no inventar datos; es una decisión de presentación para el usuario (reducirlas a una línea, moverlas más abajo o quitar la del visor mientras no exista).
5. **Metadatos: sin duplicados, con inconsistencias.** 0 títulos duplicados, 0 descripciones duplicadas, 0 títulos > 60 caracteres. Pero: **9 descripciones < 120 caracteres** (7 de Madrid, 2 de Murcia; 108–119); 1 título dice "EvAU" y 29 "PAU" (Murcia Matemáticas II); se mezclan "Región de Murcia"/"Comunidad de Madrid" (18) con "Murcia"/"Madrid" (12); y la misma asignatura se nombra distinto entre comunidades (Economía de la Empresa/Empresa, Inglés/Inglés II, Filosofía/Historia de la Filosofía).
6. **Las 5 fichas "gemelas" con título idéntico salvo la comunidad** (Matemáticas CCSS II, Lengua, Historia de España, Dibujo Técnico II, Historia del Arte) son el caso más expuesto a parecer plantilla en resultados de búsqueda; sus descripciones sí son distintas.
7. **Los datos del repo dan poco margen de ampliación sin trabajo nuevo.** Hay `ponderaciones_2026_2027` y `num_convocatorias_disponibles` en `pendiente_de_verificar` en las 30; los datasets de ponderaciones verificados son solo de Aragón, Cataluña, Comunidad Valenciana y Baleares (ninguno de Murcia ni Madrid); las notas de corte son solo de la Universidad de Murcia y por grado, no por asignatura; no hay fechas por comunidad en datos (`/calendario-ebau` es noindex) ni criterios de corrección en el JSON. Lo que sí hay es **el mismo dato verificado de las dos comunidades**, que permite una comparativa entre ambas sin inventar nada (ver sección 2).

## 2. Las 10 fichas con más prioridad de ampliar

Puntuación = 40% falta de texto único + 30% proporción de plantilla + 30% similitud con su par más parecido (tabla completa en el anexo, sección 5). **Aviso:** el rango de puntuaciones es estrecho (0,177–0,244) porque las 30 fichas se generan con la misma plantilla; la ordenación es indicativa, no hay fichas "malas" frente a "buenas". Todas las del top 10 comparten el motivo principal: **~40% de plantilla y menos de 300 palabras únicas** (excepto Madrid Griego/Latín, que además tienen la mayor similitud con su par, 26,9%).

Ideas de contenido propio, todas con datos que ya están en `data/examenes-seo.json` (campos `datos_comunidad_asignatura` de ambas comunidades). Ninguna requiere dato nuevo; las marcadas † reutilizan datos de la otra comunidad y deben escribirse desde la perspectiva de cada ficha para no crear texto duplicado entre las dos "gemelas".

| # | Ficha | Motivo principal | Contenido propio posible con datos del repo |
|---:|---|---|---|
| 1 | region-de-murcia/biologia | menos texto de las 30 (492 palabras, 266 únicas) | Comparativa † con Madrid: 6 bloques en Murcia (incluye "Genética molecular y mendeliana" y "Ingeniería genética y biotecnología" por separado) frente a 5 en Madrid (agrupa "Biotecnología y genética molecular"; añade "Metabolismo y fotosíntesis"); ambos 5 preguntas de 2 puntos, con 2 competenciales obligatorias + 3 con elección en Murcia y 1 competencial obligatoria + 4 A/B en Madrid. Desarrollar la nota de la pregunta 2 (genética mendeliana 1,5 + competencial 0,5). |
| 2 | comunidad-de-madrid/dibujo-tecnico-ii | plantilla 41,6%; parecida a Madrid Física (25,2%) | Comparativa †: Madrid = 4 preguntas de 2,5 puntos (3 con elección entre 2 propuestas + 1 obligatoria); Murcia = 6 ejercicios ofertados de los que se responden 4. Desarrollar los 4 bloques (Geometría plana, Sistema diédrico, Axonometría, Documentación gráfica y normalización) y la norma de delinear a lápiz con construcciones visibles. |
| 3 | comunidad-de-madrid/biologia | plantilla 41,6%; parecida a Madrid Matemáticas II (25,0%) | Comparativa † con Murcia (ver fila 1, desde Madrid). Explicar la regla "responder como máximo 5 preguntas y una sola propuesta de cada pareja A/B" (nota ya verificada). |
| 4 | comunidad-de-madrid/latin-ii | par más parecido de todo el conjunto (Griego II, 26,9%) | Reparto por bloques con puntos (texto 7, etimología 1, literatura 2) y la regla del apéndice gramatical del diccionario (nota verificada). Comparativa † con Murcia (5 cuestiones frente a 3 bloques en Madrid). Diferenciarla de Griego II explicando qué parte de la nota depende de la traducción. |
| 5 | comunidad-de-madrid/geografia | plantilla 40,8%; parecida a Madrid Física (25,3%) | Las 4 preguntas (tema, mapa/localización provincial, figura o paisaje, 5 definiciones entre 10 conceptos) con la extensión recomendada por parte (página y media / una página / media página). Comparativa † con Murcia (4 preguntas de 2,5 puntos con parte competencial). |
| 6 | comunidad-de-madrid/fisica | plantilla 40,6%; parecida a Geografía (25,3%) | Los 4 bloques con su opcionalidad (Vibraciones y Ondas obligatoria; A/B en gravitatorio, electromagnético y relativista/cuántica/nuclear). Comparativa † con Murcia (1 ejercicio dividido en 4 apartados, número interno de preguntas no fijado). |
| 7 | region-de-murcia/matematicas-ii | plantilla 40,4%; 288 únicas | Ya cita el cambio respecto a 2025 en la intro; convertirlo en bloque propio "Qué cambia" con los datos de P1-P5 (P1 modelización; análisis repartido entre P1-P3 y P4-P5). Comparativa † con Madrid (5 preguntas de 2 puntos, bloques Geometría/Análisis/Probabilidad/Álgebra/"Análisis con opción"). |
| 8 | comunidad-de-madrid/matematicas-ii | plantilla 40,5%; 292 únicas | Comparativa † con Murcia y la regla de justificación razonada de todas las respuestas (nota verificada). Es la otra ficha que ya menciona 2025 en la intro. |
| 9 | comunidad-de-madrid/historia-del-arte | plantilla 40,4%; parecida a Dibujo Técnico (24,1%) | Reparto de puntos por pregunta (términos 2, tema 2, 3 artistas entre 5 → 3, comentario de obra → 3) y la regla de que la pregunta 1 es única y las otras tres tienen elección. Comparativa † con Murcia (4 preguntas, temas, comparativas, imágenes y términos). |
| 10 | comunidad-de-madrid/historia-de-espana | plantilla 40,4%; 293 únicas | Reparto 3/3/4 puntos (cuestiones hasta 1788, fuente histórica, análisis de texto o tema) y la alternancia siglo XIX frente a siglos XX-XXI entre fuente y última parte (nota verificada). Comparativa † con Murcia (3 partes, 10 preguntas propuestas y 7 respuestas). |

**Propuesta transversal (afecta a las 30).** Un bloque "Cómo se compara con [otra comunidad]" generado desde `datos_comunidad_asignatura` de ambas (nº de ejercicios, modelo, duración, bloques). Hay diferencias reales y verificadas en casi todas las parejas, p. ej. Inglés (6 tareas en 3 secciones en Murcia frente a 5 preguntas en Madrid), Economía de la Empresa (10 propuestas, se responden 8, frente a 4 preguntas) o Química (5 cuestiones frente a 4 preguntas). Riesgo a vigilar: ese bloque tiene datos comunes en las dos fichas gemelas, así que hay que redactarlo desde la perspectiva de cada comunidad (y comprobar con este mismo script que la similitud de las parejas no sube).

## 3. Lo que NO se puede añadir con lo que hay en el repo

- **Ponderaciones por asignatura para Murcia y Madrid:** no hay dataset verificado (`ponderaciones-2026-2027.json` solo tiene datasets de Aragón, Cataluña, Comunidad Valenciana y Baleares; Murcia figura como `blocked` y las universidades madrileñas como `pending`). Ampliar con ellas sería inventar.
- **Notas de corte:** solo existen las de la Universidad de Murcia y por grado; no relacionan asignaturas con grados, así que no sirven para ampliar fichas por asignatura sin un mapeo verificado.
- **Fechas y convocatorias:** `num_convocatorias_disponibles` está `pendiente_de_verificar` en las 30 y `/calendario-ebau` es noindex sin fechas por comunidad en los datos.
- **Criterios de corrección y exámenes resueltos:** las fuentes los citan (p. ej. "criterios de valoración"), pero el JSON no contiene su contenido. Hace falta que el usuario suba los PDFs oficiales (este sandbox no tiene salida de red) para verificarlos antes de redactar nada.

## 4. Metadatos: acciones sugeridas (sin cambiar nada todavía)

- Alargar a 120–155 caracteres las 9 descripciones cortas (Madrid: Física, Química, Biología, Historia del Arte, Griego II, Historia de la Filosofía, Inglés; Murcia: Economía de la Empresa, Griego II).
- Unificar la fórmula del título: "PAU" (no "EvAU") y una sola forma de nombrar la comunidad.
- Diferenciar los 5 títulos idénticos salvo la comunidad, p. ej. añadiendo un rasgo propio del examen que ya está en datos (nº de preguntas o duración) siempre que quepa en 60 caracteres.
- Los títulos no llevan año y las descripciones dicen "PAU 2026". Es coherente con la estructura verificada; la decisión "2027 a secas" de `CLAUDE.md` es solo para la home y `/examenes`. No lo toco sin que lo decidas.

---

# Anexo: tablas completas

## 1. Palabras por ficha (texto visible del cuerpo, sin nav, footer, script, style ni "Sigue explorando")

| URL | Palabras | h2/h3 | Enlaces internos | Aviso |
|---|---:|---:|---:|---|
| region-de-murcia/biologia | 492 | 7 | 6 |  |
| comunidad-de-madrid/biologia | 507 | 7 | 8 |  |
| region-de-murcia/matematicas-ii | 508 | 7 | 6 |  |
| comunidad-de-madrid/dibujo-tecnico-ii | 508 | 7 | 8 |  |
| comunidad-de-madrid/fisica | 512 | 7 | 8 |  |
| comunidad-de-madrid/quimica | 512 | 7 | 8 |  |
| region-de-murcia/ingles | 514 | 7 | 6 |  |
| comunidad-de-madrid/historia-de-espana | 515 | 7 | 8 |  |
| comunidad-de-madrid/geografia | 516 | 7 | 8 |  |
| comunidad-de-madrid/latin-ii | 518 | 7 | 8 |  |
| region-de-murcia/fisica | 519 | 7 | 6 |  |
| region-de-murcia/griego-ii | 519 | 7 | 6 |  |
| region-de-murcia/geografia | 520 | 7 | 6 |  |
| region-de-murcia/historia-del-arte | 520 | 7 | 6 |  |
| comunidad-de-madrid/historia-del-arte | 520 | 7 | 8 |  |
| region-de-murcia/quimica | 522 | 7 | 6 |  |
| comunidad-de-madrid/matematicas-ii | 522 | 7 | 8 |  |
| region-de-murcia/matematicas-aplicadas-a-las-ciencias-sociales-ii | 525 | 7 | 6 |  |
| comunidad-de-madrid/ingles | 526 | 7 | 8 |  |
| comunidad-de-madrid/griego-ii | 527 | 7 | 8 |  |
| region-de-murcia/lengua-castellana-y-literatura-ii | 528 | 7 | 6 |  |
| region-de-murcia/historia-de-espana | 528 | 7 | 6 |  |
| region-de-murcia/dibujo-tecnico-ii | 528 | 7 | 6 |  |
| comunidad-de-madrid/economia-de-la-empresa | 531 | 7 | 8 |  |
| comunidad-de-madrid/lengua-castellana-y-literatura-ii | 532 | 7 | 8 |  |
| region-de-murcia/latin-ii | 534 | 7 | 6 |  |
| region-de-murcia/filosofia | 537 | 7 | 6 |  |
| comunidad-de-madrid/matematicas-aplicadas-a-las-ciencias-sociales-ii | 540 | 7 | 8 |  |
| region-de-murcia/economia-de-la-empresa | 548 | 7 | 6 |  |
| comunidad-de-madrid/filosofia | 550 | 7 | 8 |  |

Fichas por debajo de 300 palabras: **0 de 30**. Mínimo 492, máximo 550, media 523.

## 2. Duplicación entre fichas (Jaccard sobre shingles de 5 palabras)

### Los 15 pares más parecidos

| # | Ficha A | Ficha B | Similitud | Tipo de par |
|---:|---|---|---:|---|
| 1 | comunidad-de-madrid/latin-ii | comunidad-de-madrid/griego-ii | 26.9% | misma comunidad, distinta asignatura |
| 2 | comunidad-de-madrid/fisica | comunidad-de-madrid/geografia | 25.3% | misma comunidad, distinta asignatura |
| 3 | comunidad-de-madrid/fisica | comunidad-de-madrid/dibujo-tecnico-ii | 25.2% | misma comunidad, distinta asignatura |
| 4 | comunidad-de-madrid/fisica | comunidad-de-madrid/quimica | 25.2% | misma comunidad, distinta asignatura |
| 5 | comunidad-de-madrid/matematicas-ii | comunidad-de-madrid/biologia | 25.0% | misma comunidad, distinta asignatura |
| 6 | comunidad-de-madrid/quimica | comunidad-de-madrid/geografia | 24.8% | misma comunidad, distinta asignatura |
| 7 | comunidad-de-madrid/dibujo-tecnico-ii | comunidad-de-madrid/geografia | 24.7% | misma comunidad, distinta asignatura |
| 8 | comunidad-de-madrid/ingles | comunidad-de-madrid/biologia | 24.5% | misma comunidad, distinta asignatura |
| 9 | comunidad-de-madrid/quimica | comunidad-de-madrid/dibujo-tecnico-ii | 24.5% | misma comunidad, distinta asignatura |
| 10 | comunidad-de-madrid/biologia | comunidad-de-madrid/latin-ii | 24.3% | misma comunidad, distinta asignatura |
| 11 | comunidad-de-madrid/biologia | comunidad-de-madrid/griego-ii | 24.2% | misma comunidad, distinta asignatura |
| 12 | comunidad-de-madrid/economia-de-la-empresa | comunidad-de-madrid/dibujo-tecnico-ii | 24.1% | misma comunidad, distinta asignatura |
| 13 | comunidad-de-madrid/dibujo-tecnico-ii | comunidad-de-madrid/historia-del-arte | 24.1% | misma comunidad, distinta asignatura |
| 14 | comunidad-de-madrid/matematicas-ii | comunidad-de-madrid/ingles | 24.1% | misma comunidad, distinta asignatura |
| 15 | comunidad-de-madrid/matematicas-ii | comunidad-de-madrid/latin-ii | 24.0% | misma comunidad, distinta asignatura |

### Media por tipo de par

| Tipo de par | Pares | Similitud media | Similitud máxima |
|---|---:|---:|---:|
| misma comunidad, distinta asignatura | 210 | 22.6% | 26.9% |
| misma asignatura, distinta comunidad | 15 | 17.5% | 19.0% |
| distinta comunidad y asignatura | 210 | 12.7% | 14.2% |

Pares con más de 60% de similitud: **0**.

## 3. Texto plantilla (frases idénticas en 3 o más fichas)

| URL | Frases | Frases repetidas | % frases plantilla | % palabras plantilla | Palabras únicas |
|---|---:|---:|---:|---:|---:|
| region-de-murcia/biologia | 40 | 22 | 55.0% | 42.3% | 266 |
| comunidad-de-madrid/biologia | 45 | 25 | 55.6% | 41.6% | 279 |
| comunidad-de-madrid/dibujo-tecnico-ii | 43 | 25 | 58.1% | 41.6% | 279 |
| comunidad-de-madrid/geografia | 46 | 25 | 54.3% | 40.8% | 289 |
| comunidad-de-madrid/fisica | 44 | 25 | 56.8% | 40.6% | 291 |
| comunidad-de-madrid/matematicas-ii | 44 | 25 | 56.8% | 40.5% | 292 |
| comunidad-de-madrid/latin-ii | 44 | 25 | 56.8% | 40.5% | 292 |
| comunidad-de-madrid/historia-de-espana | 46 | 25 | 54.3% | 40.4% | 293 |
| comunidad-de-madrid/historia-del-arte | 47 | 25 | 53.2% | 40.4% | 293 |
| region-de-murcia/matematicas-ii | 41 | 22 | 53.7% | 40.4% | 288 |
| comunidad-de-madrid/quimica | 47 | 25 | 53.2% | 40.2% | 296 |
| comunidad-de-madrid/ingles | 49 | 25 | 51.0% | 40.0% | 299 |
| comunidad-de-madrid/griego-ii | 44 | 25 | 56.8% | 39.9% | 300 |
| region-de-murcia/ingles | 41 | 22 | 53.7% | 39.8% | 295 |
| region-de-murcia/historia-del-arte | 44 | 22 | 50.0% | 39.7% | 296 |
| region-de-murcia/dibujo-tecnico-ii | 42 | 22 | 52.4% | 39.6% | 297 |
| region-de-murcia/griego-ii | 43 | 22 | 51.2% | 39.6% | 297 |
| region-de-murcia/matematicas-aplicadas-a-las-ciencias-sociales-ii | 39 | 22 | 56.4% | 39.6% | 298 |
| region-de-murcia/geografia | 43 | 22 | 51.2% | 39.6% | 298 |
| comunidad-de-madrid/economia-de-la-empresa | 47 | 25 | 53.2% | 39.4% | 306 |
| region-de-murcia/quimica | 44 | 22 | 50.0% | 39.4% | 300 |
| region-de-murcia/fisica | 42 | 22 | 52.4% | 39.2% | 303 |
| comunidad-de-madrid/lengua-castellana-y-literatura-ii | 47 | 25 | 53.2% | 39.0% | 311 |
| region-de-murcia/lengua-castellana-y-literatura-ii | 44 | 22 | 50.0% | 38.8% | 308 |
| region-de-murcia/historia-de-espana | 43 | 22 | 51.2% | 38.7% | 309 |
| region-de-murcia/latin-ii | 44 | 22 | 50.0% | 38.7% | 309 |
| comunidad-de-madrid/matematicas-aplicadas-a-las-ciencias-sociales-ii | 47 | 25 | 53.2% | 38.6% | 317 |
| comunidad-de-madrid/filosofia | 46 | 25 | 54.3% | 38.2% | 322 |
| region-de-murcia/filosofia | 45 | 22 | 48.9% | 38.2% | 316 |
| region-de-murcia/economia-de-la-empresa | 46 | 22 | 47.8% | 37.1% | 331 |

Media: 53.2% de las frases y 39.7% de las palabras son plantilla; palabras únicas por ficha de media: 299.

### Frases repetidas más frecuentes

- (30 fichas) banco de exámenes la integración del visor externo permanece pendiente de verificar por lo que todavía no se incrusta ningún widget
- (30 fichas) la duración se contrasta con la información general pau 2026 y la estructura con el documento específico de la materia
- (30 fichas) para ver cuánto suma cada materia en tu nota de acceso usa la calculadora de nota de admisión
- (15 fichas) verifica que cada materia tiene un examen único de 90 minutos y remite a los documentos de coordinación para la estructura específica
- (15 fichas) esta ficha no asigna coeficientes hasta disponer de una tabla oficial comprobada para la región de murcia
- (15 fichas) esta ficha no asigna coeficientes hasta disponer de una tabla oficial comprobada para la comunidad de madrid
- (15 fichas) formato duración y criterios comprobados en documentación oficial del distrito universitario de la región de murcia
- (15 fichas) índice oficial del distrito de madrid que publica los modelos orientativos pau 2026 por materia
- (15 fichas) formato duración y criterios comprobados en documentación oficial de la comunidad de madrid
- (15 fichas) jornada informativa pau 2026 del distrito universitario de la región de murcia
- (30 fichas) ponderaciones 2026 2027 pendiente de verificar
- (15 fichas) y consulta el estado de las ponderaciones de universidad complutense de madrid

## 4. Metadatos

| URL | Title | Long. | Meta description | Long. | Avisos |
|---|---|---:|---|---:|---|
| region-de-murcia/matematicas-ii | Exámenes de Matemáticas II EvAU Región de Murcia \| MIEBAU | 57 | Consulta la estructura oficial PAU 2026 de Matemáticas II en la Región de Murcia: cinco preguntas, opciones, bloques y duración verificados. | 140 |  |
| region-de-murcia/matematicas-aplicadas-a-las-ciencias-sociales-ii | Exámenes de Matemáticas CCSS II PAU Murcia \| MIEBAU | 51 | Revisa el modelo oficial PAU 2026 de Matemáticas Aplicadas a las Ciencias Sociales II en Murcia: preguntas, opciones y 90 minutos. | 130 |  |
| region-de-murcia/lengua-castellana-y-literatura-ii | Exámenes de Lengua Castellana II PAU Murcia \| MIEBAU | 52 | Conoce la estructura oficial PAU 2026 de Lengua Castellana y Literatura II en Murcia: tres bloques, siete preguntas y criterios. | 128 |  |
| region-de-murcia/historia-de-espana | Exámenes de Historia de España PAU Murcia \| MIEBAU | 50 | Consulta la estructura oficial PAU 2026 de Historia de España en Murcia: tres partes, documento histórico, desarrollo y opciones. | 129 |  |
| region-de-murcia/ingles | Exámenes de Inglés PAU Región de Murcia \| MIEBAU | 48 | Revisa el modelo oficial PAU 2026 de Inglés en Murcia: Reading, Use of English, Writing, seis tareas y duración de 90 minutos. | 126 |  |
| region-de-murcia/fisica | Exámenes de Física PAU Región de Murcia \| MIEBAU | 48 | Consulta las especificaciones oficiales de Física PAU 2026 en Murcia: cuatro apartados, puntuación, obligatoriedad y 90 minutos. | 128 |  |
| region-de-murcia/quimica | Exámenes de Química PAU Región de Murcia \| MIEBAU | 49 | Conoce la estructura oficial de Química PAU 2026 en Murcia: cinco bloques, pregunta obligatoria, elecciones A/B y duración. | 123 |  |
| region-de-murcia/biologia | Exámenes de Biología PAU Región de Murcia \| MIEBAU | 50 | Revisa la estructura oficial de Biología PAU 2026 en Murcia: cinco preguntas, dos obligatorias, tres con elección y seis bloques. | 129 |  |
| region-de-murcia/economia-de-la-empresa | Exámenes de Economía de la Empresa PAU Murcia \| MIEBAU | 54 | Consulta el formato oficial PAU 2026 de Empresa y Diseño de Modelos de Negocio en Murcia, antes Economía de la Empresa. | 119 | desc < 120 |
| region-de-murcia/filosofia | Exámenes de Filosofía PAU Región de Murcia \| MIEBAU | 51 | Conoce la estructura oficial PAU 2026 de Historia de la Filosofía en Murcia: tres ejercicios, cuatro respuestas y sin opciones. | 127 |  |
| region-de-murcia/dibujo-tecnico-ii | Exámenes de Dibujo Técnico II PAU Murcia \| MIEBAU | 49 | Consulta el modelo oficial PAU 2026 de Dibujo Técnico II en Murcia: seis ejercicios ofertados, cuatro respuestas, bloques y pesos. | 130 |  |
| region-de-murcia/geografia | Exámenes de Geografía PAU Región de Murcia \| MIEBAU | 51 | Revisa la estructura oficial de Geografía PAU 2026 en Murcia: cuatro preguntas de 2,5 puntos, parte competencial y opciones. | 124 |  |
| region-de-murcia/historia-del-arte | Exámenes de Historia del Arte PAU Murcia \| MIEBAU | 49 | Conoce el formato oficial PAU 2026 de Historia del Arte en Murcia: cuatro preguntas, temas, comparativas, imágenes y términos. | 126 |  |
| region-de-murcia/latin-ii | Exámenes de Latín II PAU Región de Murcia \| MIEBAU | 50 | Consulta la estructura oficial de Latín II PAU 2026 en Murcia: texto, traducción, análisis, evolución fonética y mitología. | 123 |  |
| region-de-murcia/griego-ii | Exámenes de Griego II PAU Región de Murcia \| MIEBAU | 51 | Revisa el formato oficial de Griego II PAU 2026 en Murcia: traducción, comentario morfosintáctico, léxico y literatura. | 119 | desc < 120 |
| comunidad-de-madrid/matematicas-ii | Exámenes de Matemáticas II PAU Comunidad de Madrid \| MIEBAU | 59 | Consulta el modelo oficial PAU 2026 de Matemáticas II en Madrid: cinco preguntas de dos puntos, obligatoriedad y opciones. | 122 |  |
| comunidad-de-madrid/matematicas-aplicadas-a-las-ciencias-sociales-ii | Exámenes de Matemáticas CCSS II PAU Madrid \| MIEBAU | 51 | Revisa el modelo PAU 2026 de Matemáticas Aplicadas a las Ciencias Sociales II en Madrid: cuatro ejercicios, opciones y duración. | 128 |  |
| comunidad-de-madrid/lengua-castellana-y-literatura-ii | Exámenes de Lengua Castellana II PAU Madrid \| MIEBAU | 52 | Conoce la estructura PAU 2026 de Lengua Castellana y Literatura II en Madrid: elección de texto, tres bloques y puntuaciones. | 125 |  |
| comunidad-de-madrid/historia-de-espana | Exámenes de Historia de España PAU Madrid \| MIEBAU | 50 | Consulta el modelo PAU 2026 de Historia de España en Madrid: cuestiones, fuentes y elección entre análisis de texto o tema. | 123 |  |
| comunidad-de-madrid/ingles | Exámenes de Inglés II PAU Comunidad de Madrid \| MIEBAU | 54 | Revisa el modelo oficial de Inglés PAU 2026 en Madrid: cinco preguntas, comprensión, léxico, transformación y writing. | 118 | desc < 120 |
| comunidad-de-madrid/fisica | Exámenes de Física PAU Comunidad de Madrid \| MIEBAU | 51 | Consulta la estructura PAU 2026 de Física en Madrid: cuatro bloques, pregunta obligatoria, opciones y 90 minutos. | 113 | desc < 120 |
| comunidad-de-madrid/quimica | Exámenes de Química PAU Comunidad de Madrid \| MIEBAU | 52 | Revisa el modelo PAU 2026 de Química en Madrid: cuatro preguntas de 2,5 puntos, una obligatoria y tres elecciones A/B. | 118 | desc < 120 |
| comunidad-de-madrid/biologia | Exámenes de Biología PAU Comunidad de Madrid \| MIEBAU | 53 | Conoce el formato PAU 2026 de Biología en Madrid: cinco preguntas, una competencial obligatoria y cuatro opciones A/B. | 118 | desc < 120 |
| comunidad-de-madrid/economia-de-la-empresa | Exámenes de Empresa PAU Comunidad de Madrid \| MIEBAU | 52 | Consulta el modelo PAU 2026 de Empresa y Diseño de Modelos de Negocio en Madrid: cuatro preguntas y optatividad interna. | 120 |  |
| comunidad-de-madrid/filosofia | Exámenes de Historia de la Filosofía PAU Madrid \| MIEBAU | 56 | Revisa el modelo PAU 2026 de Historia de la Filosofía en Madrid: elección de texto y cuatro preguntas de 2,5 puntos. | 116 | desc < 120 |
| comunidad-de-madrid/dibujo-tecnico-ii | Exámenes de Dibujo Técnico II PAU Madrid \| MIEBAU | 49 | Consulta el modelo PAU 2026 de Dibujo Técnico II en Madrid: cuatro preguntas de 2,5 puntos, tres con elección y una obligatoria. | 128 |  |
| comunidad-de-madrid/geografia | Exámenes de Geografía PAU Comunidad de Madrid \| MIEBAU | 54 | Revisa la estructura PAU 2026 de Geografía en Madrid: tema, mapa, figura o fotografía y cinco conceptos, con 90 minutos. | 120 |  |
| comunidad-de-madrid/historia-del-arte | Exámenes de Historia del Arte PAU Madrid \| MIEBAU | 49 | Conoce el modelo PAU 2026 de Historia del Arte en Madrid: términos, tema, artistas y comentario de una obra. | 108 | desc < 120 |
| comunidad-de-madrid/latin-ii | Exámenes de Latín II PAU Comunidad de Madrid \| MIEBAU | 53 | Consulta el modelo PAU 2026 de Latín II en Madrid: traducción, morfología, sintaxis, etimología y literatura en tres bloques. | 125 |  |
| comunidad-de-madrid/griego-ii | Exámenes de Griego II PAU Comunidad de Madrid \| MIEBAU | 54 | Revisa el modelo PAU 2026 de Griego II en Madrid: texto, traducción, morfología, sintaxis, etimología y literatura. | 115 | desc < 120 |

Títulos duplicados exactos: **0**. Descripciones duplicadas exactas: **0**.

### Títulos de la misma asignatura en las dos comunidades (diferencia solo en la comunidad)

| Asignatura | Title Murcia | Title Madrid | Similitud tras quitar comunidad/"PAU"/"EvAU" |
|---|---|---|---:|
| matematicas-aplicadas-a-las-ciencias-sociales-ii | Exámenes de Matemáticas CCSS II PAU Murcia \| MIEBAU | Exámenes de Matemáticas CCSS II PAU Madrid \| MIEBAU | 100.0% |
| lengua-castellana-y-literatura-ii | Exámenes de Lengua Castellana II PAU Murcia \| MIEBAU | Exámenes de Lengua Castellana II PAU Madrid \| MIEBAU | 100.0% |
| historia-de-espana | Exámenes de Historia de España PAU Murcia \| MIEBAU | Exámenes de Historia de España PAU Madrid \| MIEBAU | 100.0% |
| dibujo-tecnico-ii | Exámenes de Dibujo Técnico II PAU Murcia \| MIEBAU | Exámenes de Dibujo Técnico II PAU Madrid \| MIEBAU | 100.0% |
| historia-del-arte | Exámenes de Historia del Arte PAU Murcia \| MIEBAU | Exámenes de Historia del Arte PAU Madrid \| MIEBAU | 100.0% |
| matematicas-ii | Exámenes de Matemáticas II EvAU Región de Murcia \| MIEBAU | Exámenes de Matemáticas II PAU Comunidad de Madrid \| MIEBAU | 75.0% |
| latin-ii | Exámenes de Latín II PAU Región de Murcia \| MIEBAU | Exámenes de Latín II PAU Comunidad de Madrid \| MIEBAU | 75.0% |
| griego-ii | Exámenes de Griego II PAU Región de Murcia \| MIEBAU | Exámenes de Griego II PAU Comunidad de Madrid \| MIEBAU | 75.0% |
| fisica | Exámenes de Física PAU Región de Murcia \| MIEBAU | Exámenes de Física PAU Comunidad de Madrid \| MIEBAU | 66.7% |
| quimica | Exámenes de Química PAU Región de Murcia \| MIEBAU | Exámenes de Química PAU Comunidad de Madrid \| MIEBAU | 66.7% |
| biologia | Exámenes de Biología PAU Región de Murcia \| MIEBAU | Exámenes de Biología PAU Comunidad de Madrid \| MIEBAU | 66.7% |
| economia-de-la-empresa | Exámenes de Economía de la Empresa PAU Murcia \| MIEBAU | Exámenes de Empresa PAU Comunidad de Madrid \| MIEBAU | 66.7% |
| geografia | Exámenes de Geografía PAU Región de Murcia \| MIEBAU | Exámenes de Geografía PAU Comunidad de Madrid \| MIEBAU | 66.7% |
| ingles | Exámenes de Inglés PAU Región de Murcia \| MIEBAU | Exámenes de Inglés II PAU Comunidad de Madrid \| MIEBAU | 50.0% |
| filosofia | Exámenes de Filosofía PAU Región de Murcia \| MIEBAU | Exámenes de Historia de la Filosofía PAU Madrid \| MIEBAU | 50.0% |

Resumen: 0 titles > 60; 9 descriptions < 120; 0 descriptions > 160. Por comunidad, descriptions < 120: Murcia 2, Madrid 7.
Titles con "EvAU": 1; con "PAU": 29. Titles con "Región de Murcia"/"Comunidad de Madrid": 18; con "Murcia"/"Madrid" a secas: 12.

## 5. Prioridad de ampliación (puntuación = 40% falta de texto único + 30% plantilla + 30% similitud con su par más parecido)

| # | URL | Palabras | Únicas | % plantilla | Par más parecido | Similitud | Puntuación |
|---:|---|---:|---:|---:|---|---:|---:|
| 1 | region-de-murcia/biologia | 492 | 266 | 42.3% | region-de-murcia/matematicas-ii | 23.8% | 0.244 |
| 2 | comunidad-de-madrid/dibujo-tecnico-ii | 508 | 279 | 41.6% | comunidad-de-madrid/fisica | 25.2% | 0.228 |
| 3 | comunidad-de-madrid/biologia | 507 | 279 | 41.6% | comunidad-de-madrid/matematicas-ii | 25.0% | 0.228 |
| 4 | comunidad-de-madrid/latin-ii | 518 | 292 | 40.5% | comunidad-de-madrid/griego-ii | 26.9% | 0.213 |
| 5 | comunidad-de-madrid/geografia | 516 | 289 | 40.8% | comunidad-de-madrid/fisica | 25.3% | 0.213 |
| 6 | comunidad-de-madrid/fisica | 512 | 291 | 40.6% | comunidad-de-madrid/geografia | 25.3% | 0.210 |
| 7 | region-de-murcia/matematicas-ii | 508 | 288 | 40.4% | region-de-murcia/biologia | 23.8% | 0.209 |
| 8 | comunidad-de-madrid/matematicas-ii | 522 | 292 | 40.5% | comunidad-de-madrid/biologia | 25.0% | 0.207 |
| 9 | comunidad-de-madrid/historia-del-arte | 520 | 293 | 40.4% | comunidad-de-madrid/dibujo-tecnico-ii | 24.1% | 0.203 |
| 10 | comunidad-de-madrid/historia-de-espana | 515 | 293 | 40.4% | comunidad-de-madrid/biologia | 23.9% | 0.202 |
| 11 | comunidad-de-madrid/quimica | 512 | 296 | 40.2% | comunidad-de-madrid/fisica | 25.2% | 0.201 |
| 12 | comunidad-de-madrid/griego-ii | 527 | 300 | 39.9% | comunidad-de-madrid/latin-ii | 26.9% | 0.200 |
| 13 | region-de-murcia/ingles | 514 | 295 | 39.8% | region-de-murcia/biologia | 23.2% | 0.196 |
| 14 | comunidad-de-madrid/ingles | 526 | 299 | 40.0% | comunidad-de-madrid/biologia | 24.5% | 0.195 |
| 15 | region-de-murcia/historia-del-arte | 520 | 296 | 39.7% | region-de-murcia/biologia | 22.6% | 0.192 |
| 16 | region-de-murcia/dibujo-tecnico-ii | 528 | 297 | 39.6% | region-de-murcia/biologia | 23.1% | 0.192 |
| 17 | region-de-murcia/griego-ii | 519 | 297 | 39.6% | region-de-murcia/biologia | 22.9% | 0.192 |
| 18 | region-de-murcia/geografia | 520 | 298 | 39.6% | region-de-murcia/biologia | 23.4% | 0.191 |
| 19 | comunidad-de-madrid/economia-de-la-empresa | 531 | 306 | 39.4% | comunidad-de-madrid/dibujo-tecnico-ii | 24.1% | 0.191 |
| 20 | region-de-murcia/matematicas-aplicadas-a-las-ciencias-sociales-ii | 525 | 298 | 39.6% | region-de-murcia/geografia | 23.0% | 0.190 |
| 21 | comunidad-de-madrid/lengua-castellana-y-literatura-ii | 532 | 311 | 39.0% | comunidad-de-madrid/dibujo-tecnico-ii | 23.6% | 0.188 |
| 22 | comunidad-de-madrid/matematicas-aplicadas-a-las-ciencias-sociales-ii | 540 | 317 | 38.6% | comunidad-de-madrid/dibujo-tecnico-ii | 23.9% | 0.187 |
| 23 | region-de-murcia/quimica | 522 | 300 | 39.4% | region-de-murcia/biologia | 23.0% | 0.187 |
| 24 | region-de-murcia/fisica | 519 | 303 | 39.2% | region-de-murcia/biologia | 23.1% | 0.187 |
| 25 | comunidad-de-madrid/filosofia | 550 | 322 | 38.2% | comunidad-de-madrid/fisica | 23.6% | 0.185 |
| 26 | region-de-murcia/latin-ii | 534 | 309 | 38.7% | region-de-murcia/biologia | 23.0% | 0.185 |
| 27 | region-de-murcia/lengua-castellana-y-literatura-ii | 528 | 308 | 38.8% | region-de-murcia/biologia | 22.7% | 0.185 |
| 28 | region-de-murcia/historia-de-espana | 528 | 309 | 38.7% | region-de-murcia/biologia | 22.8% | 0.184 |
| 29 | region-de-murcia/filosofia | 537 | 316 | 38.2% | region-de-murcia/biologia | 22.5% | 0.182 |
| 30 | region-de-murcia/economia-de-la-empresa | 548 | 331 | 37.1% | region-de-murcia/biologia | 22.0% | 0.177 |
