# MIEBAU.es — Contexto del proyecto

## Qué es
Web de preparación de exámenes EvAU/PAU (España). Objetivo principal: escalar el
posicionamiento SEO en Google para captar tráfico de estudiantes buscando exámenes
de años anteriores por asignatura y comunidad autónoma, y convertir ese tráfico en
ventas de packs de pago (~3,99-4,99 €) y, en el futuro, membresías.

## Stack técnico
- HTML estático + generadores Node + rewrites de Netlify (NO usa Next.js ni Astro
  todavía; migración a Astro para la capa de exámenes SEO está en curso/valorada).
- Repo: https://github.com/Carpiox/miebau
- Sitio en producción: https://miebau.es
- Deploy: Netlify (`netlify.toml`)

## Estado actual del SEO de exámenes (la prioridad #1 del proyecto)
- Antes: `/examenes` era un filtro client-side (dropdowns), sin URLs indexables → 0 páginas
  reales para long-tail SEO.
- Ahora: se están generando rutas estáticas reales `/examenes/[comunidad]/[asignatura]`
  a partir de un JSON de datos (`data/examenes-seo.json`), con contenido único por
  combinación (nunca plantilla repetida) y el widget de examenesdepau.com embebido.
- Fase 1 en marcha: 15 asignaturas troncales × 5 comunidades (Murcia, Madrid, Andalucía,
  Comunidad Valenciana, Cataluña) = 75 combinaciones. Solo Cataluña y Comunidad Valenciana
  tienen ponderaciones 2026-2027 verificadas; el resto está `pending`/`blocked` — NO
  inventar datos de estructura de examen, ponderaciones o convocatorias que no estén
  verificados. Marcar como `pendiente_de_verificar` en vez de rellenar con datos inventados.
- Sitemap en Search Console: estado "Correcto", 95 páginas descubiertas.
- Problema detectado y en resolución: páginas nuevas se indexan solo por sitemap o
  solicitud manual, no por enlazado interno ("página de referencia: no detectada" en
  Inspección de URLs). Hay que asegurar que cada página de examen tenga varios enlaces
  internos entrantes reales (misma comunidad, misma asignatura en otras comunidades,
  ponderaciones relacionadas), no solo estar en el sitemap.

## Reglas de contenido SEO (no negociables)
1. Nunca reutilizar el mismo párrafo/intro entre páginas distintas — cada combinación
   asignatura+comunidad necesita texto genuinamente distinto o Google las trata como
   contenido duplicado/fino y no las indexa.
2. Nunca inventar datos objetivos (estructura de examen, ponderaciones, nº de
   convocatorias) que no estén verificados en el proyecto. Si no hay dato verificado,
   usar `pendiente_de_verificar`, nunca un valor plausible inventado.
3. El widget de examenesdepau.com va DENTRO de una página con contenido propio
   sustancial alrededor — nunca como el único contenido de la página (Google no
   indexa bien el contenido de un iframe de terceros como si fuera tuyo).
4. Ningún intersticial/anuncio debe mostrarse al cargar la página desde un resultado
   de búsqueda; solo tras una acción del usuario (ej. clic en "Ver examen").

## Producto de pago: packs por asignatura+comunidad (4,95-4,99€, lanzamiento 3,99€)
Ver especificación completa en el documento de producto ya generado (150 preguntas,
no 200; 4 simulacros; análisis histórico ponderado por recencia; evitar la palabra
"predicción", usar "relevancia histórica"/"contenido prioritario").

## Al trabajar en este repo, Claude Code debería:
- Antes de tocar rutas de examen o SEO, comprobar el estado de verificación de los
  datos de esa comunidad/asignatura (ver campos `pending`/`blocked`/`verificado`).
- Priorizar arreglar problemas de indexación/enlazado interno sobre añadir volumen
  nuevo de páginas.
- Cualquier cambio en `sitemap.xml` debe ir acompañado de páginas que realmente
  tengan contenido suficiente — no añadir rutas "vacías" al sitemap.
