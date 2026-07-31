/*
 * Notas de corte · módulo de presentación preparado para datos futuros.
 *
 * Contrato esperado para conectar una fuente más adelante:
 * { grado, universidad, comunidad, nota, curso, turno }
 * Este módulo trabaja con un array local vacío para no inventar datos ni
 * realizar scraping o peticiones externas.
 */
(function (window, document) {
  'use strict';

  const DATA = Array.isArray(window.MIEBAU_CUTOFF_DATA) ? window.MIEBAU_CUTOFF_DATA : [];
  const $ = (id) => document.getElementById(id);

  function filteredData() {
    const degree = $('degreeFilter').value.trim().toLocaleLowerCase('es');
    const university = $('universityFilter').value.trim().toLocaleLowerCase('es');
    const community = $('communityFilter').value;
    const sort = $('cutoffSort').value;
    return DATA.filter((item) => {
      const matchesDegree = !degree || String(item.grado || '').toLocaleLowerCase('es').includes(degree);
      const matchesUniversity = !university || String(item.universidad || '').toLocaleLowerCase('es').includes(university);
      return matchesDegree && matchesUniversity && (!community || item.comunidad === community);
    }).sort((a, b) => {
      if (sort === 'name') return String(a.grado).localeCompare(String(b.grado), 'es');
      return sort === 'note-asc' ? Number(a.nota) - Number(b.nota) : Number(b.nota) - Number(a.nota);
    });
  }

  function render() {
    const results = filteredData();
    const container = $('cutoffResults');
    $('cutoffCount').textContent = results.length + (results.length === 1 ? ' resultado' : ' resultados');
    container.replaceChildren();
    if (!results.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon" aria-hidden="true">◌</div><strong>' + (DATA.length ? 'No hay coincidencias' : 'Todavía no hay datos conectados') + '</strong><p>' + (DATA.length ? 'Prueba a cambiar los filtros.' : 'Cuando exista una fuente oficial, este listado podrá recibirla sin cambiar la experiencia de usuario.') + '</p></div>';
      return;
    }
    results.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'cutoff-card';
      card.innerHTML = '<div class="cutoff-card-top"><span class="eyebrow">' + (item.curso || 'Curso pendiente') + '</span><strong>' + Number(item.nota).toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + '</strong></div><h3>' + item.grado + '</h3><p>' + item.universidad + ' · ' + item.comunidad + '</p>';
      container.appendChild(card);
    });
  }

  $('applyCutoffFilters').addEventListener('click', render);
  $('resetCutoffFilters').addEventListener('click', () => {
    $('degreeFilter').value = ''; $('universityFilter').value = ''; $('communityFilter').value = ''; $('cutoffSort').value = 'note-desc'; render();
  });
  ['degreeFilter', 'universityFilter'].forEach((id) => $(id).addEventListener('keydown', (event) => { if (event.key === 'Enter') render(); }));
  render();
}(window, document));
