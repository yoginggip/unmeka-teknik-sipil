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
| `index.html` | Beranda: foto kampus, tentang prodi, pendaftaran, berita, bidang kajian, dosen, galeri, identitas dan mitra |
| `profil.html` | Identitas, visi dan misi, sejarah, struktur organisasi |
| `akademik.html` | Bidang kajian dan penjelajah kurikulum |
| `dosen.html` | Daftar dan profil dosen |
| `fasilitas.html` | Laboratorium, perpustakaan, galeri |
| `penelitian.html` | Penelitian, pengabdian, publikasi, prestasi |
| `berita.html` | Daftar dan detail berita |
| `pmb.html` | Jalur pendaftaran, wizard pilih jalur, informasi biaya, FAQ |
| `kontak.html` | Kontak, peta, formulir pesan |
| `404.html` | Halaman tidak ditemukan |
| `admin/` | Panel administrator (prototipe) |

## Struktur

```
assets/css/style.css        gaya seluruh situs
assets/js/data.js           konten (dosen, berita, jalur, kurikulum, dll.)
assets/js/app.js            layout bersama, ikon, pencarian, utilitas
assets/js/fx.js             animasi (reveal bertahap, judul per baris, parallax, penghitung)
assets/img/                 logo dan foto
admin/                      panel administrator
```

## Kualitas

- Seluruh halaman publik diperiksa dengan axe-core (aksesibilitas WCAG) di lebar 1440 px dan 390 px:
  tanpa pelanggaran, tanpa error JavaScript, dan tanpa gulir horizontal.
- Warna emas untuk teks di latar terang memakai `--gold-700` agar kontrasnya memenuhi WCAG AA.
- Formulir kontak membuka aplikasi email pengunjung dengan pesan yang sudah terisi, karena situs statis
  tidak memiliki server pengirim.
- `robots.txt` menutup folder `admin/` dari mesin pencari. Meta `og:image` masih berupa alamat relatif;
  ganti dengan alamat lengkap setelah domain situs ditetapkan.

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
