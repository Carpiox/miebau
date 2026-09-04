# Auditoría integral de Miebau

**Sitio auditado:** https://miebau.es/  
**Repositorio:** `Carpiox/miebau`, rama local `main`  
**Fecha de la auditoría:** 2 de septiembre de 2026  
**Último commit observado:** `f8bff6e` (`Ponderaciones: corregir catálogo y coberturas parciales`)  
**Naturaleza del encargo:** análisis exclusivamente; no se ha modificado código, configuración, datos ni contenido del sitio.

## 1. Resumen ejecutivo

Miebau ya tiene un activo difícil de replicar: una base de ponderaciones 2026-2027 trazable, con 8.397 registros, estados de cobertura honestos, fuentes oficiales y tablas útiles en HTML inicial. Esa parte está mejor construida que el resto del producto: es indexable sin JavaScript, funciona en móvil, incluye búsqueda y CSV, y está protegida por 28 pruebas que pasan.

El sitio, sin embargo, no puede tratarse aún como un producto completamente fiable. El problema más grave está en `/examenes`: se promete un catálogo de exámenes oficiales y el código genera resultados de demostración para cualquier combinación, todos con `href="#"`. También hay formularios de contacto y newsletter que muestran confirmaciones aunque no envían nada. Son fallos de confianza más importantes que cualquier ajuste de metadatos.

En SEO técnico, la base es razonable: HTML estático, títulos, descripciones, canonicals limpios, sitemap y respuestas 200 correctas en las 95 URLs indexables comprobadas. Las debilidades principales son el enlazado interno estático casi inexistente hacia 81 de las 82 fichas, un error que deja indexable la página limpia `/notas-de-corte`, 45 fichas con un enlace interno a `.html`, metadatos sociales dependientes de JavaScript y datos estructurados de breadcrumb duplicados después del renderizado.

En UX móvil, las tablas de ponderaciones están resueltas con cuidado. La calculadora, en cambio, expone controles marcados como `hidden` porque varias reglas `display` anulan el atributo HTML; a 360 px aparece contenido contradictorio y se provoca un desbordamiento horizontal de 46 px. La corrección es pequeña, pero debe cubrirse con una prueba para que no reaparezca.

No hay acceso a Google Search Console, analítica, logs de Netlify, conversiones ni CrUX. PageSpeed Insights devolvió cuota agotada y no hay Lighthouse instalado en el entorno. Por tanto, esta auditoría no atribuye tráfico, posiciones, CTR, Core Web Vitals de campo ni impacto comercial que no puedan demostrarse.

### Cinco fortalezas principales

1. **Ponderaciones con datos y fuentes reales.** 8.397 filas, 912 titulaciones y cuatro matrices, con enlaces oficiales, estados `verified`, `partial`, `pending` o `blocked` y sin completar huecos por semejanza.
2. **Contenido principal prerenderizado.** El sitio es estático/SSG; calculadora, páginas y tablas de fichas existen en el HTML inicial. No es CSR puro ni depende de React.
3. **SEO on-page consistente en las fichas.** Las 82 fichas tienen un solo H1, títulos, descripciones y canonicals únicos; las 95 URLs del sitemap respondieron 200 y conservaron canonical autorreferente, título, descripción y ausencia de `noindex`.
4. **Tabla global y tablas de ficha bien resueltas.** HTML semántico, cabeceras, `aria-live`, primera columna sticky en móvil, scroll horizontal local, búsqueda, filtro 0,2, CSV y enlaces a fuente oficial.
5. **Build reproducible y con pruebas.** La sintaxis de los JS/MJS es válida y `tests/ponderaciones.test.mjs` supera 28/28 comprobaciones, incluidas cobertura, SEO, sitemap, accesibilidad de tabla y coherencia del generador.

### Cinco riesgos principales

1. **Promesa falsa en exámenes.** `/examenes` afirma ofrecer PDFs oficiales, pero fabrica resultados y todos apuntan a `#`.
2. **Confirmaciones falsas de formulario.** Contacto y newsletter aparentan éxito sin persistir ni enviar datos.
3. **Descubrimiento interno débil.** En el HTML inicial de las páginas superiores solo se enlaza una ficha (`/ponderaciones/unizar`); las otras 81 dependen del sitemap o de interacción JavaScript.
4. **Regresiones SEO y móvil verificadas.** `/notas-de-corte` queda indexable por un error de clave de ruta y la calculadora muestra elementos `hidden`, con overflow en móvil.
5. **Falta de medición.** No hay una integración analítica activa ni evidencia disponible de GSC, CWV, conversiones o uso real; hoy no se puede priorizar por demanda o retorno observado.

### Mayor oportunidad y mayor error

- **Mayor oportunidad:** convertir el excelente dataset de ponderaciones en un grafo estático y rastreable comunidad → universidades → fichas, y conectar esa información con la calculadora. La ventaja defendible no es otra calculadora genérica, sino ayudar a decidir con datos oficiales concretos.
- **Mayor error actual:** presentar resultados de exámenes como oficiales cuando son una demostración con enlaces vacíos. Debe desactivarse o reemplazarse por datos verificados antes de seguir captando tráfico hacia esa página.

## 2. Alcance, método y límites

### Qué se comprobó

- Inventario de archivos, rutas, configuración de Netlify, HTML, CSS, JavaScript, datos y pruebas.
- HTML inicial local y publicado, sin depender del DOM ya renderizado para validar contenido SEO.
- Las 95 URLs declaradas en `sitemap.xml`: estado HTTP, URL final, canonical, H1, título, descripción y robots.
- Variantes HTTP/HTTPS, `www`, rutas limpias, rutas `.html`, barra final y 404 desconocida.
- Navegación y comportamiento real en navegador de portada, calculadora, ponderaciones, fichas UAB/UAM, exámenes, notas de corte y navegación móvil.
- Consola del navegador en las muestras funcionales anteriores.
- Responsive a 360 px, scroll de página, scroll de tabla, sticky, menú móvil y controles ocultos.
- Estructura de datos, generadores y pruebas de ponderaciones.
- Metadatos, canonicals, JSON-LD, sitemap, robots y enlaces internos.
- Cabeceras HTTP, compresión, caché, service worker y tamaños de recursos.
- Contraste de combinaciones relevantes mediante la fórmula WCAG.
- Muestra competitiva observable para calculadoras, ponderaciones y exámenes oficiales.

### Qué no se pudo medir

- Google Search Console: indexación real, consultas, posiciones, impresiones, CTR y cobertura.
- GA4/Plausible/Matomo u otra analítica: usuarios, sesiones, embudos, búsquedas internas y eventos.
- Netlify Analytics o logs: hits de bots, 404 reales, redirects y cache hit rate.
- Conversiones reales de formularios, newsletter o CTA.
- Core Web Vitals de campo/CrUX e INP.
- Lighthouse de laboratorio: no está instalado; la API pública de PageSpeed Insights respondió 429 por cuota agotada.
- Backlinks, autoridad del dominio o cuota de voz.
- Validación normativa experta de todas las vías de acceso de la calculadora.

Las conclusiones que dependen de esos datos aparecen como **pendiente de datos** o **probable**, no como hechos.

## 3. Arquitectura real y forma de renderizado

### Clasificación

