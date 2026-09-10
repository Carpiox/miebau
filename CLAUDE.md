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
