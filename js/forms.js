/*
 * Envío de los formularios del sitio (contacto, aviso de ponderaciones,
 * newsletter) vía Web3Forms (https://web3forms.com).
 *
 * Sustituye a Netlify Forms: ese servicio detectaba `data-netlify="true"` en
 * build time y procesaba el POST nativo del navegador en su propio backend.
 * Cloudflare Pages no tiene un servicio equivalente, así que cada formulario
 * ahora se envía por fetch (JSON) directamente a la API pública de
 * Web3Forms, sin recargar la página.
 *
 * Los formularios llevan `data-web3forms="<contexto>"` en vez de
 * `data-netlify`, y conservan el campo honeypot `bot-field` (antes lo leía
 * Netlify; ahora lo comprobamos aquí mismo, en el cliente, antes de llamar a
 * la red).
 */
(function (globalScope) {
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
  const WEB3FORMS_ACCESS_KEY = 'c4fda362-0900-4250-89ee-9dc680092943';
  const INTERNAL_FIELDS = new Set(['bot-field', 'form-name']);

  const SUBJECTS = {
    contacto: 'Nuevo mensaje de contacto — Miebau',
    'aviso-ponderaciones': 'Aviso de ponderaciones — Miebau',
    newsletter: 'Nueva suscripción a la newsletter — Miebau',
  };

  const SUCCESS_MESSAGES = {
    contacto: '¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.',
    'aviso-ponderaciones': '¡Listo! Te avisaremos en cuanto se publiquen.',
    newsletter: '¡Gracias! Te avisaremos por email de las novedades.',
  };
  const DEFAULT_SUCCESS_MESSAGE = '¡Gracias! Hemos recibido tu mensaje.';
  const ERROR_MESSAGE = 'No hemos podido enviar el formulario. Inténtalo de nuevo en unos minutos.';

  function stripInternalFields(entries) {
    return entries.filter(([name]) => !INTERNAL_FIELDS.has(name));
  }

  function buildWeb3FormsPayload(entries, extra = {}) {
    const payload = { access_key: WEB3FORMS_ACCESS_KEY, botcheck: '' };
    for (const [name, value] of stripInternalFields(entries)) {
      payload[name] = value;
    }
    return Object.assign(payload, extra);
  }

  function isHoneypotFilled(entries) {
    return entries.some(([name, value]) => name === 'bot-field' && value);
  }

  function subjectFor(context, entries) {
    const base = SUBJECTS[context] || 'Nuevo mensaje — Miebau';
    const universidad = entries.find(([name]) => name === 'universidad');
    return universidad && universidad[1] ? `${base} (${universidad[1]})` : base;
  }

  function formEntries(form) {
    return [...new FormData(form).entries()];
  }

  async function submitToWeb3Forms(form, fetchImpl) {
    const entries = formEntries(form);
    if (isHoneypotFilled(entries)) {
      // Bot: fingimos éxito sin llamar a la red, igual que hacía el honeypot de Netlify.
      return { ok: true, spam: true };
    }

    const context = form.dataset.web3forms || '';
    const payload = buildWeb3FormsPayload(entries, { subject: subjectFor(context, entries) });
    const doFetch = fetchImpl || globalScope.fetch;
    const response = await doFetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // Respuesta no-JSON: nos quedamos solo con response.ok.
    }
    if (!response.ok || (data && data.success === false)) {
      throw new Error((data && data.message) || 'Web3Forms submit failed');
    }
    return { ok: true, spam: false, data };
  }

  function noteFor(form) {
    return form.querySelector('.form-note') || form.parentElement?.querySelector('.newsletter-note') || null;
  }

  function wireForm(form) {
    if (form.dataset.web3formsWired) return;
    form.dataset.web3formsWired = 'true';

    const note = noteFor(form);
    const submitButton = form.querySelector('button[type="submit"]');

    const context = form.dataset.web3forms || '';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (submitButton) submitButton.disabled = true;
      if (note) note.textContent = 'Enviando...';

      submitToWeb3Forms(form)
        .then(() => {
          if (note) note.textContent = SUCCESS_MESSAGES[context] || DEFAULT_SUCCESS_MESSAGE;
          form.reset();
        })
        .catch(() => {
          if (note) note.textContent = ERROR_MESSAGE;
        })
        .finally(() => {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  function wireAllForms(doc) {
    doc.querySelectorAll('form[data-web3forms]').forEach(wireForm);
  }

  const api = {
    WEB3FORMS_ENDPOINT,
    buildWeb3FormsPayload,
    isHoneypotFilled,
    subjectFor,
    submitToWeb3Forms,
    wireForm,
    wireAllForms,
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (globalScope?.document) wireAllForms(globalScope.document);
})(typeof window !== 'undefined' ? window : null);
