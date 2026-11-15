# Plan de contenido · Fase A (inventario y propuesta) · 2026-11-15

Solo lectura: no se ha tocado ninguna página. Inventario completo de las 233 páginas en `docs/inventario-contenido.csv` (URL, plantilla, palabras, title, estado de indexación, impresiones/clics/posición, consultas asociadas, dato propio verificado, recomendación preliminar). Datos de Search Console: exports del 15-11-2026 (3 meses).

**Espero tu OK (o tus cambios) antes de la Fase B/C.**

## 1. Lo que dicen los datos (antes de escribir una línea)

| Dato | Valor |
|---|---|
| Rendimiento en 3 meses | **10 clics, 431 impresiones** (321 ordenador / 102 móvil / 8 tablet). 381 impresiones en España |
| Indexación | **56-57 indexadas / 181-182 no indexadas** (gráfico del 08-11) |
| Motivos de no indexación | 172 "Descubierta: actualmente sin indexar" (último rastreo `1970-01-01` = **Google no las ha rastreado nunca**), 6 redirecciones, 3 "Rastreada: sin indexar", 1 alternativa con canonical. Solo exportaste el detalle de las 172: de las 3 "rastreadas" no sé cuáles son |
| Consultas visibles | 183 de las 431 impresiones (el resto está anonimizado por Google) |
| Términos usados (impresiones) | **ebau 50 · pau 47 · evau 24 · selectividad 10**. Con año: **"2026" 8, "2027" 0** |

### Qué páginas están sin indexar (de las 172)

| Plantilla | Páginas | Sin indexar | Impresiones |
|---|---|---|---|
| Notas de corte (fichas) | 68 | **68** | **0** |
| Ponderaciones (fichas) | 82 | 66 (14 públicas verificadas con datos, 22 públicas pendientes/bloqueadas, 30 privadas sin publicación) | 61 (casi todas de privadas indexadas) |
| Exámenes Madrid | 33 | 29 | 56 aprox. |
| Exámenes Murcia | 31 | 3 | resto de las 196 de exámenes |
| Otras | — | `/contacto`, `/guias`, `/politica-privacidad`, `/ponderaciones`, `/precios`, `/sobre-nosotros` | — |

### Lectura honesta (importante para la estrategia)
1. **Escribir más no desbloquea por sí solo la indexación.** Hay 172 URLs que Google ni ha rastreado, así que no ha evaluado su contenido. Las 14 fichas de ponderaciones públicas **con datos oficiales completos y largas** tampoco están indexadas, mientras que 15 fichas privadas **sin datos** sí lo están. Eso apunta a un problema de descubrimiento/cola de rastreo de un dominio nuevo, no (todavía) de calidad. Es una inferencia a partir de estos datos, no una certeza.
2. El contenido sí importa **donde ya hay rastreo e impresiones**: es donde el esfuerzo se puede medir.
3. Los 10 clics son: portada 6, `/ponderaciones/ucam` 2, `/calculadora` 1, `/examenes` 1.

### Dónde está la oportunidad real (páginas indexadas con impresiones)

| Página | Impr. | Pos. | Lectura |
|---|---|---|---|
| `/examenes/region-de-murcia/geografia` | 42 | **8,3** | Primera página y 0 clics: título/snippet |
| `/examenes/region-de-murcia/biologia` | 23 | **8,6** | ídem |
| `/examenes/region-de-murcia/fisica` | 16 | **8,7** | ídem |
| `/examenes/comunidad-de-madrid/historia-del-arte` | 45 | 13,6 | Segunda página; subir a la primera |
| `/examenes/region-de-murcia/matematicas-ii` | 26 | 69,3 | Consultas: "ebau mates murcia" (13), "matematicas ebau murcia" (12). La página dice "PAU/Matemáticas II"; la gente escribe "ebau" y "mates" |
| `/calculadora` | 47 | 47,7 | Clúster de ~56 impresiones de consultas "calculadora/simulador evau/ebau/nota" |
| `/notas-de-corte` | 57 | 77,7 | Clúster de ~37 impresiones "calcular nota de corte / notas de corte" |
| `/` | 70 | 61,2 | 6 de los 10 clics |
| `/ponderaciones/ucam` | 22 | **4,6** | La mejor página del sitio (2 clics) y no tiene datos propios |
| `/examenes/comunidad-de-madrid/ingles` | 15 | 76,9 | 12 variantes de "pau/evau inglés madrid" (1-2 impr. cada una) |

