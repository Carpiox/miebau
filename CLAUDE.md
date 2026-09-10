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
  Codex). Sin cambios de código todavía.
