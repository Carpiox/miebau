# Auditoría SEO técnica y de contenido — miebau.es

Fecha: 2026-11-01 · Rama: `claude/miebau-seo-audit-lx1qvy` · Commit base: `3fbe04d`
Modo: **solo lectura** (único archivo creado: este informe; sin commits).

## Alcance y límites (leer primero)

| Qué | Estado |
|---|---|
| HTML versionado (233 `.html`, 230 en sitemap) | Analizado entero con scripts propios |
| `curl` a producción (`https://miebau.es`) | **No posible**: el sandbox devuelve HTTP 000 (sin salida a dominios externos). No he podido comprobar redirects reales, cabeceras HTTP, ni que el despliegue de Cloudflare sirva lo mismo que el repo. |
| `dist/` | **No existe**. No hay build (no hay `package.json`): lo que se despliega es el HTML del repo tal cual, así que el repo *es* el HTML crudo. |
| Search Console | **No disponible** (sin conector). Punto 11 se hace con las consultas que constan en `CLAUDE.md`, no con datos frescos. |
| Lighthouse / CWV reales | No medidos. Solo análisis estático (peso, recursos bloqueantes, imágenes). |
| Enlaces externos (ucm.es, um.es…) | No verificados (sin red). |

Nota de tamaño: el sitio ya no tiene ~195 páginas sino **230 URLs en sitemap**: 64 fichas de examen, 68 de notas de corte, 82 de ponderaciones, 16 páginas de nivel superior. El 93 % (214) es contenido programático, y es ahí donde está el problema de indexación.

## Resumen ejecutivo

La estructura técnica está en buen estado (nav/footer estáticos, canonicals, H1 únicos, JSON-LD válido, 0 enlaces rotos, 0 huérfanas). Lo que explica «24 de 194 indexadas» es **calidad percibida del contenido programático**, no rastreo:

1. **68 fichas de notas de corte son casi idénticas** (similitud media 0,84; 1.496 de 2.278 pares > 0,8) y cada una aporta un único dato.
2. **64 de 82 fichas de ponderaciones no tienen datos** y están en el sitemap, contra la regla del propio `CLAUDE.md` («no añadir rutas vacías al sitemap»).
3. Las fichas de examen (64) **están bien**: similitud media 0,28, ~470 palabras propias cada una. Son el modelo a imitar.
4. AdSense y GA4 se cargan en las 233 páginas, mientras la política de cookies afirma que no se usan cookies.

Verificado que **sigue bien** el arreglo anterior: nav y footer están en el HTML crudo de las 233 páginas (cada página de nivel superior recibe 232 enlaces entrantes; huérfanas: 0; profundidad máxima: 3 clics).

---

## 🔴 CRÍTICO

### C1. Notas de corte: 68 fichas casi duplicadas con una sola cifra cada una
- **Archivos**: `notas-de-corte/*-um.html` (68), generadas por `scripts/build-notas-corte-profiles.mjs`.
- **Evidencia**:
  - Similitud Jaccard por shingles de 5 palabras sobre `<main>`: media **0,84**, máx 0,93 (`doble-grado-en-matematicas-e-ingenieria-informatica-um` vs `doble-grado-en-matematicas-y-fisica-um`), **1.496 pares > 0,8**. Compárese con exámenes: media 0,28, máx 0,39.
  - Texto propio sin enlaces de una ficha (`doble-grado-en-criminologia-y-seguridad-um`): **117 palabras**, de las que lo único específico es «7,985» y el nombre del grado. Las ~480 palabras que cuenta el HTML son en su mayoría el bloque de 67 enlaces a fichas hermanas.
  - Un único `BreadcrumbList` como dato estructurado; título de 111-139 caracteres en las 68 (ver A3).
- **Riesgo**: patrón clásico de *doorway/thin pages*; Google las clasifica como «Rastreada, actualmente sin indexar» y puede arrastrar la valoración del resto del dominio (importante para AdSense, ver A1).
- **Arreglo propuesto** (decisión de producto, por eso no lo toco):
  - Opción recomendada: **consolidar** en el hub `/notas-de-corte` (tabla ordenable con las 68 notas, una ficha por *rama* o por *facultad* con 8-12 grados cada una) y marcar `noindex,follow` las 68 fichas individuales (o 301 al hub) hasta que cada una pueda aportar ≥ 300 palabras propias: notas de varios cursos, plazas, evolución, ponderaciones que puntúan para ese grado, qué hacer si no llegas.
  - Si se mantienen: cada ficha necesita contenido que solo exista ahí (histórico, materias de ponderación de ese grado cruzando con `/ponderaciones/um`, grados afines con anchor descriptivo). El bloque de 67 enlaces por ficha pasa a ser una lista corta (5-8 afines).
  - Quitar de `sitemap.xml` las que queden `noindex`.