Miebau usa **generación estática/SSG** en el sentido operativo: Netlify sirve archivos HTML preconstruidos. No hay SSR, servidor de aplicación, React, Vite ni otro framework de renderizado. Tampoco es CSR puro: el contenido principal y las tablas de fichas están en el HTML inicial. JavaScript añade navegación, pie, metadatos sociales, filtros y comportamiento interactivo.

La configuración de rutas está en **`_redirects`**, no en `vite.config.*` ni `netlify.toml`. Ejemplos:

```text
/ponderaciones      /ponderaciones.html      200
/examenes           /examenes.html           200
/ponderaciones/uab  /ponderaciones/uab.html  200
```

Son **rewrites 200**, no redirects de navegador. Por ello:

- la URL limpia permanece visible y devuelve el contenido del `.html`;
- la URL `.html` también puede abrirse directamente y devuelve 200;
- cada página declara como canonical la versión limpia;
- no hay bucle, porque no existe un redirect de `.html` a limpia;
- sí quedan dos URLs técnicamente accesibles por contenido, mitigadas por canonical pero no consolidadas por HTTP.

No recomiendo cambiar este mecanismo de forma precipitada. Primero deben corregirse los enlaces internos a `.html`; un redirect 301 de extensión a limpia solo debería añadirse después con pruebas de no-bucle y sin interferir con los rewrites existentes.

### Generación de ponderaciones

- Origen normalizado: `data/ponderaciones-2026-2027.json`.
- Fixture de build: `scripts/fixtures/ponderaciones-2026-2027.source.json`.
- Generador de datos: `scripts/build-ponderaciones-data.mjs`.
- Generador/verificador de 82 fichas: `scripts/build-ponderaciones-profiles.mjs`.
- Interactividad global: `js/ponderaciones.js`.
- Pruebas: `tests/ponderaciones.test.mjs`.

El generador de perfiles recorre `data.universities`, filtra los registros por `universityIds`, clasifica cobertura y escribe o verifica `ponderaciones/<id>.html`. Para universidades públicas renderiza la ficha completa. En privadas conserva el contenido editorial manual y sustituye únicamente bloques generados de tabla/FAQ/JSON-LD. Esto explica por qué las 46 fichas privadas mantienen contenido propio.

### Inventario relevante

- 148 archivos versionados.
- 99 HTML: 17 de nivel superior y 82 fichas.
- 13 archivos JS/MJS.
- 1 hoja CSS principal.
- 2 JSON de ponderaciones.
- 24 PDF locales, aproximadamente 15 MB, sin referencias encontradas desde el código actual.
- No hay `package.json`, `netlify.toml`, `_headers`, backend ni gestor de dependencias de producción.

## 4. Puntuación por áreas

La puntuación es una fotografía técnica de 0 a 100, no una estimación de tráfico. Un 100 exigiría evidencia de producción, medición y ausencia de bloqueos graves.

| Área | Nota | Criterio aplicado |
|---|---:|---|
| SEO técnico | **68** | Base estática, canonicals y sitemap sólidos; resta por `/notas-de-corte`, enlazado a `.html`, schemas duplicados, OG dinámico y bajo enlazado interno. |
| Arquitectura de información | **58** | Estructura simple y URLs limpias, pero 81 fichas sin enlace estático desde páginas superiores y sin rutas indexables de comunidad. |
| Calidad de contenido | **54** | Ponderaciones aportan valor real; exámenes no son reales y guías/precios/premium/notas tienen poco contenido o son estados incompletos. |
| Rendimiento | **72** | HTML estático, Brotli y TTFB bajo en muestra; resta por `@import` de fuentes, caché no inmutable, service worker obsoleto y ausencia de CWV. |
| UX móvil | **66** | Ponderaciones funcionan muy bien; la calculadora tiene contenido oculto visible y overflow, y el menú no responde a Escape. |
| Accesibilidad | **62** | Tablas y formularios principales tienen buena semántica; fallan contrastes, ocultación, patrón de tabs, cierre del menú y landmark en exámenes. |
| Confianza y fuentes | **56** | Excelente trazabilidad en ponderaciones; penalización fuerte por exámenes y formularios simulados, identidad de contacto y textos legales incompletos. |
| Mantenibilidad | **65** | Stack pequeño, generadores y 28 pruebas; resta por JS muerto, HTML inline, documentación desactualizada, SW v1 y falta de tests fuera de ponderaciones. |

**Media simple orientativa: 63/100.** El dato no debe usarse como KPI; sirve para comparar una auditoría futura con el mismo método.

## 5. Hallazgos detallados

### MIE-001 — La página de exámenes fabrica resultados “oficiales”

| Campo | Detalle |
|---|---|
| Área | Contenido, funcionalidad, confianza |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | `examenes.html:215-216` promete “PDFs oficiales” y “Exámenes EvAU oficiales”. En `examenes.html:376-403` el comentario reconoce que faltan datos reales y se crean resultados con `pdf: '#'`. En producción, Biología + Madrid + 2025 devolvió “1 exámenes” y el CTA apuntó a `https://miebau.es/examenes#`. |
| URL afectada | `https://miebau.es/examenes` y promesas relacionadas en portada |
| Archivo/componente | `examenes.html`; `js/examenes.js` es una implementación antigua no cargada |
| Impacto | El usuario cree haber encontrado un documento oficial y recibe un enlace vacío. Puede causar abandono, pérdida de confianza, enlaces engañosos e indexación de una promesa no cumplida. |
| Solución | Acción inmediata: desactivar los resultados simulados, mostrar un estado honesto y añadir `noindex, follow` hasta disponer de un catálogo verificado. Solución definitiva: dataset por comunidad/asignatura/año con URL, organismo, convocatoria y comprobación automática de enlaces. |
| Esfuerzo | Bajo para contener; alto para construir el catálogo real |
| Riesgo del cambio | Bajo al contener; medio al importar datos oficiales heterogéneos |
| Validación | Ningún `href="#"`; ninguna selección crea resultados sin dataset; robots estático correcto; pruebas con 0/1/N resultados y verificación HTTP de una muestra de PDFs. |

### MIE-002 — Contacto y newsletter muestran éxito sin enviar datos

| Campo | Detalle |
|---|---|
| Área | Conversión, confianza, privacidad |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | `contacto.html:1` cancela el submit y dice que el formulario “está preparado para conectarse”. `js/site.js:55-63` hace lo mismo con la newsletter. No hay `action`, nombres de campo útiles, función Netlify ni proveedor. |
| URL afectada | `/contacto` y todas las páginas con footer/newsletter |
| Archivo/componente | `contacto.html`, `js/site.js` |
| Impacto | Se pierden mensajes y suscripciones mientras se confirma al usuario lo contrario. No se pueden medir conversiones ni atender correcciones de datos. |
| Solución | O conectar un envío real con consentimiento, gestión de error y política de privacidad, o retirar/deshabilitar los formularios y ofrecer solo un email real. Nunca mostrar éxito sin respuesta del backend. |
| Esfuerzo | Bajo-medio |
| Riesgo del cambio | Medio por tratamiento de datos personales |
| Validación | Envío de prueba recibido, estado de error reproducible, doble envío controlado, registro en Netlify/proveedor y texto legal coherente. |

### MIE-003 — `/notas-de-corte` queda indexable por una clave de ruta incorrecta