## 2. Decisiones que necesito de ti

| # | Decisión | Mi recomendación | Por qué |
|---|---|---|---|
| D1 | **Notas de corte (68 fichas):** ¿consolidar? | **Consolidar**: tabla navegable y completa dentro de `/notas-de-corte` (la página ya indexada con 57 impr.) y marcar las 68 fichas como `noindex` hasta que cada una tenga contenido propio verificable | 0 indexadas, 0 impresiones. El único dato propio es 1 número. Lo que pides añadir (evolución, ponderaciones del grado, plazos) **no está verificado** (ver sección 5). Sin salir de tu regla "consolidar o noindex" |
| D2 | **Ponderaciones sin datos (67 fichas):** ¿qué hacer? | Mantener indexadas las 16 que ya lo están (tienen impresiones y son las que reciben clics) y no tocarlas sin fuente oficial. Para las 51 restantes sin dato propio (8 bloqueadas + 15 pendientes + 29 privadas sin publicación; 1 privada pendiente): **noindex hasta que haya fuente**. Las 14 públicas verificadas se refuerzan | Regla 3 tuya |
| D3 | **Año** | **No cambiar años en masa.** Páginas de examen: titular "PAU 2026" (último examen real) con mención explícita a "para preparar la PAU de 2027". Calculadora, ponderaciones y notas: decidir con la fuente oficial qué curso aplica a la PAU de junio de 2027 (¿tablas 2027-2028?) | Búsquedas: "2026" aparece en 8 impresiones y "2027" en 0. Un cambio masivo a 2027 en exámenes iría contra la demanda observada |
| D4 | **Terminología** | PAU como término oficial + "EBAU" en Murcia y "EvAU" en herramientas, ambos en H2/primer párrafo | ebau 50, pau 47, evau 24. Hoy los títulos de herramientas dicen "EvAU" y las fichas de Murcia "PAU" |
| D5 | **Indexación en lote aparte** | Todo cambio de `noindex`/sitemap va en un **Lote 0 separado** (sin tocar contenido), con medición propia | Tu regla 2 |
| D6 | **Lo que desbloquea indexar de verdad** | Pedir indexación manual de las ~15 URLs clave y enlazar desde las páginas ya indexadas (home, `/calculadora`, `/examenes/region-de-murcia`) a las más valiosas aún sin rastrear | Es la palanca que sí afecta a las 172 |

## 3. Plantillas: estado, bloques propuestos y criterio de calidad

Criterio general: solo bloques con fuente verificable. Meta de similitud <0,50 entre fichas de la misma plantilla (medida con shingles de 5 palabras y coseno, sobre el texto del `<main>` sin menús ni enlaces repetidos). Hoy: exámenes 0,26 (máx. 0,39), ponderaciones 0,31, notas 0,84.

### 3.1 Exámenes por asignatura y comunidad (64 fichas + 2 índices)
- **Estado:** 691-778 palabras (mediana 737), datos propios sólidos: estructura PAU 2026 verificada, duración, puntuación, enlaces oficiales ordinaria/extraordinaria, composición con cita literal (Murcia). Es la plantilla más sana.
- **Qué falta (con fuente):** (a) título/meta con la forma en que se busca ("examen PAU Geografía Murcia", "EBAU"), (b) FAQ visible con respuestas que salen de los datos de la ficha (duración, nº de preguntas, optatividad, convocatorias), (c) "cómo estudiar con estos exámenes" **específico de la estructura** (p. ej. Geografía: 2 preguntas competenciales obligatorias + 2 con elección), (d) diferencia entre convocatoria ordinaria y extraordinaria **solo si consta en los PDF** ya descargados, (e) enlaces contextuales a calculadora/ponderaciones de la misma universidad.
- **No se añade:** "temas que más se repiten" (solo hay 2 exámenes verificados por asignatura: no se puede afirmar repetición), exámenes de años anteriores (la UMU publica PDFs antiguos, pero **no están en el proyecto ni verificados**).
- **Orden:** Murcia primero (28/31 indexadas, impresiones y posiciones 8-9), después Madrid.