### C2. 64 fichas de ponderaciones sin datos verificados, todas en sitemap e indexables
- **Archivos**: `ponderaciones/*.html` (82; solo 18 superan 600 palabras, es decir, las que tienen datos), `sitemap.xml`, `data/ponderaciones-2026-2027.json`.
- **Evidencia**: p. ej. `/ponderaciones/uniovi`: 325 palabras totales / **306 sin enlaces**, y esas son texto de estado + FAQ genérica («¿Cuándo se publicarán las ponderaciones de Universidad de Oviedo? Todavía no hay una fecha oficial…»). 16 pares con similitud > 0,8 (máx 0,89: `uam` vs `uc3m`). Ninguna tiene `noindex`.
- **Contradice** `CLAUDE.md`: «Cualquier cambio en `sitemap.xml` debe ir acompañado de páginas que realmente tengan contenido suficiente».
- **Arreglo propuesto**: `noindex,follow` + fuera del sitemap para las 64 sin datos (añadir un campo `indexable` derivado de `estado === 'verificado'` en el generador y que el sitemap lo respete); se reactivan una a una cuando tengan datos. Mantener el enlace desde el directorio de `/ponderaciones` (ya estático) para que los usuarios las encuentren. Efecto esperado: sube la proporción de páginas útiles y se concentra el rastreo en 18 + 64 + hubs.
- **Cuidado**: las universidades privadas con búsquedas reales («abat oliba precios», «alfonso x el sabio málaga», en GSC según `CLAUDE.md`) ahora devuelven una ficha que no responde a «precios». Si se va a indexar alguna sin datos de ponderación, debe tener contenido propio (qué es, grados, cómo acceder) y no solo estado.

---

## 🟠 ALTO

### A1. AdSense + GA4 en todas las páginas, y política de cookies que dice lo contrario
- **Archivos**: las 233 `.html` (`<script async src=".../adsbygoogle.js?client=ca-pub-2269622537984613">` en el `<head>`, incluidas `404` y `proximamente`), `js/integrations.js`, `politica-cookies.html`, `politica-privacidad.html`.
- **Evidencia**: `politica-cookies.html` (≈115 palabras) afirma «La versión actual de Miebau no necesita cookies propias… si se incorporan servicios… se mostrará la información y opciones de consentimiento». No hay banner (`js/` no contiene CMP). `integrations.js` pone el consentimiento de Google en `denied` por defecto pero **no existe ningún camino para concederlo**, y el script de AdSense carga igualmente sin condición.
- **Riesgo**: incumplimiento RGPD/LSSI y requisito de AdSense en el EEE (CMP certificado por Google con TCF); además cargar anuncios en páginas finas (C1, C2, `/guias`, `/precios`) es la causa habitual de rechazo por «contenido de poco valor». Esto también contradice la regla 4 de `CLAUDE.md` si algún día salen intersticiales.
- **Arreglo**: (1) no cargar `adsbygoogle.js` hasta tener CMP y ≥ N páginas con contenido sustancial; (2) implementar CMP (p. ej. el de Google en AdSense, gratuito) y conectar `gtag('consent','update',…)`; (3) reescribir política de cookies y privacidad con GA4, AdSense, Web3Forms y Cloudflare (la deuda MIE-013 sigue abierta); (4) quitar el script de `404.html`/`proximamente.html`.

### A2. Open Graph / Twitter solo por JavaScript en 146 páginas
- **Archivos**: 64 fichas `examenes/*/*.html`, 82 `ponderaciones/*.html` (las 68 de notas de corte y las páginas de nivel superior sí lo traen estático). Fuente: `js/seo.js` línea 41.
- **Evidencia**: `examenes/comunidad-de-madrid/biologia.html` solo tiene `title`, `description`, `canonical`, favicon. Los bots sociales y muchos crawlers no ejecutan JS.
- **Formato**: donde existen, están **bien formadas** (`<meta property="og:*">` y `<meta name="twitter:*">`; no hay `meta-og:*`). Falta `og:image` en `404`/`proximamente` (irrelevante, noindex).
- **Problema añadido**: `og:image` = `assets/miniatura.jpg` de **500×500** con `twitter:card=summary_large_image` (pide 1200×630, 1,91:1) → recorte feo al compartir.
- **Arreglo**: añadir el bloque OG/Twitter en `build-examenes-profiles.mjs` y `build-ponderaciones-profiles.mjs` (y en las 46 fichas privadas, fuera de marcadores: ya nos pasó tres veces); crear `assets/og-1200x630.jpg`; `og:image:width/height` y `og:image:alt`.

