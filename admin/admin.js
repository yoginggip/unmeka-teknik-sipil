/* Panel Administrator — prototipe. Data disimpan di localStorage browser;
   pada versi produksi diganti dengan database dan autentikasi server. */
const SEED = {
  admin_berita: () => D.berita.map(b => ({ ...b })),
  admin_dosen: () => D.dosen.map(d => ({ ...d })),
  admin_lowongan: () => D.lowongan.map(l => ({ ...l })),
  admin_pengumuman: () => D.pengumuman.map(p => ({ ...p })),
  admin_pesan: () => [],
  admin_halaman: () => [
    { id: 1, judul: "Profil Program Studi", bagian: "Profil", isi: D.site.prodi + " " + D.site.univ + " berada di bawah " + D.site.fakultas + ".", diubah: "2026-11-03" },
    { id: 2, judul: "Visi dan Misi", bagian: "Profil", isi: "Visi dan misi program studi sesuai dokumen resmi.", diubah: "2026-11-03" },
    { id: 3, judul: "Kurikulum", bagian: "Akademik", isi: "Struktur kurikulum dan sebaran mata kuliah per semester.", diubah: "2026-11-03" },
    { id: 4, judul: "Fasilitas", bagian: "Fasilitas", isi: "Ruang kuliah, laboratorium, dan perpustakaan.", diubah: "2026-11-03" },
  ],
  admin_akun: () => [
    { id: 1, nama: "Aep Saepuloh, ST., MT.", email: "kaprodi.ts@unmeka.ac.id", peran: "Super Admin", status: "Aktif" },
    { id: 2, nama: "Admin Program Studi", email: "admin@unmeka.ac.id", peran: "Admin", status: "Aktif" },
  ],
  admin_log: () => [],
  admin_galeri: () => D.album.map(a => ({ ...a, foto: a.foto.map(f => [...f]) })),
  admin_rps: () => rpsSeed(),
};
const db = {
  all(k) { let v = store.get(k, null); if (!v) { v = SEED[k](); store.set(k, v); } return v; },
  /* mengembalikan false bila penyimpanan browser penuh */
  save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};
/* perkecil gambar agar muat di localStorage; latar putih untuk PNG transparan.
   ratio (lebar/tinggi) memotong bagian tengah gambar ke rasio baku, mis. 4/3 untuk galeri */
async function compressImage(file, max = 1200, ratio = 0) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = url; });
    const w = img.naturalWidth, h = img.naturalHeight;
    let sw = w, sh = h;
    if (ratio) { if (w / h > ratio) sw = h * ratio; else sh = w / ratio; }
    const s = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement("canvas"); c.width = Math.round(sw * s); c.height = Math.round(sh * s);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  } finally { URL.revokeObjectURL(url); }
}
/* sesi berisi { nama, peran } dari halaman masuk */
const sesi = () => { try { return JSON.parse(sessionStorage.getItem("unmeka_sesi")) || null; } catch { return null; } };
const authed = () => !!sesi();
const isSuper = () => sesi()?.peran === "Super Admin";
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); }

