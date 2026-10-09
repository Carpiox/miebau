# Mantenimiento de las fichas de Murcia (sin Claude Code)

Todo es HTML estático. Los datos viven en JSON, unos scripts Node generan las páginas y **los HTML generados se
commitean**. No hay build en Cloudflare Pages (publica la raíz del repo tal cual). Requiere Node 18+.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Fichas y fuentes de `/examenes/*` (Murcia y Madrid) | `data/examenes-seo.json` (`sources[]` y `entries[]`) |
| Lista de materias y enlaces de la UMU (sin tocar a mano salvo para añadir) | `data/murcia/pau2026_murcia.json` |
| Resultado de la verificación de enlaces | `data/murcia/verificacion.json` y `verificacion.md` |
| Texto extraído de cada PDF | `data/murcia/textos/<codigo>-<ordinaria\|extraordinaria>.txt` |
| Composición del examen con fuente y cita | `data/murcia/composicion.json` |
| Grupos y materias relacionadas (enlazado interno) | `scripts/examenes-taxonomia.mjs` |
| Generador de las páginas | `scripts/build-examenes-profiles.mjs` |
| Sitemap | `sitemap.xml` (se edita a mano) |

**No se editan a mano** `examenes/**/*.html`, `examenes.html` (bloque generado) ni el bloque de la home entre
`home-examenes:generated:start/end`: se regeneran.

## Reglas que no se negocian

- Nada inventado: lo que no consta en el PDF oficial es `pendiente_de_verificar` (o `null` en `composicion.json`).
- Solo se publican enlaces con resultado ✅ en `verificacion.md`.
- Intro de 150-200 palabras, única: ninguna frase ni secuencia de 10 palabras repetida en ninguna ficha (Madrid incluido).
- Duración 90 minutos, `ponderaciones_2026_2027` y `num_convocatorias_disponibles` en `pendiente_de_verificar`.
- Títulos ≤ 60 caracteres, meta description ≤ 155. Sin la palabra «predicción».

## Validar cualquier cambio (siempre, antes de commitear)

```bash
node scripts/build-examenes-profiles.mjs          # regenera páginas, índices y bloque de la home
node scripts/build-examenes-profiles.mjs --check  # comprueba que lo commiteado coincide con el generador
node --test tests/*.test.mjs                      # toda la suite
```

Los otros generadores también deben pasar `--check` (`build-nav-footer`, `build-ponderaciones-profiles`,
`build-ponderaciones-directory`, `build-notas-corte-profiles`). Si el test 20 de `ponderaciones.test.mjs` falla con
cambios sin commitear, es un falso positivo conocido: pasa en cuanto se commitea. Antes de mergear, revisa el diff:
solo deben cambiar las fichas que querías tocar.

## Añadir o cambiar un enlace de examen

1. Edita `enlace_oficial_examen` (`ordinaria`, `extraordinaria`) de la ficha en `data/examenes-seo.json`.
   Una solución o unos criterios que son **otro archivo** van en `enlace_oficial_resuelto` (mismas claves).
2. Verifícalo (siguiente sección) y comprueba que sale ✅.
3. `node scripts/build-examenes-profiles.mjs` y los tests.

## Verificar enlaces con el script

Hace falta salida a internet (este entorno no la tiene, ejecútalo en tu máquina) y `pdftotext` (poppler; `brew install
poppler`, `apt install poppler-utils`, `scoop install poppler`) o, si no, `npm install --no-save pdfjs-dist`.

```bash
node scripts/verificar-enlaces-murcia.mjs                  # todos los enlaces; reanuda lo ya hecho
node scripts/verificar-enlaces-murcia.mjs --solo-fichas    # solo los enlaces de las fichas que difieren del JSON
node scripts/verificar-enlaces-murcia.mjs --only 301,306   # solo esos códigos de materia
node scripts/verificar-enlaces-murcia.mjs --force          # repite todo
node scripts/verificar-enlaces-murcia.mjs --revalidar      # reevalúa los textos guardados, sin red
```

