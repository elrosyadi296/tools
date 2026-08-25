/** 296 Tools web-app runtime: PWA metadata, connectivity state, and safe updates. */
(function () {
  'use strict';

  function addManifest() {
    if (document.querySelector('link[rel="manifest"]')) return;
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.webmanifest';
    document.head.appendChild(link);
  }

  function setConnectionState() {
    document.documentElement.dataset.connection = navigator.onLine ? 'online' : 'offline';
    document.dispatchEvent(new CustomEvent('296tools:connection', {
      detail: { online: navigator.onLine }
    }));
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (error) {
      console.warn('296 Tools: service worker tidak dapat didaftarkan.', error);
    });
  }

  addManifest();
  setConnectionState();
  window.addEventListener('online', setConnectionState);
  window.addEventListener('offline', setConnectionState);
  window.addEventListener('load', registerServiceWorker);
})();