| Campo | Detalle |
|---|---|
| Área | SEO técnico |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | `js/seo.js:4` obtiene `notas-de-corte` desde la URL limpia, pero el mapa usa `'notas-de-corte.html'` en la línea 10. El HTML estático no contiene robots. En producción, `/notas-de-corte` no tenía meta robots; `/notas-de-corte.html` sí recibió `noindex, follow` tras JavaScript. La página no tiene datos y muestra cero resultados. |
| URL afectada | `https://miebau.es/notas-de-corte` |
| Archivo/componente | `js/seo.js`, `notas-de-corte.html` |
| Impacto | Google puede indexar una herramienta vacía descubierta desde el footer aunque no figure en sitemap. El canonical apunta precisamente a la URL limpia indexable. |
| Solución | Añadir `noindex, follow` directamente al HTML mientras no haya datos y corregir la normalización de claves para rutas limpias. El robots crítico no debe depender de JS. |
| Esfuerzo | Bajo |
| Riesgo del cambio | Bajo |
| Validación | `curl` de la URL limpia contiene un solo meta robots `noindex, follow`; prueba automatizada para limpia y `.html`; inspección de URL en GSC tras despliegue. |

### MIE-004 — El CSS invalida `hidden` y rompe la calculadora en móvil

| Campo | Detalle |
|---|---|
| Área | UX móvil, accesibilidad, funcionalidad |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | No existe una regla global `[hidden]`. `.btn { display:inline-flex }` (`css/style.css:74`), `.mode-note { display:flex }` (línea 171) e `.inverse-result { display:flex }` (línea 173) prevalecen sobre el atributo. A 360 px eran visibles el aviso de modos no EvAU, `#calculateButton`, `#inverseResult` y `#clearHistory` aunque tenían `hidden`. El documento medía 406 px de ancho: 46 px de overflow. |
| URL afectada | `https://miebau.es/calculadora` |
| Archivo/componente | `css/style.css`, estados controlados por `js/calculadora.js` |
| Impacto | Flujo contradictorio, controles prematuros, contenido vacío y scroll horizontal. También altera la exposición visual de estados que el JS pretende ocultar. |
| Solución | Añadir `[hidden] { display: none !important; }` en la base CSS y probar cada estado del wizard. Ajustar la fila de acciones solo si persiste overflow. |
| Esfuerzo | Muy bajo |
| Riesgo del cambio | Medio-bajo: puede revelar componentes que dependían accidentalmente de la cascada |
| Validación | Viewports 320/360/375/430/768; `document.scrollWidth === clientWidth`; asserts de visibilidad por paso y modo; cálculo completo y retorno atrás. |

### MIE-005 — 81 de 82 fichas carecen de enlace interno estático desde páginas superiores

| Campo | Detalle |
|---|---|
| Área | Arquitectura, SEO, descubrimiento |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | Al buscar enlaces a `/ponderaciones/<slug>` en el HTML inicial de todos los HTML de raíz solo aparece `/ponderaciones/unizar`. El catálogo de `/ponderaciones` empieza vacío y crea tarjetas después de elegir comunidad o buscar con JS. Las 82 fichas sí están en sitemap. |
| URL afectada | `/ponderaciones` y las 82 fichas |
| Archivo/componente | `ponderaciones.html`, `js/ponderaciones.js` |
| Impacto | El sitemap permite descubrir las fichas, pero el grafo interno no distribuye contexto ni autoridad y obliga a un crawler o usuario sin interacción a saltarse el recorrido comunidad → universidad. |
| Solución | Renderizar en HTML inicial un índice compacto y rastreable de universidades agrupadas por comunidad, manteniendo el filtro JS como mejora progresiva. No hace falta crear 17 landings finas de inmediato. |
| Esfuerzo | Medio |
| Riesgo del cambio | Medio por volumen de HTML y coordinación con el render JS |
| Validación | Cada ficha recibe al menos un enlace estático desde `/ponderaciones`; no hay duplicados; JS filtra la misma fuente; crawl interno confirma profundidad ≤2 desde la portada. |

### MIE-006 — 45 fichas enlazan a `/politica-privacidad.html`

| Campo | Detalle |
|---|---|
| Área | SEO técnico, consistencia de URLs |
| Severidad | **Media** |
| Estado | **Verificado** |
| Evidencia | `rg '\.html' ponderaciones -g '*.html'` encontró 45 fichas con `href="/politica-privacidad.html"`, todas en el formulario de aviso de perfiles privados. La ruta `.html` responde 200 y canonicaliza a `/politica-privacidad`. El generador actual ya usa la URL limpia (`scripts/build-ponderaciones-profiles.mjs:279`), pero preserva el bloque manual privado. |
| URL afectada | 45 fichas privadas; `/politica-privacidad.html` |
| Archivo/componente | HTML privados en `ponderaciones/`; bloque manual de aviso |
| Impacto | Reintroduce la variante no canónica en el enlazado interno y desperdicia señales/rastreo entre dos URLs accesibles. No parece un riesgo grave de duplicidad porque canonical y sitemap son limpios. |
| Solución | Cambio mecánico únicamente de ese `href`, sin tocar contenido ni ponderaciones; añadir una prueba global que prohíba `href` internos acabados en `.html`. |
| Esfuerzo | Bajo, aunque afecta 45 archivos y requiere el flujo de confirmación del proyecto |
| Riesgo del cambio | Bajo |
| Validación | Cero coincidencias de `href="/...html"`; política limpia 200/canonical; 28 pruebas actuales y nueva prueba de enlaces. |

### MIE-007 — Breadcrumb JSON-LD duplicado e incoherente tras ejecutar JavaScript

| Campo | Detalle |
|---|---|
| Área | Datos estructurados, SEO |
| Severidad | **Media** |
| Estado | **Verificado** |
| Evidencia | Una ficha como UAM ya trae un `BreadcrumbList` estático de tres niveles. `js/seo.js` inyecta otro de dos niveles. Tras el render se observaron `BreadcrumbList`, `FAQPage`, `WebPage`, `BreadcrumbList`; los dos breadcrumbs no describen la misma jerarquía. |
| URL afectada | 82 fichas de `/ponderaciones/*` |
| Archivo/componente | HTML generado de perfiles, `js/seo.js` |
| Impacto | Datos estructurados redundantes y ambiguos. Google puede ignorarlos; además complica validación y mantenimiento. |
| Solución | Hacer que `seo.js` detecte un breadcrumb existente y no inyecte otro, o centralizar la generación en HTML estático. |
| Esfuerzo | Bajo |
| Riesgo del cambio | Bajo |
| Validación | Un solo `BreadcrumbList` por página, jerarquía Inicio → Ponderaciones → Universidad, Rich Results Test y test DOM. |

### MIE-008 — La mayoría de metadatos sociales se añaden solo con JavaScript

| Campo | Detalle |
|---|---|
| Área | SEO social, contenido compartido |
| Severidad | **Media** |
| Estado | **Verificado** |
| Evidencia | La portada incluye OG/Twitter en HTML inicial; la mayoría de páginas superiores no. `js/seo.js` los añade después. Muchos bots de mensajería y redes no ejecutan JavaScript. |
| URL afectada | Calculadora, ponderaciones, exámenes y páginas superiores salvo portada |
| Archivo/componente | HTML de raíz, `js/seo.js` |
| Impacto | Compartidos sin título, descripción o imagen controlados; menor CTR social. No afecta directamente al canonical ni al contenido indexable principal. |
| Solución | Generar OG/Twitter esenciales en el HTML estático, con una imagen social real y absoluta. Mantener JS solo como fallback, no como fuente principal. |
| Esfuerzo | Bajo-medio |
| Riesgo del cambio | Bajo |
| Validación | `curl` contiene `og:title`, `og:description`, `og:url`, `og:image` y Twitter; depuradores de Facebook/LinkedIn/X. |

