/* Miebau shared frontend components: header, footer, newsletter and global CTA. */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  const active = (file) => page === file ? 'active' : '';
  const logo = '<span class="brand-mark" aria-hidden="true">✓</span><span>mi<span style="color:var(--primary)">ebau</span></span>';

  function header() {
    const oldHeader = document.querySelector('.navbar');
    if (!oldHeader) return;
    oldHeader.outerHTML = `
      <nav class="navbar site-nav" aria-label="Navegación principal">
        <div class="navbar-inner">
          <a class="navbar-brand" href="/" aria-label="Miebau, inicio">${logo}</a>
          <button class="nav-toggle" id="navToggle" type="button" aria-label="Abrir menú" aria-expanded="false"><span></span></button>
          <ul class="navbar-links" id="siteMenu">
            <li><a class="${active('calculadora.html')}" href="/calculadora.html">Calculadora</a></li>
            <li><a class="${active('ponderaciones.html')}" href="/ponderaciones.html">Ponderaciones</a></li>
            <li><a class="${active('examenes.html')}" href="/examenes.html">Exámenes</a></li>
            <li><a class="${active('guias.html')}" href="/guias.html">Guías</a></li>
            <li><a class="${active('premium.html')}" href="/premium.html">Premium</a></li>
          </ul>
          <div class="nav-actions"><a class="btn btn-primary nav-cta" href="/calculadora.html">Calcular mi nota</a></div>
        </div>
      </nav>`;
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('siteMenu');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
      menu.classList.toggle('open', !open);
    });
  }

  function footer() {
    const oldFooter = document.querySelector('footer');
    if (!oldFooter) return;
    oldFooter.outerHTML = `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <div class="footer-top">
            <div class="footer-intro"><a class="navbar-brand" href="/">${logo}</a><p>Herramientas claras para tomar decisiones con calma antes, durante y después de la EvAU.</p><div class="social-links" aria-label="Redes sociales"><a href="/proximamente.html" aria-label="Instagram">IG</a><a href="/proximamente.html" aria-label="TikTok">TT</a><a href="/proximamente.html" aria-label="X">X</a></div></div>
            <div class="footer-column"><div class="footer-heading">Herramientas</div><a href="/calculadora.html">Calculadora</a><a href="/ponderaciones.html">Ponderaciones</a><a href="/examenes.html">Exámenes</a><a href="/notas-de-corte.html">Notas de corte</a><a href="/calendario-ebau.html">Calendario EBAU</a></div>
            <div class="footer-column"><div class="footer-heading">Premium</div><a href="/premium.html">Miebau Premium</a><a href="/precios.html">Precios</a><a href="/preguntas-frecuentes.html">Preguntas frecuentes</a></div>
            <div class="footer-column"><div class="footer-heading">Sobre nosotros</div><a href="/sobre-nosotros.html">Nuestra misión</a><a href="/guias.html">Guías</a><a href="/contacto.html">Contacto</a></div>
            <div class="footer-column"><div class="footer-heading">Legal</div><a href="/aviso-legal.html">Aviso legal</a><a href="/politica-privacidad.html">Privacidad</a><a href="/politica-cookies.html">Cookies</a></div>
          </div>
          <section class="newsletter" aria-labelledby="newsletterTitle"><div><h3 id="newsletterTitle">Una nota menos de incertidumbre</h3><p>Recibe novedades y guías prácticas para preparar la EvAU.</p></div><div><form class="newsletter-form" data-newsletter><input type="email" aria-label="Tu correo electrónico" placeholder="tu@email.com" required><button class="btn btn-primary" type="submit">Suscribirme</button></form><p class="newsletter-note" aria-live="polite"></p></div></section>
          <div class="footer-bottom"><span>© 2026 Miebau. Todos los derechos reservados.</span><span>Hecho para estudiantes que quieren decidir mejor.</span></div>
        </div>
      </footer>`;
    document.querySelector('[data-newsletter]').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const note = form.parentElement.querySelector('.newsletter-note');
      note.textContent = '¡Gracias! El formulario está listo para conectarse cuando lo decidas.';
      form.reset();
    });
  }

  function addCalculatorCta() {
    if (page === 'calculadora.html' || page === '404.html') return;
    const main = document.querySelector('main.page');
    if (!main || main.querySelector('.global-calculator-cta')) return;
    main.insertAdjacentHTML('beforeend', '<section class="global-calculator-cta"><h2>¿Quieres saber dónde estás?</h2><p>Calcula tu nota de acceso y admisión en menos de un minuto.</p><a class="btn btn-lg" href="/calculadora.html">Ir a la calculadora <span aria-hidden="true">→</span></a></section>');
  }

  function optimizeImages() {
    document.querySelectorAll('img').forEach((image, index) => {
      image.decoding = 'async';
      if (!image.hasAttribute('loading') && index > 0) image.loading = 'lazy';
    });
  }

  header();
  footer();
  addCalculatorCta();
  optimizeImages();
  ['/js/seo.js'].forEach((src) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}());
