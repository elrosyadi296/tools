# 296Tools — Arsitektur Modular & Scalable

Arsitektur ini dibangun agar **1 tool baru = 1 folder + 1 baris data**, tanpa
menyentuh header, sidebar, drawer, footer, search, breadcrumb, atau active-menu
sama sekali. Semua elemen itu punya **satu sumber tunggal** dan dimuat otomatis
ke setiap halaman lewat `fetch()`.

## Struktur folder

```
296tools/
├── index.html                     ← Homepage (grid, filter, search)
├── _template/index.html           ← COPY folder ini untuk tool baru
├── converter-file/index.html      ← Contoh tool (sudah dimigrasi)
├── dummy-img/index.html           ← Contoh tool (sudah dimigrasi)
│
└── assets/
    ├── css/
    │   ├── tokens.css             ← Warna, radius, shadow, spacing, font (SATU SUMBER)
    │   └── layout.css             ← Mekanik header/sidebar/drawer/footer/search
    ├── js/
    │   ├── tailwind-config.js     ← Konfigurasi Tailwind bersama
    │   ├── tools-data.js          ← DATABASE SEMUA TOOL (SATU SUMBER)
    │   └── layout.js              ← Mesin: fetch komponen, search, breadcrumb,
    │                                 active-menu, tema, favorit, riwayat
    └── components/
        ├── header.html
        ├── sidebar.html
        ├── mobile-menu.html
        └── footer.html
```

## Cara menambah tool baru (100–500 halaman tanpa edit manual)

1. **Copy folder `_template/`** → beri nama sesuai tool, mis. `qr-scanner/`.
2. Ganti judul & isi di dalam `<main id="page-content">` dengan UI tool Anda.
   Tulis `<style>`/`<script>` khusus tool di tempat yang sudah ditandai
   komentar di file template — **jangan** ubah bagian header/sidebar/footer.
3. Tambahkan **satu objek** ke `assets/js/tools-data.js`:
   ```js
   { id: 'qr-scanner', name: 'QR Scanner', desc: 'Pindai QR Code dari kamera atau gambar.',
     icon: 'fa-solid fa-qrcode', category: 'util', url: '/qr-scanner/' },
   ```
4. Selesai. Tanpa reload konfigurasi apapun, otomatis akan muncul di:
   - Sidebar desktop (dikelompokkan per kategori)
   - Mobile drawer
   - Pencarian instan (header & drawer)
   - Grid & filter kategori di homepage
   - Breadcrumb otomatis saat halaman tool dibuka
   - Active-menu (link ter-highlight saat berada di halaman itu)

`id` **harus** sama dengan nama folder, dan `url` **harus** absolut dari root
(`/qr-scanner/`, diakhiri `/`) — dua hal ini yang dipakai `layout.js` untuk
mendeteksi halaman aktif.

## Kategori

Kategori didefinisikan di `window.CATEGORIES` (atas `tools-data.js`). Tambah
kategori baru cukup tambah satu objek `{ id, label, icon }` di sana — sidebar,
drawer, dan filter homepage otomatis menyesuaikan.

## Dark / Light mode

Diatur global oleh `layout.js`, disimpan di `localStorage.theme`. Tema
diterapkan **sebelum** komponen di-fetch supaya tidak ada flash warna.

## Favorit & Riwayat

Disimpan per-browser di `localStorage` (`296tools_favorites`,
`296tools_recent`). Bintang di setiap baris nav / card tool untuk favorit;
riwayat terisi otomatis setiap kali halaman tool dikunjungi.

## Desain token

Semua nilai visual (warna, radius, shadow, spacing, font, lebar sidebar,
tinggi header) ada di `assets/css/tokens.css`. **Jangan** hardcode warna/­radius
di halaman tool — pakai `var(--nama-token)` atau class Tailwind yang sudah
dipetakan (`brand-light`, `brand-accent`, dst, lihat `tailwind-config.js`).

## Catatan deployment

- Semua path komponen memakai path **absolut dari root** (`/assets/...`).
  Cocok untuk deploy di root domain (GitHub Pages custom domain, Cloudflare
  Pages, dsb). Jika di-hosting di sub-path, sesuaikan `BASE` di
  `assets/js/layout.js` dan seluruh path `/assets/...` di head setiap halaman.
- Karena komponen dimuat via `fetch()`, situs **harus diakses lewat HTTP(S)**
  (server lokal, GitHub Pages, dst) — tidak akan bekerja dibuka langsung
  sebagai file lewat `file://` karena browser memblokir fetch lintas file lokal.
- Sudah diuji: seluruh path resolve 200, semua script lolos syntax-check,
  dan seluruh interaksi (search, active-menu, breadcrumb, dark mode, sidebar
  collapse, mobile drawer, favorit) diverifikasi lolos via automated headless
  browser test.

## Tool yang sudah dimigrasi

Seluruh 14 tool berikut sudah dipindahkan ke arsitektur baru ini — logika unik
masing-masing tool tetap 100% berfungsi seperti sebelumnya, hanya bagian shell
(header/footer/modal lama) yang digantikan komponen bersama:

`converter-file`, `dummy-img`, `fake-post-x`, `favicon-maker`,
`generator-qr-code`, `google-dorking`, `image-compresor`, `invoice-maker`,
`prompt-generator`, `scraping-fb-reels`, `smart-hpp`, `url-shortener`,
`wa-link-generator`, `web-scanner`.

Setiap migrasi diverifikasi otomatis: tag HTML seimbang, seluruh `<script>`
lolos `node --check`, setiap `getElementById(...)` dicocokkan terhadap `id`
yang benar-benar ada di halaman (untuk menangkap modal/elemen yang aslinya
berada di luar `<main>`, seperti toast, konfirmasi kustom, atau canvas
tersembunyi), dan seluruh halaman dites lewat headless browser untuk
memastikan tidak ada JavaScript error nyata.

### Pengecualian desain: `rekap/`

`rekap` (Rekap Keuangan) sengaja **tidak** memakai shell sidebar/header global.
Tool ini didesain sebagai mini-app "phone frame" (kartu selebar 390px, mirip
aplikasi ponsel) dengan header, bottom-nav, dan modalnya sendiri — memaksakan
sidebar desktop ke desain ini akan merusak nuansa UX yang memang disengaja.

Yang tetap disatukan ke arsitektur baru:
- Sumber data tool: memakai `window.TOOLS` dari `/assets/js/tools-data.js`
  (array `ALL_TOOLS` lokal yang usang sudah dihapus).
- Warna: memakai `/assets/css/tokens.css` (bukan lagi duplikat `:root`/`.dark`).
- Tautan "Beranda" dan navigasi memakai path absolut (`/`).
- Tetap menyertakan `layout.js` agar kunjungan ke `rekap` tercatat di riwayat
  ("Baru Dibuka") pada sidebar tool-tool lain.

Jika suatu saat ingin `rekap` mengikuti layout sidebar standar seperti tool
lain, tinggal terapkan pola yang sama seperti pada `converter-file`/`dummy-img`
(pindahkan konten unik ke dalam `<main id="page-content">` pada template).