### MIE-009 — El service worker puede servir CSS/JS obsoleto indefinidamente

| Campo | Detalle |
|---|---|
| Área | Rendimiento, mantenibilidad, fiabilidad |
| Severidad | **Alta** |
| Estado | **Verificado** |
| Evidencia | `sw.js:1-12` usa `miebau-static-v1` y cache-first para recursos del mismo origen, incluidos `/css/style.css`, `/js/site.js` y `/js/seo.js` sin hash. Si esos archivos cambian sin cambiar el nombre de caché o el propio SW, un usuario recurrente puede conservar versiones antiguas. El fallback navega a `/404.html`, pero ese archivo no está en `CORE`. |
| URL afectada | Todo el sitio para usuarios con SW registrado |
| Archivo/componente | `sw.js`, registro en `js/site.js` |
| Impacto | Correcciones SEO/UX pueden no llegar a usuarios existentes; mezcla de HTML nuevo y JS/CSS antiguo; fallback offline incompleto. |
| Solución | Elegir una estrategia explícita: eliminar el SW si no hay requisito offline, o versionar caché/activos y usar stale-while-revalidate o network-first según recurso, con limpieza de cachés antiguas. Precachear el fallback real. |
| Esfuerzo | Medio |
| Riesgo del cambio | Medio-alto por cachés ya instaladas |
| Validación | Prueba de actualización entre dos deploys, DevTools Application, offline, limpieza de v1 y comprobación de que CSS/JS cambian sin recarga forzada. |

### MIE-010 — Varias incidencias de accesibilidad verificables

| Campo | Detalle |
|---|---|
| Área | Accesibilidad, UX móvil |
| Severidad | **Media** |
| Estado | **Verificado** |
| Evidencia | `--text-hint: #8d96aa` da 2,97:1 sobre blanco y 2,80:1 sobre el fondo, por debajo de 4,5:1 para texto normal; el ámbar `#ca7a16` sobre `#fff4df` da 3,05:1. El menú móvil no se cierra con Escape. Las tabs de calculadora no implementan flechas ni `aria-controls`. `/examenes` carece de `<main>`. El problema de `hidden` de MIE-004 también afecta accesibilidad. |
| URL afectada | Global, calculadora y exámenes |
| Archivo/componente | `css/style.css`, `js/site.js`, `calculadora.html`, `js/calculadora.js`, `examenes.html` |
| Impacto | Texto pequeño difícil de leer, navegación de teclado incompleta y landmarks inconsistentes. |
| Solución | Oscurecer colores de texto, completar patrones de menú/tabs, añadir landmark y una regla fiable para `hidden`. Ejecutar axe y revisión manual de teclado. |
| Esfuerzo | Medio |
| Riesgo del cambio | Bajo-medio |
| Validación | Contraste AA, axe sin errores críticos, recorrido solo teclado, Escape, flechas en tabs y árbol de accesibilidad. |

### MIE-011 — Las vías especiales de la calculadora requieren validación normativa

| Campo | Detalle |
|---|---|
| Área | Exactitud, confianza |
| Severidad | **Alta** |
| Estado | **Probable; requiere revisión experta/oficial** |
| Evidencia | El cálculo EvAU estándar probado fue correcto: con Bachillerato 8, fase general media 7 y específicas 8/9 a 0,2 produjo 7,600 de acceso y 11,000 de admisión. Sin embargo, el modo mayores de 25 reutiliza un esquema simplificado de nota base + materias ponderadas, cuando los criterios pueden depender de fase general/específica, opción y universidad. CFGS también necesita matices sobre materias admitidas y vigencia. |
| URL afectada | `/calculadora`, modos CFGS y mayores de 25 |
| Archivo/componente | `calculadora.html`, `js/calculadora.js` |
| Impacto | Una cifra aparentemente precisa puede orientar una decisión educativa de alto impacto con reglas incompletas. |
| Solución | Contrastar cada modo con normativa y ejemplos oficiales actuales; citar fuente, curso y límites. Si no se puede validar, etiquetarlo como estimación experimental o retirarlo temporalmente. |
| Esfuerzo | Medio-alto |
| Riesgo del cambio | Alto por reglas territoriales y temporales |
| Validación | Casos de prueba derivados de fuentes oficiales, revisión de una persona experta y matriz por vía/comunidad/universidad. |

### MIE-012 — Falta una base real de medición

| Campo | Detalle |
|---|---|
| Área | Producto, SEO, conversión |
| Severidad | **Oportunidad alta** |
| Estado | **Pendiente de datos** |
| Evidencia | `js/integrations.js` está vacío y no se encontraron etiquetas de analítica. La portada publicada contiene el placeholder `REEMPLAZA_CON_EL_CODIGO_DE_SEARCH_CONSOLE`. No se proporcionó acceso a GSC, analítica ni Netlify. |
| URL afectada | Todo el producto |
| Archivo/componente | `index.html`, `js/integrations.js`, configuración externa |
| Impacto | No se sabe qué consultas atraen tráfico, qué comunidades se usan, dónde abandonan los usuarios, si funcionan formularios ni qué páginas merecen contenido primero. |
| Solución | Verificar GSC de forma real; definir analítica mínima y respetuosa con privacidad para búsqueda, selección de comunidad, apertura de ficha, uso de tabla, CSV, fuente oficial y finalización de calculadora. No instrumentar campos con notas ni emails. |
| Esfuerzo | Medio |
| Riesgo del cambio | Medio por consentimiento y privacidad |
| Validación | Propiedad GSC verificada, sitemap enviado, eventos documentados, DebugView/tiempo real, exclusión de PII y dashboard básico. |

### MIE-013 — Política de privacidad e identidad necesitan revisión

| Campo | Detalle |
|---|---|
| Área | Confianza, cumplimiento |
| Severidad | **Media** |
| Estado | **Probable; no es asesoramiento jurídico** |
| Evidencia | La política se centra en avisos de ponderaciones, pero faltan o son poco concretos responsable completo, base jurídica, conservación, proveedores/encargados, autoridad de control y tratamiento futuro de newsletter/contacto. Hay dos emails de contacto: `hola@miebau.es` y `calculadoraebau@gmail.com`. La página Sobre nosotros sigue identificando la marca como “Calculadora EvAU”. |
| URL afectada | `/politica-privacidad`, `/contacto`, `/sobre-nosotros`, `/examenes` |
| Archivo/componente | Páginas legales y de identidad |
| Impacto | Menor credibilidad y posible desalineación si se activan formularios o analítica. |
| Solución | Unificar identidad y canal; inventariar tratamientos reales; revisar textos con asesoramiento jurídico antes de activar nuevas capturas. |
| Esfuerzo | Medio |
| Riesgo del cambio | Medio-alto; requiere decisiones legales/organizativas |
| Validación | Inventario de datos y proveedores, textos aprobados, emails operativos y prueba de derechos/contacto. |

### MIE-014 — Cabeceras de seguridad mínimas ausentes

