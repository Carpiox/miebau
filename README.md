# Miebau

**Miebau** es un sitio de recursos para estudiantes que preparan la **EvAU / EBAU**
(Selectividad) en España: calculadora de nota de admisión, ponderaciones oficiales por
universidad, un buscador de exámenes oficiales por asignatura y comunidad autónoma, y
notas de corte verificadas por universidad y grado.

- 🔗 Producción: **https://miebau.es**
- 📦 Repositorio: [`Carpiox/miebau`](https://github.com/Carpiox/miebau)
- 🚀 Deploy: **Cloudflare Pages** (autodeploy desde `main`)

---

## Stack técnico

El sitio es **HTML + CSS + JavaScript vanilla, sin framework ni backend**:

- No hay `package.json` ni paso de build. Los `.html` que ves en el repo son
  exactamente los que se sirven en producción.
- El único uso de Node es en `scripts/*.mjs` (ESM): generadores de línea de comandos
  que se ejecutan a mano en desarrollo para producir o verificar páginas HTML a partir
  de los JSON de `data/`. No corren en producción — su salida se commitea como
  cualquier otro archivo estático.
- Los tests usan el **test runner nativo de Node** (`node --test`), sin Jest ni
  ninguna otra dependencia de testing.
- Sin librerías de frontend: cada página tiene su propio `<script>` (o los comparte
  vía un pequeño loader dinámico en `js/site.js`), manipulando el DOM directamente.
- **Service worker** propio (`sw.js`) con estrategia *stale-while-revalidate* y
  versionado de caché, más un `manifest.webmanifest` (PWA instalable).

## Arquitectura: páginas generadas a partir de datos

Las fichas de ponderaciones, exámenes y notas de corte **no se escriben a mano una por
una**: se generan (y se verifican) a partir de un JSON normalizado en `data/`, mediante
scripts en `scripts/` que siguen todos el mismo patrón:

```bash
node scripts/build-XXX.mjs          # escribe/regenera el HTML a partir del JSON
node scripts/build-XXX.mjs --check  # falla si el HTML commiteado no coincide con el JSON (usado en CI/tests)
```

| Script | Qué genera |
|---|---|
| `build-ponderaciones-data.mjs` | Valida y normaliza el dataset fuente de ponderaciones antes de publicarlo. |
| `build-ponderaciones-profiles.mjs` | Genera las 82 fichas de `/ponderaciones/<universidad>` (tabla completa para las que tienen datos verificados, aviso "avísame" para las que no) y el bloque "Últimas ponderaciones publicadas" del hub. |
| `build-ponderaciones-directory.mjs` | Genera el directorio de universidades agrupadas por comunidad autónoma dentro de `ponderaciones.html`, como HTML estático real (no depende de que se ejecute JavaScript). |
| `build-examenes-profiles.mjs` | Genera las 30 fichas de `/examenes/<comunidad>/<asignatura>` y su enlazado interno cruzado ("Sigue explorando exámenes"). |
| `build-notas-corte-profiles.mjs` | Genera las 68 fichas de `/notas-de-corte/<grado>-<universidad>`, el bloque "Últimas notas de corte publicadas" y el badge de cobertura del hub. |
| `build-nav-footer.mjs` | Fuente única del `<nav>`/`<footer>` del sitio; los demás generadores lo importan para que las 197 páginas compartan exactamente el mismo HTML estático. |

Cada bloque generado vive entre marcadores HTML (`<!-- xxx:generated:start -->` /
`:end`), así que se puede regenerar sin tocar el resto de la página a mano. Si tocas un
dato, el flujo correcto es: editar el JSON en `data/` → ejecutar el generador
correspondiente → revisar el diff → correr los tests.

### Estructura del repo

```
├── index.html, calculadora.html, ponderaciones.html, examenes.html, ...  → páginas de nivel superior (17)
├── examenes/<comunidad>/<asignatura>.html      → 30 fichas de examen, generadas
├── ponderaciones/<universidad>.html            → 82 fichas de universidad, generadas
├── notas-de-corte/<grado>-<universidad>.html   → 68 fichas de nota de corte, generadas
├── data/
│   ├── ponderaciones-2026-2027.json            → dataset de ponderaciones (universidades, datasets, fuentes)
│   ├── examenes-seo.json                       → dataset de exámenes por comunidad+asignatura
│   └── notas-corte-2026.json                   → dataset de notas de corte por grado
├── scripts/*.mjs                               → generadores (ver tabla arriba) + scripts/fixtures/
├── js/                                         → lógica de cada página (calculadora, ponderaciones, exámenes, notas de corte, forms, seo, site)
├── css/style.css                               → única hoja de estilos del sitio
├── tests/*.test.mjs                            → pruebas con el test runner nativo de Node
├── _redirects                                  → reescrituras de rutas limpias para Cloudflare Pages
└── sitemap.xml, robots.txt                     → SEO técnico
```

## Funcionalidades clave

- **Calculadora de nota de admisión** (`/calculadora`) — modos EvAU/EBAU, CFGS y
  Mayores de 25 años, con historial y simulaciones guardadas en `localStorage` y
  resultado compartible codificado en la URL (sin backend).
- **Ponderaciones oficiales** (`/ponderaciones`) — **82 universidades** (36 públicas y
  46 privadas) de **17 comunidades autónomas**, con **912 titulaciones** y **8.397
  pares materia-coeficiente** verificados en **4 datasets** con **23 fuentes**
  oficiales citadas. Cada universidad marca su cobertura como `verified`, `partial`,
  `pending` o `blocked` — nunca se completa un hueco por parecido con otra
  universidad.
- **Buscador de exámenes oficiales** (`/examenes`) — **30 fichas** reales
  (15 asignaturas troncales × 2 comunidades: Región de Murcia y Comunidad de Madrid),
  cada una con estructura de examen verificada y enlazado cruzado a exámenes de la
  misma asignatura en otras comunidades.
- **Notas de corte** (`/notas-de-corte`) — **68 grados** de la Universidad de Murcia
  (curso 2025-2026), con fuente oficial citada por entrada y aviso explícito cuando el
  cupo corresponde a segunda plaza o admisión no prioritaria de FP.
- **Formularios** (contacto, newsletter, aviso de ponderaciones) enviados vía
  **Web3Forms** (`js/forms.js`), con honeypot anti-spam y confirmación en pantalla sin
  recargar la página.

## SEO técnico

- **JSON-LD** por tipo de página: `BreadcrumbList` en todas las fichas,
  `FAQPage`/`Question`/`Answer` en ponderaciones y notas de corte,
  `WebApplication` en la calculadora, `Organization`/`EducationalOrganization` en la
  portada.
- **`sitemap.xml`** (194 URLs) y `robots.txt` mantenidos junto al contenido; los tests
  de cada sección (`examenes-seo`, `ponderaciones`, `notas-de-corte`) verifican que
  cada URL nueva aparece exactamente una vez en el sitemap y que su ficha estática
  existe de verdad.
- **Nav y footer servidos como HTML estático real** en las 197 páginas (generados por
  `build-nav-footer.mjs`): antes se inyectaban vacíos y se rellenaban con JavaScript en
  el navegador, invisibles para cualquier crawler que no ejecute JS. Mismo arreglo
  aplicado al directorio de universidades por comunidad de `/ponderaciones`
  (`build-ponderaciones-directory.mjs`) — ambos eran la causa de páginas huérfanas
  detectadas por una auditoría de enlazado interno.
- **`_redirects`** vacío intencionadamente: Cloudflare Pages ya sirve cualquier
  `archivo.html` en su ruta sin extensión de forma nativa (y redirige en sentido
  contrario), así que no lleva las reglas de rewrite que sí hacían falta en Netlify.

## Desarrollo local

No hay dependencias que instalar (no hay `package.json`). Basta con:

```bash
git clone https://github.com/Carpiox/miebau.git
cd miebau
python3 -m http.server 8000   # o cualquier servidor de archivos estáticos
```

Y abrir `http://localhost:8000/index.html` (las URLs limpias tipo `/ponderaciones/uam`
solo las resuelve Cloudflare Pages en producción; en local se sirven con su nombre de
archivo, p. ej. `ponderaciones/uam.html`).

### Scripts disponibles

```bash
# Regenerar/verificar fichas a partir de los JSON de data/
node scripts/build-ponderaciones-data.mjs [--check]
node scripts/build-ponderaciones-profiles.mjs [--check]
node scripts/build-ponderaciones-directory.mjs [--check]
node scripts/build-examenes-profiles.mjs [--check]
node scripts/build-notas-corte-profiles.mjs [--check]
node scripts/build-nav-footer.mjs [--check]

# Suite de tests completa
node --test tests/*.test.mjs
```

Los tests cubren: validación de los datasets, que el HTML generado coincida con el
JSON fuente (modo `--check` de cada generador), SEO de cada tipo de ficha (títulos,
canonicals, JSON-LD, ausencia de contenido duplicado o inventado), el envío de
formularios, y la consistencia del nav/footer estático en las 197 páginas.

## Despliegue

**Cloudflare Pages**, con autodeploy en cada push a `main`:

- Framework preset: `None`
- Build command: *(vacío)* — no hay paso de build
- Root directory / Build output directory: `/`

El proyecto vivió antes en Netlify; la migración fue por el límite de créditos de
despliegue del plan gratuito, no por ninguna limitación técnica de Netlify en sí.

## Roadmap

1. **Terminar el SEO de exámenes**: ampliar las combinaciones asignatura × comunidad
   con contenido único y datos verificados (hoy solo Región de Murcia y Comunidad de
   Madrid).
2. **Packs de pago** por asignatura y comunidad: preguntas de examen organizadas,
   simulacros y análisis de qué contenido ha sido históricamente más frecuente.
3. **Apuntes gratuitos** compartidos por la propia comunidad de estudiantes.
4. **Membresías**: acceso conjunto a packs + apuntes + herramientas en vez de comprarlo
   suelto.

Regla fija del proyecto en todos estos pasos: **nunca publicar como verificado un dato
que no lo esté** (ni ponderaciones, ni estructura de examen, ni notas de corte).

---

Para el contexto completo de decisiones de producto, reglas de contenido SEO y el
historial sesión a sesión del desarrollo, ver [`CLAUDE.md`](./CLAUDE.md).
