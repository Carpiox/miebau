# Guía de trabajo: fichas de `/examenes`

Contexto para quien (persona o Codex/Claude) vaya a completar las fichas de
`/examenes/<comunidad>/<asignatura>`. Aplica igual a Murcia y a Madrid.

**Proyecto:** MIEBAU.es, preparación de PAU/EvAU. HTML estático generado con scripts
Node, sin framework. Objetivo: SEO long-tail en `/examenes/<comunidad>/<asignatura>`.

## Estado de partida

Existen **30 fichas** (15 de Región de Murcia + 15 de Comunidad de Madrid) con
`estado_datos: "estructura_verificada"`. Siguen en `pendiente_de_verificar`:
`ponderaciones_2026_2027`, `num_convocatorias_disponibles` y `widget_embed_url`.
El generador y los tests están fijados a "exactamente 30 fichas y 32 fuentes".

Hay dos tipos de trabajo:

- **A. Completar las 30 fichas actuales** (enlaces oficiales, convocatorias, widget,
  reescritura de intro si cambia algún dato).
- **B. Añadir asignaturas nuevas** (p. ej. optativas). Exige tocar generador y tests
  (ver sección B).

## Dónde vive todo

- Datos: `data/examenes-seo.json` (`sources[]` y `entries[]`). Única fuente de verdad.
- Generador: `scripts/build-examenes-profiles.mjs` (escribe HTML, bloque de la home y
  sitemap).
- Taxonomía editorial: `scripts/examenes-taxonomia.mjs` (grupos y asignaturas
  relacionadas).
- Salida: `examenes/<comunidad>/<asignatura>.html` e índices `examenes/<comunidad>.html`.
  **No se editan a mano.**
- Tests: `tests/examenes-seo.test.mjs`, `tests/examenes-enlazado.test.mjs`.

## Estructura de cada entrada de `entries[]`

```json
{
  "prioridad": 30,
  "slug": "comunidad-de-madrid/griego-ii",
  "url": "/examenes/comunidad-de-madrid/griego-ii",
  "asignatura": "Griego II",
  "comunidad": "Comunidad de Madrid",
  "estado_datos": "estructura_verificada",
  "indexacion": "noindex",
  "seo": { "title": "...", "h1": "...", "meta_description": "..." },
  "contenido": {
    "intro": "150-200 palabras, texto único",
    "datos_comunidad_asignatura": {
      "curso_referencia": "PAU 2026",
      "duracion_minutos": 90,
      "modelo_examen_vigente": "...",
      "numero_ejercicios": "5 preguntas",
      "num_convocatorias_disponibles": "pendiente_de_verificar",
      "bloques_o_temario_destacado": ["Bloque (X puntos)", "..."],
      "notas_especificas": "...",
      "ponderaciones_2026_2027": "pendiente_de_verificar"
    }
  },
  "source_ids": ["<id-general-comunidad>", "<id-de-la-asignatura>"],
  "widget_embed_url": "pendiente_de_verificar",
  "cta_pack_slug": "/packs/<comunidad>/<asignatura>",
  "paginas_relacionadas": ["/examenes", "/ponderaciones#comunidades"],
  "enlace_oficial_examen": {
    "ordinaria": "https://...",
    "extraordinaria": "https://..."
  }
}
```

Cada fuente de `sources[]` lleva: `id`, `community`, `subject`, `period`,
`status: "verified"`, `sourceType`, `name`, `sourceUrl`, `scope`. Cada ficha tiene
exactamente 2 `source_ids`: la general de la comunidad y la de la asignatura.

## Reglas no negociables

1. **Cero datos inventados.** Sin documento oficial, el campo queda en
   `pendiente_de_verificar`. Nunca un valor plausible.
2. **Fuentes oficiales.** Los tests solo aceptan `um.es`, `carm.es` y `ucm.es`. Otro
   dominio exige ampliar el test de forma consciente.
3. **Intro única:** 150-200 palabras; ninguna frase repetida entre fichas ni ninguna
   secuencia de 10 palabras repetida. Describe la estructura real (bloques,
   puntuaciones, elecciones).
4. **Nada de `TODO`** en el JSON.
5. **Sin la palabra "predicción"**; usar "relevancia histórica" o "contenido prioritario".
6. **Widget de examenesdepau.com** solo dentro de una página con contenido propio.
7. **Ponderaciones** solo con tabla oficial verificada. Hoy el test exige
   `pendiente_de_verificar`; si se verifican, actualizar el test a propósito.
8. **Flujo:** editar JSON → ejecutar el generador → `node --test tests/*.test.mjs` →
   commit.

## Tandas de 10 en 10