| Campo | Detalle |
|---|---|
| Área | Seguridad técnica |
| Severidad | **Media** |
| Estado | **Verificado** |
| Evidencia | La muestra de producción incluye HSTS (`max-age=31536000`) pero no CSP, `X-Content-Type-Options`, política de framing, `Referrer-Policy` ni `Permissions-Policy`. No existe `_headers`. No se encontraron secretos en el repo y no hay dependencias npm de producción, lo cual reduce superficie. |
| URL afectada | Todo el sitio |
| Archivo/componente | Configuración Netlify; eventual `_headers` |
| Impacto | Se desaprovecha defensa en profundidad frente a framing, MIME sniffing y carga de recursos. Una CSP estricta es más difícil por scripts/estilos inline. |
| Solución | Añadir primero cabeceras seguras de bajo riesgo; diseñar CSP en modo report-only y reducir inline antes de bloquear. |
| Esfuerzo | Bajo para cabeceras base; medio-alto para CSP |
| Riesgo del cambio | Bajo salvo CSP, que es alto sin inventario |
| Validación | `curl -I`, Security Headers, pruebas de formularios/fuentes/JS y monitor de report-only. |

### MIE-015 — Fuentes, caché y recursos admiten optimización, pero no hay CWV para cuantificarla

| Campo | Detalle |
|---|---|
| Área | Rendimiento |
| Severidad | **Media** |
| Estado | **Verificado técnicamente; impacto de CWV pendiente** |
| Evidencia | `css/style.css:2` importa Google Fonts mediante `@import`, sin preconnect HTML. CSS/JS/JSON se sirven con Brotli, pero `Cache-Control: public,max-age=0,must-revalidate`. No hay nombres con hash. La respuesta del manifiesto usa `application/octet-stream`. |
| URL afectada | Todo el sitio |
| Archivo/componente | `css/style.css`, HTML, `manifest.webmanifest`, configuración Netlify |
| Impacto | El `@import` retrasa el descubrimiento de fuentes; cada navegación requiere revalidación; el manifest tiene MIME poco específico. No se debe afirmar que esto empeora LCP sin datos de campo. |
| Solución | Mover fuentes a `<link>` con preconnect o autoalojarlas; usar `font-display: swap`; versionar activos antes de caché inmutable; servir el manifest con MIME correcto. Coordinarlo con MIE-009. |
| Esfuerzo | Medio |
| Riesgo del cambio | Medio por flash tipográfico y SW |
| Validación | Lighthouse local antes/después, waterfall, fuentes con swap, caché correcta en segundo acceso y manifest reconocido. |

### MIE-016 — Contenido desigual y páginas indexables muy ligeras

| Campo | Detalle |
|---|---|
| Área | Contenido, SEO |
| Severidad | **Media** |
| Estado | **Verificado; impacto orgánico pendiente de GSC** |
| Evidencia | `/guias` ronda 83 palabras y principalmente enlaza a herramientas. `/premium` y `/precios` rondan 65 palabras cada una y están en sitemap aunque no hay producto activo. Veinte fichas tienen menos de 350 palabras, aunque ninguna baja de 250; 67 repiten el bloque de aviso y las FAQ fijas aparecen en las 82. |
| URL afectada | `/guias`, `/premium`, `/precios` y fichas pendientes |
| Archivo/componente | HTML de contenido y generador de perfiles |
| Impacto | Pocas respuestas a intención informativa y riesgo de que páginas sin oferta o datos no satisfagan la búsqueda. Repetición de plantilla no implica por sí sola penalización. |
| Solución | No crear volumen por crear. Priorizar guías basadas en consultas GSC y completar solo páginas con información verificable. Valorar `noindex` temporal en oferta inexistente si no cumple una función real. |
| Esfuerzo | Medio-alto |
| Riesgo del cambio | Medio por decisiones de indexación |
| Validación | Brief por intención, revisión editorial, engagement y consultas/CTR en GSC tras 6-12 semanas. |

### MIE-017 — Deuda de mantenimiento fuera del módulo probado

| Campo | Detalle |
|---|---|
| Área | Mantenibilidad |
| Severidad | **Baja** |
| Estado | **Verificado** |
| Evidencia | `js/examenes.js` no se carga y contiene otra implementación simulada; README describe partes ya superadas; hay 24 PDF locales (~15 MB) sin enlaces encontrados y algunos nombres refieren cursos antiguos. Solo ponderaciones tiene pruebas. `js/notas-de-corte.js` interpola futuros datos con `innerHTML`, que requerirá escape al conectar una fuente externa. |
| URL afectada | Repositorio y despliegue |
| Archivo/componente | `js/examenes.js`, README, PDFs, `js/notas-de-corte.js` |
| Impacto | Confusión para mantener, deploy mayor y riesgo de XSS futuro si los datos de notas no son de confianza. Los PDFs no enlazados no afectan el peso de una página normal. |
| Solución | Inventariar y retirar solo tras confirmar origen; actualizar documentación; añadir tests de smoke para calculadora, SEO y formularios; usar nodos/escape para datos futuros. |
| Esfuerzo | Medio |
| Riesgo del cambio | Bajo-medio; los PDFs podrían tener un uso no documentado |
| Validación | Mapa de referencias, build limpio, deploy diff, tests y revisión de propietario antes de borrar. |

## 6. SEO técnico e indexabilidad: resultado específico

### HTML inicial

- Portada, páginas de nivel superior y fichas entregan contenido principal en HTML inicial.
- Las fichas con datos incluyen la tabla completa en HTML; JavaScript mejora filtro y límite visual, no crea el contenido de cero.
- No hay SSR. No hay CSR puro. El patrón es HTML estático/SSG + JavaScript progresivo.

### Canonicals y duplicidad `.html`

- Las URLs limpias del sitemap son las canonicals declaradas.
- Las variantes `.html` siguen accesibles directamente con 200.
- La canonical reduce el riesgo de indexación duplicada, pero no sustituye una señal HTTP fuerte.
- No se observaron bucles: los rewrites limpias → `.html` son internos y de estado 200.
- El riesgo actual es **moderado-bajo**, no crítico: 45 enlaces internos vuelven a introducir una variante `.html`; deben corregirse antes de valorar 301.

### Sitemap

- 95 URLs únicas.
- Cero variantes `.html`.
- 82 fichas de universidad/cobertura.
- No incluye `/notas-de-corte` ni `/calendario-ebau`, coherente con su estado previsto de `noindex`.
- Todas las 95 URLs respondieron 200 en el crawl y presentaron canonical autorreferente, un H1, título y descripción.
- No hay `lastmod`. Añadirlo solo sería útil si refleja cambios reales del contenido; no debe inventarse.

### Robots y 404

- `robots.txt` permite el rastreo general y declara sitemap.
- La URL desconocida probada devolvió HTTP 404 real, no soft 404.
- `/calendario-ebau` y `/proximamente` tienen `noindex, follow` estático.
- `/notas-de-corte` es la excepción defectuosa descrita en MIE-003.

### Datos estructurados

- Portada: Organization/EducationalOrganization.
- Calculadora: WebApplication.
- Fichas: BreadcrumbList y FAQPage visibles/coherentes en HTML estático.
- 82 títulos, descriptions y canonicals de fichas son únicos.
- El problema no es falta de schema en fichas, sino el segundo breadcrumb añadido por JS.
- La presencia de FAQPage válido no garantiza rich results; debe verse como semántica, no como promesa de visibilidad.

## 7. Rendimiento y comportamiento de producción

### HTTP y entrega

