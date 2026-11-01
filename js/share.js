/*
 * Botones «Compartir» ([data-share]).
 *
 * 1. Web Share API (móvil y navegadores compatibles).
 * 2. Si no existe, o falla por algo distinto a cancelar: copiar el enlace al
 *    portapapeles (API moderna → document.execCommand como último recurso).
 * 3. Si tampoco se puede copiar, se muestra el enlace para copiarlo a mano.
 *
 * Siempre hay feedback visible y accesible: el mensaje se escribe en un
 * elemento con role="status" / aria-live="polite" (el que indique
 * data-share-status="#id" o el que siga al botón con la clase .share-feedback).
 * Comparte la URL canónica de la página (sin hash ni parámetros).
 */
(function () {
  'use strict';

  function shareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return (canonical && canonical.href) || (location.origin + location.pathname);
  }

  function statusFor(button) {
    var selector = button.getAttribute('data-share-status');
    var node = selector ? document.querySelector(selector) : null;
    if (!node) {
      var next = button.nextElementSibling;
      if (next && next.classList && next.classList.contains('share-feedback')) node = next;
    }
    if (!node) {
      node = document.createElement('p');
      node.className = 'share-feedback';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      button.insertAdjacentElement('afterend', node);
    }
    return node;
  }

  var timers = new WeakMap();
  function say(node, message) {
    clearTimeout(timers.get(node));
    node.textContent = '';
    // Vaciar y volver a escribir en el siguiente frame hace que un lector de
    // pantalla repita el aviso aunque el mensaje sea el mismo que la vez anterior.
    window.requestAnimationFrame(function () {
      node.textContent = message;
      timers.set(node, setTimeout(function () { node.textContent = ''; }, 6000));
    });
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).then(function () { return true; }, function () { return legacyCopy(url); });
    }
    return Promise.resolve(legacyCopy(url));
  }

  function handle(button) {
    var url = shareUrl();
    var status = statusFor(button);
    var data = { title: button.getAttribute('data-share-title') || document.title, url: url };
    var text = button.getAttribute('data-share-text');
    if (text) data.text = text;

    function fallback() {
      return copyLink(url).then(function (copied) {
        say(status, copied ? 'Enlace copiado' : 'No se pudo copiar automáticamente. Copia este enlace: ' + url);
      });
    }

    if (navigator.share) {
      return navigator.share(data).then(function () {
        say(status, 'Gracias por compartir Miebau');
      }, function (error) {
        if (error && error.name === 'AbortError') { status.textContent = ''; return; } // la persona canceló: no es un error
        return fallback();
      });
    }
    return fallback();
  }

  document.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('[data-share]') : null;
    if (!button) return;
    event.preventDefault();
    handle(button);
  });
}());