/* catat setiap perubahan konten untuk log aktivitas (UC-11) */
function logAct(aksi, modul, judul) {
  const all = db.all("admin_log");
  all.unshift({ id: Date.now(), waktu: new Date().toISOString(), pengguna: sesi()?.nama || "Administrator", aksi, modul, judul: String(judul || "").slice(0, 120) });
  db.save("admin_log", all.slice(0, 300));
}
const NAV_SA = [["akun.html", "users", "Akun Admin"], ["pengaturan.html", "settings", "Pengaturan"], ["log.html", "clock", "Log Aktivitas"]];
const NAV = [["dashboard.html", "grid", "Dasbor"], ["pengumuman.html", "bell", "Pengumuman"], ["berita.html", "news", "Berita"], ["lowongan.html", "briefcase", "Lowongan"], ["galeri.html", "image", "Galeri"], ["halaman.html", "file", "Halaman"], ["dosen.html", "users", "Dosen"], ["rps.html", "book", "Mata Kuliah & RPS"], ["pesan.html", "inbox", "Pesan Masuk"]];
function shell(title, body) {
  if (!authed()) { location.replace("index.html"); return false; }
  const cur = location.pathname.split("/").pop();
  const me = sesi();
  /* halaman Super Admin ditolak untuk peran Admin, termasuk bila dibuka langsung lewat URL */
  const denied = !isSuper() && NAV_SA.some(n => n[0] === cur);
  if (denied) { title = "Akses ditolak"; body = `<div class="card"><p>Halaman ini hanya dapat diakses oleh Super Admin.</p><p style="margin-top:14px"><a class="btn btn-navy" href="dashboard.html">Kembali ke dasbor</a></p></div>`; }
  const unread = db.all("admin_pesan").filter(p => !p.baca).length;
  $("#app").innerHTML = `<div class="shell"><aside class="side" id="side">
    <a class="brand" href="dashboard.html"><img src="${IMG("logo-white-330.png")}" alt="Universitas Nusa Megarkencana"></a>
    <span class="sl">Konten</span>
    ${NAV.map(n => `<a class="nl${cur === n[0] ? " on" : ""}" href="${n[0]}">${ic(n[1])}${n[2]}${n[0] === "pesan.html" && unread ? `<span class="badge-n">${unread}</span>` : ""}</a>`).join("")}
    ${isSuper() ? `<span class="sl">Super Admin</span>
    ${NAV_SA.map(n => `<a class="nl${cur === n[0] ? " on" : ""}" href="${n[0]}">${ic(n[1])}${n[2]}</a>`).join("")}` : ""}
    <div class="sp"></div>
    <a class="nl" href="../index.html" target="_blank">${ic("globe")}Lihat situs</a>
    <a class="nl" href="#" id="logout">${ic("logout")}Keluar</a></aside>
    <div class="main"><header class="top"><div style="display:flex;gap:10px;align-items:center"><button class="icon-btn menu-btn" id="mb" aria-label="Menu">${ic("menu")}</button><h1>${title}</h1></div>
      <div class="who">${avatar(me.nama, 36)}<div><b>${esc(me.nama)}</b><small>${esc(me.peran)}</small></div></div></header>
      <div class="content" id="body">${body}</div></div></div>`;
  $("#logout").onclick = e => { e.preventDefault(); try { sessionStorage.removeItem("unmeka_sesi"); } catch {} location.href = "index.html"; };
  $("#mb").onclick = () => $("#side").classList.toggle("open");
  return !denied;
}