### 3.2 Calculadora, ponderaciones (hub), notas de corte (hub), exámenes (hub)
- **Estado:** 567-1 842 palabras. La calculadora y el hub de notas concentran ~93 impresiones de consultas "calcular nota…".
- **Bloques:** respuesta directa a "cómo se calcula la nota de admisión" en las primeras líneas (fórmula 0,6 Bachillerato + 0,4 fase obligatoria + hasta 2×(0,1 o 0,2)), ejemplo resuelto, diferencia nota de acceso / nota de admisión / nota de corte (las consultas más repetidas: "nota acceso universidad", "nota admisión universidad"), FAQ real, y en `/notas-de-corte` la tabla completa de las 68 titulaciones (D1).
- **Verificar antes:** el 60/40 y los coeficientes 0,1/0,2 ya están en la calculadora, pero los contrastaré con la fuente oficial antes de reutilizarlos en texto nuevo.

### 3.3 Ponderaciones por universidad (82 fichas)
- **Estado:** 14 públicas verificadas (datos completos, 4-10 mil palabras, ya únicas), 1 privada verificada, 67 sin datos (323-430 palabras de plantilla).
- **Verificadas:** añadir arriba una introducción útil (cómo funciona esa universidad: campus/centros que consten en el dato), 2-3 **ejemplos de cálculo con titulaciones reales de su propio dataset** (coeficientes reales; las notas del alumno serán claramente "ejemplo ilustrativo") y resumen de qué materias ponderan 0,2 en más titulaciones (se calcula del dataset, no se escribe a mano).
- **Sin datos:** no se rellenan. `ucam` (pos 4,6, 2 clics) y las privadas con impresiones ("abat oliba precios", "alfonso x el sabio málaga") piden **precios/admisión**: no hay ninguna fuente en el repo → `contenido-pendiente.md`.

### 3.4 Notas de corte por grado (68 fichas)
- **Estado:** ~480 palabras con un solo dato (nota, curso, turno) + lista de 67 enlaces. 0 indexadas.
- **Propuesta (D1):** consolidar. Si tras recibir fuentes hay contenido propio para algún grado (ponderaciones de la UMU para ese grado, serie histórica), esa ficha vuelve a `index` con máx. 5-8 enlaces afines.
- **Bloqueado por falta de fuente:** ponderaciones UMU por grado (`umu` figura como `blocked`), evolución por años (solo hay 2025-2026), plazos de preinscripción/matrícula (no están en el repo).

### 3.5 Home, guías, calendario, precios, premium, contacto, legales
- **Home** (331 palabras, 70 impr., pos 61): el título (`Miebau · Tu EvAU, con todo claro`) no contiene ninguna keyword buscada. Propuesta: reformular título/H1 y la intro con el uso real (calculadora, ponderaciones, exámenes PAU por comunidad).
- **Guías** (86 palabras, 3 tarjetas, sin indexar): o se convierte en 2-3 guías cortas con fuente (cómo se calcula la nota, qué son las ponderaciones, cómo usar exámenes anteriores) o se recomienda `noindex`. Prefiero la primera, **pero solo con las fuentes de 3.2**.
- **Precios / premium / contacto** (67-69 palabras): no son páginas para posicionar. Propuesta: contenido claro y breve; evaluar `noindex` en Lote 0 (premium tiene 8 impr. pos 5,9 por la palabra "premium", sin valor).
- **Calendario EBAU:** hoy `noindex` (62 palabras, sin fechas verificadas). Sin fuente oficial de fechas 2027 no se indexa.
- **Legales:** correctas y completas, sin SEO. La política de privacidad (118 palabras) está incompleta (MIE-013) y es requisito para AdSense. Necesita que me confirmes datos del titular y del tratamiento (ver sección 5).