1. Elegir 10 fichas (`prioridad` N a N+9) y localizar la fuente oficial de cada una.
2. Rellenar solo lo verificable: `enlace_oficial_examen` (ordinaria y extraordinaria),
   `num_convocatorias_disponibles` si hay recuento oficial, `widget_embed_url` si
   existe. Reescribir la intro si cambia algún dato.
3. Regenerar y pasar los tests.
4. Revisar el diff: solo deben cambiar las fichas de la tanda.
5. Commit y PR. Fusionar antes de empezar la siguiente tanda.

## B. Asignaturas nuevas (caso actual: ampliar Comunidad de Madrid)

Madrid tiene 15 fichas (prioridades 16-30). Faltan las asignaturas restantes de la
PAU de Madrid (en torno a 35, optativas incluidas). La lista exacta NO está en el
repo: hay que sacarla del listado oficial de modelos de examen PAU 2026 de las
universidades públicas madrileñas (ucm.es) y confirmarla antes de generar nada.

### Paso 0: preparar el generador (un único PR, antes de crear fichas)

Hoy el código asume exactamente 30 fichas. Hay que quitar esas suposiciones sin
aflojar el resto de validaciones:

- `scripts/build-examenes-profiles.mjs`, `validateData()`: los literales
  `sources.length === 32`, `entries.length === 30`, `prioridad <= 30` y
  "prioridades exactamente 1-30". Sustituir por comprobaciones derivadas de los datos
  (prioridades únicas, enteras, ≥ 1 y sin huecos).
- `renderLatestExamSection()`: `.slice(0, 30)`; decidir un tope razonable para
  "Últimos exámenes añadidos".
- `tests/examenes-seo.test.mjs`: test de "prioridades 1-30", `sources.length`, "las 30
  rutas en el sitemap" (pasar a recorrer todas las entradas), y cualquier otro
  literal numérico.
- `tests/examenes-enlazado.test.mjs`: comprobar que sigue válido con más fichas.
- `scripts/examenes-taxonomia.mjs`: el texto `intro` de `comunidad-de-madrid` dice
  "las 15 asignaturas troncales"; debe dejar de ser cifra fija y de decir "troncales"
  cuando entren optativas.
- Mantener intactas: `indexacion: "noindex"` requerido por el generador, fuente
  general de Madrid `madrid-pau-2026-modelos`, 2 `source_ids` por ficha, intros únicas,
  `ponderaciones`/`num_convocatorias` en `pendiente_de_verificar`.
- Si alguna fuente no está en `ucm.es`, `um.es` o `carm.es`, ampliar el regex de
  dominios de forma explícita (y avisar), no relajarlo.

### Por cada asignatura nueva (tandas de 10)

1. `sources[]`: nueva fuente oficial (id `madrid-pau-2026-<asignatura>`).
2. `entries[]`: nueva entrada con `prioridad` = siguiente número libre (31, 32, ...),
   mismo esquema que las existentes. Usar una ficha de Madrid ya existente como
   plantilla de forma y tono.
3. `scripts/examenes-taxonomia.mjs`: añadir el slug a un grupo de `GROUPS` (crear un
   grupo nuevo, p. ej. "Optativas", si no encaja) y una entrada en `RELATED` con 2-3
   asignaturas relacionadas y una frase propia. Sin esto el generador no puede
   enlazar la ficha.
4. Intro 150-200 palabras, escrita desde el documento oficial concreto de esa
   asignatura (bloques, puntuaciones, elecciones). Nunca una plantilla con palabras
   cambiadas.
5. Datos no verificables en `pendiente_de_verificar`. Si el documento oficial no
   permite rellenar con certeza `numero_ejercicios`, `modelo_examen_vigente` o
   `notas_especificas`, NO crear la ficha: anotarla como bloqueada y seguir.
6. Regenerar, pasar `node --test tests/*.test.mjs`, comprobar el diff (las fichas
   nuevas, sitemap, índice de Madrid y bloque de la home).

Nota para Murcia más adelante: las prioridades son globales. Quien amplíe Murcia debe
partir del último número usado tras mergear Madrid, y sus intros no pueden repetir
frases ni secuencias de 10 palabras de ninguna ficha ya publicada (Madrid incluido).

## Trabajo en paralelo (Murcia y Madrid)

- Una rama por persona y PRs pequeños de 10 en 10; merge/rebase de `main` antes de
  cada tanda.
- Murcia toca solo entradas `region-de-murcia/*`; Madrid solo `comunidad-de-madrid/*`.
- Los archivos generados no se resuelven a mano: ante conflicto, aceptar `main` y
  volver a ejecutar el generador.
- Los literales 30/32 (caso B, paso 0) los cambia una sola persona, primero. Mientras
  Madrid se amplía, Murcia no toca el generador ni los tests.
