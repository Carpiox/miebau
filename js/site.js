/* Miebau shared frontend components: header, footer, newsletter and global CTA. */
(function () {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const page = path.split('/').pop() || 'index.html';
  const pageKey = page.replace(/\.html$/, '');
  const isPonderaciones = pageKey === 'ponderaciones' || path.indexOf('/ponderaciones/') === 0;
  const active = (file) => {
    const fileKey = file.replace(/\.html$/, '');
    return fileKey === 'ponderaciones' ? (isPonderaciones ? 'active' : '') : (pageKey === fileKey ? 'active' : '');
  };
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
            <li><a class="${active('calculadora.html')}" href="/calculadora">Calculadora</a></li>
            <li><a class="${active('ponderaciones.html')}" href="/ponderaciones">Ponderaciones</a></li>
            <li><a class="${active('examenes.html')}" href="/examenes">Exámenes</a></li>
            <li><a class="${active('guias.html')}" href="/guias">Guías</a></li>
            <li><a class="${active('premium.html')}" href="/premium">Premium</a></li>
            <li><a class="${active('sobre-nosotros.html')}" href="/sobre-nosotros">Sobre nosotros</a></li>
          </ul>
          <div class="nav-actions"><a class="btn btn-primary nav-cta" href="/calculadora">Calcular mi nota</a></div>
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
            <div class="footer-intro"><a class="navbar-brand" href="/">${logo}</a><p>Herramientas claras para tomar decisiones con calma antes, durante y después de la EvAU.</p><div class="social-links" aria-label="Redes sociales"><a href="/proximamente" aria-label="Instagram">IG</a><a href="/proximamente" aria-label="TikTok">TT</a><a href="/proximamente" aria-label="X">X</a></div></div>
            <div class="footer-column"><div class="footer-heading">Herramientas</div><a href="/calculadora">Calculadora</a><a href="/ponderaciones">Ponderaciones</a><a href="/examenes">Exámenes</a><a href="/notas-de-corte">Notas de corte</a><a href="/calendario-ebau">Calendario EBAU</a></div>
            <div class="footer-column"><div class="footer-heading">Premium</div><a href="/premium">Miebau Premium</a><a href="/precios">Precios</a><a href="/preguntas-frecuentes">Preguntas frecuentes</a></div>
            <div class="footer-column"><div class="footer-heading">Sobre nosotros</div><a href="/sobre-nosotros">Sobre nosotros</a><a href="/guias">Guías</a><a href="/contacto">Contacto</a></div>
            <div class="footer-column"><div class="footer-heading">Legal</div><a href="/aviso-legal">Aviso legal</a><a href="/politica-privacidad">Privacidad</a><a href="/politica-cookies">Cookies</a></div>
          </div>
          <section class="newsletter" aria-labelledby="newsletterTitle"><div><h3 id="newsletterTitle">Una nota menos de incertidumbre</h3><p>Recibe novedades y guías prácticas para preparar la EvAU.</p></div><div><form class="newsletter-form" data-newsletter name="newsletter"><input type="hidden" name="form-name" value="newsletter"><input type="text" name="bot-field" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><input type="email" name="email" aria-label="Tu correo electrónico" placeholder="tu@email.com" required><button class="btn btn-primary" type="submit">Suscribirme</button></form><p class="newsletter-note" aria-live="polite"></p><p class="newsletter-consent">Al suscribirte aceptas recibir estos correos. Consulta la <a href="/politica-privacidad">política de privacidad</a>.</p></div></section>
          <div class="footer-bottom"><span>© 2026 Miebau. Todos los derechos reservados.</span><span>Hecho para estudiantes que quieren decidir mejor.</span></div>
        </div>
      </footer>`;
    const newsletterForm = document.querySelector('[data-newsletter]');
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const note = form.parentElement.querySelector('.newsletter-note');
      const submitButton = form.querySelector('button[type="submit"]');
      if (form.querySelector('[name="bot-field"]').value) return;
      const body = new URLSearchParams(new FormData(form)).toString();
      submitButton.disabled = true;
      note.textContent = 'Enviando...';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
        .then((response) => {
          if (!response.ok) throw new Error('newsletter submit failed');
          note.textContent = '¡Gracias! Te avisaremos por email de las novedades.';
          form.reset();
        })
        .catch(() => {
          note.textContent = 'No hemos podido guardar tu correo. Inténtalo de nuevo en unos minutos.';
        })
        .finally(() => {
          submitButton.disabled = false;
        });
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

  header();
  footer();
  addCalculatorCta();
  optimizeImages();
  ['/js/integrations.js', '/js/seo.js'].forEach((src) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}());