## 4. Orden de lotes (por impresiones) y verificación de cada uno

| Lote | Contenido | Impr. 3 m | Depende de |
|---|---|---|---|
| 0 | **Indexación** (solo noindex/enlaces/sitemap, sin contenido): D1, D2, D6 | — | Tu OK a D1, D2 |
| 1 | Exámenes Murcia (31 fichas + índice) | ~140 | — |
| 2 | Calculadora + hub notas de corte (+ tabla de 68 titulaciones) + hub ponderaciones | ~160 | D3, fuente de la fórmula |
| 3 | Home | 70 | D3, D4 |
| 4 | Ponderaciones verificadas (15) | ~5 | — |
| 5 | Exámenes Madrid (33 fichas + índice) | ~60 | — |
| 6 | Guías, precios, premium, contacto, legales | ~10 | Datos legales (sec. 5) |

Tras cada lote: `node --test tests/*.test.mjs`, generadores en `--check`, `curl` del HTML crudo, similitud entre fichas antes/después, JSON-LD válido, 0 enlaces rotos, 0 huérfanas; commit por lote, **sin push**. `docs/seo-seguimiento.md` se actualiza con fecha, hipótesis y métricas a 2-4 semanas (posición media, impresiones, clics, páginas indexadas; valores base de hoy: 10 clics, 431 impresiones, 57 indexadas).

**Espacio para la sección de música:** cada ficha mantiene su estructura en secciones independientes dentro de la columna principal, sin barra lateral fija ni bloques de ancho rígido, de modo que se pueda insertar una sección nueva entre "cómo estudiar" y "fuentes". No se implementa nada.

## 5. Datos que me faltan (pasarán a `docs/contenido-pendiente.md` en el Lote 1)

| Página/plantilla | Dato que falta | Fuente oficial sugerida |
|---|---|---|
| Notas de corte (68) y `umu` | Ponderaciones UMU por titulación 2026-27 / 2027-28 | Tabla de ponderaciones de la Universidad de Murcia (PDF oficial de admisión), que tendrías que subir al chat |
| Notas de corte | Series de años anteriores por grado | Notas de corte de la UMU de cursos previos (PDF oficial) |
| Notas de corte | Plazos de preinscripción y matrícula UMU | Calendario de admisión del Distrito Universitario de la Región de Murcia |
| Notas de corte | URL exacta del PDF de la fuente (hoy solo `https://www.um.es`) | Enlace directo al documento |
| `ucam`, privadas con impresiones | Precios, admisión, cupos | Web oficial de cada universidad |
| Exámenes | Años anteriores a 2026 por asignatura | Portal de exámenes anteriores de la UMU (`examenesacceso.um.es`), enlaces o PDFs |
| Calculadora | Confirmar fórmula y coeficientes y qué curso aplica a la PAU 2027 | BOE / RD de acceso, y publicación del Distrito |
| Calendario EBAU | Fechas oficiales PAU 2027 | Convocatoria del Distrito Universitario |
| Legales | Titular, domicilio, correo, tratamiento de datos (newsletter, contacto, GA4/AdSense) | Tú |

Desde esta sesión no hay salida de red a webs oficiales, así que cualquier PDF o dato lo tienes que subir o pegar tú.

## 6. Qué haré tras tu OK
1. Lote 0 solo si apruebas D1/D2 (decisión de indexación, aislada).
2. Lote 1 (exámenes Murcia), empezando por Geografía, Biología y Física (posición 8-9, 0 clics).
3. Mostrar métricas antes/después y parar a revisar antes del siguiente lote.
