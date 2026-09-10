/*
 * Google Analytics 4 (gtag.js).
 *
 * Se inicializa con Consent Mode denegado por defecto (analytics_storage y
 * ad_storage en "denied") porque el sitio todavía no tiene un banner de
 * cookies/consentimiento real (solo la página informativa
 * /politica-cookies). Sin ese banner, gtag.js sigue enviando eventos, pero
 * en modo cookieless/modelado, sin escribir cookies de analítica. En cuanto
 * exista un banner que conceda consentimiento explícito, debe llamar a
 * gtag('consent', 'update', { analytics_storage: 'granted' }) para pasar a
 * medición completa. Ver CLAUDE.md y AUDITORIA_MIEBAU.md (MIE-013).
 */
(function () {
  const GA_MEASUREMENT_ID = 'G-PC072KNFRT';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}());