### A3. Títulos y descripciones fuera de rango
| Sección | Páginas | Título > 60 | Descripción < 120 | Descripción > 155 |
|---|---:|---:|---:|---:|
| Notas de corte | 68 | **68** (111-139 car.) | 0 | **51** |
| Ponderaciones | 82 | 36 | 2 | 15 |
| Fichas de examen | 64 | 4 | 11 | 0 |
| Índices de comunidad | 2 | 1 | 0 | 2 |
| Nivel superior | 17 | 2 | **13** | 1 |
Únicos: 0 títulos y 0 descripciones duplicados (bien). 
- **Ejemplos**: `/notas-de-corte/doble-grado-en-criminologia-y-seguridad-um` → «Nota de corte Doble Grado en Criminología y Seguridad en Universidad de Murcia · Miebau» (88). `/examenes` (68 car.). Páginas de nivel superior con descripciones de 22-72 caracteres: `/aviso-legal` 22, `/politica-cookies` 30, `/politica-privacidad` 33, `/calendario-ebau` 39, `/proximamente` 56, `/404` sin descripción.
- **Marca inconsistente**: fichas de examen usan « | MIEBAU», el resto « · Miebau».
- **Arreglo**: plantilla de título `«{Grado} · Nota de corte {curso} {UMU}»` con recorte a 60; marca única « · Miebau» (o quitarla en fichas largas); descripciones 120-155 en los generadores.

### A4. `/guias` está vacío: 3 tarjetas, 88 palabras, cero artículos
- **Archivo**: `guias.html`. Enlaza a `/calculadora`, `/ponderaciones`, `/examenes` con «Calcular mi nota →», «Ver ponderaciones →», «Buscar exámenes →» (no a guías).
- **Evidencia**: no hay ninguna URL `/guias/*`; por tanto **no hay `Article`** en ningún sitio. El sitio no captura consultas informativas («cómo se calcula la nota de acceso», «diferencia nota de acceso y admisión», «qué asignaturas ponderan para medicina»), que son las más fáciles de ganar y las que atraen enlaces.
- **Arreglo**: 6-10 guías de 800-1.200 palabras con `Article` + `BreadcrumbList` + autor/fecha, enlazadas desde home, calculadora y fichas. Es además el activo más útil para pasar AdSense.

### A5. Enlazado interno: aún quedan fichas débiles, anchors genéricos y comunidades sin destino propio
- **Fichas con ≤ 4 entrantes**: 17 de ponderaciones. `uniovi`, `uclm`, `uex`, `uib`: **1** (solo el directorio de `/ponderaciones`). Con 2: `unizar`, `universidad-san-jorge`, `unican`, `universidad-europea-del-atlantico`, `upna`, `universidad-de-navarra`, `unirioja`, `unir`, `galicia-publicas`, `universidad-intercontinental-de-la-empresa`. Con 4: `ehu`, `euneiz`, `mondragon-unibertsitatea`, `universidad-de-deusto`. Mediana de ponderaciones: 9 entrantes. Exámenes: ≥ 33 por ficha; notas de corte: 67.
- **Home → 16 comunidades → todas a `/ponderaciones`** (`index.html`, `<a href="/ponderaciones" class="community-link">Andalucía</a>`…). `js/ponderaciones.js` no lee hash ni query, así que el usuario aterriza sin filtro. Es enlazado engañoso y desperdicia 16 oportunidades de anchor con keyword.
- **Anchors genéricos**: «Ver ficha →» ×102, «Ver ponderaciones →» ×83 (apuntando a destinos distintos), además de «Calcular mi nota →», «Ver todos los exámenes», «Abrir calculadora →». Las fichas de examen ya usan anchors descriptivos (bien).
- **Profundidad**: máx 3 (25 en nivel 1, 156 en nivel 2, 48 en nivel 3). Correcto. Las 48 de nivel 3 son fichas de examen/ponderaciones alcanzadas solo vía índice.
- **Enlaces a páginas noindex**: `/proximamente` (botones IG/TT/X del footer, 232 páginas) y `/calendario-ebau` (noindex, en nav) reciben el enlace más repetido del sitio.
- **Arreglo**: crear `/ponderaciones/<comunidad>` (16 páginas con contenido propio) o, mínimo, `ponderaciones?comunidad=…` leído por JS y enlazado desde la home; anchors con keyword («Ponderaciones de la Universidad de Oviedo»); enlazar universidades de comunidades vecinas; enlazar ficha de ponderaciones ↔ notas de corte ↔ examen de la misma universidad/región.

