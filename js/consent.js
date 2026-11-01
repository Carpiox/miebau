/*
 * Gestor de consentimiento de cookies (RGPD / LSSI) con Google Consent Mode v2.
 *
 * - Por defecto TODO denegado: ad_storage, analytics_storage, ad_user_data y
 *   ad_personalization. Se declara antes de cargar nada de Google.
 * - GA4 y AdSense (js/integrations.js) solo se descargan tras aceptar la
 *   categoría correspondiente. Sin consentimiento no hay peticiones a Google
 *   ni cookies de Google (modo "básico" de Consent Mode).
 * - La decisión se guarda en localStorage ("miebau-consent") dentro de
 *   try/catch: si el almacenamiento está bloqueado, la decisión vale solo para
 *   la página actual y el aviso volverá a salir (comportamiento seguro).
 * - Cualquier elemento con [data-consent-open] (p. ej. el botón "Configurar
 *   cookies" del footer) reabre el panel para cambiar la decisión.
 *
 * ENGANCHE DE UN CMP CERTIFICADO POR GOOGLE (necesario para servir anuncios en
 * el EEE/Reino Unido/Suiza): ver CONFIG.googleCmp más abajo.
 */
(function () {
  'use strict';

  var CONFIG = {
    storageKey: 'miebau-consent',
    version: 1,
    // false = banner propio gestiona analítica Y publicidad (adsbygoogle.js
    //         no se carga hasta aceptar "Publicidad").
    // true  = hay un CMP certificado por Google activo en AdSense → Privacidad
    //         y mensajes. Entonces ese CMP gestiona el consentimiento de
    //         publicidad: adsbygoogle.js se carga desde el principio (es lo que
    //         muestra el mensaje de Google) y este banner propio solo gestiona
    //         la analítica. NO activar sin haber publicado el mensaje en AdSense.
    googleCmp: false,
  };

  var DENIED = { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (!window.gtag) window.gtag = gtag;
  window.gtag('consent', 'default', DENIED);

  var services = window.MiebauServices || { loadAnalytics: function () {}, loadAds: function () {}, isLoaded: function () { return false; } };
  var listeners = [];
  var current = null; // última decisión aplicada
  var banner = null;
  var lastOpener = null;

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.v === CONFIG.version && typeof data.analytics === 'boolean' && typeof data.ads === 'boolean') return data;
    } catch (_) { /* storage bloqueado o JSON corrupto: se trata como "sin decisión" */ }
    return null;
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(CONFIG.storageKey, JSON.stringify({ v: CONFIG.version, analytics: !!choice.analytics, ads: !!choice.ads, ts: new Date().toISOString() }));
    } catch (_) { /* sin almacenamiento: la decisión no persiste */ }
  }

  function expireCookie(name) {
    var host = location.hostname;
    var domains = ['', ';domain=' + host, ';domain=.' + host.replace(/^www\./, '')];
    domains.forEach(function (domain) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + domain;
    });
  }

  function clearCookies(matchers) {
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (name && matchers.some(function (match) { return match.test(name); })) expireCookie(name);
    });
  }

  function apply(choice) {
    var previous = current;
    current = { analytics: !!choice.analytics, ads: !!choice.ads };
    window.gtag('consent', 'update', {
      analytics_storage: current.analytics ? 'granted' : 'denied',
      ad_storage: current.ads ? 'granted' : 'denied',
      ad_user_data: current.ads ? 'granted' : 'denied',
      ad_personalization: current.ads ? 'granted' : 'denied',
    });
    if (current.analytics) services.loadAnalytics();
    else if (previous && previous.analytics) clearCookies([/^_ga($|_)/, /^_gid$/, /^_gat/]);
    if (current.ads) services.loadAds();
    else if (previous && previous.ads) clearCookies([/^__gads$/, /^__gpi$/, /^__eoi$/]);
    listeners.forEach(function (fn) { try { fn({ analytics: current.analytics, ads: current.ads }); } catch (_) { /* un listener roto no debe romper el resto */ } });
  }

  function decide(choice) {
    saveChoice(choice);
    apply(choice);
  }

  /* ----------------------------- Banner ----------------------------- */

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    if (html != null) node.innerHTML = html;
    return node;
  }

  function buildBanner() {
    var adsRow = CONFIG.googleCmp ? '' :
      '<label class="consent-option" for="consentAds"><input type="checkbox" id="consentAds"><span><strong>Publicidad</strong>' +
      '<small>Google AdSense: mostrar y medir anuncios. Instala cookies de Google (por ejemplo __gads, __gpi).</small></span></label>';
    var node = el('div', { class: 'consent-banner', id: 'consentBanner', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'consentTitle', 'aria-describedby': 'consentDesc', tabindex: '-1' },
      '<div class="consent-inner">' +
        '<p class="consent-title" id="consentTitle">Tu privacidad en Miebau</p>' +
        '<p class="consent-text" id="consentDesc">Usamos cookies de medición' + (CONFIG.googleCmp ? '' : ' y de publicidad') + ' solo si tú lo permites. Sin tu permiso no se carga ningún servicio de Google. Puedes cambiar tu decisión cuando quieras desde «Configurar cookies», al final de cualquier página. Más información en la <a href="/politica-cookies">política de cookies</a>.</p>' +
        '<div class="consent-panel" id="consentPanel" hidden>' +
          '<label class="consent-option" for="consentNecessary"><input type="checkbox" id="consentNecessary" checked disabled><span><strong>Técnicas (siempre activas)</strong>' +
          '<small>Guardan tu decisión sobre cookies y tus cálculos en tu propio navegador. No se envían a ningún tercero.</small></span></label>' +
          '<label class="consent-option" for="consentAnalytics"><input type="checkbox" id="consentAnalytics"><span><strong>Analítica</strong>' +
          '<small>Google Analytics 4: nos dice qué páginas se visitan para mejorar el sitio. Instala cookies _ga.</small></span></label>' +
          adsRow +
          '<div class="consent-actions"><button type="button" class="consent-btn" data-consent="save">Guardar selección</button></div>' +
        '</div>' +
        '<div class="consent-actions" id="consentMainActions">' +
          '<button type="button" class="consent-btn" data-consent="accept">Aceptar todo</button>' +
          '<button type="button" class="consent-btn" data-consent="reject">Rechazar todo</button>' +
          '<button type="button" class="consent-btn" data-consent="config" aria-expanded="false" aria-controls="consentPanel">Configurar</button>' +
        '</div>' +
      '</div>');
    node.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-consent]') : null;
      if (!button) return;
      var action = button.getAttribute('data-consent');
      if (action === 'accept') { decide({ analytics: true, ads: !CONFIG.googleCmp }); hideBanner(); }
      else if (action === 'reject') { decide({ analytics: false, ads: false }); hideBanner(); }
      else if (action === 'config') togglePanel();
      else if (action === 'save') {
        var ads = node.querySelector('#consentAds');
        decide({ analytics: node.querySelector('#consentAnalytics').checked, ads: ads ? ads.checked : false });
        hideBanner();
      }
    });
    node.addEventListener('keydown', function (event) {
      // Esc solo cierra si ya había una decisión guardada (reapertura); la primera vez hay que elegir.
      if (event.key === 'Escape' && current) hideBanner();
    });
    return node;
  }

  function togglePanel(force) {
    if (!banner) return;
    var panel = banner.querySelector('#consentPanel');
    var toggle = banner.querySelector('[data-consent="config"]');
    var open = typeof force === 'boolean' ? force : panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  function showBanner(opts) {
    opts = opts || {};
    if (!document.body) return;
    if (!banner) { banner = buildBanner(); document.body.appendChild(banner); }
    banner.hidden = false;
    banner.querySelector('#consentAnalytics').checked = !!(current && current.analytics);
    var ads = banner.querySelector('#consentAds');
    if (ads) ads.checked = !!(current && current.ads);
    togglePanel(!!opts.expanded);
    document.body.style.paddingBottom = banner.offsetHeight + 'px';
    try { banner.focus({ preventScroll: true }); } catch (_) { banner.focus(); }
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    document.body.style.paddingBottom = '';
    if (lastOpener && lastOpener.focus) { try { lastOpener.focus(); } catch (_) { /* elemento ya no existe */ } }
    lastOpener = null;
  }

  function init() {
    var saved = readChoice();
    if (CONFIG.googleCmp) services.loadAds();
    if (saved) apply(saved);
    else showBanner();
    document.addEventListener('click', function (event) {
      var opener = event.target.closest ? event.target.closest('[data-consent-open]') : null;
      if (!opener) return;
      event.preventDefault();
      lastOpener = opener;
      showBanner({ expanded: true });
    });
  }

  window.MiebauConsent = {
    config: CONFIG,
    get: function () { return current ? { analytics: current.analytics, ads: current.ads } : null; },
    open: function () { showBanner({ expanded: true }); },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
