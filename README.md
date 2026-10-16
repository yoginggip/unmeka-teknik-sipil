# Website Profil Program Studi Teknik Sipil UNMEKA

Prototipe website profil Program Studi Sarjana Teknik Sipil, Fakultas Teknik dan Informatika,
Universitas Nusa Megarkencana (UNMEKA), Yogyakarta. Dibuat sebagai media informasi, publikasi,
dan promosi program studi.

Situs statis (HTML, CSS, JavaScript) tanpa proses build.

## Menjalankan

```bash
python -m http.server 5173
```

Lalu buka `http://localhost:5173`.

## Halaman

| Halaman | Isi |
|---|---|
| `index.html` | Beranda: jembatan kabel 3D interaktif, teks berjalan, tentang prodi, simulasi "gulir untuk membangun", pendaftaran, berita, bidang kajian, dosen, galeri, lab balok interaktif, simulator gempa, mitra |
| `profil.html` | Identitas, visi dan misi, sejarah, struktur organisasi |
| `akademik.html` | Bidang kajian dan penjelajah kurikulum |
| `dosen.html` | Daftar dan profil dosen |
| `fasilitas.html` | Laboratorium, perpustakaan, galeri |
| `penelitian.html` | Penelitian, pengabdian, publikasi, prestasi |
| `berita.html` | Daftar dan detail berita |
| `pmb.html` | Jalur pendaftaran, wizard pilih jalur, informasi biaya, FAQ |
| `kontak.html` | Kontak, peta, formulir pesan |
| `jembatan.html` | Mini game "Uji Jembatan" (simulasi rangka batang) |
| `admin/` | Panel administrator (prototipe) |

## Struktur

```
assets/css/style.css        gaya seluruh situs
assets/js/data.js           konten (dosen, berita, jalur, kurikulum, dll.)
assets/js/app.js            layout bersama, ikon, pencarian, utilitas
assets/js/fx.js             efek interaksi (parallax, reveal, penghitung)
assets/js/flair.js          kursor khusus, tombol magnetis, efek label, teks berjalan
assets/js/wow.js            beranda: gulir untuk membangun, lab balok, hero 2D cadangan
assets/js/hero3d.js         jembatan kabel 3D di hero (three.js)
assets/js/quake-engine.js   mesin fisika simulator gempa (bisa diuji di Node)
assets/js/quake-game.js     antarmuka simulator gempa
assets/js/vendor/           three.js r149 (lisensi MIT)
assets/js/bridge-engine.js  mesin fisika mini game (bisa diuji di Node)
assets/js/bridge-game.js    antarmuka mini game
assets/img/                 logo dan foto
admin/                      panel administrator
```

## Catatan data

- Identitas, dosen, akreditasi, visi-misi, sejarah, jalur pendaftaran, berita, prestasi, logo, dan
  foto bersumber dari [unmeka.ac.id](https://unmeka.ac.id).
- Kurikulum per semester, daftar laboratorium, dan detail dosen (NIDN, bidang keahlian) masih
  bersifat sementara dan menunggu data resmi program studi.
- Biaya kuliah belum dicantumkan. Isi `daftar`, `spp`, dan `gedung` pada data `jalur` di
  `assets/js/data.js` agar kalkulator biaya tampil otomatis.

## Panel admin (prototipe)

Login demo: `admin@unmeka.ac.id` / `admin123`. Data disimpan di `localStorage` browser, bukan
database, dan hanya untuk demonstrasi. Versi produksi direncanakan dengan Laravel + MySQL.

Logo, foto, dan materi visual adalah milik Universitas Nusa Megarkencana.