### A6. Calidad de contenido: `/premium`, `/precios`, `/contacto` y legales por debajo de lo exigible
Palabras (sin JS): `precios` 69, `premium` 71, `contacto` 71, `calendario-ebau` 64, `guias` 88, `aviso-legal` 117, `politica-privacidad` 120, `politica-cookies` 111, `preguntas-frecuentes` 138. `premium` y `precios` están en sitemap y anuncian un producto que no existe («Próximamente»).
- **Arreglo**: sacar `premium`/`precios` del sitemap (o `noindex`) hasta que el producto exista; ampliar legales a texto real; `preguntas-frecuentes` a ≥ 15 preguntas con `FAQPage` (hoy 1 FAQPage en esa página y 1 en notas-de-corte).

---

## 🟡 MEDIO

### M1. Datos estructurados: base correcta, huecos claros
- **Válido**: los JSON-LD de las 220 páginas que los tienen parsean sin error.
- **Presente**: `Organization+EducationalOrganization` (solo home), `WebApplication` (calculadora), `BreadcrumbList` (exámenes, notas, ponderaciones), `FAQPage` (preguntas-frecuentes, notas-de-corte).
- **Falta**: `WebSite` (con `SearchAction` si se añade buscador) → 0 en el sitio; `Article` → 0; `BreadcrumbList` en `/examenes`, `/ponderaciones`, `/guias`, `/calculadora` y nivel superior; 13 páginas sin JSON-LD (`aviso-legal`, `contacto`, `examenes`, `guias`, `ponderaciones`, `precios`, `premium`, legales…). `Organization.logo` es un **SVG** (`assets/favicon.svg`); Google exige raster ≥ 112×112 px. Sin `sameAs` (cuando existan redes reales).
- **Arreglo**: bloque único generado en `build-nav-footer.mjs` para `WebSite` + `Organization`; `Breadcrumb` en las 16 de nivel superior; `Dataset`/`Table` no, no hace falta.

### M2. Terminología y año inconsistentes
Conteo de apariciones en todo el texto visible: **PAU 866 · EvAU 736 · EBAU 240 · «2026» 1.533 · «2027» 330 · «2028» 0**. Títulos: PAU en 65, EBAU en 68, EvAU en 54.
- Fichas de examen: «PAU 2026» (64/64 en title+desc). Home y `/examenes`: «EvAU / EBAU **2027**». `/notas-de-corte`: «EvAU **2026**». `/ponderaciones`: «2026-2027». Fichas de notas: «2025-2026». Un usuario ve tres años distintos en tres secciones.
- **Recomendación** (sin datos de volumen, criterio por intención):
  - **Exámenes (fichas e índices): «PAU»** como término principal — es la denominación oficial en Madrid y Murcia y lo que dicen los PDF de la fuente. Añadir «(EvAU/EBAU)» una vez en el H1 del hub `/examenes` para la sinonimia.
  - **Calculadora, ponderaciones, notas de corte y calendario: «EvAU»** (ya domina en las consultas de GSC según `CLAUDE.md`: «calculadora evau», «ebau calculadora», «simulador ebau»), con «EBAU» en la descripción como variante.
  - **Año**: las fichas de examen deben decir el año del examen que *describen* (2026, ya verificado); las herramientas de cara al próximo curso, «2027». Es coherente siempre que se explique («Examen PAU 2026 · para la convocatoria 2027»). Hoy `/notas-de-corte` dice «EvAU 2026» pero lo útil para quien busca es el curso 2025-2026 de las notas → «Notas de corte 2025-2026 (para acceder en 2026-2027)».

