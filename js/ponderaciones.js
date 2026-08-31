/*
 * Ponderaciones · fuentes oficiales y fichas informativas.
 * Actualizado en agosto de 2026 con enlaces de fuentes oficiales verificadas.
 * Las URL institucionales pueden cambiar y deben revisarse periódicamente.
 * Las universidades privadas enlazan a fichas HTML estáticas sin inventar
 * ponderaciones.
 */
(function (window, document) {
  'use strict';

  const DOCUMENTS = [
    { region: 'Andalucía', name: 'Ponderaciones de Andalucía 2026-2027', city: 'Distrito Único Universitario de Andalucía', pdf: 'https://www.juntadeandalucia.es/economiaconocimientoempresasyuniversidad/sguit/?q=mapa' },
    { region: 'Aragón', name: 'Ponderaciones de Aragón 2026-2027', city: 'Universidad de Zaragoza', pdf: 'https://academico.unizar.es/acceso-admision-grado/ponder' },
    { region: 'Asturias', name: 'Ponderaciones de Asturias 2026-2027', city: 'Universidad de Oviedo', pdf: 'https://www.uniovi.es/documents/39158/13774579/PONDERACIONES.pdf' },
    { region: 'Cantabria', name: 'Estudios de Grado y Ponderaciones 2026-2027', city: 'Universidad de Cantabria', pdf: 'https://web.unican.es/admision/Documents/Acceso/Estudios%20de%20Grado%20y%20Ponderaciones%202026-27.pdf' },
    { region: 'Castilla-La Mancha', name: 'Ponderaciones de Castilla-La Mancha 2026-2027', city: 'Universidad de Castilla-La Mancha', pdf: 'https://soporte.uclm.es/hc/es/articles/11225019713298' },
    { region: 'Castilla y León', name: 'Ponderaciones de Castilla y León 2026-2027', city: 'Distrito único universitario', pdf: 'https://www.educa.jcyl.es/universidad/es/servicio-ensenanza-universitaria/admision-ensenanzas-universitarias-oficiales-grado-universi/parametros-ponderacion-curso-2026-2027' },
    { region: 'Cataluña', name: 'Ponderaciones de Cataluña 2026-2027', city: 'Consell Interuniversitari de Catalunya', pdf: 'https://universitats.gencat.cat/es/preinscripcions/ponderacions/index.html' },
    { region: 'Comunidad Valenciana', name: 'Ponderaciones de la Comunidad Valenciana 2026-2027', city: 'Generalitat Valenciana', pdf: 'https://universitats.gva.es/es/-/c%C3%A1lculo-calificaciones' },
    { region: 'Extremadura', name: 'Ponderaciones de Extremadura 2026-2027', city: 'Universidad de Extremadura', pdf: 'https://alumnado.unex.es/pau/pau/' },
    { region: 'Galicia', name: 'Ponderaciones de Galicia 2026-2027', city: 'CIUG', pdf: 'https://ciug.gal/lexislacion' },
    { region: 'Islas Baleares', name: 'Ponderaciones de las Islas Baleares 2026-2027', city: 'Universidad de las Islas Baleares', pdf: 'https://estudis.uib.es/estudis-de-grau/com-hi-pots-accedir/acces/parametres' },
    { region: 'Islas Canarias', name: 'Ponderaciones ULPGC 2026-2027', city: 'Universidad de Las Palmas de Gran Canaria', pdf: 'https://www.ulpgc.es/gestion-academica/materiasdeponderacion' },
    { region: 'Islas Canarias', name: 'Ponderaciones ULL 2026-2027', city: 'Universidad de La Laguna', pdf: null, note: 'Pendiente de verificar la tabla específica de la ULL. No comparte tabla con la ULPGC.' },
    { region: 'La Rioja', name: 'Ponderaciones de La Rioja 2026-2027', city: 'Universidad de La Rioja', pdf: 'https://www.unirioja.es/administracion-y-servicios/oficina-de-estudiantes/pau/parametros-de-ponderacion/' },
    // Madrid publica una tabla por universidad. La UCM 2025-2026 es solo la referencia principal facilitada: verificar cada tabla específica 2026-2027 antes de enlazarla.
    { region: 'Comunidad de Madrid', name: 'Universidad de Alcalá', city: 'Madrid', pdf: null, note: 'Pendiente de verificar la tabla específica 2026-2027 de esta universidad.' },
    { region: 'Comunidad de Madrid', name: 'Universidad Autónoma de Madrid', city: 'Madrid', pdf: null, note: 'Pendiente de verificar la tabla específica 2026-2027 de esta universidad.' },
    { region: 'Comunidad de Madrid', name: 'Universidad Carlos III de Madrid', city: 'Madrid', pdf: null, note: 'Pendiente de verificar la tabla específica 2026-2027 de esta universidad.' },
    { region: 'Comunidad de Madrid', name: 'Universidad Complutense de Madrid', city: 'Referencia UCM 2025-2026 · verificar 2026-2027', pdf: 'https://www.ucm.es/file/tabla-de-ponderaciones-ucm-2025-2026/' },
    { region: 'Comunidad de Madrid', name: 'Universidad Politécnica de Madrid', city: 'Madrid', pdf: null, note: 'Pendiente de verificar la tabla específica 2026-2027 de esta universidad.' },
    { region: 'Comunidad de Madrid', name: 'Universidad Rey Juan Carlos', city: 'Madrid', pdf: null, note: 'Pendiente de verificar la tabla específica 2026-2027 de esta universidad.' },
    { region: 'Región de Murcia', name: 'Ponderaciones de la Región de Murcia 2026-2027', city: 'Distrito Único de la Región de Murcia', pdf: 'https://www.um.es/web/estudios/utilidades/ponderaciones' },
    { region: 'Navarra', name: 'Ponderaciones de Navarra 2026-2027', city: 'Universidad Pública de Navarra', pdf: 'https://www.unavarra.es/sites/estudios/acceso-y-admision/admision-en-estudios-de-grado/notas-de-corte-y-simulador.html' },
    { region: 'País Vasco', name: 'Ponderaciones del País Vasco 2026-2027', city: 'UPV/EHU', pdf: 'https://www.ehu.eus/es/web/unibertsitaterako-sarbidea/vias-de-acceso/bachillerato-y-ciclos-formativos-de-grado-superior/parametros-de-ponderacion' }
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
      link.textContent = 'Abrir fuente oficial →';
      card.appendChild(link);
    } else {
      const pending = document.createElement('span');
      pending.className = 'pending-link';
      pending.textContent = documentItem.note || 'Documento pendiente de verificar';
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
    $('documentBadge').textContent = pdfCount + (pdfCount === 1 ? ' fuente oficial' : ' fuentes oficiales') + ' · ' + profileCount + (profileCount === 1 ? ' ficha' : ' fichas');

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
