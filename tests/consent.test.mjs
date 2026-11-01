import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = readFileSync(path.join(ROOT, 'js/consent.js'), 'utf8');

// DOM mínimo: lo justo para ejecutar js/consent.js sin navegador.
function fakeElement(tag) {
  const listeners = {};
  const children = {};
  return {
    tag, hidden: false, checked: false, attrs: {}, listeners,
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return this.attrs[k]; },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    querySelector(sel) { return (children[sel] ||= fakeElement(sel)); },
    focus() { this.focused = true; },
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    offsetHeight: 120,
  };
}

function setup({ stored = null, storageThrows = false } = {}) {
  const calls = { analytics: 0, ads: 0, appended: [] };
  const store = new Map(stored ? [['miebau-consent', JSON.stringify(stored)]] : []);
  const docListeners = {};
  const body = { style: {}, appendChild(node) { calls.appended.push(node); } };
  const document = {
    readyState: 'complete', body, cookie: '', location: {},
    createElement: fakeElement,
    addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
  };
  const localStorage = storageThrows
    ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }
    : { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const window = {
    dataLayer: [], localStorage,
    MiebauServices: { loadAnalytics() { calls.analytics += 1; }, loadAds() { calls.ads += 1; }, isLoaded: () => false },
  };
  window.window = window;
  const context = vm.createContext({ window, document, location: { hostname: 'miebau.es' }, localStorage, Date, JSON, console });
  vm.runInContext(SOURCE, context);
  const layer = () => JSON.parse(JSON.stringify(window.dataLayer.map((args) => Array.from(args))));
  return { window, calls, store, layer, document };
}

function click(banner, action) {
  const button = { getAttribute: () => action };
  banner.listeners.click.forEach((fn) => fn({ target: { closest: () => button } }));
}

test('Consent Mode v2: los cuatro permisos arrancan denegados y es lo primero que se declara', () => {
  const { layer } = setup();
  assert.deepEqual(layer()[0], ['consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
});

test('sin decisión previa: no se carga GA4 ni AdSense y se muestra el banner', () => {
  const { calls, layer } = setup();
  assert.equal(calls.analytics, 0);
  assert.equal(calls.ads, 0);
  assert.equal(calls.appended.length, 1);
  assert.equal(layer().filter((d) => d[1] === 'update').length, 0);
});

test('el banner ofrece Aceptar, Rechazar y Configurar con la misma clase (misma prominencia)', () => {
  const { calls } = setup();
  const html = calls.appended[0].innerHTML;
  const buttons = [...html.matchAll(/<button type="button" class="(consent-btn)" data-consent="(accept|reject|config)"/g)];
  assert.deepEqual(buttons.map((m) => m[2]).sort(), ['accept', 'config', 'reject']);
  assert(buttons.every((m) => m[1] === 'consent-btn'));
  const { attrs } = calls.appended[0];
  assert.equal(attrs.role, 'dialog');
  assert.equal(attrs['aria-labelledby'], 'consentTitle');
  assert.equal(attrs['aria-modal'], 'false');
});

test('aceptar todo: guarda la decisión, concede permisos y carga GA4 y AdSense', () => {
  const { calls, store, layer } = setup();
  click(calls.appended[0], 'accept');
  assert.equal(calls.analytics, 1);
  assert.equal(calls.ads, 1);
  const saved = JSON.parse(store.get('miebau-consent'));
  assert.equal(saved.analytics, true);
  assert.equal(saved.ads, true);
  const update = layer().find((d) => d[1] === 'update');
  assert.deepEqual(update[2], { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
});

test('rechazar todo: guarda la decisión y no carga nada', () => {
  const { calls, store, layer } = setup();
  click(calls.appended[0], 'reject');
  assert.equal(calls.analytics, 0);
  assert.equal(calls.ads, 0);
  const saved = JSON.parse(store.get('miebau-consent'));
  assert.equal(saved.analytics, false);
  assert.equal(saved.ads, false);
  const update = layer().find((d) => d[1] === 'update');
  assert.deepEqual(update[2], { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
});

test('decisión guardada: se aplica sin volver a mostrar el banner', () => {
  const { calls, layer } = setup({ stored: { v: 1, analytics: true, ads: false } });
  assert.equal(calls.appended.length, 0);
  assert.equal(calls.analytics, 1);
  assert.equal(calls.ads, 0);
  const update = layer().find((d) => d[1] === 'update');
  assert.equal(update[2].analytics_storage, 'granted');
  assert.equal(update[2].ad_storage, 'denied');
});

test('decisión guardada con versión o forma inválida se ignora y se vuelve a preguntar', () => {
  const { calls } = setup({ stored: { v: 99, analytics: true, ads: true } });
  assert.equal(calls.appended.length, 1);
  assert.equal(calls.analytics, 0);
});

test('localStorage bloqueado: no lanza, vuelve a preguntar y no carga nada', () => {
  const { calls } = setup({ storageThrows: true });
  assert.equal(calls.appended.length, 1);
  assert.equal(calls.analytics + calls.ads, 0);
  click(calls.appended[0], 'accept'); // setItem lanza internamente: no debe romper
  assert.equal(calls.analytics, 1);
});
