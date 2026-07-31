/*
 * Miebau · calculadora frontend
 * -----------------------------
 * La calculadora es autocontenida: calcula en memoria, guarda el borrador y
 * el historial en localStorage y comparte una simulación codificada en el hash
 * de la URL. No realiza peticiones de red ni depende de un backend.
 */
(function (window, document) {
  'use strict';

  const Core = window.Miebau;
  const STORAGE = {
    draft: 'miebau.calculadora.draft.v1',
    history: 'miebau.calculadora.history.v1',
    target: 'miebau.calculadora.target.v1'
  };
  const MODES = {
    evau: {
      label: 'EvAU / EBAU',
      description: 'Calcula la nota de acceso sobre 10 y suma hasta dos materias ponderadas para llegar a 14.'
    },
    cfgs: {
      label: 'CFGS',
      description: 'Parte de tu expediente de CFGS sobre 10 y prueba cómo las materias de admisión pueden acercarte a 14.'
    },
    mayores25: {
      label: 'Mayores de 25',
      description: 'Introduce la nota base de tu prueba de acceso y simula materias de admisión sin salir de este dispositivo.'
    }
  };
  const INPUT_IDS = ['notaBachillerato', 'mediaCFGS', 'notaMayores25', 'lengua', 'historia', 'idioma', 'troncal', 'pond1', 'nota1', 'pond2', 'nota2'];
  const DEFAULT_INPUTS = {
    notaBachillerato: '', mediaCFGS: '', notaMayores25: '', lengua: '', historia: '', idioma: '', troncal: '',
    pond1: '0.2', nota1: '', pond2: '0.1', nota2: ''
  };
  const $ = (id) => document.getElementById(id);
  const numeric = (value, fallback) => {
    if (value === null || value === undefined || value === '') return fallback === undefined ? 0 : fallback;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : (fallback === undefined ? 0 : fallback);
  };
  const cleanMode = (mode) => MODES[mode] ? mode : 'evau';
  const cleanTarget = (value) => Core.clamp(numeric(value, 12), 0, 14);
  const round = (value) => Math.round(value * 1000) / 1000;

  let storedDraft = Core.read(STORAGE.draft, {});
  let state = {
    mode: cleanMode(storedDraft.mode),
    step: 1,
    inputs: Object.assign({}, DEFAULT_INPUTS, storedDraft.inputs || {}),
    target: cleanTarget(storedDraft.target || Core.read(STORAGE.target, 12)),
    lastResult: null
  };
  let history = Array.isArray(Core.read(STORAGE.history, [])) ? Core.read(STORAGE.history, []) : [];
  let compareIds = [];

  function format(value, decimals) { return Core.format(value, decimals === undefined ? 2 : decimals); }

  function getInputs() {
    const values = {};
    INPUT_IDS.forEach((id) => { values[id] = $(id) ? $(id).value : ''; });
    return values;
  }

  function setInputs(values) {
    INPUT_IDS.forEach((id) => {
      if ($(id) && values[id] !== undefined && values[id] !== null) $(id).value = values[id];
    });
  }

  function saveDraft() {
    state.inputs = getInputs();
    Core.write(STORAGE.draft, { mode: state.mode, inputs: state.inputs, target: state.target });
    Core.write(STORAGE.target, state.target);
  }

  function modeBase(inputs, mode) {
    if (mode === 'evau') return numeric(inputs.notaBachillerato);
    return mode === 'cfgs' ? numeric(inputs.mediaCFGS) : numeric(inputs.notaMayores25);
  }

  function calculate(inputs, mode) {
    const baseInput = modeBase(inputs, mode);
    const obligatoryNotes = ['lengua', 'historia', 'idioma', 'troncal'].map((id) => numeric(inputs[id]));
    const obligatoryAverage = obligatoryNotes.reduce((sum, value) => sum + value, 0) / obligatoryNotes.length;
    const access = mode === 'evau' ? (0.6 * baseInput) + (0.4 * obligatoryAverage) : baseInput;
    const voluntary1 = numeric(inputs.nota1) * numeric(inputs.pond1);
    const voluntary2 = numeric(inputs.nota2) * numeric(inputs.pond2);
    return {
      access: round(Core.clamp(access, 0, 10)),
      admission: round(Core.clamp(access + voluntary1 + voluntary2, 0, 14)),
      baseContribution: round(mode === 'evau' ? 0.6 * baseInput : baseInput),
      obligatoryContribution: round(mode === 'evau' ? 0.4 * obligatoryAverage : 0),
      obligatoryAverage: round(obligatoryAverage),
      voluntary: round(voluntary1 + voluntary2),
      voluntary1: round(voluntary1),
      voluntary2: round(voluntary2),
      mode
    };
  }

  function validateStep(step) {
    const inputs = getInputs();
    const required = step === 1
      ? (state.mode === 'evau' ? ['notaBachillerato'] : [state.mode === 'cfgs' ? 'mediaCFGS' : 'notaMayores25'])
      : (state.mode === 'evau' && step === 2 ? ['lengua', 'historia', 'idioma', 'troncal'] : []);
    const missing = required.find((id) => {
      const value = numeric(inputs[id], NaN);
      return !Number.isFinite(value) || value < 0 || value > 10;
    });
    if (!missing) return true;
    const label = $(missing).closest('.form-group')?.querySelector('.form-label')?.textContent || 'ese campo';
    showError('Revisa ' + label.toLowerCase() + ': introduce una nota entre 0 y 10.');
    $(missing)?.focus();
    return false;
  }

  function showError(message) {
    const node = $('formError');
    node.textContent = message;
    node.hidden = false;
  }

  function clearError() {
    $('formError').hidden = true;
    $('formError').textContent = '';
  }

  function renderMode() {
    document.querySelectorAll('[data-mode]').forEach((button) => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-mode-fields]').forEach((field) => {
      field.hidden = field.dataset.modeFields !== state.mode;
    });
    document.querySelectorAll('.evau-only-fields').forEach((field) => { field.hidden = state.mode !== 'evau'; });
    document.querySelectorAll('[data-non-evau-note]').forEach((field) => { field.hidden = state.mode === 'evau'; });
    $('modeDescription').textContent = MODES[state.mode].description;
    $('step2Title').textContent = state.mode === 'evau' ? 'Fase obligatoria' : 'Materias de admisión';
    $('step2Pill').textContent = state.mode === 'evau' ? '4 asignaturas' : 'Opcional';
    const obligatoryOption = document.querySelector('#inverseTarget option[value="obligatoria"]');
    obligatoryOption.hidden = state.mode !== 'evau';
    if (state.mode !== 'evau' && $('inverseTarget').value === 'obligatoria') $('inverseTarget').value = 'base';
  }

  function renderStep() {
    document.querySelectorAll('[data-step-panel]').forEach((panel) => {
      const active = Number(panel.dataset.stepPanel) === state.step;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    document.querySelectorAll('[data-step-indicator]').forEach((item) => {
      const step = Number(item.dataset.stepIndicator);
      item.classList.toggle('current', step === state.step);
      item.classList.toggle('completed', step < state.step);
    });
    $('wizardProgressText').textContent = 'Paso ' + state.step + ' de 3';
    $('wizardProgressBar').style.width = (state.step / 3 * 100) + '%';
    $('previousStep').hidden = state.step === 1;
    $('nextStep').hidden = state.step === 3;
    $('calculateButton').hidden = state.step !== 3;
  }

  function motivation(admission, target) {
    if (admission >= target) return '¡Objetivo alcanzado! Ahora puedes comparar esta combinación con otras.';
    if (admission >= 12) return '¡Excelente! Estás construyendo una nota con muchas opciones.';
    if (admission >= 9) return 'Vas por muy buen camino. Cada décima suma.';
    return 'Este es tu punto de partida: convierte tu objetivo en un siguiente paso.';
  }

  function renderGoal(result) {
    const target = cleanTarget($('objetivoNota').value);
    $('objetivoNota').value = target;
    $('goalTarget').textContent = 'Objetivo: ' + format(target);
    $('inverseGoal').value = target;
    if (!result) {
      $('goalCurrent').textContent = '—';
      $('goalProgress').style.width = '0%';
      $('goalProgressText').textContent = 'Aún no hay una simulación calculada.';
      $('goalMessage').textContent = 'Calcula tu simulación para ver cuánto te acerca a tu meta.';
      return;
    }
    const percentage = target > 0 ? Core.clamp(result.admission / target * 100, 0, 100) : 100;
    $('goalCurrent').textContent = format(result.admission) + ' / 14';
    $('goalProgress').style.width = percentage + '%';
    $('goalProgressText').textContent = result.admission >= target ? 'Has alcanzado tu objetivo.' : 'Te faltan ' + format(target - result.admission) + ' puntos para llegar.';
    $('goalMessage').textContent = result.admission >= target ? 'Tu esfuerzo ya se ve en el resultado.' : 'Un pequeño ajuste puede acercarte mucho más.';
  }

  function renderResult(result) {
    $('resultado').hidden = false;
    $('notaPrincipal').textContent = format(result.admission, 3);
    $('notaAcceso').textContent = format(result.access, 3);
    $('notaAdmision').textContent = format(result.admission, 3);
    $('desgloseBach').textContent = format(result.baseContribution, 3);
    $('desgloseObl').textContent = format(result.obligatoryContribution, 3);
    $('desgloseVol').textContent = format(result.voluntary, 3);
    $('mensajeResultado').textContent = motivation(result.admission, cleanTarget($('objetivoNota').value));
    requestAnimationFrame(() => { $('barraNota').style.width = (result.admission / 14 * 100) + '%'; });
    renderGoal(result);
  }

  function calculateCurrent() {
    clearError();
    if (!validateStep(1) || !validateStep(2)) return;
    state.inputs = getInputs();
    state.target = cleanTarget($('objetivoNota').value);
    state.lastResult = calculate(state.inputs, state.mode);
    saveDraft();
    renderResult(state.lastResult);
    $('resultado').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function recordTitle(result) {
    return MODES[state.mode].label + ' · ' + format(result.admission) + ' / 14';
  }

  function saveCalculation() {
    if (!state.lastResult) { showError('Calcula tu nota antes de guardarla.'); return; }
    const record = {
      id: Core.uid('sim'),
      title: recordTitle(state.lastResult),
      createdAt: new Date().toISOString(),
      mode: state.mode,
      inputs: Object.assign({}, getInputs()),
      target: cleanTarget($('objetivoNota').value),
      result: Object.assign({}, state.lastResult)
    };
    history.unshift(record);
    history = history.slice(0, 20);
    Core.write(STORAGE.history, history);
    renderHistory();
    Core.toast('Cálculo guardado en este dispositivo.');
  }

  function renderHistory() {
    const list = $('historyList');
    $('clearHistory').hidden = history.length === 0;
    list.replaceChildren();
    if (!history.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon" aria-hidden="true">◷</div><strong>Todavía no has guardado simulaciones</strong><p>Guarda una combinación para verla aquí y compararla con otras.</p></div>';
      renderComparison();
      return;
    }
    history.forEach((record) => {
      const item = document.createElement('article');
      item.className = 'history-item';
      const date = new Date(record.createdAt);
      const dateText = Number.isNaN(date.getTime()) ? 'Guardado localmente' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      item.innerHTML = '<label class="history-check"><input type="checkbox" data-compare-id="' + record.id + '"><span>Comparar</span></label>' +
        '<div class="history-main"><strong>' + record.title + '</strong><span>' + MODES[record.mode].label + ' · ' + dateText + '</span></div>' +
        '<div class="history-score">' + format(record.result.admission, 3) + '<small>/ 14</small></div>' +
        '<button class="history-delete" type="button" data-delete-id="' + record.id + '" aria-label="Eliminar ' + record.title + '">×</button>';
      const checkbox = item.querySelector('[data-compare-id]');
      checkbox.checked = compareIds.includes(record.id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked && compareIds.length >= 3) {
          checkbox.checked = false;
          Core.toast('Puedes comparar hasta 3 simulaciones.', 'info');
          return;
        }
        compareIds = checkbox.checked ? compareIds.concat(record.id) : compareIds.filter((id) => id !== record.id);
        renderComparison();
      });
      item.querySelector('[data-delete-id]').addEventListener('click', () => deleteRecord(record.id));
      list.appendChild(item);
    });
    renderComparison();
  }

  function deleteRecord(id) {
    history = history.filter((record) => record.id !== id);
    compareIds = compareIds.filter((recordId) => recordId !== id);
    Core.write(STORAGE.history, history);
    renderHistory();
    Core.toast('Simulación eliminada.', 'info');
  }

  function renderComparison() {
    const selected = compareIds.map((id) => history.find((record) => record.id === id)).filter(Boolean);
    $('comparisonCount').textContent = selected.length + ' / 3';
    $('comparisonPanel').hidden = selected.length < 2;
    if (selected.length < 2) return;
    const rows = [
      ['Nota de admisión', (record) => format(record.result.admission, 3) + ' / 14'],
      ['Nota de acceso', (record) => format(record.result.access, 3) + ' / 10'],
      ['Puntos voluntarios', (record) => '+' + format(record.result.voluntary, 3)],
      ['Objetivo', (record) => format(record.target) + ' / 14'],
      ['Vía', (record) => MODES[record.mode].label]
    ];
    const table = document.createElement('table');
    table.className = 'comparison-table';
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th></th>' + selected.map((record) => '<th>' + record.title + '</th>').join('') + '</tr>';
    table.appendChild(head);
    const body = document.createElement('tbody');
    rows.forEach(([label, getter]) => {
      const row = document.createElement('tr');
      row.innerHTML = '<th>' + label + '</th>' + selected.map((record) => '<td>' + getter(record) + '</td>').join('');
      body.appendChild(row);
    });
    table.appendChild(body);
    $('comparisonContent').replaceChildren(table);
  }

  function buildShareUrl() {
    const payload = { version: 1, mode: state.mode, inputs: getInputs(), target: cleanTarget($('objetivoNota').value) };
    return location.href.split('#')[0] + '#sim=' + encodeURIComponent(JSON.stringify(payload));
  }

  function loadSharedSimulation() {
    const match = location.hash.match(/#sim=(.*)$/);
    if (!match) return false;
    try {
      const payload = JSON.parse(decodeURIComponent(match[1]));
      state.mode = cleanMode(payload.mode);
      state.inputs = Object.assign({}, DEFAULT_INPUTS, payload.inputs || {});
      state.target = cleanTarget(payload.target);
      setInputs(state.inputs);
      $('objetivoNota').value = state.target;
      state.lastResult = calculate(state.inputs, state.mode);
      return true;
    } catch (_) {
      Core.toast('No se pudo abrir esta simulación compartida.', 'info');
      return false;
    }
  }

  async function shareResult() {
    if (!state.lastResult) { showError('Calcula tu nota antes de compartirla.'); return; }
    const url = buildShareUrl();
    const text = 'Mi nota de admisión es ' + format(state.lastResult.admission, 3) + ' sobre 14. Calcula la tuya en Miebau.';
    if (navigator.share) {
      try { await navigator.share({ title: 'Mi nota · Miebau', text, url }); return; } catch (_) { return; }
    }
    await copyLink(url);
  }

  async function copyLink(url) {
    try { await Core.copyText(url || buildShareUrl()); Core.toast('Enlace copiado. Puedes enviarlo a quien quieras.'); }
    catch (_) { Core.toast('No se pudo copiar el enlace.', 'info'); }
  }

  async function copyResult() {
    if (!state.lastResult) { showError('Calcula tu nota antes de copiarla.'); return; }
    try { await Core.copyText('Mi nota de admisión EvAU es ' + format(state.lastResult.admission, 3) + ' sobre 14. Calcula la tuya en Miebau.'); Core.toast('Resultado copiado.'); }
    catch (_) { Core.toast('No se pudo copiar el resultado.', 'info'); }
  }

  function downloadResult() {
    if (!state.lastResult) { showError('Calcula tu nota antes de descargarla.'); return; }
    const result = state.lastResult;
    const canvas = document.createElement('canvas');
    canvas.width = 1400; canvas.height = 800;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 1400, 800);
    gradient.addColorStop(0, '#171e40'); gradient.addColorStop(.62, '#4534c9'); gradient.addColorStop(1, '#6650fb');
    context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#9ff3d8'; context.font = '700 38px Arial'; context.fillText('MIEBAU · ' + MODES[state.mode].label.toUpperCase(), 90, 110);
    context.fillStyle = '#ffffff'; context.font = '800 220px Arial'; context.fillText(format(result.admission, 3), 80, 390);
    context.fillStyle = '#cdc7ff'; context.font = '700 42px Arial'; context.fillText('NOTA DE ADMISIÓN / 14', 92, 470);
    context.fillStyle = '#ffffff'; context.font = '600 34px Arial'; context.fillText('Acceso ' + format(result.access, 3) + ' · Objetivo ' + format(state.target), 92, 590);
    context.fillStyle = '#ccffed'; context.font = '700 34px Arial'; context.fillText('Tu esfuerzo también cuenta.', 92, 690);
    const link = document.createElement('a'); link.download = 'mi-nota-miebau.png'; link.href = canvas.toDataURL('image/png'); link.click();
    Core.toast('Imagen descargada.');
  }

  function calculateInverse() {
    const inputs = getInputs();
    const target = cleanTarget($('inverseGoal').value);
    const result = calculate(inputs, state.mode);
    const selected = $('inverseTarget').value;
    const desiredAccess = target - result.voluntary;
    let required = desiredAccess;
    let label = state.mode === 'evau' ? 'nota de acceso' : 'nota base';
    if (selected === 'obligatoria') {
      required = state.mode === 'evau' ? (desiredAccess - (0.6 * numeric(inputs.notaBachillerato))) / 0.4 : NaN;
      label = 'media de fase obligatoria';
    } else if (selected === 'vol1') {
      const pond = numeric(inputs.pond1);
      required = pond > 0 ? (target - result.access - result.voluntary2) / pond : NaN;
      label = 'materia ponderada 1';
    } else if (selected === 'vol2') {
      const pond = numeric(inputs.pond2);
      required = pond > 0 ? (target - result.access - result.voluntary1) / pond : NaN;
      label = 'materia ponderada 2';
    }
    const box = $('inverseResult');
    box.hidden = false;
    $('inverseValue').textContent = Number.isFinite(required) ? format(required) + ' / 10' : 'No disponible';
    const feasible = Number.isFinite(required) && required >= 0 && required <= 10;
    $('inverseMessage').textContent = !Number.isFinite(required)
      ? 'Selecciona una ponderación mayor que 0 para calcular esta materia.'
      : feasible
        ? 'Necesitas aproximadamente esa nota en ' + label + '. Puedes conseguirlo.'
        : required < 0
          ? 'Con las notas actuales ya superarías este objetivo.'
          : 'Esta meta no es alcanzable con esta combinación: necesitarías más de 10.';
    box.dataset.tone = feasible ? 'success' : 'info';
  }

  function attachEvents() {
    document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      state.mode = cleanMode(button.dataset.mode);
      state.lastResult = null;
      $('resultado').hidden = true;
      clearError();
      renderMode(); renderStep(); saveDraft(); renderGoal(null);
    }));
    document.querySelectorAll('.form-input, .form-select').forEach((input) => input.addEventListener('input', () => {
      state.lastResult = null;
      $('resultado').hidden = true;
      state.inputs = getInputs();
      saveDraft();
      if (input.id === 'objetivoNota') { state.target = cleanTarget(input.value); $('inverseGoal').value = state.target; renderGoal(null); }
    }));
    $('nextStep').addEventListener('click', () => { if (validateStep(state.step)) { state.step = Math.min(3, state.step + 1); clearError(); renderStep(); } });
    $('previousStep').addEventListener('click', () => { state.step = Math.max(1, state.step - 1); clearError(); renderStep(); });
    $('calculateButton').addEventListener('click', calculateCurrent);
    $('saveCalculation').addEventListener('click', saveCalculation);
    $('shareResult').addEventListener('click', shareResult);
    $('copyResult').addEventListener('click', copyResult);
    $('copyLink').addEventListener('click', () => copyLink());
    $('downloadResult').addEventListener('click', downloadResult);
    $('inverseButton').addEventListener('click', calculateInverse);
    $('inverseTarget').addEventListener('change', calculateInverse);
    $('inverseGoal').addEventListener('input', () => { $('objetivoNota').value = $('inverseGoal').value; state.target = cleanTarget($('inverseGoal').value); saveDraft(); renderGoal(null); });
    $('clearHistory').addEventListener('click', () => {
      if (!window.confirm('¿Borrar todas las simulaciones guardadas en este dispositivo?')) return;
      history = []; compareIds = []; Core.remove(STORAGE.history); renderHistory(); Core.toast('Historial borrado.', 'info');
    });
  }

  function init() {
    const shared = loadSharedSimulation();
    setInputs(state.inputs);
    $('objetivoNota').value = state.target;
    attachEvents();
    renderMode(); renderStep(); renderHistory();
    if (shared) { renderResult(state.lastResult); Core.toast('Simulación compartida cargada.'); }
    else renderGoal(null);
  }

  init();
}(window, document));
