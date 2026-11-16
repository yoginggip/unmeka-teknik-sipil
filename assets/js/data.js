/* Konten website. Data bertanda "contoh" menunggu data resmi dari prodi. */
window.UNMEKA = {
  site: {
    prodi: "Teknik Sipil",
    univ: "Universitas Nusa Megarkencana",
    tagline: "Unggul, Mandiri, Berdaya Saing",
    fakultas: "Fakultas Teknik dan Informatika",
    kaprodi: "Aep Saepuloh, ST., MT",
    dekan: "Dr. Dyah Anggraini, SKom., MEngSc., MMSI., MIKom., PhD",
    rektor: "Dr. Misdiyono, SE., MM., MIKom",
    akreditasi: "Baik",
    alamat: "Jl. A.M. Sangaji No.49, Cokrodiningratan, Kec. Jetis, Kota Yogyakarta, DIY 55233",
    telp: "(0274) 518 987",
    email: "mail@unmeka.ac.id",
    maps: "https://www.google.com/maps?q=-7.775912504661314%2C110.36503474418029",
    daftar: "https://pendaftaran.unmeka.ac.id/",
    ejournal: "https://ejournal.unmeka.ac.id/",
    kalender: "https://unmeka.ac.id/page/kalender-akademik",
    perpustakaan: "https://unmeka.ac.id/page/perpustakaan",
    web: "https://unmeka.ac.id/",
    wa: "", /* nomor WhatsApp PMB, format 62812xxxxxxx; kosong = tombol diarahkan ke halaman Kontak */
  },

  dosen: [
    { id: 1, nama: "Aep Saepuloh, ST., MT", jabatan: "Ketua Program Studi", bidang: "Teknik Sipil", nidn: "", pendidikan: "Magister Teknik (M.T.)", email: "", fokus: "" },
    { id: 2, nama: "Ade Suhendar Sutisna, ST., MT", jabatan: "Dosen Tetap", bidang: "Teknik Sipil", nidn: "", pendidikan: "Magister Teknik (M.T.)", email: "", fokus: "" },
    { id: 3, nama: "Nur Fatihah, ST., MT", jabatan: "Dosen Tetap", bidang: "Teknik Sipil", nidn: "", pendidikan: "Magister Teknik (M.T.)", email: "", fokus: "" },
    { id: 4, nama: "Alma Hastari Salsabila, ST., MT", jabatan: "Dosen Tetap", bidang: "Teknik Sipil", nidn: "", pendidikan: "Magister Teknik (M.T.)", email: "", fokus: "" },
    { id: 5, nama: "Sutrisno, ST., MT", jabatan: "Dosen Tetap", bidang: "Teknik Sipil", nidn: "", pendidikan: "Magister Teknik (M.T.)", email: "", fokus: "" },
  ],

  bidang: [
    { id: "struktur", nama: "Struktur", icon: "bridge", desk: "Analisis dan perancangan gedung, jembatan, dan bangunan agar aman terhadap beban dan gempa.", mk: ["Analisis Struktur", "Struktur Beton", "Struktur Baja", "Rekayasa Gempa"] },
    { id: "geoteknik", nama: "Geoteknik", icon: "layers", desk: "Perilaku tanah dan batuan untuk pondasi, lereng, galian, dan perbaikan tanah.", mk: ["Mekanika Tanah", "Rekayasa Pondasi"] },
    { id: "transportasi", nama: "Transportasi", icon: "road", desk: "Perencanaan jalan, perkerasan, dan sistem lalu lintas yang aman dan efisien.", mk: ["Rekayasa Lalu Lintas", "Perancangan Jalan", "Perkerasan Jalan"] },
    { id: "hidro", nama: "Keairan", icon: "droplet", desk: "Hidrologi, hidrolika, irigasi, drainase, dan bangunan air.", mk: ["Hidrologi", "Hidrolika", "Bangunan Air"] },
    { id: "manajemen", nama: "Manajemen Konstruksi", icon: "clipboard", desk: "Pengelolaan biaya, waktu, mutu, dan keselamatan kerja pada proyek konstruksi.", mk: ["Manajemen Konstruksi", "Estimasi Biaya", "K3 Konstruksi"] },
  ],

  /* contoh — menunggu dokumen kurikulum resmi */
  kurikulum: {
    1: [["Matematika Teknik I", 3], ["Fisika Dasar", 3], ["Kimia Dasar", 2], ["Gambar Teknik", 3], ["Pengantar Teknik Sipil", 2], ["Bahasa Indonesia", 2], ["Pendidikan Pancasila", 2], ["Bahasa Inggris", 2]],
    2: [["Matematika Teknik II", 3], ["Statika", 3], ["Mekanika Bahan", 3], ["Ilmu Ukur Tanah", 3], ["Teknologi Bahan Konstruksi", 3], ["Komputer & CAD", 3], ["Pendidikan Agama", 2]],
    3: [["Analisis Struktur I", 3], ["Mekanika Fluida", 3], ["Mekanika Tanah I", 3], ["Teknik Transportasi", 3], ["Statistika & Probabilitas", 3], ["Survei & Pemetaan", 3], ["Kewarganegaraan", 2]],
    4: [["Analisis Struktur II", 3], ["Hidrolika", 3], ["Mekanika Tanah II", 3], ["Rekayasa Lalu Lintas", 3], ["Struktur Beton I", 3], ["Struktur Baja I", 3], ["Metode Numerik", 2]],
    5: [["Struktur Beton II", 3], ["Struktur Baja II", 3], ["Rekayasa Pondasi", 3], ["Hidrologi", 3], ["Perancangan Jalan", 3], ["Manajemen Konstruksi", 3], ["Dinamika Struktur", 2]],
    6: [["Rekayasa Gempa", 3], ["Bangunan Air", 3], ["Perkerasan Jalan", 3], ["Estimasi Biaya", 3], ["Rekayasa Lingkungan", 2], ["BIM untuk Teknik Sipil", 3], ["Metodologi Penelitian", 2]],
    7: [["Kerja Praktik", 3], ["Kuliah Kerja Nyata", 3], ["Mata Kuliah Pilihan I", 3], ["Mata Kuliah Pilihan II", 3], ["Etika Profesi & K3", 2], ["Kewirausahaan", 2]],
    8: [["Tugas Akhir", 6]],
  },

  /* contoh — menunggu data laboratorium resmi */
  lab: [
    { id: "bahan", nama: "Bahan & Beton", icon: "flask", desk: "Pengujian agregat, rancangan campuran, dan kuat tekan beton.", praktikum: ["Analisis saringan agregat", "Rancangan campuran beton", "Uji slump", "Uji kuat tekan"] },
    { id: "tanah", nama: "Mekanika Tanah", icon: "layers", desk: "Pengujian sifat fisik dan mekanik tanah untuk perencanaan pondasi.", praktikum: ["Kadar air & berat jenis", "Batas Atterberg", "Uji pemadatan", "Uji geser langsung"] },
    { id: "hidro", nama: "Hidrolika", icon: "droplet", desk: "Pengamatan aliran pada saluran terbuka dan pipa dengan model fisik.", praktikum: ["Aliran saluran terbuka", "Ambang dan pelimpah", "Kehilangan energi pada pipa"] },
    { id: "survei", nama: "Survei & Pemetaan", icon: "ruler", desk: "Pengukuran lapangan dan pemetaan topografi.", praktikum: ["Pengukuran sipat datar", "Pengukuran poligon", "Pemetaan situasi"] },
    { id: "komputer", nama: "Komputasi & CAD", icon: "monitor", desk: "Penggambaran teknik dan analisis struktur berbantuan perangkat lunak.", praktikum: ["Gambar teknik dengan CAD", "Pemodelan struktur", "Pengenalan BIM"] },
  ],

  berita: [
    { id: 1, judul: "Borong Juara! Tim Bola Voli UNMEKA Sandingkan Gelar Juara 1 Putra dan Putri di GAMA CUP UGM 2026", kategori: "Prestasi", tanggal: "2026-10-09", ringkas: "Tim bola voli UNMEKA meraih juara 1 kategori putra dan putri pada GAMA CUP UGM 2026.", isi: "Tim bola voli Universitas Nusa Megarkencana meraih juara 1 pada kategori putra maupun putri dalam ajang GAMA CUP UGM 2026 di Yogyakarta.\n\nLandung Ramadani dinobatkan sebagai MVP Putra Terbaik dan Siti Rachmi sebagai MVP Putri Terbaik.\n\nSumber: unmeka.ac.id/berita/gama-cup-ugm-2026.", gambar: "berita/gama-cup-2026-juara.webp", thumb: "berita/gama-cup-2026-thumb.jpg", galeri: [["berita/gama-cup-2026-mvp-putra.webp", "Landung Ramadani, MVP Putra Terbaik"], ["berita/gama-cup-2026-mvp-putri.webp", "Siti Rachmi, MVP Putri Terbaik"]] },
    { id: 3, judul: "Menyemai Semangat di Lapangan: Tim Voli Universitas Nusa Megarkencana Ukir Prestasi di GAMACUP 2024", kategori: "Kegiatan", tanggal: "2024-09-17", ringkas: "Tim bola voli UNMEKA mengikuti kompetisi GAMACUP 2024.", isi: "Tim bola voli UNMEKA mengikuti kompetisi GAMACUP 2024.\n\nSumber: unmeka.ac.id.", gambar: "web/article-01.jpg" },
    { id: 4, judul: "Pembekalan dan Pelepasan Mahasiswa MBKM Kampus Mengajar Angkatan 8 Tahun 2024 di Universitas Nusa Megarkencana", kategori: "Kegiatan", tanggal: "2024-09-02", ringkas: "UNMEKA melepas mahasiswa peserta program MBKM Kampus Mengajar angkatan 8.", isi: "UNMEKA menggelar acara pelepasan mahasiswa peserta program MBKM Kampus Mengajar angkatan 8.\n\nSumber: unmeka.ac.id.", gambar: "web/article-02.jpg" },
    { id: 5, judul: "STIE Nusa Megarkencana Resmi Bertransformasi Menjadi Universitas Nusa Megarkencana", kategori: "Kampus", tanggal: "2024-08-22", ringkas: "STIE Nusa Megarkencana bertransformasi menjadi Universitas Nusa Megarkencana berdasarkan SK Mendikbudristek Nomor 502/E/O/2024.", isi: "Melalui Surat Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 502/E/O/2024 tertanggal 23 Juli 2024, STIE Nusa Megarkencana memperoleh izin perubahan bentuk menjadi Universitas Nusa Megarkencana (UNMEKA).\n\nUNMEKA kini memiliki dua fakultas, yaitu Fakultas Ekonomi dan Bisnis serta Fakultas Teknik dan Informatika. Program Studi Teknik Sipil berada di Fakultas Teknik dan Informatika.", gambar: "web/article-03.jpg" },
  ],

  agenda: [],

  /* contoh — pengumuman resmi diisi admin prodi lewat panel admin */
  pengumuman: [
    { id: 1, judul: "Jadwal pengisian KRS semester genap", kategori: "KRS", tanggal: "2026-11-02", penting: true, isi: "Pengisian Kartu Rencana Studi (KRS) semester genap dilakukan melalui sistem akademik sesuai jadwal pada kalender akademik.\nMahasiswa diharapkan berkonsultasi dengan dosen pembimbing akademik sebelum mengisi KRS.", contoh: true },
    { id: 2, judul: "Batas pengumpulan proposal tugas akhir", kategori: "Tugas Akhir", tanggal: "2026-10-28", isi: "Mahasiswa yang akan mengambil tugas akhir mengumpulkan proposal kepada koordinator tugas akhir program studi.\nFormat proposal mengikuti pedoman tugas akhir yang tersedia di halaman Unduhan.", contoh: true },
    { id: 3, judul: "Kuliah lapangan mata kuliah Ilmu Ukur Tanah", kategori: "Akademik", tanggal: "2026-10-20", isi: "Kuliah lapangan dilaksanakan di area kampus. Mahasiswa membawa perlengkapan pengukuran sesuai arahan dosen pengampu.", contoh: true },
    { id: 4, judul: "Pembukaan pendaftaran mahasiswa baru 2026", kategori: "PMB", tanggal: "2026-10-10", isi: "Pendaftaran mahasiswa baru dibuka melalui enam jalur. Informasi lengkap tersedia di halaman Pendaftaran.", contoh: true },
  ],

  /* contoh — dokumen resmi menunggu dari prodi; isi "url" bila berkas sudah tersedia */
  unduhan: [
    { kat: "Akademik", judul: "Kalender Akademik", ket: "Jadwal registrasi, perkuliahan, ujian, dan libur akademik", url: "https://unmeka.ac.id/page/kalender-akademik", jenis: "Tautan" },
    { kat: "Akademik", judul: "Buku Pedoman Akademik", ket: "Aturan akademik, sistem kredit, dan evaluasi studi", url: "", jenis: "PDF", contoh: true },
    { kat: "Akademik", judul: "Struktur Kurikulum Teknik Sipil", ket: "Daftar mata kuliah per semester beserta SKS", url: "", jenis: "PDF", contoh: true },
    { kat: "Tugas Akhir", judul: "Pedoman Penulisan Tugas Akhir", ket: "Format penulisan, sistematika, dan tata cara sidang", url: "", jenis: "PDF", contoh: true },
    { kat: "Tugas Akhir", judul: "Formulir Pengajuan Judul Tugas Akhir", ket: "Diisi bersama calon dosen pembimbing", url: "", jenis: "DOCX", contoh: true },
    { kat: "Formulir", judul: "Formulir Kerja Praktik", ket: "Pengajuan kerja praktik ke instansi atau perusahaan", url: "", jenis: "DOCX", contoh: true },
    { kat: "Formulir", judul: "Formulir Cuti Akademik", ket: "Pengajuan cuti studi satu semester", url: "", jenis: "DOCX", contoh: true },
    { kat: "Akreditasi", judul: "Sertifikat Akreditasi Program Studi", ket: "Status akreditasi Baik", url: "", jenis: "PDF", contoh: true },
  ],

  /* contoh — rumusan umum; menunggu dokumen kurikulum resmi prodi */
  profilLulusan: [
    { icon: "ruler", t: "Perencana dan perancang", d: "Merencanakan dan merancang struktur bangunan, jalan, jembatan, dan bangunan air." },
    { icon: "hardhat", t: "Pelaksana konstruksi", d: "Memimpin pelaksanaan pekerjaan konstruksi di lapangan sesuai mutu, biaya, dan waktu." },
    { icon: "eye", t: "Pengawas dan konsultan", d: "Mengawasi mutu pekerjaan dan memberi konsultasi teknis pada proyek konstruksi." },
    { icon: "clipboard", t: "Manajer proyek", d: "Mengelola sumber daya, jadwal, biaya, dan keselamatan kerja proyek." },
    { icon: "flask", t: "Peneliti dan akademisi", d: "Mengembangkan ilmu dan teknologi teknik sipil melalui penelitian dan pengajaran." },
    { icon: "briefcase", t: "Wirausaha jasa konstruksi", d: "Membangun usaha di bidang jasa konstruksi, konsultan, atau material bangunan." },
  ],
  cpl: [
    { a: "Sikap", items: ["Bertakwa kepada Tuhan Yang Maha Esa serta menjunjung nilai kemanusiaan dan etika profesi insinyur.", "Bertanggung jawab atas pekerjaan di bidang keahliannya secara mandiri."] },
    { a: "Pengetahuan", items: ["Menguasai konsep matematika, fisika, dan mekanika sebagai dasar analisis rekayasa sipil.", "Menguasai prinsip perancangan struktur, geoteknik, transportasi, keairan, dan manajemen konstruksi."] },
    { a: "Keterampilan umum", items: ["Mampu berpikir logis, kritis, dan sistematis dalam menyelesaikan masalah rekayasa.", "Mampu berkomunikasi dan bekerja sama dalam tim multidisiplin."] },
    { a: "Keterampilan khusus", items: ["Mampu menganalisis dan merancang komponen infrastruktur sesuai standar yang berlaku.", "Mampu menggunakan perangkat lunak rekayasa serta merencanakan biaya dan jadwal proyek."] },
  ],

  /* contoh — lowongan resmi diisi admin prodi lewat panel admin */
  lowongan: [
    { id: 1, posisi: "Drafter Struktur", instansi: "Konsultan perencana struktur", jenis: "Kerja", lokasi: "Yogyakarta", batas: "2026-12-15", tanggal: "2026-11-02", ringkas: "Menyusun gambar kerja struktur beton bertulang dan baja menggunakan AutoCAD dan Revit.", syarat: "Lulusan S1 Teknik Sipil\nMenguasai AutoCAD; Revit menjadi nilai tambah\nMampu membaca gambar struktur", tautan: "", contoh: true },
    { id: 2, posisi: "Magang Pelaksana Lapangan", instansi: "Kontraktor bangunan gedung", jenis: "Magang", lokasi: "Sleman", batas: "2026-11-30", tanggal: "2026-10-28", ringkas: "Membantu pengawasan pekerjaan struktur di proyek gedung bertingkat selama tiga bulan.", syarat: "Mahasiswa Teknik Sipil minimal semester 5\nBersedia bekerja di lapangan\nMemahami dasar K3 konstruksi", tautan: "", contoh: true },
    { id: 3, posisi: "Estimator Biaya (Quantity Surveyor)", instansi: "Perusahaan jasa konstruksi", jenis: "Kerja", lokasi: "Yogyakarta", batas: "2027-01-10", tanggal: "2026-10-20", ringkas: "Menghitung volume pekerjaan, menyusun RAB, dan memantau biaya proyek.", syarat: "Lulusan S1 Teknik Sipil\nMenguasai Microsoft Excel dan analisa harga satuan\nTeliti dan mampu bekerja dalam tim", tautan: "", contoh: true },
    { id: 4, posisi: "Magang Surveyor Pemetaan", instansi: "Konsultan survei dan pemetaan", jenis: "Magang", lokasi: "Bantul", batas: "2026-12-20", tanggal: "2026-10-15", ringkas: "Membantu pengukuran topografi menggunakan total station dan pengolahan data pengukuran.", syarat: "Mahasiswa Teknik Sipil minimal semester 4\nTelah lulus mata kuliah Ilmu Ukur Tanah", tautan: "", contoh: true },
  ],

  /* foto kampus dari unmeka.ac.id */
  galeri: [
    ["web/home-pic-1.jpg", "Mahasiswa di depan gedung Universitas Nusa Megarkencana"],
    ["slider-2.jpg", "Diskusi mahasiswa di lingkungan kampus"],
    ["web/article-05.jpg", "Sidang terbuka wisuda"],
    ["web/home-pic-2.jpg", "Kegiatan mahasiswa di halaman kampus"],
    ["slider-3.jpg", "Belajar bersama"],
    ["web/article-03.jpg", "Penyerahan surat keputusan perubahan bentuk menjadi universitas"],
    ["web/article-01.jpg", "Tim bola voli UNMEKA pada GAMACUP 2024"],
    ["web/article-04.jpg", "Pelepasan mahasiswa program MBKM Kampus Mengajar 7"],
  ],

  /* album galeri: foto[0] menjadi sampul. Foto dari unmeka.ac.id; tanggal kosong bila tidak diketahui */
  album: [
    { id: 1, judul: "GAMA CUP UGM 2026", kategori: "Kegiatan", tanggal: "2026-10-09", ket: "Tim bola voli UNMEKA meraih juara 1 kategori putra dan putri pada GAMA CUP UGM 2026.",
      foto: [["berita/gama-cup-2026-juara.webp", "Tim bola voli UNMEKA juara GAMA CUP UGM 2026"], ["berita/gama-cup-2026-mvp-putra.webp", "Landung Ramadani, MVP Putra Terbaik"], ["berita/gama-cup-2026-mvp-putri.webp", "Siti Rachmi, MVP Putri Terbaik"]] },
    { id: 2, judul: "GAMACUP 2024", kategori: "Kegiatan", tanggal: "2024-09-17", ket: "Tim bola voli UNMEKA mengikuti kompetisi GAMACUP 2024.", foto: [["web/article-01.jpg", "Tim bola voli UNMEKA pada GAMACUP 2024"]] },
    { id: 3, judul: "Pembekalan dan Pelepasan MBKM Kampus Mengajar Angkatan 8", kategori: "Kegiatan", tanggal: "2024-09-02", ket: "", foto: [["web/article-02.jpg", "Pembekalan dan pelepasan mahasiswa MBKM Kampus Mengajar Angkatan 8"]] },
    { id: 4, judul: "Peresmian Universitas Nusa Megarkencana", kategori: "Kegiatan", tanggal: "2024-08-22", ket: "STIE Nusa Megarkencana bertransformasi menjadi Universitas Nusa Megarkencana.", foto: [["web/article-03.jpg", "Penyerahan surat keputusan perubahan bentuk menjadi universitas"]] },
    { id: 5, judul: "Pelepasan MBKM Kampus Mengajar 7", kategori: "Kegiatan", tanggal: "", ket: "", foto: [["web/article-04.jpg", "Pelepasan mahasiswa program MBKM Kampus Mengajar 7"]] },
    { id: 6, judul: "Sidang Terbuka Wisuda", kategori: "Kegiatan", tanggal: "", ket: "", foto: [["web/article-05.jpg", "Sidang terbuka wisuda"]] },
    { id: 7, judul: "Lingkungan Kampus", kategori: "Fasilitas", tanggal: "", ket: "Gedung dan suasana kampus Universitas Nusa Megarkencana.",
      foto: [["web/home-pic-1.jpg", "Mahasiswa di depan gedung Universitas Nusa Megarkencana"], ["slider-2.jpg", "Diskusi mahasiswa di lingkungan kampus"], ["web/home-pic-2.jpg", "Kegiatan mahasiswa di halaman kampus"], ["slider-3.jpg", "Belajar bersama"]] },
  ],

  mitra: [["partner-kampus-merdeka.webp", "Kampus Merdeka"], ["partner-google.webp", "Google"], ["partner-microsoft.webp", "Microsoft"], ["partner-nvidia.webp", "NVIDIA"]],

  prestasi: [
    { tahun: 2026, juara: "Juara 1", lomba: "GAMA CUP UGM 2026, Bola Voli Putra", tim: "Tim Bola Voli UNMEKA" },
    { tahun: 2026, juara: "Juara 1", lomba: "GAMA CUP UGM 2026, Bola Voli Putri", tim: "Tim Bola Voli UNMEKA" },
    { tahun: 2026, juara: "MVP Putra Terbaik", lomba: "GAMA CUP UGM 2026", tim: "Landung Ramadani" },
    { tahun: 2026, juara: "MVP Putri Terbaik", lomba: "GAMA CUP UGM 2026", tim: "Siti Rachmi" },
  ],

  /* Biaya resmi belum tersedia. Isi daftar, spp, dan gedung (dalam Rupiah) pada setiap jalur
     dengan angka resmi dari bagian PMB; kalkulator biaya di halaman Pendaftaran otomatis muncul
     bila ketiga nilai itu terisi di semua jalur. Contoh: daftar: 300000, spp: 4500000, gedung: 5000000 */
  jalur: [
    { id: "reguler", foto: "web/pendaftaran-reguler.jpg", nama: "Reguler", desk: "Jalur umum bagi lulusan SMA, SMK, MA, atau sederajat.", path: "Umum" },
    { id: "kip", foto: "web/pendaftaran-kip.jpg", nama: "KIP-Kuliah", desk: "Bantuan biaya pendidikan hingga 100% bagi yang memenuhi syarat.", path: "KIP", potongan: 1 },
    { id: "prestasi", foto: "web/pendaftaran-prestasi.jpg", nama: "Prestasi Raport", desk: "Beasiswa hingga 50% berdasarkan nilai raport.", path: "Prestasi%20Raport", potongan: .5 },
    { id: "transfer", nama: "Transfer", desk: "Bagi mahasiswa pindahan dari perguruan tinggi lain.", path: "Transfer" },
    { id: "ekstensi", nama: "Ekstensi", desk: "Bagi lulusan diploma yang ingin melanjutkan ke jenjang sarjana.", path: "Ekstensi" },
    { id: "karyawan", nama: "Karyawan", desk: "Kelas bagi calon mahasiswa yang sudah bekerja.", path: "Karyawan" },
  ],

  faq: [
    ["Apa akreditasi Program Studi Teknik Sipil UNMEKA?", "Program Studi S1 Teknik Sipil UNMEKA terakreditasi Baik."],
    ["Gelar apa yang diperoleh lulusan?", "Lulusan program sarjana Teknik Sipil memperoleh gelar Sarjana Teknik (S.T.)."],
    ["Di mana lokasi kampus?", "Kampus UNMEKA berada di Jl. A.M. Sangaji No.49, Jetis, Kota Yogyakarta."],
    ["Apakah tersedia beasiswa?", "Tersedia jalur KIP-Kuliah dengan bantuan hingga 100% dan jalur Prestasi Raport dengan beasiswa hingga 50%, sesuai ketentuan yang berlaku."],
    ["Apakah ada kelas untuk yang sudah bekerja?", "Ada. Calon mahasiswa yang sudah bekerja dapat mendaftar melalui jalur Karyawan."],
  ],
};
