# Informe SEO · Fase 1 (diagnóstico) · 2026-11-15

Solo lectura: no se ha tocado código, sitemap, noindex ni enlazado. Todo lo de abajo sale del repo en `HEAD` (rama `claude/miebau-seo-diagnostico-rjcyk2`, sobre `main` = PR #33).

## 0. Qué se pudo medir y qué no (léelo primero)

| Bloque pedido | Estado | Por qué |
|---|---|---|
| 1a. Search Console (quick wins, CTR, canibalización, indexación) | **NO REALIZADO** | No hay conector de Search Console en esta sesión (solo Gmail, Drive, GitHub). Sin datos no hay lista top 50, ni canibalización, ni motivos de "descubierta/rastreada sin indexar". No los invento. |
| 1b. Auditoría técnica del repo | Hecho | Script propio sobre los 233 HTML crudos (lo que ve un crawler sin JS). |
| 1b. chrome-devtools | **No disponible** | Sustituido por Playwright + Chromium móvil (Pixel 5) contra servidor local. LCP/CLS son de laboratorio, sin red real ni compresión de Cloudflare, sin fuentes de Google: **orientativos, no datos de campo/CrUX**. |
| 1c. SERP | **Parcial** | Solo 5 consultas, con la búsqueda web de la herramienta (US-only, resumida). No tengo tu lista de las 10 queries más valiosas; usé las que constan en `CLAUDE.md`. No se pudo abrir ninguna URL externa (sin salida de red). |

**Para completar 1a necesito de ti (cualquiera de las dos):**
1. Search Console → Rendimiento → últimos 90 días → exportar **Consultas** y **Páginas** (CSV), y la combinación consulta+página (en la interfaz: filtra por página, o exporta vía Looker Studio/Sheets). Y Indexación → Páginas → exportar cada motivo ("Rastreada: actualmente sin indexar", "Descubierta: actualmente sin indexar", "Excluida por noindex", etc.) con la lista de URLs.
2. O instalar un conector con Search Console (el registro ofrece *Supermetrics*, aún no instalado). Lo decides tú.

## 1. Resumen ejecutivo

La parte de rastreo está sana. El riesgo principal es de **calidad del contenido a escala**, no técnico:

1. **68 fichas de notas de corte** (UMU) son casi idénticas entre sí: ~480 palabras con un solo dato propio (un número) y un listado de 67 enlaces hermanos. Similitud media entre pares (shingles de 5 palabras): **0,84**; **1 656 de 2 278 pares superan 0,80**. Es el patrón que Google trata como contenido fino/doorway.
2. **67 de 82 fichas de ponderaciones no tienen ningún dato verificado** (15 `pending` + 8 `blocked` + 44 `no_publication`), están en el sitemap, indexables, con 323–430 palabras de plantilla + formulario de aviso. Esto choca con tu regla 3 ("dato sin verificar → noindex"). **Matiz importante:** de este grupo salen búsquedas reales documentadas en `CLAUDE.md` ("abat oliba precios", "alfonso x el sabio malaga"), así que no se puede decidir a ciegas: hace falta el CSV de Search Console.
3. **La ficha de la Universidad de Murcia en ponderaciones (`/ponderaciones/umu`) no tiene datos verificados** (339 palabras de plantilla), y es justo la página para "ponderaciones UMU 2027". Las 15 universidades verificadas son catalanas, valencianas, aragonesas y baleares, no Murcia.
4. **Desalineación de año**: portada y `/examenes` dicen 2027; `/ponderaciones` y 45 fichas dicen "2026-2027"; notas de corte "2026" y "2025-2026". Una PAU en junio de 2027 se rige por las tablas del curso 2027-2028 (la propia SERP muestra una tabla de Murcia etiquetada 2027-2028 de un tercero). **No lo doy por hecho: hay que confirmarlo con la fuente oficial de la UMU.**
5. **Páginas informativas casi vacías indexables**: `/guias` (86 palabras, 3 tarjetas que solo enlazan a herramientas), `/precios` (67), `/premium` (69), `/contacto` (69), `/politica-privacidad` (118), `/aviso-legal` (115).
6. Lo bueno: 0 enlaces rotos, 0 huérfanas reales, canonicals 100 % correctas, títulos y metas únicos, 0 H1 duplicados/ausentes, JSON-LD válido en todas, sitemap = exactamente las páginas indexables.

## 2. Discrepancias con lo que me contaste

- **`examenes.html` con resultados falsos y `href="#"`: no reproducible en HEAD.** No hay ningún `href="#"` en `examenes.html` ni en `js/examenes.js`; el HTML trae 64 tarjetas con enlace real a su ficha. O ya se arregló, o te refieres a otra cosa (¿una captura/rastreo antiguo?). No hay nada que arreglar en Oleada A por esto salvo que me indiques dónde lo ves.
- **Noindex: encuentro 3, no 4**: `/404`, `/proximamente`, `/calendario-ebau` (meta en HTML y también en `js/seo.js`). Ninguna está en el sitemap. `robots.txt` bloquea además `/404.html` y `/proximamente.html`. No existe `_headers`, así que no hay `X-Robots-Tag`. **La cuarta no la identifico**; podría ser una URL con parámetros o un dominio alternativo que Search Console cuenta aparte. Necesito el listado de Search Console.
- **Páginas totales**: 233 HTML, 230 en sitemap (no ~195; el número de CLAUDE.md está desfasado).
- **Huérfanas de ponderaciones (uniovi, uclm, uex)**: ya no son huérfanas (las arregló el PR #23, directorio estático). Siguen siendo frágiles: **1 solo enlace entrante** (`uclm`, `uex`, `uib`, `uniovi`) y 10 más con 2.

## 3. Auditoría técnica (con números)

| Comprobación | Resultado |
|---|---|
| HTML / sitemap | 233 / 230 URLs; 0 en sitemap sin archivo; 0 indexables fuera del sitemap; 0 noindex en sitemap |
| Canonical | 233/233 autorreferentes y limpias |
| Title / meta description | 0 duplicados; 0 títulos >60; 0 metas fuera de 70–160 (solo `/404` sin meta) |
| H1 | exactamente 1 en las 233 |
| JSON-LD | 0 inválidos. BreadcrumbList en 216 fichas; FAQPage en 82 fichas de ponderaciones + `/preguntas-frecuentes`; WebApplication en calculadora. **Sin JSON-LD**: `/ponderaciones`, `/examenes`, `/guias`, `/precios`, `/premium`, `/contacto`, `/sobre-nosotros`, legales |
| Enlazado | 0 rotos, 0 enlaces `.html`, 0 huérfanas (salvo `/404`); profundidad de clic: 1 en 27 páginas, 2 en 156, 3 en 48, máx. 3 |
| Entrantes en cuerpo (mediana) | exámenes 34 · notas de corte 67 · ponderaciones 9 (mín. 1) |
| Peso (móvil, local, sin comprimir) | HTML típico 13–20 KB; CSS 53 KB; JS 27–53 KB; 0 imágenes en página. `/ponderaciones/uab` 198 KB de HTML y 2 748 nodos DOM (10 725 palabras de tablas, legítimo). `/ponderaciones` descarga además `data/ponderaciones-2026-2027.json` (620 KB sin comprimir) |
| LCP / CLS laboratorio | LCP 56–248 ms, CLS 0 en las 9 páginas probadas. Sin red real ni fuentes: **no extrapolable**; sin datos CrUX ni PageSpeed en esta sesión. INP no medido |
| `js/pdf.js` (195 KB) | No lo referencia ningún HTML ni JS (grep). Candidato a código muerto; impacto SEO nulo, comprobar antes de borrar |

### Nota sobre FAQPage
Las 82 fichas de ponderaciones repiten las mismas 3 preguntas/respuestas genéricas (solo cambia el nombre en la 3.ª). Hasta donde sé, Google limitó los resultados enriquecidos de FAQ a webs institucionales de salud/gobierno, así que probablemente no aporta nada en SERP y añade texto repetido. **Dato a verificar en la documentación actual de Google antes de decidir.**

## 4. Contenido fino y duplicado

| Familia | Fichas | Palabras (mín / mediana / máx) | Similitud media entre pares | Pares >0,80 | Lectura |
|---|---|---|---|---|---|
| Exámenes | 66 | 691 / 738 / 1 135 | 0,26 | 0 | **Sano.** Máxima similitud 0,39 (Griego II vs Latín II) |
| Notas de corte | 68 | 479 / 486 / 527 | **0,84** | **1 656** | **Riesgo alto.** Un número por página |
| Ponderaciones | 82 | 323 / 426 / 10 725 | 0,31 | 16 | Las 15 con datos son únicas y largas; las 67 sin datos son plantilla (pares >0,80, p. ej. `uam`/`uc3m`: 0,88) |

Detalle notas de corte (`/notas-de-corte/grado-en-filosofia-um` como muestra): titular con el dato, párrafo estándar de "nota retrospectiva", bloque de fuente y la lista de 67 grados hermanos. El listado largo es lo que más infla la similitud y además diluye la relevancia de cada enlace (67 enlaces sin afinidad temática). Limitaciones del propio dato: `sourceUrl` apunta al dominio `https://www.um.es`, no al PDF concreto (pendiente tuyo según `CLAUDE.md`), y 30 de los 68 valores son de "2º plazo", no la nota de corte ordinaria.

## 5. SERP (5 consultas; cobertura parcial)

| Consulta | Qué ocupa el top (según la búsqueda) | Qué cubren que Miebau no |
|---|---|---|
| nota de corte medicina universidad de murcia 2025 | Redacción Médica (noticias con cifra y contexto: 13,28), Educaweb, YAQ | Contexto/histórico y cifras comparadas; las fuentes se contradicen (13,28 / 12,965 / 12,784). Miebau tiene la ficha `/notas-de-corte/grado-en-medicina-um` pero sin serie histórica ni contexto |
| calcular nota de corte grado universidad | Simuladores de universidades (UPV, UPF, UA, UC3M), YAQ, Ilerna, Uniscopio | Simulador **por universidad/grado** comparando contra la nota de corte. Miebau tiene calculadora y notas por separado, sin cruzarlas |
| examen PAU historia del arte Murcia con soluciones | PDFs oficiales UM antiguos (2013–2020), academias con modelos y soluciones (luis-vives.es), UPCT | Soluciones/criterios y exámenes recientes de Murcia. **Hueco real**: no apareció un PDF oficial con soluciones de 2025/2026. Miebau enlaza a los exámenes oficiales, no aporta soluciones |
| ponderaciones universidad de murcia 2026-2027 PAU | YAQ (PDF de tablas de Murcia), UPCT, Educaweb, Uniscopio | Tablas completas descargables por universidad. **No apareció ninguna tabla oficial 2026-2027 de la UMU** en los resultados; `umu` en Miebau está sin datos |
| calculadora nota EvAU PAU simulador | Uniscopio, Omni Calculator, simuladores UPV/UC3M/EHU, Ilerna, Genbeta/Xataka | Explicación de fórmula y ejemplos junto a la herramienta; competencia muy fuerte, dominada por universidades y grandes portales |

No he abierto esas páginas (sin salida de red), así que la comparación es sobre el resumen devuelto, no sobre su HTML.

## 6. Hallazgos ordenados por impacto / esfuerzo

| # | Hallazgo | Impacto | Esfuerzo | Riesgo | Notas |
|---|---|---|---|---|---|
| 1 | Notas de corte: 68 fichas casi duplicadas | Alto | Medio | Medio | Dejar fichas propias solo para los grados con demanda real (necesita CSV), el resto consolidado en el hub como tabla enlazada; sustituir los 67 enlaces por ~6–8 afines. Separar en dos commits (indexación / contenido) |
| 2 | 67 fichas de ponderaciones sin datos, indexables | Alto | Bajo | **Medio-alto** (puedes perder las búsquedas long-tail que ya llegan) | Decidir con CSV: noindex solo las que no reciben impresiones. Aplica tu regla 3 |
| 3 | `umu` sin datos verificados | Alto | Medio | Bajo | Requiere que subas el PDF oficial de ponderaciones de la UMU (sin red desde aquí) |
| 4 | Año objetivo inconsistente (2026-2027 vs 2027) | Medio-alto | Bajo | Medio | Confirmar con fuente oficial qué curso aplica a la PAU de 2027 antes de tocar títulos |
| 5 | Páginas finas indexables (`/guias`, `/precios`, `/premium`, `/contacto`, legales) | Medio | Bajo–medio | Bajo | `/guias` es el sitio natural para contenido informativo; legales: la privacidad con 118 palabras es un riesgo para AdSense (ya anotado como MIE-013) |
| 6 | FAQPage genérico en 82 fichas | Bajo-medio | Bajo | Bajo | Verificar valor actual en doc. de Google; si no aporta, quitar o hacer FAQ específico |
| 7 | Entrantes frágiles en ponderaciones (4 con 1, 10 con 2) | Medio | Bajo | Bajo | Enlaces contextuales desde notas de corte/exámenes de la misma universidad |
| 8 | Titular de portada sin palabra clave (`Miebau · Tu EvAU, con todo claro`) y marca inconsistente (`\| MIEBAU` vs `· Miebau`) | Medio | Muy bajo | Bajo | Cambio on-page aislado |
| 9 | 4.º noindex sin identificar; `examenes.html` "falso" no reproducible | — | — | — | Necesito datos de Search Console / URL concreta |
| 10 | `js/pdf.js` sin referencias; JSON de 620 KB en `/ponderaciones` | Bajo | Bajo | Bajo | Comprimido por Cloudflare, probablemente irrelevante; medir con datos reales |

## 7. Qué sigue

Me detengo aquí, como pediste. Para la Fase 2 con cifras reales me falta el export de Search Console (sección 0). Con eso:
- relleno el top 50 de quick wins, canibalización y causas de no-indexación;
- decido con datos el punto 2 (qué fichas de ponderaciones pasan a noindex) en vez de adivinar;
- armo la tabla de 3 oleadas.

Sin esos datos, puedo preparar la Fase 2 solo con lo estructural (puntos 1, 4, 5, 7, 8), marcando cada decisión que dependa de impresiones como pendiente.
