/* Miebau shared frontend components: nav toggle, newsletter and global CTA.
   El nav y el footer ya llegan como HTML estático real en cada página
   (generados por scripts/build-nav-footer.mjs y los demás generadores) —
   antes se construían aquí mismo con outerHTML, invisibles para cualquier
   crawler que no ejecute JavaScript. Este archivo ahora solo añade
   comportamiento sobre el markup que ya existe: abrir/cerrar el menú móvil. */
(function () {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const page = path.split('/').pop() || 'index.html';
  const pageKey = page.replace(/\.html$/, '');

  function wireNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('siteMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
      menu.classList.toggle('open', !open);
    });
  }

  function addCalculatorCta() {
    if (pageKey === 'calculadora' || pageKey === '404') return;
    const main = document.querySelector('main.page');
    if (!main || main.querySelector('.global-calculator-cta')) return;
    main.insertAdjacentHTML('beforeend', '<section class="global-calculator-cta"><h2>¿Quieres saber dónde estás?</h2><p>Calcula tu nota de acceso y admisión en menos de un minuto.</p><a class="btn btn-lg" href="/calculadora">Ir a la calculadora <span aria-hidden="true">→</span></a></section>');
  }

  function optimizeImages() {
    document.querySelectorAll('img').forEach((image, index) => {
      image.decoding = 'async';
      if (!image.hasAttribute('loading') && index > 0) image.loading = 'lazy';
    });
  }

  wireNav();
  addCalculatorCta();
  optimizeImages();
  ['/js/forms.js', '/js/integrations.js', '/js/seo.js'].forEach((src) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}());