/* ---------- CRUD generik ---------- */
function crud(cfg) {
  const { key, cols, fields } = cfg;
  /* isian yang nilainya dikelola di memori formulir: gambar, banyak foto, dan berkas dokumen */
  const imgFields = fields.filter(f => ["image", "images", "file"].includes(f.type));
  $("#body").innerHTML = `<div class="toolbar">
      <label class="search"><span class="sr-only">Cari</span>${ic("search")}<input class="input" id="aq" type="search" placeholder="Cari ${cfg.noun.toLowerCase()}"></label>
      ${cfg.noAdd ? "" : `<button class="btn btn-navy" id="add">${ic("plus")} Tambah ${cfg.noun.toLowerCase()}</button>`}</div>
    <div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${c.label}</th>`).join("")}<th><span class="sr-only">Aksi</span></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  const draw = () => {
    const q = $("#aq").value.trim().toLowerCase();
    /* isi gambar tidak ikut dicari */
    const rows = db.all(key).filter(r => JSON.stringify(r, (k, v) => imgFields.some(f => f.k === k) ? undefined : v).toLowerCase().includes(q));
    $("#tb").innerHTML = rows.length ? rows.map(r => `<tr class="${cfg.rowClass ? cfg.rowClass(r) : ""}">${cols.map(c => `<td>${c.render ? c.render(r) : esc(r[c.k])}</td>`).join("")}
      <td class="act"><button class="ibtn" data-a="edit" data-id="${r.id}">${ic(cfg.noAdd ? "file" : "edit")}${cfg.noAdd ? "Buka" : "Ubah"}</button><button class="ibtn del" data-a="del" data-id="${r.id}">${ic("trash")}Hapus</button></td></tr>`).join("")
      : `<tr><td colspan="${cols.length + 1}" class="empty">${cfg.emptyText || "Belum ada data."}</td></tr>`;
  };
  const form = item => {
    const v = item || {};
    const imgs = {}; imgFields.forEach(f => imgs[f.k] = f.type === "images" ? (v[f.k] || []).map(p => [...p]) : f.type === "file" ? v[f.k] || null : v[f.k] || "");
    openModal(`<h2 style="font-size:1.2rem;margin-bottom:20px">${item ? (cfg.noAdd ? "Detail" : "Ubah") : "Tambah"} ${cfg.noun.toLowerCase()}</h2>
      <form id="fm" novalidate><div id="ferr"></div><div class="form-grid">${fields.map(f => {
        const val = esc(v[f.k] ?? f.def ?? "");
        const ctl = f.type === "file" ? `<div class="up-file" id="uf_${f.k}"></div><div class="up-act"><label class="btn btn-outline" for="f_${f.k}">Pilih berkas</label><button type="button" class="btn btn-outline" id="r_${f.k}" hidden>Hapus berkas</button></div><input class="sr-only" id="f_${f.k}" type="file" accept="${f.accept || ".pdf,.doc,.docx"}">`
          : f.type === "images" ? `<div class="um-list" id="m_${f.k}"></div><div class="up-act"><label class="btn btn-outline" for="f_${f.k}">Tambah foto</label></div><input class="sr-only" id="f_${f.k}" type="file" accept="image/jpeg,image/png,image/webp" multiple>`
          : f.type === "image" ? `<div class="up"><img class="up-prev" id="p_${f.k}" alt="Pratinjau" hidden><div class="up-act"><label class="btn btn-outline" for="f_${f.k}">Pilih gambar</label><button type="button" class="btn btn-outline" id="r_${f.k}" hidden>Hapus gambar</button></div><input class="sr-only" id="f_${f.k}" type="file" accept="image/jpeg,image/png,image/webp"></div>`
          : f.type === "check" ? `<label class="chk"><input type="checkbox" id="f_${f.k}"${v[f.k] === true || v[f.k] === "Ya" ? " checked" : ""}><span>${f.text || f.label}</span></label>`
          : f.type === "textarea" ? `<textarea class="input" id="f_${f.k}" rows="${f.rows || 4}"${f.ro ? " readonly" : ""}>${val}</textarea>`
          : f.type === "select" ? `<select class="input" id="f_${f.k}">${f.options.map(o => `<option${String(v[f.k]) === String(o) ? " selected" : ""}>${o}</option>`).join("")}</select>`
          : `<input class="input" id="f_${f.k}" type="${f.type || "text"}" value="${val}"${f.ro ? " readonly" : ""}>`;
        return `<div class="field${f.full ? " full" : ""}"><label for="f_${f.k}">${f.label}${f.req ? ' <span style="color:#c53030">*</span>' : ""}</label>${ctl}${f.help ? `<small class="meta">${f.help}</small>` : ""}</div>`;
      }).join("")}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">${cfg.noAdd ? `<button type="button" class="btn btn-outline" onclick="closeModal()">Tutup</button>` : `<button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button class="btn btn-navy" type="submit">Simpan</button>`}</div></form>`, "form");
    const formErr = m => { $("#ferr").innerHTML = `<div class="alert err">${m}</div>`; $("#ferr").scrollIntoView({ block: "nearest" }); };
    /* banyak foto: foto pertama menjadi sampul */
    imgFields.filter(f => f.type === "images").forEach(f => {
      const inp = $("#f_" + f.k), list = $("#m_" + f.k), sub = $('#fm [type="submit"]'), MAXN = f.maxCount || 24;
      const paint = () => {
        list.innerHTML = imgs[f.k].length ? imgs[f.k].map((p, i) => `<div class="um"><img src="${SRC(p[0])}" alt="Foto ${i + 1}"><div class="um-b">${i === 0 ? '<span class="um-cover">Sampul</span>' : `<button type="button" data-cover="${i}">Jadikan sampul</button>`}<button type="button" data-rm="${i}" aria-label="Hapus foto ${i + 1}">${ic("trash")}</button></div></div>`).join("")
          : '<p class="meta" style="margin:0 0 10px">Belum ada foto.</p>';
      };
      inp.addEventListener("change", async () => {
        const files = [...inp.files]; inp.value = ""; if (!files.length) return;
        $("#ferr").innerHTML = ""; sub.disabled = true;
        const skip = [];
        for (const file of files) {
          if (imgs[f.k].length >= MAXN) { skip.push(`${file.name} (maksimal ${MAXN} foto per album)`); continue; }
          if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { skip.push(`${file.name} (format harus JPG, PNG, atau WebP)`); continue; }
          if (file.size > 8 * 1024 * 1024) { skip.push(`${file.name} (lebih dari 8 MB)`); continue; }
          try { imgs[f.k].push([await compressImage(file, f.max || 1200, f.ratio || 0), ""]); paint(); }
          catch { skip.push(`${file.name} (tidak dapat dibaca)`); }
        }
        sub.disabled = false;
        if (skip.length) formErr(`Foto berikut tidak ditambahkan: ${skip.map(esc).join("; ")}.`);
      });
      list.addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.cover) imgs[f.k].unshift(imgs[f.k].splice(+b.dataset.cover, 1)[0]);
        if (b.dataset.rm) imgs[f.k].splice(+b.dataset.rm, 1);
        paint();
      });
      paint();
    });
    /* berkas dokumen (mis. RPS): disimpan sebagai { nama, ukuran, data } */
    imgFields.filter(f => f.type === "file").forEach(f => {
      const inp = $("#f_" + f.k), box = $("#uf_" + f.k), rm = $("#r_" + f.k), MAXB = (f.maxMB || 2) * 1024 * 1024;
      const paint = () => {
        const x = imgs[f.k];
        box.innerHTML = x ? `<p class="up-name">${ic("file")}<span>${esc(x.nama)}</span><small class="meta">${Math.max(1, Math.round(x.ukuran / 1024))} KB</small></p>` : '<p class="meta" style="margin:0 0 10px">Belum ada berkas.</p>';
        rm.hidden = !x;
      };
      inp.addEventListener("change", () => {
        const file = inp.files[0]; inp.value = ""; if (!file) return;
        $("#ferr").innerHTML = "";
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!(f.accept || ".pdf,.doc,.docx").split(",").includes("." + ext)) return formErr(`Format berkas harus ${(f.accept || ".pdf,.doc,.docx").replace(/\./g, "").toUpperCase().replace(/,/g, ", ")}.`);
        if (file.size > MAXB) return formErr(`Ukuran berkas maksimal ${f.maxMB || 2} MB pada prototipe ini. Untuk berkas lebih besar, gunakan tautan Google Drive.`);
        const rd = new FileReader();
        rd.onload = () => { imgs[f.k] = { nama: file.name, ukuran: file.size, data: rd.result }; paint(); };
        rd.onerror = () => formErr("Berkas tidak dapat dibaca. Coba berkas lain.");
        rd.readAsDataURL(file);
      });
      rm.addEventListener("click", () => { imgs[f.k] = null; paint(); });
      paint();
    });
    imgFields.filter(f => f.type === "image").forEach(f => {
      const inp = $("#f_" + f.k), prev = $("#p_" + f.k), rm = $("#r_" + f.k), sub = $('#fm [type="submit"]');
      const paint = () => { prev.hidden = rm.hidden = !imgs[f.k]; if (imgs[f.k]) prev.src = SRC(imgs[f.k]); };
      inp.addEventListener("change", async () => {
        const file = inp.files[0]; if (!file) return;
        $("#ferr").innerHTML = "";
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { inp.value = ""; return formErr("Format gambar harus JPG, PNG, atau WebP."); }
        if (file.size > 8 * 1024 * 1024) { inp.value = ""; return formErr("Ukuran gambar maksimal 8 MB."); }
        sub.disabled = true;
        try { imgs[f.k] = await compressImage(file, f.max || 1200, f.ratio || 0); paint(); }
        catch { formErr("Gambar tidak dapat dibaca. Coba file lain."); }
        finally { sub.disabled = false; inp.value = ""; }
      });
      rm.addEventListener("click", () => { imgs[f.k] = ""; paint(); });
      paint();
    });
    if (cfg.onOpen && item) { cfg.onOpen(item); draw(); }
    $("#fm").addEventListener("submit", e => {
      e.preventDefault();
      const data = {}; for (const f of fields) data[f.k] = f.k in imgs ? imgs[f.k] : f.type === "check" ? $("#f_" + f.k).checked : $("#f_" + f.k).value.trim();
      const miss = fields.find(f => f.req && (Array.isArray(data[f.k]) ? !data[f.k].length : !data[f.k]));
      if (miss) return formErr(`Kolom “${miss.label}” wajib diisi.`);
      const all = db.all(key);
      if (item) Object.assign(all.find(r => r.id === item.id), data);
      else all.unshift({ id: Date.now(), ...(cfg.defaults || {}), ...data });
      if (!db.save(key, all)) return formErr("Penyimpanan browser penuh. Hapus beberapa gambar atau berkas, atau gunakan tautan, lalu coba lagi.");
      closeModal(); draw(); toast(item ? "Perubahan disimpan." : `${cfg.noun} ditambahkan.`);
      if (!cfg.noLog) logAct(item ? "Mengubah" : "Menambah", cfg.noun, data[fields[0].k]);
    });
  };
  $("#aq").addEventListener("input", draw);
  $("#add")?.addEventListener("click", () => form());
  $("#tb").addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const id = +b.dataset.id;
    if (b.dataset.a === "edit") form(db.all(key).find(r => r.id === id));
    else if (confirm(`Hapus ${cfg.noun.toLowerCase()} ini? Tindakan ini tidak dapat dibatalkan.`)) { const gone = db.all(key).find(r => r.id === id); db.save(key, db.all(key).filter(r => r.id !== id)); draw(); toast(`${cfg.noun} dihapus.`); if (!cfg.noLog && gone) logAct("Menghapus", cfg.noun, gone[fields[0].k]); }
  });
  draw();
}
