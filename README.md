# Miebau · frontend estático

Miebau es una web estática en HTML, CSS y JavaScript vanilla. Las herramientas funcionan completamente en el navegador: no hay backend, endpoints, APIs ni scraping.

## Calculadora

`calculadora.html` usa `js/calculadora.js` y ofrece:

- wizard de tres pasos con indicador de progreso;
- modos EvAU / EBAU, CFGS y Mayores de 25;
- objetivo de nota con progreso y mensajes motivadores;
- calculadora inversa para estimar la nota necesaria;
- guardado del borrador, historial y comparación de hasta tres simulaciones en `localStorage`;
- compartir resultado mediante URL con datos en el hash, copiar nota, copiar enlace y descargar una tarjeta PNG con canvas.

La URL compartida no necesita servidor: contiene una simulación codificada en `#sim=...` y se puede abrir directamente en otra sesión del navegador.

## Componentes reutilizables

`js/miebau-core.js` centraliza almacenamiento local, formato de notas, copiado, avisos toast, banners Premium y avisos de futuras conexiones de datos. Cualquier página puede reutilizarlos con:

```html
<script src="/js/miebau-core.js" defer></script>
<div data-premium-banner></div>
<section data-future-feature>Contenido preparado para una fuente futura.</section>
```

## Datos futuros

- `notas-de-corte.html` + `js/notas-de-corte.js` define el contrato `{ grado, universidad, comunidad, nota, curso, turno }` y renderiza un estado vacío hasta que exista una fuente oficial.
- `ponderaciones.html` + `js/ponderaciones.js` usa un catálogo local de PDFs y deja comunidades pendientes señaladas. El contrato futuro por grado es `{ comunidad, universidad, grado, materia, coeficiente, curso }`.

Para conectar datos más adelante basta con alimentar esos contratos y conservar las funciones de filtrado/renderizado; no es necesario cambiar la experiencia de usuario.

## Desarrollo local

Al ser una web estática, se puede servir la carpeta con cualquier servidor de archivos estáticos. Por ejemplo:

```powershell
python -m http.server 8765
```

Después, abre `http://localhost:8765/calculadora.html`.