Valida HTTP 200, que sea PDF, año 2026 en la cabecera (`PAU2026`), convocatoria (junio = ordinaria, julio =
extraordinaria) y materia. Escribe `verificacion.md` (léelo) y guarda el texto de cada PDF. ⚠️ = mirar el PDF a mano;
❌ y 🔁 = no se publica.

**Si una ficha tiene un enlace distinto del JSON de la UMU** (hoy: 306 ordinaria, 313 extraordinaria, 322 ordinaria):

```bash
node scripts/verificar-enlaces-murcia.mjs --solo-fichas   # 1. verifica el enlace de la ficha y el del JSON
node scripts/resolver-conflictos-murcia.mjs               # 2. enseña qué haría y el diff, sin escribir
node scripts/resolver-conflictos-murcia.mjs --aplicar     # 3. lo escribe en data/examenes-seo.json
node scripts/build-examenes-profiles.mjs && node --test tests/*.test.mjs
```

Regla: si el de la ficha pasa y el del JSON es otro archivo, la ficha lo conserva como examen y el del JSON va a
`enlace_oficial_resuelto`; si es solo una versión `-vN` del mismo archivo, se usa la del JSON; si el de la ficha falla
y el del JSON pasa, se sustituye; en cualquier otro caso no cambia nada y avisa.

## Añadir una materia nueva

1. Añádela a `data/murcia/pau2026_murcia.json` con sus enlaces (copia el formato de otra) y verifícalos.
2. Lee el PDF (`data/murcia/textos/<codigo>-ordinaria.txt`) y anota la composición en `data/murcia/composicion.json`
   (bloques, puntos, elecciones, material, tiempos), cada dato con `fuente` y una `cita` literal del texto
   (`tests/murcia-composicion.test.mjs` las comprueba). Lo que no consta: `null`.
3. En `data/examenes-seo.json`: una fuente nueva en `sources[]` (id `murcia-pau-2026-<slug>`, URL del examen) y una
   entrada en `entries[]` copiando una ficha de Murcia reciente. `prioridad` = siguiente número libre, `slug` igual al
   de Madrid si existe allí (así se enlazan entre comunidades), `source_ids` = `["murcia-pau-2026-general", "<tu fuente>"]`
   y `indexacion: "index"`. Escribe una intro original de 150-200 palabras con la estructura real.
4. En `scripts/examenes-taxonomia.mjs`: añade el slug a un grupo de `GROUPS` y una entrada en `RELATED` (2-3 materias
   relacionadas que existan en Murcia; si alguna no existe allí, usa `RELATED_OVERRIDES`).
5. Añade la URL al sitemap (sección siguiente), regenera y pasa los tests.

## Sitemap

`sitemap.xml` es un archivo estático que **se edita a mano**: no lo genera ningún script. Por cada ficha nueva añade
una línea con el formato de las demás:

```xml
<url><loc>https://miebau.es/examenes/region-de-murcia/<slug></loc><changefreq>yearly</changefreq><priority>0.6</priority></url>
```

`tests/sitemap.test.mjs` falla si hay una página indexable que no está en el sitemap, o una URL del sitemap sin página,
con la canónica distinta o `noindex`. Tras desplegar, reenvía el sitemap en Search Console.

### Si producción no coincide con el repo

Comprueba qué se está sirviendo de verdad (el sitemap en producción debe tener tantas `<loc>` como el del repo):

```bash
curl -sI https://miebau.es/sitemap.xml          # ¿server: cloudflare o netlify? ¿last-modified / age?
curl -s  https://miebau.es/sitemap.xml | grep -c '<loc>'
grep -c '<loc>' sitemap.xml
```

- `server: Netlify` o cabeceras `x-nf-*`: el dominio sigue apuntando a Netlify, cuyos despliegues de producción llevaban parados
  por falta de créditos (ver `CLAUDE.md`). Hay que repuntar el dominio al proyecto de Cloudflare Pages.
- `server: cloudflare`: en el panel de Cloudflare Pages comprueba **Settings → Builds → Production branch** (debe ser
  `main`), que el último despliegue de producción sea el último commit de `main`, y que el dominio personalizado esté
  asociado a ese proyecto. Después, purga la caché (Caching → Purge everything).
- Un PR en verde solo prueba que la vista previa se generó, no que el dominio sirva ese contenido.
