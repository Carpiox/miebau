# Miebau

**Miebau** es una web para estudiantes que se preparan para la **EvAU / EBAU** (Selectividad)
en España. Nace de la idea de que preparar la Selectividad no debería significar buscar
por 20 sitios distintos qué examen te toca, qué pondera tu carrera, o si aprobarás con
la nota que sacas en un simulacro.

El proyecto lo llevamos dos personas, a tiempo parcial, con la idea de hacerlo crecer
poco a poco: primero consolidando las herramientas gratuitas y el SEO, después
metiendo producto de pago, y más adelante una comunidad donde los propios estudiantes
compartan apuntes.

🔗 Producción: **https://miebau.es**
📦 Repo: `Carpiox/miebau`
🚀 Deploy: Netlify (autodeploy desde `main`, previews automáticos en cada PR)

---

## Qué hay ya hecho

- **Calculadora de nota de admisión** (`/calculadora`) — EvAU/EBAU, CFGS y Mayores de 25,
  con historial, comparación de simulaciones y resultado compartible por URL.
- **Ponderaciones oficiales** (`/ponderaciones` + fichas por universidad) — más de 8.000
  registros con fuente oficial, cobertura marcada como `verified` / `partial` / `pending`
  / `blocked` (nunca se rellenan huecos por "parecido" a otra universidad).
- **Buscador de exámenes por asignatura y comunidad** (`/examenes/[comunidad]/[asignatura]`)
  — páginas estáticas reales (no un filtro sin URL propia) pensadas para posicionar en
  Google por búsquedas de tipo "examen selectividad [asignatura] [comunidad] resuelto".

## Hacia dónde vamos

La hoja de ruta, de más cercana a más futura:

1. **Terminar el SEO de exámenes.** Completar las combinaciones asignatura × comunidad
   con contenido único y datos verificados, y arreglar el enlazado interno para que
   Google descubra las páginas nuevas sin depender solo del sitemap.
2. **Packs de pago por asignatura + comunidad** (lanzamiento ~3,99 €, precio normal
   ~4,95-4,99 €): preguntas de examen organizadas, simulacros y un análisis de qué
   contenido ha sido históricamente más frecuente (sin usar la palabra "predicción" —
   se habla de "relevancia histórica" o "contenido prioritario").
3. **Apuntes gratuitos.** Espacio para subir y compartir apuntes por asignatura, tanto
   nuestros como de la propia comunidad de estudiantes, como gancho de tráfico y
   confianza antes de la compra de un pack.
4. **Membresías.** Una vez haya suficiente producto (packs + apuntes + herramientas),
   una suscripción que dé acceso a todo en vez de comprarlo suelto por asignatura.

No hay fechas cerradas para estos puntos — se van desarrollando según el tiempo y los
datos (tráfico, indexación, qué compran los usuarios) lo permitan. Lo que sí es una
regla fija del proyecto: **nunca lanzar contenido que aparente ser más de lo que es**
(ni exámenes de mentira, ni ponderaciones inventadas, ni packs vacíos).

---

## Parte técnica

### Stack

- **HTML + CSS + JavaScript vanilla**, sin framework ni backend. No hay build step ni
  `package.json`: los `.html` que ves en el repo son los que se sirven tal cual.
- El único uso de Node es en `scripts/*.mjs`, generadores que se ejecutan a mano para
  producir/actualizar páginas HTML a partir de los JSON de datos (no corren en
  producción, son herramientas de desarrollo).
- Enrutado con `_redirects` (rewrites 200 de Netlify): una URL "limpia" como
  `/ponderaciones/uam` sirve el contenido de `ponderaciones/uam.html` sin cambiar la
  URL visible ni redirigir. Cada página fija su propia URL limpia como `canonical`.
- Migración a **Astro** para la capa de exámenes SEO: valorada/en curso, aún no
  aplicada al resto del sitio.

### Estructura del repo

```
├── index.html, calculadora.html, ponderaciones.html, examenes.html, ...  → páginas de nivel superior
├── examenes/<comunidad>/<asignatura>.html     → fichas de examen (SEO, una por combinación)
├── ponderaciones/<Universidad>/...            → fichas de ponderaciones por universidad
├── ponderaciones/<universidad>.html           → fichas de universidad individuales
├── data/
│   ├── ponderaciones-2026-2027.json           → dataset normalizado de ponderaciones
│   └── examenes-seo.json                      → dataset de las combinaciones asignatura+comunidad
├── scripts/
│   ├── build-ponderaciones-data.mjs           → valida/normaliza el JSON de ponderaciones
│   ├── build-ponderaciones-profiles.mjs       → genera/verifica las fichas HTML de universidad
│   ├── build-examenes-profiles.mjs            → genera las fichas HTML de examen
│   └── fixtures/                              → datos fuente de ejemplo para los generadores
├── js/                                        → lógica de cada página (calculadora, ponderaciones, exámenes, core)
├── css/style.css                              → única hoja de estilos del sitio
├── tests/*.test.mjs                           → pruebas con el test runner nativo de Node
├── reports/                                   → informes de cobertura/estado (ej. ponderaciones-coverage.md)
├── _redirects                                 → rewrites de rutas limpias
└── sitemap.xml, robots.txt                     → SEO técnico
```

### Cómo se generan las fichas

Las fichas de ponderaciones y de exámenes **no se escriben a mano una por una**: se
generan (o verifican) a partir del JSON en `data/` mediante los scripts en `scripts/`.
Si tocas un dato, el flujo correcto es:

1. Editar el JSON fuente correspondiente en `data/` (o su fixture en `scripts/fixtures/`).
2. Ejecutar el generador con Node, por ejemplo:
   ```bash
   node scripts/build-ponderaciones-profiles.mjs
   node scripts/build-examenes-profiles.mjs
   ```
3. Revisar el HTML generado y correr los tests antes de commitear.

No editar a mano el HTML generado si el dato viene de un JSON — se perdería en la
siguiente regeneración.

### Tests

```bash
node --test tests/*.test.mjs
```

Cubren: validación del fixture de ponderaciones, coherencia del generador de fichas,
SEO de las páginas de examen (títulos, canonicals, ausencia de contenido duplicado),
y el formulario de contacto.

### Desarrollo local

Al no haber build step, cualquier servidor de archivos estáticos sirve:

```bash
python -m http.server 8765
```

Luego abre `http://localhost:8765/index.html` (o la página que quieras probar).

### Deploy

Netlify despliega automáticamente `main` a producción y genera un *deploy preview*
por cada pull request. La configuración de rutas vive en `_redirects`; no hay
`netlify.toml` en el repo.

---

## Contexto para quien retome el proyecto (o para Claude Code)

Ver [`CLAUDE.md`](./CLAUDE.md) para las reglas de contenido SEO, el estado de
verificación de datos por comunidad, el flujo de trabajo con ramas/PRs y el
historial de qué se ha hecho en cada sesión.
