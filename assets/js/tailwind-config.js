/**
 * 296TOOLS — KONFIGURASI TAILWIND BERSAMA
 * Dimuat di SETIAP halaman setelah <script src="https://cdn.tailwindcss.com">.
 * Karena Tailwind di sini dipakai lewat CDN (tanpa build step), config wajib
 * didefinisikan per-halaman — tapi cukup include file ini, jangan tulis ulang.
 * Warna diarahkan ke CSS variable di tokens.css supaya tetap satu sumber.
 */
window.tailwind = window.tailwind || {};
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: 'var(--brand-light)',
          dark: 'var(--brand-dark)',
          accent: 'var(--brand-accent)',
          emerald: 'var(--brand-emerald)',
          rose: 'var(--brand-rose)',
        },
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
      },
      borderRadius: {
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        premium: 'var(--shadow-premium)',
        glow: 'var(--shadow-glow)',
      },
    },
  },
};