### M3. Sitemap
- 230 URLs, ninguna con `noindex` (bien), ninguna inexistente (bien), `404`, `calendario-ebau` y `proximamente` correctamente fuera.
- **Sin `<lastmod>`**: 0 de 230. Google ignora `changefreq`/`priority` pero usa `lastmod` si es fiable. Falta además `lastmod` real por ficha (fecha de verificación del dato ya existe: «Comprobado el 10/09/2026»).
- Incluye `premium` y `precios` (placeholders) y las 64 de C2 y 68 de C1.
- **Arreglo**: generar el sitemap desde los generadores con `lastmod` = fecha de verificación del dato o `git log -1` del archivo; excluir lo no indexable.

### M4. `robots.txt` y noindex
- `Disallow: /404.html` y `/proximamente.html` no cubren las URLs limpias (`/proximamente`), y un `Disallow` impide que Google vea el `noindex` de la página. Como `proximamente` ya trae `noindex` estático, lo correcto es **quitar ambos Disallow** y dejar que el `noindex` actúe (o dejar el Disallow y aceptar que puede aparecer como «URL indexada sin contenido» si le llegan enlaces; con 232 entrantes internos es probable).
- Falta `Disallow` irrelevante; `Sitemap:` correcto.

### M5. Jerarquía de encabezados
H1 único en las 233 (bien). Saltos H1→H3 en 5 páginas: `/` (hero → `<h3>` de tarjetas sin H2), `/contacto`, `/premium`, `/preguntas-frecuentes`, `/404`. Arreglo trivial: H2 para el bloque de tarjetas/secciones.

### M6. Rendimiento / Core Web Vitals (estático)
- **Imágenes**: ninguna `<img>` en el sitio → sin riesgo de CLS por dimensiones ni de LCP por imagen. Iconos con Unicode/emoji.
- **Fuentes**: `css/style.css` línea 2 usa `@import url('https://fonts.googleapis.com/…')`: cadena CSS → CSS de Google → archivos de fuente, bloquea el render y no hay `preconnect`. Arreglo: `<link rel="preconnect">` + `<link rel="stylesheet">` en `<head>` (o autoalojar las 2 familias con `font-display:swap`, que además mejora RGPD).
- **JS**: `site.js` y `seo.js` con `defer`, `adsbygoogle.js` con `async` (bien técnicamente; ver A1). `js/pdf.js` pesa **195 KB** y no se referencia desde ningún HTML ni JS visible (verificar si es carga dinámica o código muerto).
- **Peso HTML**: mediana ficha de ponderaciones 11 KB; las 18 con datos: hasta **190 KB** (`/ponderaciones/uab`, `ub` 171 KB, `udg` 161 KB), 10.625 palabras en `uab`. Aceptable en red, pero conviene paginar/colapsar tablas y usar `<details>`.
- **CSS**: un solo `style.css` de 50 KB sin minificar, bloqueante. Aceptable; minificar y considerar *critical CSS* si LCP > 2,5 s en campo.
- Medir con PageSpeed/CrUX tras los cambios (no medido aquí).

### M7. `examenes.html` con listado precocinado
- No hay `href="#"` en ninguna página del sitio (0 resultados). El bloque «Últimos exámenes añadidos» tiene 66 `.exam-row` con enlaces reales (`/examenes/region-de-murcia/tecnologia-e-ingenieria-ii` etc.), anchor único «Ver ficha →» (genérico). El listado es HTML estático generado, correcto para SEO; mejorar el anchor (ver A5).
- Hay un `<h3>Índices por comunidad</h3>` antes de las filas, con jerarquía H2→H3 coherente.

### M8. Accesibilidad básica
- **Alt**: N/A (0 imágenes). **Iconos decorativos**: la mayoría de los emoji/símbolos (`📄`, `⌁`, `↗`, `▤`, `◌`, `✓` del logo) llevan `aria-hidden="true"` (bien); revisar los `→` dentro de enlaces, que se leen como «flecha derecha».
- **Botón «Compartir Miebau»** (`index.html:132`): `onclick` inline, sin `type="button"`, y si falla `navigator.share` copia al portapapeles **sin ningún aviso al usuario**; título fijo «Miebau · EvAU 2027». `examenes.html:893` «Compartir página» igual. Arreglo: feedback visible (`aria-live`) y mover a `site.js`.
- **Botones IG / TT / X** del footer: texto de 1-2 letras con `aria-label`, destino `/proximamente` (no son redes reales). Mejor ocultarlos hasta tener cuentas, o `<span>` no interactivo.
- **Contraste**: no medido (requiere render). Revisar `--primary #5a43f2` sobre fondos claros y el texto `muted` en `style.css`.