- `http://miebau.es/` → 301 a HTTPS.
- `https://www.miebau.es/` → 301 a apex.
- `http://www.miebau.es/` hace dos saltos (HTTPS www y después apex), aceptable pero optimizable.
- HSTS activo por un año.
- `/ponderaciones/` → 301 a `/ponderaciones`.
- Netlify sirve Brotli para CSS/JS/JSON en clientes compatibles.

### Medición sintética de red

Tres peticiones `curl` por URL desde el entorno de auditoría. Son tiempos de red/servidor, no LCP ni una prueba de experiencia de usuario. Tamaño sin solicitar compresión:

| URL | TTFB mediano | Total mediano | Bytes HTML |
|---|---:|---:|---:|
| `/` | 131 ms | 131 ms | 5.633 |
| `/calculadora` | 131 ms | 153 ms | 16.088 |
| `/ponderaciones` | 141 ms | 141 ms | 9.832 |
| `/ponderaciones/uab` | 138 ms | 229 ms | 196.240 |
| `/examenes` | 134 ms | 156 ms | 14.839 |

En una inspección con compresión Brotli se observaron aproximadamente 10,1 KB para CSS, 2,0 KB para `site.js`, 5,0 KB para `ponderaciones.js` y 27,9 KB para el JSON de ponderaciones. Son cifras favorables para el volumen de datos, aunque no sustituyen CWV.

### Resultado móvil y funcional

- Portada a 360 px: H1 legible, sin overflow.
- `/ponderaciones`: selector de comunidad como entrada principal; Madrid mostró 20 fichas en una columna; enlaces limpios.
- Tabla global a 360 px: scroll horizontal dentro del contenedor, no en toda la página; primera columna sticky.
- UAM: 34 filas, cobertura parcial y aviso honesto; tabla usable y sin errores de consola.
- UAB: 1.097 resultados, 500 visibles tras JS con aviso para refinar; el HTML inicial conserva todas las filas.
- Calculadora: cálculo EvAU estándar correcto, pero con el fallo de ocultación/overflow de MIE-004.
- Menú móvil: abre y actualiza `aria-expanded`; Escape no lo cierra.
- No se observaron errores de consola en las páginas funcionales muestreadas.

## 8. Evaluación de contenido, intención y competencia

### Posicionamiento recomendable

Miebau no debería competir solo por “calculadora nota EvAU”, una intención cubierta por muchas herramientas. Su posición más defendible es:

> “Calcula y decide con ponderaciones verificadas por universidad, grado y comunidad, mostrando siempre fuente y cobertura.”

La calculadora puede atraer demanda; el dataset y la transparencia pueden retener y diferenciar.

### Muestra competitiva observable

