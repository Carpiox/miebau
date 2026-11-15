/*
 * Notas de corte · filtro y orden sobre la tabla estática del hub.
 *
 * La tabla (#cutoffTable) la genera scripts/build-notas-corte-profiles.mjs a
 * partir de data/notas-corte-2026.json y ya está en el HTML servido, de modo que
 * se lee sin JavaScript. Este script solo oculta filas que no coinciden con los
 * filtros y reordena las visibles; nunca crea ni modifica datos.
 */
(function (window, document) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const body = $('cutoffBody');
  if (!body) return;
  const rows = Array.from(body.querySelectorAll('tr'));
  const lower = (value) => String(value || '').toLocaleLowerCase('es');

  function apply() {
    const degree = lower($('degreeFilter').value.trim());
    const university = lower($('universityFilter').value.trim());
    const community = $('communityFilter').value;
    const sort = $('cutoffSort').value;

    const visible = rows.filter((row) => {
      const match = (!degree || lower(row.dataset.grado).includes(degree))
        && (!university || lower(row.dataset.universidad).includes(university))
        && (!community || row.dataset.comunidad === community);
      row.hidden = !match;
      return match;
    });

    visible.sort((a, b) => {
      if (sort === 'name') return a.dataset.grado.localeCompare(b.dataset.grado, 'es');
      return sort === 'note-asc' ? Number(a.dataset.nota) - Number(b.dataset.nota) : Number(b.dataset.nota) - Number(a.dataset.nota);
    });
    visible.forEach((row) => body.appendChild(row));

    $('cutoffCount').textContent = visible.length + (visible.length === 1 ? ' resultado' : ' resultados');
    $('cutoffEmpty').hidden = visible.length > 0;
  }

  $('applyCutoffFilters').addEventListener('click', apply);
  $('resetCutoffFilters').addEventListener('click', () => {
    $('degreeFilter').value = '';
    $('universityFilter').value = '';
    $('communityFilter').value = '';
    $('cutoffSort').value = 'note-desc';
    apply();
  });
  ['degreeFilter', 'universityFilter'].forEach((id) => $(id).addEventListener('keydown', (event) => { if (event.key === 'Enter') apply(); }));
  ['communityFilter', 'cutoffSort'].forEach((id) => $(id).addEventListener('change', apply));
}(window, document));
