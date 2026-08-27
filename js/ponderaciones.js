/*
 * Ponderaciones · catálogo estático y fichas informativas.
 * Los PDFs existentes siguen apuntando a archivos locales. Las universidades
 * privadas enlazan a fichas HTML estáticas sin inventar ponderaciones.
 */
(function (window, document) {
  'use strict';

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

  const PRIVATE_UNIVERSITIES = [
    { region: 'Andalucía', name: 'Universidad Loyola', mode: 'Presencial', profile: '/ponderaciones/universidad-loyola' },
    { region: 'Andalucía', name: 'UTAMED', mode: 'Online', profile: '/ponderaciones/utamed' },
    { region: 'Andalucía', name: 'Universidad CEU Fernando III', mode: 'Presencial', profile: '/ponderaciones/universidad-ceu-fernando-iii' },
    { region: 'Andalucía', name: 'Universidad Europea de Andalucía', mode: 'Presencial', profile: '/ponderaciones/universidad-europea-de-andalucia' },
    { region: 'Andalucía', name: 'Universidad Alfonso X el Sabio Mare Nostrum', mode: 'Presencial', profile: '/ponderaciones/universidad-alfonso-x-el-sabio-mare-nostrum' },
    { region: 'Aragón', name: 'Universidad San Jorge', mode: 'Presencial', profile: '/ponderaciones/universidad-san-jorge' },
    { region: 'Islas Canarias', name: 'Universidad Europea de Canarias', mode: 'Presencial', profile: '/ponderaciones/universidad-europea-de-canarias' },
    { region: 'Islas Canarias', name: 'Universidad Fernando Pessoa-Canarias', mode: 'Presencial', profile: '/ponderaciones/universidad-fernando-pessoa-canarias' },
    { region: 'Islas Canarias', name: 'Universidad del Atlántico Medio', mode: 'Presencial', profile: '/ponderaciones/universidad-del-atlantico-medio' },
    { region: 'Islas Canarias', name: 'Universidad de las Hespérides', mode: 'Online', profile: '/ponderaciones/universidad-de-las-hesperides' },
    { region: 'Cantabria', name: 'Universidad Europea del Atlántico', mode: 'Presencial', profile: '/ponderaciones/universidad-europea-del-atlantico' },
    { region: 'Castilla y León', name: 'Universidad Pontificia de Salamanca', mode: 'Presencial', profile: '/ponderaciones/universidad-pontificia-de-salamanca' },
    { region: 'Castilla y León', name: 'UCAV', mode: 'Presencial', profile: '/ponderaciones/ucav' },
    { region: 'Castilla y León', name: 'UEMC', mode: 'Presencial', profile: '/ponderaciones/uemc' },
    { region: 'Castilla y León', name: 'IE University', mode: 'Presencial', profile: '/ponderaciones/ie-university' },
    { region: 'Castilla y León', name: 'Universidad Internacional Isabel I de Castilla', mode: 'Online', profile: '/ponderaciones/universidad-internacional-isabel-i-de-castilla' },
    { region: 'Cataluña', name: 'Universidad Ramon Llull', mode: 'Presencial', profile: '/ponderaciones/universidad-ramon-llull' },
    { region: 'Cataluña', name: 'UOC', mode: 'Online', profile: '/ponderaciones/uoc' },
    { region: 'Cataluña', name: 'UIC Barcelona', mode: 'Presencial', profile: '/ponderaciones/uic-barcelona' },
    { region: 'Cataluña', name: 'UVic-UCC', mode: 'Presencial', profile: '/ponderaciones/uvic-ucc' },
    { region: 'Cataluña', name: 'Universitat Abat Oliba CEU', mode: 'Presencial', profile: '/ponderaciones/universitat-abat-oliba-ceu' },
    { region: 'Comunidad Valenciana', name: 'Universidad CEU Cardenal Herrera', mode: 'Presencial', profile: '/ponderaciones/universidad-ceu-cardenal-herrera' },
    { region: 'Comunidad Valenciana', name: 'Universidad Católica de Valencia San Vicente Mártir', mode: 'Presencial', profile: '/ponderaciones/universidad-catolica-de-valencia-san-vicente-martir' },
    { region: 'Comunidad Valenciana', name: 'VIU', mode: 'Online', profile: '/ponderaciones/viu' },
    { region: 'Comunidad Valenciana', name: 'Universidad Europea de Valencia', mode: 'Presencial', profile: '/ponderaciones/universidad-europea-de-valencia' },
    { region: 'Galicia', name: 'Universidad Intercontinental de la Empresa (UIE)', mode: 'Presencial', profile: '/ponderaciones/universidad-intercontinental-de-la-empresa' },
    { region: 'La Rioja', name: 'UNIR', mode: 'Online', profile: '/ponderaciones/unir' },
    { region: 'Comunidad de Madrid', name: 'Universidad Pontificia Comillas', mode: 'Presencial', profile: '/ponderaciones/universidad-pontificia-comillas' },
    { region: 'Comunidad de Madrid', name: 'UAX', mode: 'Presencial', profile: '/ponderaciones/uax' },
    { region: 'Comunidad de Madrid', name: 'Universidad CEU San Pablo', mode: 'Presencial', profile: '/ponderaciones/universidad-ceu-san-pablo' },
    { region: 'Comunidad de Madrid', name: 'UFV', mode: 'Presencial', profile: '/ponderaciones/ufv' },
    { region: 'Comunidad de Madrid', name: 'Universidad Nebrija', mode: 'Presencial', profile: '/ponderaciones/universidad-nebrija' },
    { region: 'Comunidad de Madrid', name: 'Universidad Europea de Madrid', mode: 'Presencial', profile: '/ponderaciones/universidad-europea-de-madrid' },
    { region: 'Comunidad de Madrid', name: 'UCJC', mode: 'Presencial', profile: '/ponderaciones/ucjc' },
    { region: 'Comunidad de Madrid', name: 'UDIMA', mode: 'Online', profile: '/ponderaciones/udima' },
    { region: 'Comunidad de Madrid', name: 'Universidad Eclesiástica San Dámaso', mode: 'Presencial', profile: '/ponderaciones/universidad-eclesiastica-san-damaso' },
    { region: 'Comunidad de Madrid', name: 'ESIC Universidad', mode: 'Presencial', profile: '/ponderaciones/esic-universidad' },
    { region: 'Comunidad de Madrid', name: 'Universidad Villanueva', mode: 'Presencial', profile: '/ponderaciones/universidad-villanueva' },
    { region: 'Comunidad de Madrid', name: 'CUNEF Universidad', mode: 'Presencial', profile: '/ponderaciones/cunef-universidad' },
    { region: 'Comunidad de Madrid', name: 'UNIE', mode: 'Presencial', profile: '/ponderaciones/unie' },
    { region: 'Comunidad de Madrid', name: 'UDIT', mode: 'Presencial', profile: '/ponderaciones/udit' },
    { region: 'Región de Murcia', name: 'UCAM', mode: 'Presencial', profile: '/ponderaciones/ucam' },
    { region: 'Navarra', name: 'Universidad de Navarra', mode: 'Presencial', profile: '/ponderaciones/universidad-de-navarra' },
    { region: 'País Vasco', name: 'Universidad de Deusto', mode: 'Presencial', profile: '/ponderaciones/universidad-de-deusto' },
    { region: 'País Vasco', name: 'Mondragon Unibertsitatea', mode: 'Presencial', profile: '/ponderaciones/mondragon-unibertsitatea' },
    { region: 'País Vasco', name: 'EUNEIZ', mode: 'Presencial', profile: '/ponderaciones/euneiz' }
  ];

  const CATALOG = DOCUMENTS.concat(PRIVATE_UNIVERSITIES).sort((a, b) => {
    const regionOrder = a.region.localeCompare(b.region, 'es');
    return regionOrder || a.name.localeCompare(b.name, 'es');
  });
  const $ = (id) => document.getElementById(id);
  const regions = [...new Set(CATALOG.map((documentItem) => documentItem.region))];

  function populateRegions() {
    regions.forEach((region) => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      $('regionFilter').appendChild(option);
    });
  }

  function filteredDocuments() {
    const region = $('regionFilter').value;
    const search = $('universitySearch').value.trim().toLocaleLowerCase('es');
    return CATALOG.filter((documentItem) => (!region || documentItem.region === region) && (!search || (documentItem.name + ' ' + documentItem.region).toLocaleLowerCase('es').includes(search)));
  }

  function createDocumentCard(documentItem) {
    const card = document.createElement('article');
    card.className = 'pdf-card' + (!documentItem.pdf && !documentItem.profile ? ' pdf-card-pending' : '');
    const mode = documentItem.mode ? 'Universidad privada · ' + documentItem.mode : documentItem.city;
    card.innerHTML = '<div class="pdf-card-heading"><span class="pdf-icon" aria-hidden="true">◈</span><span class="eyebrow">' + documentItem.region + '</span></div><div class="uni-name">' + documentItem.name + '</div><div class="uni-city">' + mode + '</div>';

    if (documentItem.profile) {
      const link = document.createElement('a');
      link.href = documentItem.profile;
      link.textContent = 'Ver ficha informativa →';
      card.appendChild(link);
    } else if (documentItem.pdf) {
      const link = document.createElement('a');
      link.href = documentItem.pdf;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Abrir documento PDF →';
      card.appendChild(link);
    } else {
      const pending = document.createElement('span');
      pending.className = 'pending-link';
      pending.textContent = 'Documento pendiente de conectar';
      card.appendChild(pending);
    }
    return card;
  }

  function appendDocumentCards(container, documents) {
    documents.forEach((documentItem) => container.appendChild(createDocumentCard(documentItem)));
  }

  function createDocumentGroup(title, documents) {
    const section = document.createElement('section');
    section.className = 'university-group';

    const heading = document.createElement('h3');
    heading.textContent = title;
    section.appendChild(heading);

    if (documents.length) {
      const groupGrid = document.createElement('div');
      groupGrid.className = 'pdf-grid';
      appendDocumentCards(groupGrid, documents);
      section.appendChild(groupGrid);
    } else {
      const empty = document.createElement('p');
      empty.className = 'university-group-empty';
      empty.textContent = 'No hay resultados en esta sección.';
      section.appendChild(empty);
    }
    return section;
  }

  function render() {
    const documents = filteredDocuments();
    const pdfCount = documents.filter((documentItem) => documentItem.pdf).length;
    const profileCount = documents.filter((documentItem) => documentItem.profile).length;
    const selectedRegion = $('regionFilter').value;
    $('ponderacionesCount').textContent = documents.length + (documents.length === 1 ? ' recurso' : ' recursos');
    $('documentBadge').textContent = pdfCount + ' PDFs · ' + profileCount + ' fichas';

    const grid = $('pdfGrid');
    grid.replaceChildren();
    grid.classList.toggle('pdf-grid-grouped', Boolean(selectedRegion));

    if (selectedRegion) {
      const publicDocuments = documents.filter((documentItem) => Object.prototype.hasOwnProperty.call(documentItem, 'pdf'));
      const privateUniversities = documents.filter((documentItem) => Object.prototype.hasOwnProperty.call(documentItem, 'mode'));
      grid.appendChild(createDocumentGroup('Universidades públicas', publicDocuments));
      grid.appendChild(createDocumentGroup('Universidades privadas', privateUniversities));
      return;
    }

    appendDocumentCards(grid, documents);
  }

  populateRegions();
  $('regionFilter').addEventListener('change', render);
  $('universitySearch').addEventListener('input', render);
  render();
}(window, document));