| Referencia | Qué resuelve bien | Brecha/oportunidad para Miebau |
|---|---|---|
| [EvAU.info](https://evau.info/calculadora-de-selectividad-evau/) | Simulador directo con varias específicas y explicación paso a paso. | Miebau puede superar la introducción manual del coeficiente enlazando su tabla verificada. |
| [BuscoUni](https://buscouni.com/calculadora) | Distingue nota de admisión/corte, elige las dos mejores y enlaza a notas de corte. | La experiencia forma un recorrido de decisión más completo que el actual de Miebau. |
| [Modo Cheto](https://www.modocheto.ai/herramientas/calculadora-nota-evau) | Hasta cuatro voluntarias, selección automática de las dos mejores, contenido explicativo y CTA de producto. | Miebau ya tiene datos oficiales mejores para convertir una calculadora genérica en una específica por titulación. |
| [Calculadora PAU](https://calculadora-pau.com/) | Crea entradas estáticas por comunidad y una arquitectura temática amplia. | Miebau carece de enlaces/rutas rastreables por comunidad; no debe copiar landings finas sin contenido único. |
| [Canal Universitats](https://universitats.gencat.cat/es/preinscripcions/ponderacions/index.html) | Fuente oficial, vigencia por años, explicación y PDFs 2026-2028. | Miebau aporta búsqueda transversal y legibilidad, pero debe mantener fecha/fuente al nivel de las fuentes oficiales. |
| [Comunidad de Madrid: exámenes PAU](https://www.comunidad.madrid/educacion/examenes-pau-estadisticas) | Archivo real por convocatorias/años y enlaces oficiales. | Es el estándar mínimo para que `/examenes` pueda llamarse oficial. |

En una muestra de búsquedas web para “calculadora nota EvAU ponderaciones España”, “ponderaciones EvAU universidades 2026” y “exámenes EvAU por comunidad PDF” no apareció Miebau entre los resultados devueltos. Esto **no prueba** que el dominio no esté indexado ni permite conocer posición; solo justifica consultar GSC antes de decidir keywords y contenidos.

### Capas de contenido recomendadas

1. **Herramienta:** cálculo y tabla, rápida y directa.
2. **Decisión:** conectar nota calculada con universidad/grado/ponderaciones reales.
3. **Explicación:** fórmulas, vigencia, diferencias entre acceso/admisión/corte y casos especiales.
4. **Evidencia:** fuente oficial, periodo, cobertura, fecha de revisión y límites.
5. **Exploración:** comunidad → universidad → grado, con enlaces HTML reales.

No recomiendo publicar decenas de páginas de comunidad o grado hasta saber qué combinaciones tienen demanda y poder aportar datos únicos.

## 9. Matriz de prioridad

P0 no significa “SEO importante”; se reserva para engaño funcional o pérdida directa de confianza/datos. P1 agrupa fallos altos y acciones habilitadoras. P2 mejora calidad y crecimiento. P3 es mantenimiento u optimización no urgente.

| Prioridad | Acción | Impacto | Esfuerzo | Confianza | Dependencias |
|---|---|---:|---:|---:|---|
| **P0** | Desactivar resultados simulados de `/examenes`; estado honesto y `noindex` hasta datos reales | Muy alto | Bajo | Muy alta | Decisión editorial sobre mensaje temporal |
| **P0** | Dejar de confirmar contacto/newsletter si no hay envío; conectar o retirar | Muy alto | Bajo-medio | Muy alta | Proveedor, privacidad y email operativo |
| **P1** | Corregir `[hidden]` y overflow de calculadora con tests responsive | Alto | Muy bajo | Muy alta | Ninguna |
| **P1** | Poner `noindex` estático en `/notas-de-corte` y normalizar rutas SEO | Alto | Bajo | Muy alta | Ninguna |
| **P1** | Crear enlazado HTML comunidad → 82 fichas desde `/ponderaciones` | Alto | Medio | Alta | Fuente única del catálogo y prueba de build |
| **P1** | Verificar GSC e instrumentar eventos mínimos sin PII | Alto | Medio | Alta | Cuenta, consentimiento y política |
| **P1** | Resolver estrategia del service worker y actualización de caché | Alto | Medio | Alta | Decisión offline y plan de migración |
| **P1** | Validar oficialmente los modos CFGS/mayores de 25 | Alto | Medio-alto | Media | Fuentes actuales y revisión experta |
| **P2** | Cambiar 45 enlaces de privacidad a URL limpia y añadir test | Medio | Bajo | Muy alta | Confirmación por afectar >5 archivos |
| **P2** | Eliminar breadcrumb duplicado y hacer OG/Twitter estático | Medio | Bajo-medio | Alta | Plantilla/generador coherente |
| **P2** | Corregir contrastes, Escape, tabs y landmark de exámenes | Medio | Medio | Alta | Revisión manual y axe |
| **P2** | Unificar identidad/email y revisar privacidad antes de captar datos | Medio-alto | Medio | Media | Decisión de responsable y asesoría legal |
| **P2** | Optimizar fuentes, versionado y caché tras resolver SW | Medio | Medio | Media | MIE-009 y medición Lighthouse |
| **P3** | Actualizar README, revisar JS muerto y PDFs no enlazados | Bajo | Medio | Alta | Confirmar que ningún PDF tiene uso externo |
| **P3** | Evaluar contenido de guías/premium/precios con GSC y objetivos reales | Variable | Medio-alto | Baja sin datos | GSC, analítica y estrategia de producto |

## 10. Quick wins — máximo 10

1. Desactivar el generador ficticio de exámenes y quitar cualquier resultado con `href="#"`.
2. Añadir `[hidden] { display: none !important; }` y una prueba de estados de calculadora.
3. Añadir `noindex, follow` estático a notas de corte mientras esté vacía.
4. No mostrar éxito en contacto/newsletter hasta que exista entrega real.
5. Sustituir los 45 enlaces `/politica-privacidad.html` por la ruta limpia, con prueba global.
6. Evitar que `seo.js` cree un segundo BreadcrumbList en fichas.
7. Reemplazar el placeholder de Search Console por una verificación real o retirarlo hasta tenerla.
8. Oscurecer `--text-hint` y el texto ámbar hasta contraste AA.
9. Añadir OG/Twitter estático a calculadora, ponderaciones y exámenes.
10. Decidir si se elimina temporalmente el service worker o se publica una estrategia de caché versionada.

## 11. Plan 30/60/90 días

### Días 0-30 — Restaurar confianza y capacidad de medir

- Contener `/examenes` y los formularios ficticios.
- Corregir `hidden`, overflow y `noindex` de notas de corte.
- Resolver enlaces `.html` y breadcrumb duplicado.
- Verificar GSC y enviar sitemap.
- Definir eventos mínimos y política de datos; activar solo cuando legal y técnicamente esté listo.
- Baseline con Lighthouse local/CI y, si hay datos suficientes, CrUX/PSI.
- Decidir estrategia del service worker antes de más cambios de CSS/JS global.

**Salida esperada:** cero promesas falsas, errores P0 cerrados, indexación controlada y primera línea base de datos.

### Días 31-60 — Hacer rastreable y más útil el activo principal

- Renderizar índice estático por comunidad en `/ponderaciones`.
- Añadir breadcrumbs visibles y enlaces contextuales sin duplicar schema.
- Validar normativa de modos especiales de calculadora.
- Conectar el resultado de calculadora con búsqueda de ponderaciones sin inventar coincidencias.
- Mejorar accesibilidad global y automatizar axe/smoke en páginas clave.
- Añadir fechas de verificación reales y proceso de revisión de fuentes.

**Salida esperada:** recorrido completo calculadora/comunidad/ficha/fuente, accesible y rastreable.

### Días 61-90 — Crecer solo con evidencia

- Elegir contenidos según consultas GSC, búsquedas internas y gaps de cobertura.
- Construir catálogo de exámenes únicamente con fuentes verificadas y comprobación de enlaces.
- Valorar páginas de comunidad solo si hay intención, datos únicos y enlaces oficiales suficientes.
- Decidir alcance de notas de corte y calendario según disponibilidad de fuente sostenible.
- Revisar premium/precios: producto real con propuesta y conversión, o desindexación temporal.
- Comparar CWV, CTR, finalización de calculadora, apertura de fichas y clic a fuente con la línea base.

**Salida esperada:** crecimiento de contenido guiado por demanda y con mantenimiento sostenible.

## 12. Mediciones imprescindibles antes de decisiones mayores

### Google Search Console

- Estado de indexación de las 95 canonicals.
- Si Google eligió otra canonical para variantes `.html`.
- Consultas y páginas para calculadora, ponderaciones, universidad y comunidad.
- CTR y posición por dispositivo.
- URLs “Descubierta/rastreada, actualmente sin indexar”.
- Rich results y errores de FAQ/breadcrumb.
- Inspección específica de `/notas-de-corte` tras `noindex`.

### Analítica de producto

- Selección de comunidad.
- Búsqueda de universidad.
- Apertura de ficha desde catálogo y tabla.
- Uso de filtro 0,2 y descarga CSV.
- Clic en fuente oficial.
- Inicio/finalización/error de calculadora y modo elegido, sin registrar notas personales.
- Paso de calculadora a ponderaciones.
- Envío real, error y consentimiento de formularios.

### Rendimiento

- LCP, CLS e INP por plantilla y dispositivo en CrUX si existe volumen.
- Lighthouse móvil repetido al menos tres veces en portada, calculadora, ponderaciones y ficha pesada.
- Peso/tiempo de fuente, CSS, JSON y HTML de ficha.
- Tasa de usuarios con service worker antiguo y comportamiento entre deploys.

### Logs/operación

- 404 y URLs `.html` solicitadas por usuarios/bots.
- Errores y latencia de formularios.
- Links oficiales rotos o redirigidos.
- Frecuencia real de actualización por fuente/dataset.

### Métricas de negocio y calidad

- Tasa de cálculo completado.
- Ficha visitada por sesión con calculadora.
- Clic a fuente oficial.
- Búsquedas sin resultados por comunidad/universidad/grado.
- Cobertura verificada por comunidad y demanda asociada.
- Correcciones recibidas y tiempo de resolución.

## 13. Próximo lote recomendado para Codex — no implementado

### Objetivo

Contener exclusivamente el P0 de exámenes sin ampliar arquitectura ni inventar datos.

### Alcance exacto

1. En `/examenes`, eliminar la generación de resultados ficticios y cualquier CTA a `#`.
2. Sustituir la herramienta por un estado honesto que explique que el catálogo se está verificando.
3. Añadir `noindex, follow` en HTML inicial mientras no haya datos.
4. Mantener navegación y layout existente; no crear PDFs ni registros.
5. Añadir pruebas de regresión específicas.

### Archivos previstos

- `examenes.html`
- `tests/site-quality.test.mjs` (nuevo) o una ampliación de la suite si se prefiere no crear archivo

### Pruebas

- HTML y JS válidos.
- Cero `pdf: '#'` y cero enlaces de resultado a `#`.
- Meta robots presente en HTML inicial.
- H1/título/descripción no prometen disponibilidad inmediata de documentos.
- URL limpia y `.html` siguen resolviendo sin bucle.
- Las 28 pruebas de ponderaciones continúan pasando.

### Criterios de aceptación

- Un usuario no puede obtener un resultado inventado.
- La página comunica claramente el estado y ofrece alternativas reales.
- Los rastreadores reciben `noindex` sin JavaScript.
- No se modifica ningún dato de ponderaciones ni fichas.

### Exclusiones deliberadas

- No construir todavía el catálogo real de exámenes.
- No tocar calculadora, ponderaciones, sitemap, CSS global, formularios ni páginas Sobre nosotros/portada en el mismo lote.
- Las promesas relacionadas de portada y Sobre nosotros se revisarían en una tarea editorial separada para respetar cambios aislados.

## 14. Evidencia de URLs comprobadas

### Comprobación manual/funcional representativa

- `https://miebau.es/`
- `https://miebau.es/calculadora`
- `https://miebau.es/ponderaciones`
- `https://miebau.es/ponderaciones/uab`
- `https://miebau.es/ponderaciones/uam`
- `https://miebau.es/examenes`
- `https://miebau.es/notas-de-corte`
- `https://miebau.es/notas-de-corte.html`
- `https://miebau.es/calendario-ebau`
- `https://miebau.es/proximamente`
- `https://miebau.es/ponderaciones/`
- `https://miebau.es/ponderaciones/universidad-loyola`
- `https://miebau.es/ponderaciones/universidad-loyola.html`
- `https://miebau.es/no-existe-auditoria-20260902`
- variantes `http://miebau.es/`, `https://www.miebau.es/` y `http://www.miebau.es/`

### Crawl automatizado exhaustivo del sitemap

Se comprobaron estas 95 URLs, todas con HTTP 200 y metadatos esenciales válidos en el momento de la auditoría:

```text
https://miebau.es/
https://miebau.es/calculadora
https://miebau.es/ponderaciones
https://miebau.es/examenes
https://miebau.es/guias
https://miebau.es/sobre-nosotros
https://miebau.es/contacto
https://miebau.es/premium
https://miebau.es/precios
https://miebau.es/preguntas-frecuentes
https://miebau.es/aviso-legal
https://miebau.es/politica-privacidad
https://miebau.es/politica-cookies
https://miebau.es/ponderaciones/universidad-loyola
https://miebau.es/ponderaciones/utamed
https://miebau.es/ponderaciones/universidad-ceu-fernando-iii
https://miebau.es/ponderaciones/universidad-europea-de-andalucia
https://miebau.es/ponderaciones/universidad-alfonso-x-el-sabio-mare-nostrum
https://miebau.es/ponderaciones/universidad-san-jorge
https://miebau.es/ponderaciones/universidad-europea-de-canarias
https://miebau.es/ponderaciones/universidad-fernando-pessoa-canarias
https://miebau.es/ponderaciones/universidad-del-atlantico-medio
https://miebau.es/ponderaciones/universidad-de-las-hesperides
https://miebau.es/ponderaciones/universidad-europea-del-atlantico
https://miebau.es/ponderaciones/universidad-pontificia-de-salamanca
https://miebau.es/ponderaciones/ucav
https://miebau.es/ponderaciones/uemc
https://miebau.es/ponderaciones/ie-university
https://miebau.es/ponderaciones/universidad-internacional-isabel-i-de-castilla
https://miebau.es/ponderaciones/universidad-ramon-llull
https://miebau.es/ponderaciones/uoc
https://miebau.es/ponderaciones/uic-barcelona
https://miebau.es/ponderaciones/uvic-ucc
https://miebau.es/ponderaciones/universitat-abat-oliba-ceu
https://miebau.es/ponderaciones/universidad-ceu-cardenal-herrera
https://miebau.es/ponderaciones/universidad-catolica-de-valencia-san-vicente-martir
https://miebau.es/ponderaciones/viu
https://miebau.es/ponderaciones/universidad-europea-de-valencia
https://miebau.es/ponderaciones/universidad-intercontinental-de-la-empresa
https://miebau.es/ponderaciones/unir
https://miebau.es/ponderaciones/universidad-pontificia-comillas
https://miebau.es/ponderaciones/uax
https://miebau.es/ponderaciones/universidad-ceu-san-pablo
https://miebau.es/ponderaciones/ufv
https://miebau.es/ponderaciones/universidad-nebrija
https://miebau.es/ponderaciones/universidad-europea-de-madrid
https://miebau.es/ponderaciones/ucjc
https://miebau.es/ponderaciones/udima
https://miebau.es/ponderaciones/universidad-eclesiastica-san-damaso
https://miebau.es/ponderaciones/esic-universidad
https://miebau.es/ponderaciones/universidad-villanueva
https://miebau.es/ponderaciones/cunef-universidad
https://miebau.es/ponderaciones/unie
https://miebau.es/ponderaciones/udit
https://miebau.es/ponderaciones/ucam
https://miebau.es/ponderaciones/universidad-de-navarra
https://miebau.es/ponderaciones/universidad-de-deusto
https://miebau.es/ponderaciones/mondragon-unibertsitatea
https://miebau.es/ponderaciones/euneiz
https://miebau.es/ponderaciones/andalucia-publicas
https://miebau.es/ponderaciones/unizar
https://miebau.es/ponderaciones/uniovi
https://miebau.es/ponderaciones/unican
https://miebau.es/ponderaciones/uclm
https://miebau.es/ponderaciones/ubu
https://miebau.es/ponderaciones/ule
https://miebau.es/ponderaciones/usal
https://miebau.es/ponderaciones/uva
https://miebau.es/ponderaciones/ub
https://miebau.es/ponderaciones/uab
https://miebau.es/ponderaciones/upc
https://miebau.es/ponderaciones/upf
https://miebau.es/ponderaciones/udl
https://miebau.es/ponderaciones/udg
https://miebau.es/ponderaciones/urv
https://miebau.es/ponderaciones/ua
https://miebau.es/ponderaciones/uji
https://miebau.es/ponderaciones/umh
https://miebau.es/ponderaciones/upv
https://miebau.es/ponderaciones/uv
https://miebau.es/ponderaciones/uex
https://miebau.es/ponderaciones/galicia-publicas
https://miebau.es/ponderaciones/uib
https://miebau.es/ponderaciones/ulpgc
https://miebau.es/ponderaciones/ull
https://miebau.es/ponderaciones/unirioja
https://miebau.es/ponderaciones/uah
https://miebau.es/ponderaciones/uam
https://miebau.es/ponderaciones/uc3m
https://miebau.es/ponderaciones/ucm
https://miebau.es/ponderaciones/upm
https://miebau.es/ponderaciones/urjc
https://miebau.es/ponderaciones/umu
https://miebau.es/ponderaciones/upna
https://miebau.es/ponderaciones/ehu
```

## 15. Comandos, herramientas y trazabilidad

### Repositorio/local

- `git status --short --branch`, `git log` y listado de archivos.
- `rg`, `Get-ChildItem`, `Get-Content` y búsquedas de enlaces/metadatos/configuración.
- Scripts Node de solo lectura para inventario, parseo de sitemap, perfiles, metadatos, JSON-LD y enlaces.
- `node --check` sobre JS/MJS.
- `node --test tests/ponderaciones.test.mjs`: **28/28**.
- No se ejecutó el generador en modo escritura.

### Producción

- `curl`/fetch para HTML inicial, estados, redirects, cabeceras, compresión, canonicals, robots, sitemap y tiempos.
- Crawl de todas las URLs del sitemap.
- Navegador controlado para interacción, responsive, teclado, scroll/sticky, consola y DOM post-JS.
- Búsqueda web y lectura de competidores/fuentes oficiales visibles.

### Fallos o indisponibilidades documentados

- Primer intento de Node falló porque `node` no estaba en `PATH`; se usó el runtime local proporcionado por Codex.
- PageSpeed Insights: HTTP 429/cuota agotada.
- Lighthouse: no instalado.
- Performance API del navegador controlado: no disponible para una medición fiable.
- GSC, analítica, CrUX, logs y conversiones: sin acceso.

## 16. Confirmación de integridad

- No se modificaron archivos de código, contenido, configuración, datos, fichas ni tests.
- No se creó ningún commit.
- No se hizo push.
- El único archivo creado por este encargo es este informe: `AUDITORIA_MIEBAU.md`.

