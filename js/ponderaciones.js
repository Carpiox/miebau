/*
 * Ponderaciones · catálogo estático y contrato futuro.
 * No se consulta ninguna URL: `pdf` siempre apunta a un archivo local del
 * proyecto o queda a null para indicar que falta una fuente oficial.
 */
(function (window, document) {
  'use strict';

  // Contrato futuro por grado: { comunidad, universidad, grado, materia, coeficiente, curso }.
  const DOCUMENTS = [
    { region: 'Andalucía', name: 'Ponderaciones de Andalucía', city: 'Comunidad autónoma', pdf: null },
    { region: 'Aragón', name: 'Ponderaciones de Aragón', city: 'Comunidad autónoma', pdf: '/ponderaciones/Aragon/Aragon.pdf' },
    { region: 'Asturias', name: 'Ponderaciones de Asturias', city: 'Comunidad autónoma', pdf: '/ponderaciones/Asturias/Asturias.pdf' },
    { region: 'Cantabria', name: 'Estudios de Grado y Ponderaciones 2024-25', city: 'Universidad de Cantabria', pdf: '/ponderaciones/Cantabria/Estudios de Grado y Ponderaciones 2024-25.pdf' },
    { region: 'Castilla-La Mancha', name: 'Ponderaciones de Castilla-La Mancha', city: 'Comunidad autónoma', pdf: '/ponderaciones/Castilla_la_macha/Castilla_la_manta.pdf' },
    { region: 'Castilla y León', name: 'Universidad de Burgos', city: 'Burgos', pdf: '/ponderaciones/Castilla_y_leon/UBU_-_Universidad_de_Burgos.pdf' },
    { region: 'Castilla y León', name: 'Universidad de León', city: 'León', pdf: '/ponderaciones/Castilla_y_leon/ULE_-_Universidad_de_León.pdf' },
    { region: 'Castilla y León', name: 'Universidad de Salamanca', city: 'Salamanca', pdf: '/ponderaciones/Castilla_y_leon/USAL_-_Universidad_de_Salamanca.pdf' },
    { region: 'Castilla y León', name: 'Universidad de Valladolid', city: 'Valladolid', pdf: '/ponderaciones/Castilla_y_leon/UVA_-_Universidad_de_Valladolid.pdf' },
    { region: 'Cataluña', name: 'Ponderaciones de Cataluña', city: 'Comunidad autónoma', pdf: '/ponderaciones/Catalunya/Catalunya.pdf' },
    { region: 'Comunidad Valenciana', name: 'Ponderaciones de la Comunidad Valenciana', city: 'Comunidad autónoma', pdf: '/ponderaciones/Comunidad_Valenciana/Comunidad_Valenciana.pdf' },
    { region: 'Extremadura', name: 'Ponderaciones de Extremadura', city: 'Comunidad autónoma', pdf: '/ponderaciones/Extremadura/Extremadura.pdf' },
    { region: 'Galicia', name: 'Ponderaciones de Galicia', city: 'Comunidad autónoma', pdf: '/ponderaciones/Galicia/Galicia.pdf' },
    { region: 'Islas Baleares', name: 'Ponderaciones de las Islas Baleares', city: 'Comunidad autónoma', pdf: '/ponderaciones/Islas_Baleares/Islas_Baleares.pdf' },
    { region: 'Islas Canarias', name: 'Ponderaciones de las Islas Canarias', city: 'Comunidad autónoma', pdf: '/ponderaciones/Islas_Canarias/Islas_Canarias.pdf' },
    { region: 'La Rioja', name: 'Ponderaciones de La Rioja', city: 'Comunidad autónoma', pdf: '/ponderaciones/La_Rioja/La_Rioja.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad de Alcalá', city: 'Madrid', pdf: '/ponderaciones/Madrid/UAH_-_Universidad_de_Alcalá.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad Autónoma de Madrid', city: 'Madrid', pdf: '/ponderaciones/Madrid/UAM_-_Universidad_Autónoma_de _Madrid.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad Carlos III de Madrid', city: 'Madrid', pdf: '/ponderaciones/Madrid/UC3M _-_Universidad_Carlos_III_de_Madrid.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad Complutense de Madrid', city: 'Madrid', pdf: '/ponderaciones/Madrid/UCM_-_Universidad_Complutense_de_Madrid.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad Politécnica de Madrid', city: 'Madrid', pdf: '/ponderaciones/Madrid/UPM_-_Universidad_Politécnica_de_Madrid.pdf' },
    { region: 'Comunidad de Madrid', name: 'Universidad Rey Juan Carlos', city: 'Madrid', pdf: '/ponderaciones/Madrid/URJC_-_Universidad_Rey_Juan_Carlos.pdf' },
    { region: 'Región de Murcia', name: 'Universidad de Murcia', city: 'Murcia', pdf: '/ponderaciones/Murcia/UM_-_Universidad_de_Murcia.pdf' },
    { region: 'Región de Murcia', name: 'Universidad Politécnica de Cartagena', city: 'Cartagena', pdf: '/ponderaciones/Murcia/UPCT_-_Universidad_Politécnica_de_Cartagena2025.pdf' },
    { region: 'Navarra', name: 'Ponderaciones de Navarra', city: 'Comunidad autónoma', pdf: '/ponderaciones/Navarra/Navarra.pdf' },
    { region: 'País Vasco', name: 'Ponderaciones del País Vasco', city: 'Comunidad autónoma', pdf: null }
  ];

  const $ = (id) => document.getElementById(id);
  const regions = [...new Set(DOCUMENTS.map((documentItem) => documentItem.region))].sort((a, b) => a.localeCompare(b, 'es'));

  function populateRegions() {
    regions.forEach((region) => {
      const option = document.createElement('option'); option.value = region; option.textContent = region; $('regionFilter').appendChild(option);
    });
  }

  function filteredDocuments() {
    const region = $('regionFilter').value;
    const search = $('universitySearch').value.trim().toLocaleLowerCase('es');
    return DOCUMENTS.filter((documentItem) => (!region || documentItem.region === region) && (!search || (documentItem.name + ' ' + documentItem.city).toLocaleLowerCase('es').includes(search)));
  }

  function render() {
    const documents = filteredDocuments();
    $('ponderacionesCount').textContent = documents.length + (documents.length === 1 ? ' documento' : ' documentos');
    $('documentBadge').textContent = documents.filter((documentItem) => documentItem.pdf).length + ' disponibles';
    const grid = $('pdfGrid'); grid.replaceChildren();
    documents.forEach((documentItem) => {
      const card = document.createElement('article'); card.className = 'pdf-card' + (documentItem.pdf ? '' : ' pdf-card-pending');
      card.innerHTML = '<div class="pdf-card-heading"><span class="pdf-icon" aria-hidden="true">▤</span><span class="eyebrow">' + documentItem.region + '</span></div><div class="uni-name">' + documentItem.name + '</div><div class="uni-city">' + documentItem.city + '</div>';
      if (documentItem.pdf) {
        const link = document.createElement('a'); link.href = documentItem.pdf; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Abrir documento PDF →'; card.appendChild(link);
      } else {
        const pending = document.createElement('span'); pending.className = 'pending-link'; pending.textContent = 'Documento pendiente de conectar'; card.appendChild(pending);
      }
      grid.appendChild(card);
    });
  }

  populateRegions();
  $('regionFilter').addEventListener('change', render);
  $('universitySearch').addEventListener('input', render);
  render();
}(window, document));