---

## 🟢 BAJO

- **B1.** `google-site-verification` con placeholder `REEMPLAZA_CON_EL_CODIGO_DE_SEARCH_CONSOLE` en `index.html:10`. Search Console ya está verificado por otra vía; eliminar la etiqueta para no dejar basura.
- **B2.** `/calendario-ebau` (noindex) enlazado desde el nav global: o se publica con contenido real (alta demanda estacional) o se quita del nav.
- **B3.** `manifest.webmanifest`: un único icono SVG; faltan PNG 192/512 para instalar como PWA.
- **B4.** `lang="es"` correcto en las 233; sin `hreflang` (no hace falta, solo español).
- **B5.** `ads.txt` presente y bien formado (`google.com, pub-2269622537984613, DIRECT, f08c47fec0942fa0`).
- **B6.** `sw.js` stale-while-revalidate: bien; recordar subir `CACHE_VERSION` al desplegar cambios de CSS/JS grandes.
- **B7.** Enlaces externos: 33 fichas de Madrid enlazan al mismo índice UCM y cada una a PDFs `ucm.es/file/...`; no verificables desde aquí. Revisar con `scripts/verificar-enlaces-*` en local antes de cada campaña (existe el de Murcia, falta el de Madrid).

---

## ✅ Lo que está bien (comprobado)

- 233/233 con `<html lang="es">`, `<title>`, `<link rel="canonical">` autorreferente y correcta (0 discrepancias con la URL esperada), **H1 único**.
- 0 enlaces internos rotos, 0 enlaces a `.html`, 0 `href="#"`, 0 huérfanas, 0 URLs de sitemap inexistentes ni con `noindex`.
- 0 títulos y 0 descripciones duplicados entre páginas.
- JSON-LD: 0 errores de sintaxis.
- Fichas de examen: contenido genuinamente distinto (Jaccard 0,28) y ~470 palabras propias; sin iframe de terceros (regla 3 cumplida).
- Nav/footer en HTML estático en todo el sitio (verificado; no repito el diagnóstico).

## 11. Oportunidades de keywords (sin datos de GSC)

Sin conector no puedo listar consultas en posición 8-30. Con lo registrado en `CLAUDE.md` (18 ago-8 sep 2026, ~60 impresiones):
- **«calcular nota de corte»** (7 impr., la mayor): hoy compiten `/notas-de-corte` (hub) y 68 fichas casi idénticas → riesgo de canibalización interna; el hub debe ser la página que rankea, las fichas no. Refuerza C1.
- **«examen(es) historia del arte»**: ficha existe en Madrid; falta ficha de Murcia equivalente enlazada con anchor descriptivo para la misma consulta → decidir página canónica por consulta.
- **«abat oliba precios» / «alfonso x el sabio málaga»**: consultas de universidades privadas; las fichas de ponderaciones no responden («precios»/ubicación). Oportunidad de contenido real, no de más fichas.
- **Canibalización estructural**: `/examenes` vs `/examenes/<ccaa>` vs fichas; `/ponderaciones` vs 82 fichas; fichas de notas entre sí por «nota de corte {grado} Murcia». Definir una página objetivo por consulta y usar el anchor adecuado.
- **Acción**: exportar de GSC (Rendimiento → Consultas × Páginas, 3 meses) y cruzarlo con este informe.

## 12. Preparación AdSense

| Requisito | Estado |
|---|---|
| `ads.txt` | ✅ presente |
| Política de privacidad / aviso legal / cookies / contacto / sobre nosotros | ✅ existen; ⚠ legales de ~115 palabras, sin mencionar GA4/AdSense/Web3Forms |
| CMP / consentimiento (EEE) | ❌ no existe (A1) |
| Contenido útil por página | ✅ exámenes (≈470 p.), ponderaciones con datos (18); ❌ notas de corte (117 p.), ponderaciones vacías (306 p. de plantilla), guías (88), precios/premium (≈70) |
| Navegación clara, sin páginas «en construcción» | ⚠ `/premium`, `/precios`, `/proximamente`, redes IG/TT/X → «Próximamente» |
| Tráfico/antigüedad | ⚠ muy temprano (≈60 impresiones en 3 semanas) |

