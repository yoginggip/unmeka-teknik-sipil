/* Layout bersama dan utilitas — Teknik Sipil UNMEKA */
const D = window.UNMEKA;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const fmtDate = s => { const d = new Date(s + "T00:00:00"); return isNaN(d) ? s : `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const rupiah = n => "Rp" + Math.round(n).toLocaleString("id-ID");
const initials = n => String(n).split(",")[0].replace(/\b(Prof|Dr|Ir|Drs|Dra)\.\s*/g, "").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const BASE = location.pathname.includes("/admin/") ? "../" : "";
const IMG = f => BASE + "assets/img/" + f;

/* data yang bisa diubah lewat panel admin (disimpan di browser pada prototipe ini) */
const DATA_V = 6;
if (store.get("data_v", 0) < DATA_V) { ["admin_berita", "admin_dosen", "admin_pesan"].forEach(k => { try { localStorage.removeItem(k); } catch {} }); store.set("data_v", DATA_V); }
const getBerita = () => (store.get("admin_berita", null) || D.berita).slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal));
const getDosen = () => store.get("admin_dosen", null) || D.dosen;

/* ---------- Ikon (garis, 24px) ---------- */
const P = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', chevron: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m18 15-6-6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M20 17v5H6.5A2.5 2.5 0 0 1 4 19.5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
  bridge: '<path d="M2 18h20M4 18V8M20 18V8M4 8c4 0 6 5 8 5s4-5 8-5M8 18v-6M12 18v-5M16 18v-6"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  road: '<path d="M4 22 8 2M20 22 16 2M12 4v3M12 11v3M12 18v3"/>',
  droplet: '<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
  ruler: '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
  grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
};
const ic = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;
const avatar = (nama, size = 84) => `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${size / 3.2}px">${esc(initials(nama))}</span>`;

const PAGES = [
  ["index.html", "Beranda"], ["profil.html", "Profil"], ["akademik.html", "Akademik"], ["dosen.html", "Dosen"],
  ["fasilitas.html", "Fasilitas"], ["penelitian.html", "Penelitian"], ["berita.html", "Berita"], ["kontak.html", "Kontak"],
];

function mountLayout() {
  const cur = location.pathname.split("/").pop() || "index.html";
  const s = D.site;
  const hdr = $("#site-header");
  if (hdr) hdr.outerHTML = `
  <a class="skip" href="#main">Lewati ke konten utama</a>
  <div class="topbar"><div class="container">
    <div class="l"><span>${s.fakultas}</span><span>${s.univ}</span></div>
    <div class="r"><a href="tel:+62274518987">${ic("phone")} ${s.telp}</a><a href="mailto:${s.email}">${ic("mail")} ${s.email}</a><a href="${s.ejournal}" target="_blank" rel="noopener">E-Journal</a></div>
  </div></div>
  <header class="header" id="header"><div class="container">
    <a class="brand" href="index.html" aria-label="Beranda Program Studi Teknik Sipil UNMEKA">
      <img src="${IMG("logo-330.png")}" srcset="${IMG("logo-330.png")} 330w, ${IMG("web/logo-659.png")} 659w" sizes="165px" alt="Universitas Nusa Megarkencana" width="165" height="50"><span class="div"></span>
      <span class="pt">Program Studi<br>Teknik Sipil<small>Sarjana (S1)</small></span></a>
    <nav class="nav" id="nav" aria-label="Menu utama">
      <button class="icon-btn nav-close" id="btn-close" aria-label="Tutup menu">${ic("x")}</button>
      ${PAGES.map(([h, t]) => `<a href="${h}"${cur === h ? ' class="active" aria-current="page"' : ""}>${t}</a>`).join("")}
      <a class="btn btn-primary" href="pmb.html">Pendaftaran</a>
    </nav>
    <div class="h-actions">
      <button class="icon-btn" id="btn-search" aria-label="Cari">${ic("search")}</button>
      <a class="btn btn-primary btn-sm" href="pmb.html">Pendaftaran</a>
      <button class="icon-btn burger" id="btn-menu" aria-label="Buka menu" aria-expanded="false">${ic("menu")}</button>
    </div>
  </div></header><div class="scrim" id="scrim"></div>`;

  const ftr = $("#site-footer");
  if (ftr) ftr.outerHTML = `
  <footer class="footer"><div class="container">
    <div class="f-grid">
      <div><a class="brand" href="index.html"><img src="${IMG("logo-white-659.png")}" alt="Universitas Nusa Megarkencana" width="165" height="50"></a><p style="margin-top:14px;color:var(--yellow);font-weight:600;font-size:.86rem;letter-spacing:.04em">${s.tagline}</p>
        <p style="margin-top:18px">Program Studi Sarjana Teknik Sipil, ${s.fakultas}, ${s.univ}.</p></div>
      <div><h4>Program Studi</h4><ul>${PAGES.slice(1, 5).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="penelitian.html">Penelitian</a></li></ul></div>
      <div><h4>Informasi</h4><ul><li><a href="pmb.html">Pendaftaran</a></li><li><a href="berita.html">Berita</a></li><li><a href="jembatan.html">Mini Game Uji Jembatan</a></li><li><a href="${s.kalender}" target="_blank" rel="noopener">Kalender Akademik</a></li><li><a href="${s.ejournal}" target="_blank" rel="noopener">E-Journal</a></li><li><a href="${s.web}" target="_blank" rel="noopener">unmeka.ac.id</a></li></ul></div>
      <div><h4>Kontak</h4><ul class="f-contact"><li>${ic("pin")}<span>${s.alamat}</span></li><li>${ic("phone")}<a href="tel:+62274518987">${s.telp}</a></li><li>${ic("mail")}<a href="mailto:${s.email}">${s.email}</a></li></ul></div>
    </div>
    <div class="f-bottom"><span>© ${new Date().getFullYear()} Program Studi Teknik Sipil, ${s.univ}</span><a href="${BASE}admin/index.html">Admin</a></div>
  </div></footer>
  <button class="to-top" id="to-top" aria-label="Kembali ke atas">${ic("up")}</button>
  <div class="modal sd" id="sd" role="dialog" aria-modal="true" aria-label="Pencarian"><div class="modal-box">
    <div class="sd-in">${ic("search")}<input id="sd-in" placeholder="Cari halaman, dosen, atau berita" autocomplete="off"><kbd>Esc</kbd></div>
    <div class="sd-list" id="sd-list"></div><div class="sd-foot"><kbd>↑</kbd> <kbd>↓</kbd> untuk memilih, <kbd>Enter</kbd> untuk membuka</div></div></div>`;
}

/* ---------- Modal ---------- */
function openModal(html, cls = "") {
  let m = $("#gmodal");
  if (!m) { m = document.createElement("div"); m.id = "gmodal"; m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); document.body.append(m); m.addEventListener("click", e => { if (e.target === m) closeModal(); }); }
  m.classList.remove("lb");
  m.innerHTML = `<div class="modal-box ${cls}"><button class="modal-x" aria-label="Tutup" onclick="closeModal()">${ic("x")}</button>${html}</div>`;
  requestAnimationFrame(() => m.classList.add("open"));
  setTimeout(() => $(".modal-x", m)?.focus(), 50);
}
function closeModal() { $("#gmodal")?.classList.remove("open"); }

