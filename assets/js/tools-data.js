/**
 * 296TOOLS — DATABASE TOOL (SINGLE SOURCE OF TRUTH)
 * =============================================================================
 * CARA MENAMBAH TOOL BARU (tanpa sentuh file lain sama sekali):
 *   1. Buat folder baru, mis. /nama-tool-baru/index.html (boleh copy dari /_template/).
 *   2. Tambahkan SATU objek baru ke array TOOLS di bawah ini.
 *   3. Selesai — menu sidebar, mobile drawer, pencarian, breadcrumb, active-menu,
 *      dan grid homepage akan otomatis menampilkan tool baru tersebut.
 *
 * Field:
 *   id       : slug unik, HARUS sama dengan nama folder (dipakai utk deteksi active menu & url)
 *   name     : nama tampilan tool
 *   desc     : deskripsi singkat (1 kalimat, tampil di card & search)
 *   icon     : class Font Awesome
 *   category : id kategori (harus salah satu dari CATEGORIES di bawah)
 *   url      : path ABSOLUT dari root domain, selalu diakhiri "/" → "/nama-folder/"
 *   badge    : (opsional) label kecil, mis. 'Baru', 'Populer'
 *   keywords : (opsional) array kata kunci tambahan untuk pencarian
 * =============================================================================
 */

window.CATEGORIES = [
  { id: 'all', label: 'Semua', icon: 'fa-solid fa-border-all' },
  { id: 'dokumen', label: 'Dokumen & File', icon: 'fa-solid fa-file-lines' },
  { id: 'gambar', label: 'Gambar & Media', icon: 'fa-regular fa-images' },
  { id: 'generator', label: 'Generator', icon: 'fa-solid fa-wand-magic-sparkles' },
  { id: 'bisnis', label: 'Bisnis & Keuangan', icon: 'fa-solid fa-briefcase' },
  { id: 'sosial', label: 'Media Sosial', icon: 'fa-solid fa-share-nodes' },
  { id: 'util', label: 'Utilitas', icon: 'fa-solid fa-wrench' },
];

window.TOOLS = [
  { id: 'converter-file', name: 'Converter File', desc: 'Pengkonversi berkas PDF, Word, Teks, & Gambar', icon: 'fa-solid fa-file', category: 'dokumen', url: '/converter-file/' },
  { id: 'dummy-img', name: 'Dummy Img', desc: 'Buat gambar placeholder kustom dengan warna solid atau gambar sendiri', icon: 'fa-regular fa-images', category: 'gambar', url: '/dummy-img/' },
  { id: 'fake-post-x', name: 'Fake Post X', desc: 'Pembuat screenshot postingan media sosial X secara instan', icon: 'fa-brands fa-x-twitter', category: 'sosial', url: '/fake-post-x/' },
  { id: 'favicon-maker', name: 'Favicon Maker', desc: 'Pembuat & kompresor favicon modern terlengkap (.ico & .png)', icon: 'fa-solid fa-file-image', category: 'gambar', url: '/favicon-maker/' },
  { id: 'generator-qr-code', name: 'Generator QR Code', desc: 'Pembuat QR Code premium dengan warna & logo kustom', icon: 'fa-solid fa-qrcode', category: 'generator', url: '/generator-qr-code/' },
  { id: 'google-dorking', name: 'Google Dorking', desc: 'Pembuat query pencarian lanjutan (dork) Google untuk riset & keamanan', icon: 'fa-brands fa-google', category: 'util', url: '/google-dorking/' },
  { id: 'image-compresor', name: 'Image Compressor', desc: 'Pengkompres ukuran dimensi & kapasitas kilobyte gambar', icon: 'fa-regular fa-images', category: 'gambar', url: '/image-compresor/' },
  { id: 'invoice-maker', name: 'Invoice Maker', desc: 'Pembuat berkas tagihan (invoice) praktis terkompresi PDF', icon: 'fa-solid fa-file-invoice', category: 'bisnis', url: '/invoice-maker/' },
  { id: 'prompt-generator', name: 'Prompt Generator', desc: 'Pembuat format prompt siap pakai untuk optimasi ChatGPT/Claude', icon: 'fa-regular fa-keyboard', category: 'generator', url: '/prompt-generator/' },
  { id: 'rekap', name: 'Rekap Keuangan', desc: 'Merekap keuangan dimanapun dan kapanpun', icon: 'fa-solid fa-rupiah-sign', category: 'bisnis', url: '/rekap/' },
  { id: 'scraping-fb-reels', name: 'Scraping Link FB Reels', desc: 'Ekstraktor tautan (URL) reel profil publik dari Facebook', icon: 'fa-brands fa-facebook', category: 'sosial', url: '/scraping-fb-reels/' },
  { id: 'smart-hpp', name: 'Smart HPP', desc: 'Kalkulator HPP & harga jual anti boncos bagi pemilik bisnis', icon: 'fa-solid fa-calculator', category: 'bisnis', url: '/smart-hpp/' },
  { id: 'url-shortener', name: 'URL Shortener', desc: 'Pangkas URL panjang menjadi ringkas dan mudah dibagikan', icon: 'fa-solid fa-link', category: 'util', url: '/url-shortener/' },
  { id: 'wa-link-generator', name: 'WA Link Generator', desc: 'Pembuat link pesan instan WhatsApp otomatis', icon: 'fa-brands fa-whatsapp', category: 'generator', url: '/wa-link-generator/' },
  { id: 'web-scanner', name: 'Web Scanner', desc: 'Scan dokumen dengan mudah dan dimana saja', icon: 'fa-brands fa-searchengin', category: 'util', url: '/web-scanner/' },
  { id: 'webp-converter', name: 'WebP Converter', desc: 'Konversi JPG/PNG ke WebP secara massal agar ringan saat diunggah ke Blogger', icon: 'fa-solid fa-file-export', category: 'gambar', url: '/webp-converter/', badge: 'Baru', keywords: ['webp', 'konversi gambar', 'kompres blogger', 'convert jpg png'] },

  // ANDA BISA MENAMBAHKAN TOOL BARU DI SINI SECARA MUDAH!
  // Contoh:
  // { id: 'nama-tool-baru', name: 'Nama Tool Baru', desc: 'Deskripsi singkat.',
  //   icon: 'fa-solid fa-check', category: 'util', url: '/nama-tool-baru/' },
];