Recomendación: **no solicitar AdSense aún**. Primero C1, C2, A1, A4. Entonces tendrás ≈ 100 páginas con valor real y política de consentimiento coherente.

---

## Plan de acción (10 pasos, por impacto/esfuerzo)

Marcado 🕷️ = **afecta al rastreo/indexación** (aplicar de uno en uno, esperar 2-3 semanas y medir en «Páginas» de GSC y «Estadísticas de rastreo»). 📝 = no afecta al rastreo.

| # | Acción | Impacto | Esfuerzo | Tipo | Medir |
|---|---|---|---|---|---|
| 1 | **C2**: `noindex,follow` + fuera de sitemap para las 64 fichas de ponderaciones sin datos (campo `indexable` en el generador) | Alto | Bajo | 🕷️ | Nº indexadas / «Sin indexar» en GSC; ratio indexadas/enviadas |
| 2 | **C1**: consolidar notas de corte (hub con tabla + `noindex` en las 68 fichas, o enriquecerlas), quitar del sitemap lo que quede `noindex` | Muy alto | Medio | 🕷️ | Posición de «calcular nota de corte» y del hub |
| 3 | **M3**: sitemap con `lastmod` real, sin `premium`/`precios` | Medio | Bajo | 🕷️ | Rastreo diario en «Estadísticas de rastreo» |
| 4 | **M4**: quitar `Disallow` de `robots.txt`; quitar `/proximamente` y `/calendario-ebau` del nav/footer (o dejar IG/TT/X sin enlace) | Medio | Bajo | 🕷️ | Rastreo de `/proximamente` en logs/GSC |
| 5 | **A5**: 16 páginas `/ponderaciones/<comunidad>` (o filtro por query) enlazadas desde la home con anchors descriptivos; refuerzo para `uniovi/uclm/uex/uib` | Alto | Medio | 🕷️ | Entrantes por ficha (re-ejecutar este análisis); impresiones de ponderaciones |
| 6 | **A2 + A3**: OG/Twitter estáticos en 146 fichas, imagen 1200×630; títulos ≤ 60 y descripciones 120-155 en generadores | Medio | Bajo | 📝 (el cambio de `title` sí se reprocesa; hacerlo en un lote aparte) | CTR en GSC por sección |
| 7 | **A4**: publicar 6-10 guías (`Article`) y enlazarlas desde home y calculadora | Alto | Alto | 🕷️ (URLs nuevas; añadir al sitemap solo cuando estén completas) | Impresiones informativas, nuevas indexadas |
| 8 | **A1**: CMP + política de cookies/privacidad reales; retirar `adsbygoogle.js` de páginas finas hasta tenerlo | Alto (legal y AdSense) | Medio | 📝 | Consentimiento en GA4 |
| 9 | **M1 + M5**: `WebSite`/`Organization` con logo raster, `BreadcrumbList` en nivel superior, corregir saltos de H | Medio | Bajo | 📝 | Informe de «Mejoras» en GSC |
| 10 | **M6 + M2**: fuentes con `preconnect`/autoalojadas, unificar términos (PAU en exámenes, EvAU en herramientas) y año | Medio | Bajo-medio | 📝 (el cambio de términos reescribe títulos: lote aparte) | CWV en PageSpeed/CrUX; CTR |

Los pasos 1-5 son los que alteran qué ve Googlebot y qué URLs se consideran; conviene aplicar **1 → 2 → 5 → 3 → 4** en ese orden, uno cada 2-3 semanas, y no mezclarlos con cambios de título (paso 6) para poder atribuir el efecto.

## Verificaciones que quedan para ti (no posibles desde el sandbox)

1. `curl -sI https://miebau.es/ponderaciones/uniovi` → 200 sin cadena de redirects; `curl -sI https://miebau.es/ponderaciones.html` → 308 a `/ponderaciones` (una sola salto).
2. `curl -s https://miebau.es/ | grep -c '<a '` para confirmar que producción sirve nav/footer estáticos igual que el repo.
3. GSC: exportar Páginas → «Rastreada, actualmente sin indexar» / «Descubierta, actualmente sin indexar» por patrón (`/notas-de-corte/`, `/ponderaciones/`, `/examenes/`) para confirmar que C1/C2 son la causa.
4. Lighthouse móvil sobre `/`, una ficha de examen y `/ponderaciones/uab` para validar M6.