/* ---------- Pencarian ---------- */
function initSearch() {
  const box = $("#sd"); if (!box) return;
  const inp = $("#sd-in"), list = $("#sd-list");
  const idx = [
    ...PAGES.map(([h, t]) => ({ t, s: "Halaman", h, i: "file" })),
    { t: "Pendaftaran Mahasiswa Baru", s: "Halaman", h: "pmb.html", i: "cap" },
    { t: "Uji Jembatan (mini game)", s: "Halaman", h: "jembatan.html", i: "bridge" },
    ...getDosen().map(d => ({ t: d.nama, s: "Dosen", h: "dosen.html?id=" + d.id, i: "user" })),
    ...getBerita().map(b => ({ t: b.judul, s: "Berita", h: "berita.html?id=" + b.id, i: "news" })),
    ...D.bidang.map(b => ({ t: "Bidang " + b.nama, s: "Akademik", h: "akademik.html#bidang", i: b.icon })),
  ];
  let sel = 0, cur = [];
  const render = () => {
    const q = inp.value.trim().toLowerCase();
    cur = (q ? idx.filter(x => (x.t + " " + x.s).toLowerCase().includes(q)) : idx.slice(0, 8)).slice(0, 10); sel = 0;
    list.innerHTML = cur.length ? cur.map((x, i) => `<a class="sd-item${i ? "" : " sel"}" href="${x.h}">${ic(x.i)}<span>${esc(x.t)}</span><small>${x.s}</small></a>`).join("") : `<p class="empty">Tidak ada hasil untuk “${esc(q)}”.</p>`;
  };
  const open = () => { box.classList.add("open"); inp.value = ""; render(); setTimeout(() => inp.focus(), 30); };
  const close = () => box.classList.remove("open");
  $("#btn-search")?.addEventListener("click", open);
  box.addEventListener("click", e => { if (e.target === box) close(); });
  inp.addEventListener("input", render);
  inp.addEventListener("keydown", e => {
    const items = $$(".sd-item", list); if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items.forEach((n, i) => n.classList.toggle("sel", i === sel)); items[sel].scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter") location.href = cur[sel].h;
  });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); box.classList.contains("open") ? close() : open(); }
    if (e.key === "Escape") { close(); closeModal(); closeMenu(); }
  });
}