- Preguntar antes de asumir datos de ponderaciones/estructura de examen no verificados.
- **Ciclo EvAU y el año en el copy**: cada vez que empiece un curso nuevo (septiembre),
  revisar si portada (`index.html`) y `/examenes` siguen anunciando el año EvAU
  correcto (hoy: "2027" a secas, decisión del usuario — ver historial de sesiones).
  No es automático, hay que cambiarlo a mano cada año. No tocar por esto:
  `/ponderaciones` (usa rango "20XX-20XX", se mantiene correcto todo el ciclo), las
  fechas de "Verificado el ..." (registro histórico), el `<option>` de años del
  filtro de exámenes pasados en `/examenes` (solo gana opción cuando exista un
  examen real de ese año), ni el copyright del footer (año natural, no ciclo EvAU).

## Flujo de trabajo con git/PRs (preferencia explícita del usuario)
Cuando el usuario pida hacer cambios/modificar archivos, el flujo por defecto es:
1. Hacer el cambio en la rama de trabajo de la sesión (el entorno la asigna; no se
   commitea directo en `main`).
2. Verificarlo (revisar el diff, ejecutar cualquier check/test relevante que exista
   en `tests/`/`scripts/`, comprobar que no se rompe nada evidente).
3. Una vez verificado, mergear el PR a `main` sin esperar aprobación manual en
   GitHub para cada cambio — el usuario quiere que esto se haga de forma autónoma,
   no que se quede el PR esperando su clic.
- Excepción: si el cambio es arriesgado, ambiguo, toca datos de examen/ponderaciones
  no verificados, o afecta a algo con impacto grande (borrar contenido, cambiar
  estructura de precios, etc.), preguntar antes de mergear.

## Historial de sesiones
(Cada sesión de Claude Code debe añadir aquí un resumen breve de qué se hizo,
para que la siguiente sesión no tenga que releer todo el proyecto.)

