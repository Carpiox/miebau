/*
 * Cargadores de servicios de terceros (Google Analytics 4 y Google AdSense).
 *
 * Este archivo NO ejecuta nada por sí mismo: solo expone window.MiebauServices
 * con loadAnalytics() y loadAds(). Los llama js/consent.js, y únicamente
 * después de que la persona usuaria haya dado su consentimiento. Mientras
 * tanto no se descarga ningún script de Google ni se escribe ninguna cookie.
 *
 * El <head> estático de las páginas ya no incluye adsbygoogle.js: solo lleva
 * <meta name="google-adsense-account"> (verificación de propiedad, no carga ni
 * guarda nada).
 */
(function () {
  var GA_MEASUREMENT_ID = 'G-PC072KNFRT';
  var ADSENSE_CLIENT = 'ca-pub-2269622537984613';
  var loaded = { analytics: false, ads: false };

  function addScript(src, attrs) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    Object.keys(attrs || {}).forEach(function (key) { script.setAttribute(key, attrs[key]); });
    document.head.appendChild(script);
    return script;
  }

  function loadAnalytics() {
    if (loaded.analytics) return;
    loaded.analytics = true;
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    addScript('https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID);
  }

  function loadAds() {
    if (loaded.ads) return;
    loaded.ads = true;
    addScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT, { crossorigin: 'anonymous' });
  }

  window.MiebauServices = {
    loadAnalytics: loadAnalytics,
    loadAds: loadAds,
    isLoaded: function (name) { return !!loaded[name]; },
  };
}());
