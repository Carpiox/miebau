# Seguimiento SEO · miebau.es

Registro de cada cambio con su hipótesis y la métrica a vigilar. **Los commits están en local (sin push)**: la "fecha de subida" y las ventanas de medición empiezan cuando tú publiques. Cambia `[fecha de push]` cuando ocurra.

## Métricas base (Search Console, 3 meses hasta 2026-11-15)

| Métrica | Valor base |
|---|---|
| Clics | **10** |
| Impresiones | **431** (321 ordenador / 102 móvil / 8 tablet) |
| Posición media | ≈ **42,2** (ponderada por impresiones a partir de Dispositivos.csv; GSC no dio la cifra global) |
| Páginas indexadas | **57** (gráfico del 08-11: 56-57) |
| No indexadas | **181-182** (172 "Descubierta: actualmente sin indexar", 6 redirecciones, 3 "Rastreada: sin indexar", 1 alternativa con canonical) |
| Sitemap antes de los cambios | 230 URLs · después: **113 URLs** |

Base por URL de las páginas tocadas (impresiones / posición / clics):

| URL | Impr. | Pos. | Clics |
|---|---|---|---|
| `/examenes/region-de-murcia/geografia` | 42 | 8,3 | 0 |
| `/examenes/region-de-murcia/biologia` | 23 | 8,6 | 0 |
| `/examenes/region-de-murcia/fisica` | 16 | 8,7 | 0 |
| `/examenes/comunidad-de-madrid/historia-del-arte` | 45 | 13,6 | 0 |
| `/examenes/region-de-murcia/matematicas-ii` | 26 | 69,3 | 0 |
| `/examenes/comunidad-de-madrid/ingles` | 15 | 76,9 | 0 |
| `/calculadora` | 47 | 47,7 | 1 |
| `/notas-de-corte` | 57 | 77,7 | 0 |
| `/` | 70 | 61,2 | 6 |

> **Cautela estadística:** con ~430 impresiones por trimestre, cualquier variación de unas pocas posiciones o 1-2 clics es ruido. Evalúa por URL, comparando 28 días con 28 días, y no concluyas con menos de ~30 impresiones por URL.

## Oleada: Lote 0 (indexación) y Lote 1 (contenido)

Orden de commits (más antiguo primero) y qué mirar. Los cambios de **indexación** y de **contenido** van en commits distintos para poder atribuirlos.

