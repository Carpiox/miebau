# Contenido pendiente de fuente oficial · actualizado 2026-11-15

Datos que **no se han escrito** porque no están verificados en el proyecto. Desde la sesión de trabajo no hay salida de red a webs oficiales: hay que subir el PDF o pegar el dato/enlace. Cuando llegue, se añade con su cita y fecha de verificación.

| # | Página / plantilla | Dato que falta | Fuente oficial sugerida | Qué desbloquea |
|---|---|---|---|---|
| 1 | `/notas-de-corte` y 68 fichas | **Ponderaciones de la Universidad de Murcia por grado** (2026-27 y/o 2027-28). `umu` figura como `blocked` en `data/ponderaciones-2026-2027.json` | Tabla de ponderaciones de la UMU (PDF oficial de admisión a grado) | "Qué asignaturas ponderan más para este grado" en cada ficha; ejemplos de cálculo reales; reabrir fichas con contenido propio |
| 2 | `/notas-de-corte` | **Notas de corte de cursos anteriores** de la UMU | Notas de corte de grado de la UMU de 2023-24 y 2024-25 (PDF oficial) | Evolución por años (hoy solo 2025-2026) |
| 3 | `/notas-de-corte` | **Plazos de preinscripción y matrícula** de la UMU | Calendario de admisión del Distrito Universitario de la Región de Murcia | Bloque de plazos |
| 4 | `/notas-de-corte` | **URL exacta del PDF** de la fuente (hoy `sourceUrl` = `https://www.um.es`) | Enlace directo al documento de notas de corte 2025-26 | Cita de fuente verificable; actualizar `data/notas-corte-2026.json` |
| 5 | `/notas-de-corte` | Notas de corte de **otras universidades** | PDF oficial de cada universidad | Ampliar la tabla (el generador ya admite varias universidades y cursos) |
| 6 | `/notas-de-corte` | Los 30 grados con "(S)/(NP)": nota de corte **ordinaria de primer plazo** | Misma publicación de la UMU, si existe sin anotación | Sustituir "2º plazo" por el dato ordinario |
| 7 | `/calculadora` | **Mínimos oficiales** (p. ej. nota mínima en la fase obligatoria y en las materias voluntarias para que cuenten) y confirmación de 0,6/0,4 | BOE: norma estatal de acceso a la universidad en vigor; normativa de cada comunidad | Poder explicarlos en el texto y, si procede, aplicarlos en el cálculo (hoy la calculadora **no** los aplica y la página lo dice) |
| 8 | `/calculadora` | **Reglas propias por comunidad** (hay búsquedas de "calculadora selectividad País Vasco", "calcular nota selectividad Valencia", "calculadora nota PAU Madrid") | Normativa de cada comunidad / universidad | Texto o variantes por comunidad |
| 9 | `/calculadora`, `/ponderaciones` | **Qué curso de ponderaciones aplica a la PAU de junio de 2027** (¿2026-27 o 2027-28?) | Convocatoria PAU 2027 del Distrito y tablas oficiales publicadas | Decidir el año en título, H1 y texto (decisión D3 pendiente) |
| 10 | Fichas de exámenes (Murcia) | **Exámenes de años anteriores** a 2026 por asignatura | Portal de exámenes anteriores de la UMU (`examenesacceso.um.es`) | Sección de histórico y "cómo cambió el examen" con más de 2 muestras. Ojo: ese subdominio no lo admiten hoy el generador ni el test de dominios |
| 11 | Fichas de exámenes | `num_convocatorias_disponibles` (campo `pendiente_de_verificar` en las 64) | Documento oficial de cada distrito | Mostrarlo |
| 12 | `/examenes/comunidad-de-madrid/historia-del-arte` e `/ingles` (y el resto de Madrid) | **PDF de los modelos de Madrid** (no están en `data/`): criterios de corrección, material permitido y diferencias entre modelo ordinario y extraordinario | UCM / Comunidad de Madrid: modelos PAU 2026 | Igualar a las fichas de Murcia (criterios y "qué cambió") |
| 12b | `/examenes/region-de-murcia/matematicas-ii` | Criterios de calificación de la **convocatoria de julio** (solo se citan los de junio; el texto de julio extraído no los trae de forma legible) | PDF extraordinario de la UMU (306) | Desglose por apartados también de julio |
| 13 | Fichas de exámenes (Murcia y Madrid) | **Ponderaciones de la asignatura** para grados de la UMU y de las universidades madrileñas | Tablas oficiales de ponderación | Responder "¿cuánto pondera X?" con dato (hoy la FAQ dice que está pendiente) |
| 14 | `/ponderaciones/ucam`, `unir`, `universitat-abat-oliba-ceu`, `universidad-alfonso-x-el-sabio-mare-nostrum` y demás privadas indexadas | **Precios, admisión y requisitos** (hay búsquedas "abat oliba precios", "alfonso x el sabio málaga") | Web oficial de cada universidad | Contenido propio verificable para las 16 fichas privadas que reciben impresiones |
| 15 | `/guias`, `/precios`, `/premium`, `/contacto` | Contenido práctico (guías con fuente); decisión de indexar o no | — | Lote 6 del plan |
| 16 | Legales (`/politica-privacidad`, `/aviso-legal`) | Titular, domicilio, correo y tratamiento de datos (newsletter, contacto, GA4, AdSense) | Tú | Política de privacidad completa (MIE-013, requisito AdSense) |
| 17 | `/calendario-ebau` (noindex) | **Fechas oficiales PAU 2027** | Convocatoria del Distrito Universitario | Poder indexarla |

## Decisiones que quedan abiertas
- **uam, uc3m y uoc** pasaron a `noindex` el 2026-11-15 (0 impresiones, nunca rastreadas). Se reabren cuando tengan tabla oficial propia verificada (quitar el id de `PONDERACIONES_NOINDEX_PARCIALES`).
- **Cifra de ponderaciones en noindex: 49, no 51.** El "51" salía de un fallo de aritmética de mi plan (sumé 15 pendientes cuando son 14 públicas + 1 privada). Hechos: 82 fichas − 16 ya indexadas − 14 verificadas − 3 parciales = 49.