- 2026-09-10: Sesión inicial. Se crea este archivo `CLAUDE.md` a partir del contexto
  de proyecto que el usuario traía de una sesión anterior (también trabajado con
  Codex). Sin cambios de código todavía. (PR #1, mergeado)
- 2026-09-10: Se reescribe `README.md` con la visión del proyecto (SEO de exámenes →
  packs de pago → apuntes gratuitos compartidos → membresías) y la parte técnica real
  (stack sin build, `_redirects`, pipeline `data/` + `scripts/*.mjs`, cómo correr
  tests). Se corrige en `CLAUDE.md` el nombre del JSON de exámenes
  (`data/examenes-seo.json`, no `examenes-seo-fase1.json`). (PR #1, mergeado)
- 2026-09-10: Se investiga un fallo intermitente en `tests/ponderaciones.test.mjs`.
  Causa: el test 20 (`alcance de archivos respetado`) mira *todo* el estado de git
  (`git diff`/`git ls-files --others`) y falla si hay cualquier archivo fuera de su
  lista blanca de ponderaciones modificado sin commitear — daba falso positivo con
  `README.md`/`CLAUDE.md` tocados por trabajo en paralelo. Se añade una lista de
  documentos ignorados (`README.md`, `CLAUDE.md`) para que no bloqueen ese check.
  Verificado con el árbol sucio a propósito y con la suite completa (17/17). (PR #2,
  mergeado)
- Flujo de trabajo confirmado con el usuario: cuando termina un PR, se reinicia la
  rama de sesión desde `origin/main` (`git fetch origin main && git checkout -B
  claude/miebau-project-context-lnlu7q origin/main`) antes de seguir con el próximo
  cambio, para no apilar commits sobre historial ya mergeado.
- 2026-09-10: A petición del usuario, tres cambios más:
  1. **Diseño de `.exam-row`** (usado en "Últimas ponderaciones publicadas" de
     `/ponderaciones` y en "Últimos exámenes añadidos"/resultados de `/examenes`):
     esas clases no tenían ningún CSS propio, se veían como texto plano apilado.
     Se añadió diseño de tarjeta con icono/título/meta/botón en `css/style.css`.
     Verificado con Playwright (no con el CLI de Chromium a pelo, que dio falsos
     positivos de overflow por no esperar a que cargara la página). (PR #4, mergeado)
  2. **Enlazado interno real en `/examenes/<comunidad>/<asignatura>`**: cada ficha
     solo enlazaba a `/examenes` y `/ponderaciones`, sin ningún enlace a las otras
     29 fichas del lote. Se añadió una sección "Sigue explorando exámenes" en
     `scripts/build-examenes-profiles.mjs`, generada desde el propio dataset
     (15 asignaturas × 2 comunidades → 15 enlaces reales por ficha). (PR #5, mergeado)
  3. Se investigó por qué las 30 fichas de examen dicen en el sidebar "Vista previa ·
     no indexable" pero están en `sitemap.xml`, sin meta `robots` y sin bloqueo en
     `robots.txt` — **no es un bug**: `tests/examenes-seo.test.mjs` prueba
     explícitamente que NO debe haber meta `noindex`. El campo `indexacion:
     'noindex'` del JSON parece ser solo una marca de estado interno, no una
     directriz real. El texto del sidebar "no indexable" es engañoso/desactualizado
     y debería corregirse o aclararse, pero no se tocó la indexación real sin que el
     usuario lo confirme explícitamente (afecta a páginas ya publicadas).
  4. Se detectó un **overflow horizontal de 26px a ~900px de ancho** en las fichas de
     `/examenes/*`, ya presente antes de estos cambios (probablemente el `::after`
     decorativo del banner CTA inferior, similar al patrón de `.career-cta::after`
     con `right:-6%` en otras páginas). Pendiente de diagnosticar y arreglar en una
     sesión futura.
  5. Sin conectores de Search Console/Analytics en esta cuenta de Claude
     (`ListConnectors` solo mostró Google Drive e Indeed) — cualquier auditoría SEO
     en sesiones futuras se hace leyendo el código/HTML directamente, no con datos
     reales de posiciones/impresiones/CTR salvo que el usuario los pegue a mano.
  6. Confirmado que no hay Google Analytics/GA4 ni código de AdSense en el sitio
     todavía (`js/integrations.js` vacío). El meta `google-site-verification` en
     `index.html` sigue con el placeholder `REEMPLAZA_CON_EL_CODIGO_DE_SEARCH_CONSOLE`
     sin reemplazar (aunque Search Console ya está verificado por otra vía, según el
     usuario).
- 2026-09-10: Bloque **P0** de la lista de prioridades, dos de los tres puntos resueltos:
  1. **`js/seo.js`**: el `noindex` de `/notas-de-corte` y `/calendario-ebau`, y el
     schema `FAQPage` de `/preguntas-frecuentes`, nunca se aplicaban en la URL limpia
     (canónica) porque el lookup comparaba `location.pathname` (sin `.html`) contra
     claves del mapa `routes` que sí llevaban `.html`. Se normaliza la clave antes de
     comparar. Verificado sirviendo copias sin extensión con Playwright (truco: sin
     esto, Python http.server no sabe qué Content-Type servir a un archivo sin
     extensión — usar `guess_type` override o similar si se repite este tipo de test).
     (PR #7, mergeado)
  2. **Newsletter del footer**: ahora envía de verdad a Netlify Forms (antes
     `preventDefault()` + mensaje de éxito falso sin guardar nada). Se añadió un
     formulario estático oculto en `index.html` con `data-netlify="true"` — necesario
     porque Netlify solo detecta formularios en el HTML estático servido, no en los
     que inyecta JavaScript en tiempo de ejecución (el formulario real vive en
     `js/site.js`, generado dinámicamente para el footer de todas las páginas).
     Incluye honeypot y texto de consentimiento con enlace a la política de
     privacidad. **Pendiente**: la política de privacidad todavía no menciona el
     tratamiento de estos correos (MIE-013 en `AUDITORIA_MIEBAU.md`) — esto resuelve
     el engaño de "decir que funciona sin funcionar", no sustituye una revisión legal
     del consentimiento. (PR #7, mergeado)
  3. **P0.1 (GA4)**: el usuario dio el Measurement ID real (`G-PC072KNFRT`). Conectado
     en `js/integrations.js` (antes vacío a propósito), cargado vía el mismo loader
     dinámico que `js/site.js` ya usaba para `seo.js`. Inicializado con **Google
     Consent Mode denegado por defecto** (no hay banner de cookies real todavía,
     solo `/politica-cookies` informativa) — recoge datos ya, en modo
     cookieless/modelado, sin escribir cookies de analítica sin consentimiento
     explícito. Cuando exista un banner real, hay que llamar a `gtag('consent',
     'update', { analytics_storage: 'granted' })` tras la aceptación. **Bloque P0
     completo.** (PR #9, mergeado)
- 2026-09-10: Bloque **P1**, los 4 puntos resueltos en un solo PR:
  1. 44 fichas privadas de ponderaciones enlazaban a `/politica-privacidad.html`
     (no canónico) en un bloque de contenido editorial manual que el generador
     nunca regenera para universidades privadas — corregido a mano en las 44.
  2. Quitado el texto "Vista previa · no indexable" del sidebar de `/examenes/*`:
     era un string fijo sin conexión al dato real, y la página sí es indexable
     (confirmado en la sesión anterior: está en sitemap, sin `noindex`, sin bloqueo
     en `robots.txt`).
  3. Meta OG/Twitter añadidas en HTML estático en las 14 páginas de nivel superior
     indexables (antes solo por JS vía `js/seo.js`, invisibles para bots que no
     ejecutan JavaScript). No se tocó `404.html` ni `proximamente.html` (noindex).
  4. Enlazado interno real en las 82 fichas de ponderaciones (mismo problema
     MIE-005 ya resuelto para `/examenes` en la sesión anterior): sección "Más
     universidades de `<comunidad>`" en cada ficha, pública y privada, reutilizando
     `.region-quick-link`. Nuevo marcador `ponderaciones-related:generated:start/end`
     para las fichas privadas.
  (PR #10, mergeado)
- 2026-09-10: El usuario señaló que hay que anticipar el cambio de año EvAU 2026→2027
  para SEO (quien busque ahora piensa en el examen de junio de 2027, no en el de
  2026 que ya pasó). Se encontró que **ya estaba desalineado hoy, no solo de cara a
  futuro**: `/ponderaciones` decía correctamente "Curso 2026-2027", pero portada y
  `/examenes` decían "EvAU 2026" a secas en título, meta description, badge del hero
  y texto de compartir. Preguntado el criterio al usuario: eligió **año suelto (no
  rango "2026-2027")**. Aplicado en portada y `/examenes`. **Regla para el año que
  viene**: cuando toque, hay que volver a cambiar "2027" → "2028" a mano en esos
  mismos sitios (no es automático); no tocar `/ponderaciones` (usa rango, ya
  correcto todo el ciclo), ni el `<option>` de años del filtro de exámenes pasados
  en `/examenes` (ese solo debe ganar una opción nueva cuando exista un examen real
  de ese año), ni el copyright del footer (sigue el año natural, no el ciclo EvAU).
- 2026-09-10: El usuario compartió capturas reales de Google Search Console
  (18 ago - 8 sep 2026, ~60 impresiones totales, prácticamente 0 clics — el sitio
  está en la fase más temprana de indexación). Hallazgos accionables:
  - Ninguna consulta de calculadora/simulador lleva año explícito ("calculadora
    evau", "simulador ebau", "ebau calculadora"...) — refuerza que el cambio a
    "EvAU 2027" no arriesga tráfico por año, la gente no busca por año para estas
    herramientas.
  - **"calcular nota de corte" es la consulta con más impresiones de todas (7)**,
    y `/notas-de-corte` hoy no tiene ningún dato real (estado vacío). Justo en esta
    sesión se corrigió el bug que hacía indexable esa URL por accidente (ver bloque
    P0 arriba) — con el fix, la página dejará de aparecer para esa búsqueda en
    cuanto Google re-rastree, en el peor momento posible (cuando hay prueba de
    demanda real). **Candidato fuerte para la próxima sesión**: valorar con el
    usuario si merece la pena construir un dataset real (aunque sea parcial, unas
    pocas carreras/universidades) para poder quitar el noindex con contenido
    honesto, en vez de dejarlo noindex para siempre. Es una decisión de producto,
    no se tomó unilateralmente.
  - "examenes historia del arte"/"examen historia del arte" (4 impresiones) valida
    esa asignatura; "abat oliba precios" y "alfonso x el sabio malaga" confirman
    que las fichas de universidades privadas ya reciben búsquedas long-tail reales.
- 2026-09-10: Bloque **P2** completo, los 3 puntos de la auditoría/sesión anterior:
  1. **Overflow horizontal sitewide de hasta 146px entre 761-950px de ancho**
     (afecta a TODAS las páginas, no solo `/examenes` como se pensaba al
     detectarlo): la navbar colapsaba a hamburguesa en `@media (max-width:760px)`,
     pero los enlaces inline + el botón "Calcular mi nota" necesitan hasta ~950px
     para caber en una fila sin `flex-wrap`. Se sube el punto de corte a 960px
     (verificado con Playwright: overflow 0 en todo el rango 760-980px).
  2. **MIE-004**: nunca existió una regla global `[hidden] { display: none
     !important; }` — `.btn`, `.mode-note` e `.inverse-result` declaran su propio
     `display` y ganaban la cascada sobre el atributo `hidden`, así que varios
     controles de la calculadora (`#calculateButton`, `#inverseResult`,
     `#clearHistory`, `#previousStep`, `#comparisonPanel`, aviso de modo no-EvAU)
     aparecían visibles en la carga inicial pese a tener `hidden`. Regla global
     añadida; verificado que los 6 elementos ahora resuelven a `display:none` real,
     y que el overflow de 46px a 360px de la auditoría original desapareció.
  3. **MIE-009**: el service worker usaba cache-first puro con un nombre de cache
     que nunca cambiaba (`miebau-static-v1`) y sin limpieza de caches viejas —
     un usuario recurrente podía quedarse con CSS/JS desactualizado
     indefinidamente pese a nuevos deploys. Pasa a stale-while-revalidate (sirve
     la copia en caché al instante, pero siempre revalida en segundo plano con
     `cache:'no-store'` para no toparse con la caché HTTP heurística del
     navegador) más versionado de caché (v2) con limpieza de versiones antiguas en
     `activate()`, y `/404.html` añadido a `CORE` para que el fallback offline
     funcione de verdad. Verificado con Playwright simulando un cambio de archivo
     entre peticiones: primera petición tras el cambio sirve stale (rápido),
     segunda sirve la versión nueva ya revalidada.
  (PR #12, mergeado)
- 2026-09-11: **`/notas-de-corte` implementado con datos reales**, a petición del
  usuario (brief detallado con copy SEO ya redactado). Puntos importantes para
  sesiones futuras:
  - **Este entorno no tiene salida de red a dominios externos** (`WebFetch` a
    `um.es` devuelve `EGRESS_BLOCKED`) — confirmado también antes con miebau.es.
    Para cualquier fuente oficial futura que haya que descargar (PDFs, páginas),
    hay que pedirle al usuario que suba el archivo directamente al chat (Read
    funciona con PDFs sin red) o que pegue los datos/URL a mano. No asumir que se
    puede hacer scraping ni descarga directa desde esta sesión.
  - El usuario subió el PDF oficial "Notas de corte estudios de grado, curso
    2025-2026" de la Universidad de Murcia. Se extrajeron **38 grados** (de ~65
    filas totales) que no llevaban ninguna anotación ambigua en el documento
    ("(S)" segundo plazo, "(NP)" opción no prioritaria, "(OD)" otros distritos) —
    quedan ~27 grados pendientes de añadir en una futura ronda, con la etiqueta de
    cupo/plazo correcta si se decide incluirlos.
  - `data/notas-corte-2026.json` + `scripts/build-notas-corte-profiles.mjs` +
    `tests/notas-de-corte.test.mjs`, mismo patrón que ponderaciones/exámenes:
    fichas estáticas en `/notas-de-corte/<slug>-um`, marcador
    `notas-corte-latest:generated:start/end` para el bloque "Últimas notas de
    corte publicadas" en el hub, y `notas-corte-coverage:generated:start/end`
    para el badge de cobertura (¡cuidado! `replaceGeneratedBlock` consume los
    marcadores — cualquier función de reemplazo debe reincluirlos en su propio
    return, si no el siguiente `--check` falla).
  - El hub (`notas-de-corte.html`) ya no es un placeholder "Próximamente": tiene
    contenido real y sustancial (definición, cómo se calcula la nota de admisión,
    mini FAQ con `FAQPage` JSON-LD), así que se quitó `noindex: true` de
    `js/seo.js` para esa ruta. Los 38 grados y el hub ya están en `sitemap.xml`
    y `_redirects`.
  - **Pendiente del usuario**: el `sourceUrl` de la fuente cita `https://www.um.es`
    (el dominio, verificado en el propio PDF) en vez del enlace directo al
    documento — si el usuario pasa la URL exacta del PDF, actualizar
    `data/notas-corte-2026.json`.
  - Añadido un 7º enlace a la navbar principal ("Notas de corte") y una 4ª
    tarjeta en la portada — la navbar necesitó subir su punto de corte a
    hamburguesa de 960px a 1020px para no reintroducir overflow (verificado con
    Playwright en todo el rango 760-1200px).
  - No se usó chrome-devtools-mcp (el usuario decidió explícitamente no
    instalarlo en la conversación) — la verificación visual se hizo con
    Playwright + Chromium ya preinstalado, como en el resto de la sesión.
  (PR #13, mergeado)
- 2026-09-11: **`/notas-de-corte` completado y auditado antes de añadir otra
  universidad** (a petición explícita del usuario — buen hábito a repetir con
  cualquier fuente de datos nueva).
  - Se publican los **68 grados** del PDF de la Universidad de Murcia: los 38
    ya publicados (cupo general sin anotación) + 30 más que en el PDF llevan
    "(S)" segundo plazo y/o "(NP)" opción no prioritaria de FP en la columna de
    Cupo General. Estos 30 **no se etiquetan como cupo general normal** —
    `turno: "General (2º plazo)"` / `"General (2º plazo, opción no prioritaria
    de FP)"`, y cada ficha añade una nota "Importante" explicando qué significa
    (vía `cupoNote()` en `scripts/build-notas-corte-profiles.mjs`).
  - El usuario preguntó directamente si `/notas-de-corte` tenía el mismo nivel
    de SEO/enlazado interno que `/examenes` y `/ponderaciones`. Auditoría
    honesta, 2 gaps reales encontrados y arreglados en el mismo PR:
    1. **Cero enlazado interno entre las 68 fichas** (cada una solo enlazaba
       al hub y a `/calculadora`) — mismo problema MIE-005 ya resuelto para
       examenes/ponderaciones en sesiones anteriores, no aplicado aquí por
       descuido. Se añadió "Más notas de corte de `<universidad>`" con las
       67 fichas hermanas, mismo patrón `.region-quick-link`.
    2. **Faltaban meta OG/Twitter estáticas** en las 68 fichas (mismo gap del
       fix de P1, no extendido aquí). Añadidas.
  - Un tercer punto se revisó y **no era un problema nuevo**: el párrafo
    "la nota de corte es un dato retrospectivo..." se repite igual en las 68
    fichas, pero 64 de las 82 fichas de ponderaciones ya hacen lo mismo con su
    aviso de "sin datos verificados" — es el patrón establecido del proyecto
    para contenido de aviso/estado de una ficha de datos, no una violación de
    la regla de intros únicos (esa regla, según su propia redacción en este
    archivo, es específicamente para el contenido narrativo largo de
    `/examenes`, no para cada ficha de dato individual del proyecto).
  - **Lección para cuando se añada una segunda universidad**: repetir esta
    misma auditoría (enlazado interno + OG/Twitter + sitemap/redirects) antes
    de dar por "terminada" cualquier fuente de datos nueva — no asumir que el
    patrón de otra sección del proyecto se copió completo solo porque la
    estructura de generador es la misma.
  (PR #15, mergeado)
- 2026-09-11/12: **Descubierto que el sitio nunca llegó a producción pese a
  meses de PRs en verde**: Netlify tiene dos proyectos conectados al mismo
  repo — "miebau" (no es el que sirve `miebau.es`, un red herring que llevó a
  falsas confirmaciones de "ya está en producción" toda la sesión) y
  `astonishing-torrone-1d9db7` (el real, atado al dominio). Los *previews* de
  PR seguían saliendo en verde porque usan un cupo de crédito distinto al de
  los *despliegues de producción*; estos últimos llevaban semanas
  "skipped — Skipped due to account credit usage exceeded" en silencio, sin
  ningún check en rojo que lo delatara. **Lección de proceso**: un PR en
  verde certifica que el build/preview funcionó, nunca que el contenido llegó
  a servirse en el dominio real — si hay dudas, hay que pedir al usuario que
  lo compruebe en el propio dominio (incógnito + hard refresh), no fiarse de
  los checks. Decisión del usuario: migrar el hosting a **Cloudflare Pages**
  (tier gratuito sin límite de créditos) y las suscripciones/contacto de
  Netlify Forms a **Web3Forms**.
- 2026-09-12: **Bug de bucle de redirección en Cloudflare Pages, encontrado y
  arreglado con evidencia de repo, no suposición** (el usuario exigió
  explícitamente verificar antes de tocar nada más, ver contexto en el propio
  PR #17): tras apuntar el dominio a Cloudflare Pages, la home cargaba pero
  `/notas-de-corte`, `/ponderaciones`, `/calculadora` y `/examenes/*` daban
  "too many redirects".
  - Evidencia reunida antes de tocar nada: `git ls-files` confirma que las
    fichas de `notas-de-corte/`, `ponderaciones/` y `examenes/*/*.html` están
    commiteadas tal cual (no se generan en build/deploy — los scripts
    `scripts/build-*.mjs` son herramientas de desarrollo local, su salida se
    commitea como cualquier otro archivo). No existe `package.json` ni
    `netlify.toml` en el repo: la configuración de Netlify vivía enteramente
    en su panel (build command vacío, publish directory = raíz del repo).
  - **Causa real**: `_redirects` tenía 195 reglas `"/ruta /ruta.html 200"`
    (necesarias en Netlify, que NO sirve URLs limpias de forma automática).
    Cloudflare Pages sí lo hace de forma nativa: cualquier `archivo.html` se
    sirve automáticamente en `/archivo`, y una petición a `/archivo.html` se
    redirige (308) a `/archivo`. Al tener además una regla explícita que
    reescribe `/archivo` → `/archivo.html`, la resolución interna de ese
    destino `.html` vuelve a disparar la redirección automática de Cloudflare
    hacia la ruta limpia, que vuelve a matchear la misma regla: bucle
    infinito. La home no tiene ninguna regla propia en el archivo (se sirve
    directamente desde `index.html`), por eso era la única ruta que cargaba.
  - **Arreglo**: se vació `_redirects` (con comentario explicando el porqué,
    para que nadie vuelva a añadir reglas `"ruta ruta.html 200"` sin saber que
    rompen Cloudflare). Se actualizaron los tests de `ponderaciones`,
    `examenes-seo` y `notas-de-corte` que antes exigían esas reglas: ahora
    comprueban que **no** existen y que la ficha estática sigue existiendo.
    23/23 archivos de test en verde. (PR #17, mergeado)
  - **Nota para el futuro**: si algún día se vuelve a Netlify, hay que
    reintroducir manualmente las reglas de rewrite en `_redirects` (Netlify sí
    las necesita); en Cloudflare Pages, no añadirlas nunca para rutas que
    apuntan a un `.html` con el mismo nombre.
  - **Límite de esta sesión, aplicado también en el futuro**: este entorno
    sandbox no tiene salida de red a dominios externos reales (confirmado con
    403 en `cloudflare.com`/`pages.dev`, igual que antes con `miebau.es` y
    `um.es`), y no hay ninguna herramienta/API de Cloudflare conectada — no se
    puede configurar el panel de Cloudflare Pages ni verificar el deployment
    en vivo con Playwright desde esta sesión. Cualquier verificación de la URL
    real la tiene que hacer el usuario (o pegar el HTML/capturas para que
    Claude las revise).
  - **Pendiente**: el usuario va a crear la cuenta de Web3Forms y pasar el
    Access Key para migrar el formulario de contacto/newsletter (hoy en
    Netlify Forms) — sustituir el `data-netlify` por un `fetch()` POST a
    `https://api.web3forms.com/submit`, manteniendo el honeypot.
- 2026-09-12: **Migración de Netlify Forms a Web3Forms completada** (el
  usuario ya expandió los DNS a Cloudflare y confirmó que todo carga bien;
  pasó el Access Key `c4fda362-0900-4250-89ee-9dc680092943`).
  - El alcance real era mayor que "contacto + newsletter": había **82 fichas
    de `/ponderaciones/*.html`** con un tercer formulario Netlify ("avísame
    cuando se publiquen las ponderaciones"), 44 de ellas con contenido
    editorial congelado que `scripts/build-ponderaciones-profiles.mjs` nunca
    regenera para universidades privadas sin registros (ver nota de la
    sesión del PR #15). Antes de tocar nada hay que buscar **todas** las
    apariciones de `data-netlify`/`netlify-honeypot`/`form-name` en el repo,
    no asumir que solo hay uno o dos formularios.
  - Arreglo: `js/forms.js` (nuevo) — capa compartida que engancha cualquier
    `form[data-web3forms="<contexto>"]`, comprueba el honeypot `bot-field`
    en el cliente (ya no lo procesa Netlify) y hace `fetch` JSON a
    `https://api.web3forms.com/submit` con `access_key` + los campos del
    formulario + un `subject` calculado por contexto (incluye el nombre de
    la universidad si el formulario lleva un campo oculto `universidad`).
    Muestra la confirmación/error en un `<p class="form-note">` propio (o
    reutiliza `.newsletter-note` en el footer) sin recargar la página. Se
    carga sitewide vía el mismo loader dinámico de `js/site.js` que ya
    usaba `integrations.js`/`seo.js` — no hace falta tocar el `<head>` de
    cada página.
  - Para las 44 fichas con el aviso congelado: se comprobó primero (con
    `grep -c`) que el bloque de formulario era **byte-idéntico** en las 44
    salvo el nombre de la universidad, y se parcheó con un pequeño script
    Python de reemplazo literal en vez de tocarlas a mano una por una. Para
    el resto (universidades públicas, regeneradas por completo en cada
    build), bastó con arreglar la plantilla `renderNotice()` del generador
    y volver a ejecutar `node scripts/build-ponderaciones-profiles.mjs`
    (sin `--check`) para que se regeneraran solas.
  - **Límite de esta sesión, otra vez**: no se pudo consultar la
    documentación de Web3Forms ni verificar que el correo llega de verdad —
    `api.web3forms.com` también da `EGRESS_BLOCKED`/403 desde este sandbox,
    igual que `cloudflare.com`/`pages.dev`/`um.es`. La implementación sigue
    el formato de integración por fetch/JSON públicamente documentado de
    Web3Forms (`access_key` + campos + `subject`; respuesta JSON con
    `success`/`message`), con manejo defensivo de la respuesta (solo se
    trata como fallo un `response.ok` falso o `success === false` explícito)
    para no depender de que su forma exacta coincida al 100%. Verificado en
    su lugar con Playwright contra un servidor estático local, interceptando
    la petición a `api.web3forms.com/submit` (17/17 comprobaciones: payload
    correcto sin campos internos de Netlify, mensaje de éxito/error en
    pantalla sin recargar, botón reactivado tras un fallo para poder
    reintentar, honeypot relleno = cero peticiones de red). **Pendiente del
    usuario**: probar el envío real en `miebau.es` ya desplegado y confirmar
    que el correo le llega a la bandeja de Web3Forms/su email.
  (PR #19, mergeado)