| Fecha cambio | Commit | Cambio | Tipo | Hipótesis | Métrica y ventana |
|---|---|---|---|---|---|
| 2026-11-15 | `8929fe5` | 68 fichas de notas de corte: `noindex,follow`, fuera del sitemap y sin enlaces internos | Indexación | Se concentra el rastreo en páginas con contenido propio; deja de contarse como "descubierta sin indexar" lo que no se quiere indexar | Informe **Indexación de páginas**: "Excluida por noindex" sube ~68 y "Descubierta sin indexar" baja en la misma medida. **14-28 días** (Google debe rastrearlas para ver el noindex; el sitemap más corto actúa antes) |
| 2026-11-15 | `e3be04a` | 49 fichas de ponderaciones sin dato: `noindex,follow` y fuera del sitemap (se mantienen las 16 indexadas y las 17 con filas oficiales) | Indexación | Ídem; no se pierde tráfico porque las 16 con impresiones no se tocan | Las 16 URLs indexadas siguen con impresiones (`ucam` 22 impr./pos 4,6, 2 clics). **14-28 días** |
| 2026-11-15 | `222fc01` | Test: el sitemap = exactamente las páginas sin noindex | Test | — | — |
| 2026-11-15 | `95996b4` | Geografía, Biología, Física (Murcia) e Historia del Arte (Madrid): title/H1/meta con PAU+EBAU/EvAU, lead, criterios de corrección y cambios entre convocatorias (de los PDF oficiales), cómo preparar, FAQ visible + FAQPage | Contenido | Pasar de pos 8-9 a la parte alta de la 1ª página y convertir impresiones en clics (CTR 0 %); HdA Madrid de 13,6 a 1ª página | Por URL: **CTR, clics y posición**. Primera lectura a **14 días**, decisión a **28 días**. Mirar también consultas nuevas por página |
| 2026-11-15 | `162a1c5` | `/calculadora`: H1/title/meta "calculadora nota EvAU (PAU/EBAU)", texto, ejemplo y FAQ | Contenido | Subir en el clúster "calculadora/simulador evau/ebau/nota" (~56 impr., pos 60-95) | Impresiones y posición del clúster (filtro de consulta: `calculad|simulad|calcular nota`). **28 días** |
| 2026-11-15 | `3f9022b` | `/notas-de-corte`: tabla estática con 68 notas, guía para calcular y comparar, FAQ | Contenido | Subir en "calcular nota de corte" / "notas de corte" (~37 impr., pos 85-95) y aportar contenido propio indexable | Impresiones y posición del clúster (filtro `corte`). **28 días** |
| 2026-11-15 | `1f6117a` | Portada: bloque "Empieza por aquí" con enlaces a calculadora, notas de corte y las 4 fichas | Enlazado | Más rastreo/valor interno hacia las páginas que ya rankean | Entrantes internos (+1 por ficha) y "Página de referencia" en Inspección de URLs. **14 días** |
| 2026-11-15 | `bb26755` | Matemáticas II (Murcia) e Inglés (Madrid): title/H1/meta, lead, material y criterios (Murcia, de los PDF), cómo preparar, FAQ visible + FAQPage | Contenido | Subir en "ebau mates murcia" (25 impr., pos 68-72) y en las ~12 variantes de "pau/evau inglés madrid" (pos 62-84) | Por URL: posición, impresiones y consultas nuevas. Primera lectura a **14 días**, decisión a **28 días**. Con 1-2 impresiones por consulta, mirar la suma del clúster |

## Pasos manuales para ti tras el push (no los puedo hacer desde aquí)
1. Comprobar que Cloudflare Pages desplegó (la lección de Netlify: un PR en verde no prueba que el contenido esté en el dominio real). Abrir en incógnito `miebau.es/notas-de-corte` y confirmar la tabla.
2. Search Console → **Sitemaps**: reenviar `sitemap.xml` (113 URLs).
3. Search Console → **Inspección de URLs → Solicitar indexación** para: `/notas-de-corte`, `/calculadora`, `/` y las 4 fichas de examen (7 URLs).
4. Inspeccionar una ficha de notas de corte y una de ponderaciones sin dato: debe aparecer "Excluida por la etiqueta noindex" cuando Google las rastree.

## Próximos lotes del plan (no ejecutados)
- **Lote 2 hecho** (Matemáticas II Murcia e Inglés Madrid). Siguientes por impresiones: Lengua Castellana (6), Historia de España (11), Inglés Murcia (5), Filosofía (4) y el índice `/examenes/region-de-murcia` (12 impr., pos 49).
- **Propuesta de indexación pendiente de tu OK (Lote 0b):** `noindex` en `uam`, `uc3m` y `uoc` (ver abajo).
- Resto de fichas de Murcia y Madrid; guías, precios, premium, contacto y legales (necesitan los datos de `docs/contenido-pendiente.md`).

## Propuesta Lote 0b · `uam`, `uc3m`, `uoc` (pendiente de tu OK)
Datos de Search Console (3 meses hasta 2026-11-15): **0 impresiones, 0 clics, ninguna consulta asociada**, y las tres están en "Descubierta: actualmente sin indexar" con último rastreo 1970-01-01 (Google no las ha rastreado nunca). Tienen 3, 3 y 1 filas oficiales compartidas, sin tabla propia verificada, y `uam`/`uc3m` se parecen entre sí (Jaccard 0,88).
**Propuesta: `noindex` y fuera del sitemap las tres**, hasta tener su tabla oficial (el cambio es una línea en `scripts/indexacion.mjs` y es reversible). No pierden tráfico porque no tienen ninguno. Impacto esperado: sitemap de 113 a 110 URLs.
