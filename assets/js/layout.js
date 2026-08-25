/**
 * 296TOOLS — LAYOUT ENGINE
 * =============================================================================
 * Satu-satunya file yang bertanggung jawab memuat & menghidupkan shell global
 * (header, sidebar, mobile drawer, footer, search, breadcrumb, active-menu,
 * dark/light mode, favorit & riwayat). Halaman tool TIDAK perlu menulis ulang
 * logika ini — cukup include file ini + tools-data.js dan sediakan mount
 * point yang benar (lihat /_template/index.html).
 * =============================================================================
 */
(function () {
  'use strict';

  // Runtime PWA dipisahkan agar fondasi aplikasi dapat diperbarui tanpa
  // mencampur logika shell dan logika cache/offline.
  if (!document.querySelector('script[data-296-app-runtime]')) {
    var appRuntime = document.createElement('script');
    appRuntime.src = '/assets/js/app-runtime.js';
    appRuntime.defer = true;
    appRuntime.setAttribute('data-296-app-runtime', 'true');
    document.head.appendChild(appRuntime);
  }

  var BASE = '/assets/components/';
  var STORAGE_THEME = 'theme';
  var STORAGE_COLLAPSED = '296tools_sidebar_collapsed';
  var STORAGE_FAVORITES = '296tools_favorites';
  var STORAGE_RECENT = '296tools_recent';

  // ---------------------------------------------------------------------
  // 0. TERAPKAN TEMA SESEGERA MUNGKIN (mencegah flash light/dark)
  // ---------------------------------------------------------------------
  (function applyThemeEarly() {
    var saved = localStorage.getItem(STORAGE_THEME);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function normalizePath(p) {
    if (!p) return '/';
    if (p.length > 1 && p.endsWith('/index.html')) p = p.slice(0, -('index.html'.length));
    if (p.length > 1 && !p.endsWith('/')) p += '/';
    return p;
  }
  function getJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function setJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function findToolByPath(path) {
    var tools = window.TOOLS || [];
    for (var i = 0; i < tools.length; i++) {
      if (normalizePath(tools[i].url) === path) return tools[i];
    }
    return null;
  }
  function categoryOf(id) {
    var cats = window.CATEGORIES || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }

  // ---------------------------------------------------------------------
  // 1. MUAT KOMPONEN LAYOUT VIA fetch()
  // ---------------------------------------------------------------------
  function loadComponent(mountId, file) {
    var mount = document.getElementById(mountId);
    if (!mount) return Promise.resolve();
    return fetch(BASE + file)
      .then(function (r) {
        if (!r.ok) throw new Error('Gagal memuat komponen: ' + file);
        return r.text();
      })
      .then(function (html) { mount.innerHTML = html; })
      .catch(function (err) {
        console.error(err);
        mount.innerHTML = '<div class="p-3 text-xs text-red-400">Gagal memuat komponen ' + file + '</div>';
      });
  }

  function initLayout() {
    Promise.all([
      loadComponent('site-header', 'header.html'),
      loadComponent('site-sidebar', 'sidebar.html'),
      loadComponent('site-mobile-menu', 'mobile-menu.html'),
      loadComponent('site-footer', 'footer.html'),
    ]).then(function () {
      initThemeToggle();
      initSidebarToggle();
      initMobileDrawer();
      initSearch();
      initNavigation();
      initBreadcrumb();
      initHeaderCount();
      trackRecentIfToolPage();
      document.dispatchEvent(new CustomEvent('296tools:layout-ready'));
    });
  }

  // ---------------------------------------------------------------------
  // 2. DARK / LIGHT MODE
  // ---------------------------------------------------------------------
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem(STORAGE_THEME, isDark ? 'dark' : 'light');
    });
  }

  // ---------------------------------------------------------------------
  // 3. SIDEBAR COLLAPSE (desktop)
  // ---------------------------------------------------------------------
  function initSidebarToggle() {
    var shell = document.querySelector('.app-shell');
    var btn = document.getElementById('btn-sidebar-toggle');
    if (!shell) return;
    if (localStorage.getItem(STORAGE_COLLAPSED) === '1') shell.classList.add('sidebar-collapsed');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var collapsed = shell.classList.toggle('sidebar-collapsed');
      localStorage.setItem(STORAGE_COLLAPSED, collapsed ? '1' : '0');
    });
  }

  // ---------------------------------------------------------------------
  // 4. MOBILE DRAWER
  // ---------------------------------------------------------------------
  function initMobileDrawer() {
    var wrap = document.getElementById('site-mobile-menu');
    if (!wrap) return;
    var openBtn = document.getElementById('btn-mobile-menu-open');
    var closeBtn = document.getElementById('btn-mobile-menu-close');
    var backdrop = document.getElementById('site-mobile-menu-backdrop');
    var bottomToolsBtn = document.getElementById('btn-bottomnav-tools');
    var searchBtns = [document.getElementById('btn-mobile-search'), document.getElementById('btn-bottomnav-search')];

    function open(focusSearch) {
      wrap.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (focusSearch) {
        var input = document.getElementById('mobile-search-input');
        if (input) setTimeout(function () { input.focus(); }, 320);
      }
    }
    function close() {
      wrap.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', function () { open(false); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    if (bottomToolsBtn) bottomToolsBtn.addEventListener('click', function () { open(false); });
    searchBtns.forEach(function (b) { if (b) b.addEventListener('click', function () { open(true); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // tutup drawer otomatis saat link di dalamnya diklik
    wrap.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) close();
    });
  }

  // ---------------------------------------------------------------------
  // 5. RENDER NAVIGASI (sidebar desktop + mobile drawer) — dari tools-data.js
  // ---------------------------------------------------------------------
  function isFavorite(id) { return getJSON(STORAGE_FAVORITES, []).indexOf(id) !== -1; }
  function toggleFavorite(id) {
    var favs = getJSON(STORAGE_FAVORITES, []);
    var idx = favs.indexOf(id);
    if (idx === -1) favs.unshift(id); else favs.splice(idx, 1);
    setJSON(STORAGE_FAVORITES, favs);
    renderFavoritesList();
    renderCategoryNav();
  }

  function navRowHTML(tool, activePath, withStar) {
    var active = normalizePath(tool.url) === activePath;
    var star = withStar
      ? '<button class="sidebar-star flex-shrink-0 text-[11px] ' + (isFavorite(tool.id) ? 'text-yellow-400' : 'text-[var(--text-muted)]') + '" data-fav-id="' + tool.id + '" title="Favoritkan">' +
        '<i class="fa-' + (isFavorite(tool.id) ? 'solid' : 'regular') + ' fa-star"></i></button>'
      : '';
    return '<a href="' + tool.url + '" class="sidebar-link' + (active ? ' active' : '') + '">' +
      '<i class="' + tool.icon + '"></i>' +
      '<span class="sidebar-label flex-1 truncate">' + tool.name + '</span>' + star +
      '</a>';
  }

  function renderCategoryNav() {
    var activePath = normalizePath(location.pathname);
    var tools = window.TOOLS || [];
    var cats = (window.CATEGORIES || []).filter(function (c) { return c.id !== 'all'; });

    var html = cats.map(function (cat) {
      var items = tools.filter(function (t) { return t.category === cat.id; });
      if (!items.length) return '';
      return '<div class="mt-3">' +
        '<div class="sidebar-group-label px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]"><i class="' + cat.icon + ' mr-1"></i>' + cat.label + '</div>' +
        '<div class="space-y-0.5">' + items.map(function (t) { return navRowHTML(t, activePath, true); }).join('') + '</div>' +
        '</div>';
    }).join('');

    var sidebarTarget = document.getElementById('sidebar-categories');
    var mobileTarget = document.getElementById('mobile-menu-categories');
    if (sidebarTarget) sidebarTarget.innerHTML = html;
    if (mobileTarget) mobileTarget.innerHTML = html;

    bindStarButtons();
  }

  function bindStarButtons() {
    document.querySelectorAll('[data-fav-id]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(btn.getAttribute('data-fav-id'));
      });
    });
  }

  function renderFavoritesList() {
    var target = document.getElementById('sidebar-favorites-list');
    if (!target) return;
    var favIds = getJSON(STORAGE_FAVORITES, []);
    var tools = window.TOOLS || [];
    var activePath = normalizePath(location.pathname);
    var favTools = favIds.map(function (id) { return tools.find(function (t) { return t.id === id; }); }).filter(Boolean);
    target.innerHTML = favTools.length
      ? favTools.map(function (t) { return navRowHTML(t, activePath, true); }).join('')
      : '<p class="sidebar-label text-[10px] text-[var(--text-muted)] px-2 py-1">Belum ada tool favorit.</p>';
    bindStarButtons();
  }

  function renderRecentList() {
    var target = document.getElementById('sidebar-recent-list');
    if (!target) return;
    var recentIds = getJSON(STORAGE_RECENT, []);
    var tools = window.TOOLS || [];
    var activePath = normalizePath(location.pathname);
    var recentTools = recentIds.map(function (id) { return tools.find(function (t) { return t.id === id; }); }).filter(Boolean);
    target.innerHTML = recentTools.length
      ? recentTools.map(function (t) { return navRowHTML(t, activePath, false); }).join('')
      : '<p class="sidebar-label text-[10px] text-[var(--text-muted)] px-2 py-1">Belum ada riwayat.</p>';
  }

  function trackRecentIfToolPage() {
    var path = normalizePath(location.pathname);
    var tool = findToolByPath(path);
    if (!tool) { renderFavoritesList(); renderRecentList(); return; }
    var recent = getJSON(STORAGE_RECENT, []).filter(function (id) { return id !== tool.id; });
    recent.unshift(tool.id);
    if (recent.length > 6) recent = recent.slice(0, 6);
    setJSON(STORAGE_RECENT, recent);
    renderFavoritesList();
    renderRecentList();
  }

  function initNavigation() {
    renderCategoryNav();
  }

  // ---------------------------------------------------------------------
  // 6. PENCARIAN INSTAN (header desktop + drawer mobile)
  // ---------------------------------------------------------------------
  function initSearch() {
    setupSearchBox('global-search-input', 'global-search-results');
    setupSearchBox('mobile-search-input', 'mobile-search-results');

    // shortcut "/" untuk fokus search desktop
    document.addEventListener('keydown', function (e) {
      var active = document.activeElement;
      var typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if (e.key === '/' && !typing) {
        var input = document.getElementById('global-search-input');
        if (input && input.offsetParent !== null) {
          e.preventDefault();
          input.focus();
        } else {
          var openBtn = document.getElementById('btn-mobile-menu-open');
          if (openBtn) openBtn.click();
        }
      }
    });
  }

  function setupSearchBox(inputId, resultsId) {
    var input = document.getElementById(inputId);
    var results = document.getElementById(resultsId);
    if (!input || !results) return;

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) { results.classList.remove('is-open'); results.innerHTML = ''; return; }
      var tools = window.TOOLS || [];
      var matches = tools.filter(function (t) {
        return t.name.toLowerCase().indexOf(q) !== -1 ||
          t.desc.toLowerCase().indexOf(q) !== -1 ||
          (t.keywords || []).join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);

      results.innerHTML = matches.length
        ? matches.map(function (t) {
            return '<a href="' + t.url + '" class="search-result-item">' +
              '<i class="' + t.icon + ' text-brand-light w-4 text-center"></i>' +
              '<span class="flex-1 truncate">' + t.name + '</span>' +
              '<i class="fa-solid fa-arrow-right text-[10px] opacity-40"></i></a>';
          }).join('')
        : '<div class="search-result-item" style="cursor:default">Tidak ada tool ditemukan.</div>';
      results.classList.add('is-open');
    }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () { if (input.value.trim()) results.classList.add('is-open'); });
    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !results.contains(e.target)) results.classList.remove('is-open');
    });
  }

  // ---------------------------------------------------------------------
  // 7. BREADCRUMB OTOMATIS BERDASARKAN URL
  // ---------------------------------------------------------------------
  function initBreadcrumb() {
    var target = document.getElementById('site-breadcrumb');
    if (!target) return;
    var path = normalizePath(location.pathname);

    if (path === '/') {
      target.innerHTML = '<span class="font-semibold text-[var(--text-primary)]">Beranda</span>';
      return;
    }
    var tool = findToolByPath(path);
    if (!tool) {
      target.innerHTML = '<a href="/">Beranda</a>';
      return;
    }
    var cat = categoryOf(tool.category);
    var parts = ['<a href="/">Beranda</a>'];
    if (cat) parts.push('<a href="/?kategori=' + cat.id + '">' + cat.label + '</a>');
    parts.push('<span class="font-semibold text-[var(--text-primary)]">' + tool.name + '</span>');
    target.innerHTML = parts.join(' <i class="fa-solid fa-chevron-right" style="font-size:8px;margin:0 2px;"></i> ');
  }

  // ---------------------------------------------------------------------
  // 8. BADGE JUMLAH TOOL DI HEADER
  // ---------------------------------------------------------------------
  function initHeaderCount() {
    var el = document.getElementById('header-tool-count');
    if (el) el.textContent = (window.TOOLS || []).length + ' tools tersedia';
  }

  // ---------------------------------------------------------------------
  // Ekspor util kecil untuk dipakai halaman tool bila perlu (opsional)
  // ---------------------------------------------------------------------
  window.Tools296 = {
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    normalizePath: normalizePath,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
