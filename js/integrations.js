/* Leave IDs empty until the corresponding Google service is configured. */
window.MIEBAU_ANALYTICS_ID = window.MIEBAU_ANALYTICS_ID || '';
window.MIEBAU_ADSENSE_CLIENT = window.MIEBAU_ADSENSE_CLIENT || '';
if (window.MIEBAU_ANALYTICS_ID) {
  const analytics = document.createElement('script');
  analytics.async = true;
  analytics.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(window.MIEBAU_ANALYTICS_ID);
  document.head.appendChild(analytics);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date()); gtag('config', window.MIEBAU_ANALYTICS_ID, { anonymize_ip: true });
}
if (window.MIEBAU_ADSENSE_CLIENT) {
  const ads = document.createElement('script');
  ads.async = true;
  ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(window.MIEBAU_ADSENSE_CLIENT);
  ads.crossOrigin = 'anonymous'; document.head.appendChild(ads);
}
