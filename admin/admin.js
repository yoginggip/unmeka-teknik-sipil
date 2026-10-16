/* Panel Administrator — prototipe. Data disimpan di localStorage browser;
   pada versi produksi diganti dengan database dan autentikasi server. */
const SEED = {
  admin_berita: () => D.berita.map(b => ({ ...b })),
  admin_dosen: () => D.dosen.map(d => ({ ...d })),
  admin_pesan: () => [],
};
const db = {
  all(k) { let v = store.get(k, null); if (!v) { v = SEED[k](); store.set(k, v); } return v; },
  save(k, v) { store.set(k, v); },
};
const authed = () => { try { return sessionStorage.getItem("unmeka_admin") === "1"; } catch { return false; } };
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); }

const NAV = [["dashboard.html", "grid", "Dasbor"], ["berita.html", "news", "Berita"], ["dosen.html", "users", "Dosen"], ["pesan.html", "inbox", "Pesan Masuk"]];
function shell(title, body) {
  if (!authed()) { location.replace("index.html"); return false; }
  const cur = location.pathname.split("/").pop();
  const unread = db.all("admin_pesan").filter(p => !p.baca).length;
  $("#app").innerHTML = `<div class="shell"><aside class="side" id="side">
    <a class="brand" href="dashboard.html"><img src="${IMG("logo-white-330.png")}" alt="Universitas Nusa Megarkencana"></a>
    <span class="sl">Konten</span>
    ${NAV.map(n => `<a class="nl${cur === n[0] ? " on" : ""}" href="${n[0]}">${ic(n[1])}${n[2]}${n[0] === "pesan.html" && unread ? `<span class="badge-n">${unread}</span>` : ""}</a>`).join("")}
    <div class="sp"></div>
    <a class="nl" href="../index.html" target="_blank">${ic("globe")}Lihat situs</a>
    <a class="nl" href="#" id="logout">${ic("logout")}Keluar</a></aside>
    <div class="main"><header class="top"><div style="display:flex;gap:10px;align-items:center"><button class="icon-btn menu-btn" id="mb" aria-label="Menu">${ic("menu")}</button><h1>${title}</h1></div>
      <div class="who">${avatar("Admin Prodi", 36)}<div><b>Administrator</b><small>Teknik Sipil</small></div></div></header>
      <div class="content" id="body">${body}</div></div></div>`;
  $("#logout").onclick = e => { e.preventDefault(); try { sessionStorage.removeItem("unmeka_admin"); } catch {} location.href = "index.html"; };
  $("#mb").onclick = () => $("#side").classList.toggle("open");
  return true;
}

/* ---------- CRUD generik ---------- */
function crud(cfg) {
  const { key, cols, fields } = cfg;
  $("#body").innerHTML = `<div class="toolbar">
      <label class="search"><span class="sr-only">Cari</span>${ic("search")}<input class="input" id="aq" type="search" placeholder="Cari ${cfg.noun.toLowerCase()}"></label>
      ${cfg.noAdd ? "" : `<button class="btn btn-navy" id="add">${ic("plus")} Tambah ${cfg.noun.toLowerCase()}</button>`}</div>
    <div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${c.label}</th>`).join("")}<th><span class="sr-only">Aksi</span></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  const draw = () => {
    const q = $("#aq").value.trim().toLowerCase();
    const rows = db.all(key).filter(r => JSON.stringify(r).toLowerCase().includes(q));
    $("#tb").innerHTML = rows.length ? rows.map(r => `<tr class="${cfg.rowClass ? cfg.rowClass(r) : ""}">${cols.map(c => `<td>${c.render ? c.render(r) : esc(r[c.k])}</td>`).join("")}
      <td class="act"><button class="ibtn" data-a="edit" data-id="${r.id}">${ic(cfg.noAdd ? "file" : "edit")}${cfg.noAdd ? "Buka" : "Ubah"}</button><button class="ibtn del" data-a="del" data-id="${r.id}">${ic("trash")}Hapus</button></td></tr>`).join("")
      : `<tr><td colspan="${cols.length + 1}" class="empty">${cfg.emptyText || "Belum ada data."}</td></tr>`;
  };
  const form = item => {
    const v = item || {};
    openModal(`<h2 style="font-size:1.2rem;margin-bottom:20px">${item ? (cfg.noAdd ? "Detail" : "Ubah") : "Tambah"} ${cfg.noun.toLowerCase()}</h2>
      <form id="fm" novalidate><div id="ferr"></div><div class="form-grid">${fields.map(f => {
        const val = esc(v[f.k] ?? f.def ?? "");
        const ctl = f.type === "textarea" ? `<textarea class="input" id="f_${f.k}" rows="${f.rows || 4}"${f.ro ? " readonly" : ""}>${val}</textarea>`
          : f.type === "select" ? `<select class="input" id="f_${f.k}">${f.options.map(o => `<option${v[f.k] === o ? " selected" : ""}>${o}</option>`).join("")}</select>`
          : `<input class="input" id="f_${f.k}" type="${f.type || "text"}" value="${val}"${f.ro ? " readonly" : ""}>`;
        return `<div class="field${f.full ? " full" : ""}"><label for="f_${f.k}">${f.label}${f.req ? ' <span style="color:#c53030">*</span>' : ""}</label>${ctl}${f.help ? `<small class="meta">${f.help}</small>` : ""}</div>`;
      }).join("")}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">${cfg.noAdd ? `<button type="button" class="btn btn-outline" onclick="closeModal()">Tutup</button>` : `<button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button><button class="btn btn-navy" type="submit">Simpan</button>`}</div></form>`, "form");
    if (cfg.onOpen && item) { cfg.onOpen(item); draw(); }
    $("#fm").addEventListener("submit", e => {
      e.preventDefault();
      const data = {}; for (const f of fields) data[f.k] = $("#f_" + f.k).value.trim();
      const miss = fields.find(f => f.req && !data[f.k]);
      if (miss) { $("#ferr").innerHTML = `<div class="alert err">Kolom “${miss.label}” wajib diisi.</div>`; return; }
      const all = db.all(key);
      if (item) Object.assign(all.find(r => r.id === item.id), data);
      else all.unshift({ id: Date.now(), ...(cfg.defaults || {}), ...data });
      db.save(key, all); closeModal(); draw(); toast(item ? "Perubahan disimpan." : `${cfg.noun} ditambahkan.`);
    });
  };
  $("#aq").addEventListener("input", draw);
  $("#add")?.addEventListener("click", () => form());
  $("#tb").addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const id = +b.dataset.id;
    if (b.dataset.a === "edit") form(db.all(key).find(r => r.id === id));
    else if (confirm(`Hapus ${cfg.noun.toLowerCase()} ini? Tindakan ini tidak dapat dibatalkan.`)) { db.save(key, db.all(key).filter(r => r.id !== id)); draw(); toast(`${cfg.noun} dihapus.`); }
  });
  draw();
}