/* ---------- Header, menu, reveal ---------- */
function closeMenu() { $("#nav")?.classList.remove("open"); $("#scrim")?.classList.remove("show"); $("#btn-menu")?.setAttribute("aria-expanded", "false"); }
function initChrome() {
  const hdr = $("#header"), top = $("#to-top");
  const onScroll = () => { hdr?.classList.toggle("scrolled", scrollY > 10); top?.classList.toggle("show", scrollY > 700); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top?.addEventListener("click", () => scrollTo({ top: 0 }));
  $("#btn-menu")?.addEventListener("click", () => { const o = $("#nav").classList.toggle("open"); $("#scrim").classList.toggle("show", o); $("#btn-menu").setAttribute("aria-expanded", o); });
  $("#scrim")?.addEventListener("click", closeMenu);
  $("#btn-close")?.addEventListener("click", closeMenu);
}
function observeReveal() {
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal:not(.in)").forEach(el => io.observe(el));
}
function accordion(root = document) {
  $$(".acc", root).forEach(a => {
    const b = $("button", a), c = $(".ans", a);
    b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", () => { const o = a.classList.toggle("open"); b.setAttribute("aria-expanded", o); c.style.maxHeight = o ? c.scrollHeight + "px" : 0; });
  });
}

/* ---------- Komponen berita ---------- */
function thumb(b) {
  const src = b.thumb || b.gambar;
  return src ? `<img src="${IMG(src)}" alt="" loading="lazy">`
    : `<div class="thumb-ph"><img src="${IMG("logo-white-330.png")}" alt=""></div>`;
}

/* ---------- Lightbox galeri: items = [[file, keterangan], ...] ---------- */
function lightbox(items, i) {
  let cur = i;
  const show = () => {
    const [f, cap] = items[cur];
    openModal(`<figure><img src="${IMG(f)}" alt="${esc(cap)}"><figcaption>${esc(cap)}<small>${cur + 1} / ${items.length}</small></figcaption></figure>
      ${items.length > 1 ? `<button class="lb-nav prev" aria-label="Foto sebelumnya">${ic("arrow")}</button><button class="lb-nav next" aria-label="Foto berikutnya">${ic("arrow")}</button>` : ""}`, "");
    const m = $("#gmodal"); m.classList.add("lb");
    $(".prev", m)?.addEventListener("click", () => { cur = (cur - 1 + items.length) % items.length; show(); });
    $(".next", m)?.addEventListener("click", () => { cur = (cur + 1) % items.length; show(); });
  };
  const key = e => {
    if (!$("#gmodal.open.lb")) { removeEventListener("keydown", key); return; }
    if (e.key === "ArrowRight") { cur = (cur + 1) % items.length; show(); }
    if (e.key === "ArrowLeft") { cur = (cur - 1 + items.length) % items.length; show(); }
  };
  show(); addEventListener("keydown", key);
}
const newsCard = b => `<a class="card news-card reveal" href="berita.html?id=${b.id}"><div class="thumb">${thumb(b)}</div><div class="body"><div class="meta"><span class="tag">${esc(b.kategori)}</span><span>${fmtDate(b.tanggal)}</span></div><h3>${esc(b.judul)}</h3><p>${esc(b.ringkas)}</p></div></a>`;

document.addEventListener("DOMContentLoaded", () => {
  mountLayout(); initChrome(); initSearch();
  if (window.pageInit) window.pageInit();
  accordion(); observeReveal();
});
