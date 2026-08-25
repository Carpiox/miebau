/*
 * Miebau · utilidades frontend compartidas
 * -----------------------------------------
 * Este archivo no conoce ningún backend ni realiza peticiones de red. Expone
 * utilidades pequeñas para almacenamiento local, avisos y componentes visuales
 * que pueden reutilizarse desde cualquier página estática.
 */
(function (window, document) {
  'use strict';

  const memory = Object.create(null);

  function read(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
    }
  }

  function write(key, value) {
    memory[key] = value;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* modo privado o storage bloqueado */ }
    return value;
  }

  function remove(key) {
    delete memory[key];
    try { window.localStorage.removeItem(key); } catch (_) { /* no-op */ }
  }

  function uid(prefix) {
    return (prefix || 'miebau') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function format(value, decimals) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return Number(value).toLocaleString('es-ES', {
      minimumFractionDigits: decimals === undefined ? 2 : decimals,
      maximumFractionDigits: decimals === undefined ? 2 : decimals
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function toast(message, tone) {
    let node = document.querySelector('[data-miebau-toast]');
    if (!node) {
      node = document.createElement('div');
      node.setAttribute('data-miebau-toast', '');
      node.className = 'miebau-toast';
      node.setAttribute('role', 'status');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.dataset.tone = tone || 'success';
    node.classList.add('visible');
    window.clearTimeout(node._hideTimer);
    node._hideTimer = window.setTimeout(() => node.classList.remove('visible'), 2600);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('No se pudo copiar');
    return true;
  }

  function mountPremiumBanners() {
    document.querySelectorAll('[data-premium-banner]').forEach((node) => {
      const title = node.dataset.premiumTitle || 'Más claridad para tus próximos pasos';
      const text = node.dataset.premiumText || 'Estamos preparando herramientas ampliadas para organizar tus opciones y objetivos.';
      node.innerHTML = '<div class="premium-banner-icon" aria-hidden="true">✦</div>' +
        '<div class="premium-banner-copy"><span class="eyebrow">Próximamente</span><h2>' + title + '</h2><p>' + text + '</p></div>' +
        '<a class="btn btn-outline" href="/premium">Ver Premium</a>';
      node.classList.add('premium-banner');
    });
  }

  function mountFutureNotices() {
    document.querySelectorAll('[data-future-feature]').forEach((node) => {
      node.classList.add('future-notice');
      if (!node.querySelector('.future-notice-label')) {
        node.insertAdjacentHTML('afterbegin', '<span class="future-notice-label">Preparado para conectar datos futuros</span>');
      }
    });
  }

  window.Miebau = Object.freeze({
    clamp,
    copyText,
    format,
    memory,
    mountFutureNotices,
    mountPremiumBanners,
    read,
    remove,
    toast,
    uid,
    write
  });

  document.addEventListener('DOMContentLoaded', () => {
    mountPremiumBanners();
    mountFutureNotices();
  });
}(window, document));
