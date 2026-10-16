/* Antarmuka mini game "Uji Jembatan": editor, simulasi, dan gambar kanvas. */
(function () {
  const E = window.BridgeEngine;
  const { W, H, GROUND, GRID, MAT, LEVELS } = E;
  const KEY = i => "bridge_v1_level_" + i;
  const DONE = "bridge_v1_done";

  const C = { sky1: "#e9eef8", sky2: "#f8fafd", grid: "rgba(16,39,94,.10)", cliff: "#10275e", cliffTop: "#f5c219", water: "#3b6fb6", node: "#ffffff",
    nodeLine: "#10275e", anchor: "#f5c219", road: "#2f3747", roadLine: "#f5c219", steel: "#183679", preview: "rgba(24,54,121,.55)", bad: "#c53030" };

  let canvas, ctx, scale = 1, dpr = 1;
  let lv = 0, design, mode = "build", tool = "road", world = null;
  let pending = null, hover = null, drag = null, undo = [];

  /* ---------- util ---------- */
  const snap = v => Math.round(v / GRID) * GRID;
  const save = () => { try { localStorage.setItem(KEY(lv), JSON.stringify(design)); } catch {} };
  const load = i => { try { const d = JSON.parse(localStorage.getItem(KEY(i))); if (d && d.nodes) return d; } catch {} return E.emptyDesign(i); };
  const doneSet = () => { try { return new Set(JSON.parse(localStorage.getItem(DONE)) || []); } catch { return new Set(); } };
  const markDone = (i, stars) => { try { const d = JSON.parse(localStorage.getItem(DONE) || "{}"); const o = Array.isArray(d) ? {} : d; o[i] = Math.max(o[i] || 0, stars); localStorage.setItem(DONE, JSON.stringify(o)); } catch {} };
  const starsOf = i => { try { const o = JSON.parse(localStorage.getItem(DONE) || "{}"); return (o && o[i]) || 0; } catch { return 0; } };
  const rp = n => "Rp" + (n * 1000).toLocaleString("id-ID");

  function solidAt(x, y) {
    const L = LEVELS[lv];
    if (y > GROUND && (x < L.L || x > L.R)) return true;
    if (L.pilar && y > L.pilar.y && Math.abs(x - L.pilar.x) < 16) return true;
    return y > H - 20 || y < 20 || x < 0 || x > W;
  }
  function nodeAt(x, y, r = Math.max(12, 20 / scale)) {
    let best = -1, bd = r;
    design.nodes.forEach((n, i) => { const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function beamAt(x, y) {
    let best = -1, bd = Math.max(9, 16 / scale);
    design.beams.forEach((b, i) => {
      const A = design.nodes[b.a], B = design.nodes[b.b], dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy;
      let t = ((x - A.x) * dx + (y - A.y) * dy) / L2; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(x - (A.x + dx * t), y - (A.y + dy * t)); if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  /* titik akhir dibatasi panjang maksimum material */
  function clampEnd(start, x, y) {
    const mx = MAT[tool === "erase" ? "road" : tool].maks, dx = x - start.x, dy = y - start.y, d = Math.hypot(dx, dy);
    const ni = nodeAt(x, y); if (ni >= 0 && E.len(design.nodes[ni], start) <= mx + .5) return { x: design.nodes[ni].x, y: design.nodes[ni].y, ni };
    let ex = x, ey = y;
    if (d > mx) { ex = start.x + dx / d * mx; ey = start.y + dy / d * mx; }
    ex = snap(ex); ey = snap(ey);
    while (Math.hypot(ex - start.x, ey - start.y) > mx + .5) { ex -= Math.sign(dx) * GRID * (Math.abs(dx) > Math.abs(dy) ? 1 : 0); ey -= Math.sign(dy) * GRID * (Math.abs(dy) >= Math.abs(dx) ? 1 : 0); }
    return { x: ex, y: ey, ni: nodeAt(ex, ey, 2) };
  }

  /* ---------- edit ---------- */
  function pushUndo() { undo.push(JSON.stringify(design)); if (undo.length > 60) undo.shift(); }
  function addBeam(start, end) {
    if (Math.hypot(end.x - start.x, end.y - start.y) < GRID - 1) return false;
    if (solidAt(end.x, end.y) && end.ni < 0) return false;
    pushUndo();
    const idOf = p => { if (p.ni >= 0) return p.ni; design.nodes.push({ x: p.x, y: p.y }); return design.nodes.length - 1; };
    const a = idOf(start), b = idOf(end);
    if (a === b || design.beams.some(x => (x.a === a && x.b === b) || (x.a === b && x.b === a))) { undo.pop(); return false; }
    design.beams.push({ a, b, type: tool });
    save(); refresh(); return true;
  }
  function removeBeam(i) {
    pushUndo();
    design.beams.splice(i, 1);
    /* hapus titik yatim (bukan tumpuan) dan susun ulang indeks */
    const used = new Set(design.beams.flatMap(b => [b.a, b.b]));
    const map = [], nodes = [];
    design.nodes.forEach((n, i) => { if (n.fixed || used.has(i)) { map[i] = nodes.length; nodes.push(n); } });
    design.beams.forEach(b => { b.a = map[b.a]; b.b = map[b.b]; });
    design.nodes = nodes;
    save(); refresh();
  }

  /* ---------- input ---------- */
  function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  function startPoint(p) {
    const ni = nodeAt(p.x, p.y);
    if (ni >= 0) return { x: design.nodes[ni].x, y: design.nodes[ni].y, ni };
    return null; /* batang harus dimulai dari titik yang sudah ada */
  }
  function onDown(e) {
    if (mode !== "build") return;
    const p = pos(e);
    if (tool === "erase") { const bi = beamAt(p.x, p.y); if (bi >= 0) removeBeam(bi); return; }
    if (e.button === 2) { pending = null; draw(); return; }
    const s = startPoint(p);
    if (pending) {
      /* ketuk titik yang sama atau terlalu jauh = batal */
      if ((s && s.ni === pending.ni) || Math.hypot(p.x - pending.x, p.y - pending.y) > MAT[tool].maks * 1.25) { pending = null; draw(); return; }
      const end = clampEnd(pending, p.x, p.y);
      if (addBeam(pending, end)) { const ni = nodeAt(end.x, end.y, 2); pending = ni >= 0 ? { x: end.x, y: end.y, ni } : null; } else pending = s;
      draw(); return;
    }
    if (s) { drag = { start: s, moved: false }; try { canvas.setPointerCapture(e.pointerId); } catch {} }
    else flash("Mulai batang dari titik tumpu (kuning) atau titik yang sudah ada.");
  }
  function onMove(e) {
    const p = pos(e); hover = p;
    if (drag && Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 8) drag.moved = true;
    if (mode === "build") draw();
  }
  function onUp(e) {
    if (!drag) return;
    const p = pos(e);
    if (drag.moved) { addBeam(drag.start, clampEnd(drag.start, p.x, p.y)); pending = null; }
    else pending = drag.start; /* mode ketuk: ketuk titik awal lalu titik akhir */
    drag = null; draw();
  }

  /* ---------- simulasi ---------- */
  let raf = 0;
  function test() {
    if (mode === "sim") { stopSim(); return; }
    const c = E.cost(design);
    if (c > LEVELS[lv].budget) { flash("Biaya melebihi anggaran. Hapus atau perpendek beberapa batang."); return; }
    if (!design.beams.some(b => b.type === "road")) { flash("Tambahkan batang jalan agar truk bisa menyeberang."); return; }
    mode = "sim"; pending = null; world = E.createWorld(lv, design);
    hideResult(); refresh();
    const loop = () => {
      E.step(world); draw(); stats();
      if (world.status === "jalan") raf = requestAnimationFrame(loop);
      else result();
    };
    raf = requestAnimationFrame(loop);
  }
  function stopSim() { cancelAnimationFrame(raf); mode = "build"; world = null; hideResult(); refresh(); }
  function result() {
    const ok = world.status === "lolos", c = E.cost(design), b = LEVELS[lv].budget;
    const stars = ok ? (c <= b * .7 ? 3 : c <= b * .85 ? 2 : 1) : 0;
    if (ok) markDone(lv, stars);
    const box = document.getElementById("bg-result");
    box.innerHTML = ok
      ? `<div class="res-card ok"><span class="label">Uji beban berhasil</span><h3>Jembatan lolos!</h3><div class="stars">${[1, 2, 3].map(i => `<i class="${i <= stars ? "on" : ""}"></i>`).join("")}</div>
         <p>Biaya ${rp(c)} dari anggaran ${rp(b)}. Tegangan maksimum ${(world.maxStress * 100).toFixed(0)}%.</p>
         <div class="acts">${lv < LEVELS.length - 1 ? `<button class="btn btn-primary btn-sm" data-act="next">Level berikutnya</button>` : `<a class="btn btn-primary btn-sm" href="pmb.html">Daftar Teknik Sipil</a>`}<button class="btn btn-outline btn-sm" data-act="edit">Perbaiki desain</button></div></div>`
      : `<div class="res-card bad"><span class="label">Uji beban gagal</span><h3>Jembatan runtuh</h3>
         <p>${world.B.some(x => x.broken) ? "Batang berwarna merah menahan gaya terlalu besar lalu putus. Coba bentuk segitiga atau tambah penopang." : "Truk tidak berhasil menyeberang. Pastikan jalan tersambung dari tebing ke tebing."}</p>
         <div class="acts"><button class="btn btn-primary btn-sm" data-act="edit">Perbaiki desain</button></div></div>`;
    box.hidden = false;
    renderLevels();
  }
  function hideResult() { const b = document.getElementById("bg-result"); if (b) b.hidden = true; }

  /* ---------- gambar ---------- */
  function stressColor(s) {
    s = Math.min(1, s);
    const a = [47, 158, 68], m = [245, 194, 25], z = [197, 48, 48];
    const [p, q, t] = s < .5 ? [a, m, s / .5] : [m, z, (s - .5) / .5];
    return `rgb(${p.map((v, i) => Math.round(v + (q[i] - v) * t)).join(",")})`;
  }
  function draw() {
    const L = LEVELS[lv];
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.sky1); g.addColorStop(1, C.sky2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* air */
    ctx.fillStyle = C.water; ctx.fillRect(L.L, H - 46, L.R - L.L, 46);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let y = H - 36; y < H; y += 14) { ctx.beginPath(); for (let x = L.L; x <= L.R; x += 8) ctx.lineTo(x, y + Math.sin(x / 18 + (world ? world.t * 3 : 0)) * 2); ctx.stroke(); }
    /* grid */
    if (mode === "build") { ctx.fillStyle = C.grid; for (let x = 0; x <= W; x += GRID) for (let y = 40; y < H - 20; y += GRID) if (!solidAt(x, y)) ctx.fillRect(x - 1, y - 1, 2, 2); }
    /* tebing */
    ctx.fillStyle = C.cliff; ctx.fillRect(0, GROUND, L.L, H - GROUND); ctx.fillRect(L.R, GROUND, W - L.R, H - GROUND);
    ctx.fillStyle = C.cliffTop; ctx.fillRect(0, GROUND - 4, L.L, 4); ctx.fillRect(L.R, GROUND - 4, W - L.R, 4);
    if (L.pilar) { ctx.fillStyle = "#8b95a8"; ctx.fillRect(L.pilar.x - 16, L.pilar.y, 32, H - L.pilar.y); ctx.fillStyle = "#6c768a"; ctx.fillRect(L.pilar.x - 20, L.pilar.y, 40, 6); }
    /* bendera finish */
    ctx.fillStyle = C.nodeLine; ctx.fillRect(L.R + 118, GROUND - 46, 3, 46); ctx.fillStyle = C.cliffTop; ctx.beginPath(); ctx.moveTo(L.R + 121, GROUND - 46); ctx.lineTo(L.R + 145, GROUND - 38); ctx.lineTo(L.R + 121, GROUND - 30); ctx.fill();

    const nodes = world ? world.P : design.nodes, beams = world ? world.B : design.beams;
    /* batang: rangka dulu, jalan di atasnya */
    ["steel", "road"].forEach(type => beams.forEach(b => {
      if (b.type !== type || b.broken) return;
      const A = nodes[b.a], B = nodes[b.b];
      ctx.lineCap = "round";
      ctx.strokeStyle = world ? stressColor(b.shown ?? b.stress) : (type === "road" ? C.road : C.steel);
      ctx.lineWidth = type === "road" ? 9 : 5;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      if (type === "road" && !world) { ctx.strokeStyle = C.roadLine; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); ctx.setLineDash([]); }
    }));
    /* sorot batang yang akan dihapus */
    if (mode === "build" && tool === "erase" && hover) { const bi = beamAt(hover.x, hover.y); if (bi >= 0) { const b = design.beams[bi], A = design.nodes[b.a], B = design.nodes[b.b]; ctx.strokeStyle = C.bad; ctx.lineWidth = 11; ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); ctx.globalAlpha = 1; } }
    /* pratinjau */
    const from = drag && drag.moved ? drag.start : pending;
    if (mode === "build" && from && hover && tool !== "erase") {
      const end = clampEnd(from, hover.x, hover.y), okEnd = !(solidAt(end.x, end.y) && end.ni < 0);
      ctx.strokeStyle = okEnd ? C.preview : C.bad; ctx.lineWidth = tool === "road" ? 9 : 5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(end.x, end.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.preview; ctx.beginPath(); ctx.arc(end.x, end.y, 5, 0, 7); ctx.fill();
      ctx.font = "600 12px 'Plus Jakarta Sans',sans-serif"; ctx.fillStyle = C.nodeLine;
      ctx.fillText(rp(Math.round(E.len(from, end) * MAT[tool].biaya)), end.x + 10, end.y - 10);
    }
    /* titik */
    nodes.forEach((n, i) => {
      const fixed = (world ? n.fixed : n.fixed);
      ctx.beginPath(); ctx.arc(n.x, n.y, fixed ? 7 : 5, 0, 7);
      ctx.fillStyle = fixed ? C.anchor : C.node; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.nodeLine; ctx.stroke();
      if (mode === "build" && pending && pending.ni === i) { ctx.beginPath(); ctx.arc(n.x, n.y, 11, 0, 7); ctx.strokeStyle = C.cliffTop; ctx.lineWidth = 3; ctx.stroke(); }
    });
    /* truk */
    if (world) drawTruck(world.car);
    else { const c = { w: [{ x: 90, y: GROUND - 13, r: 13 }, { x: 142, y: GROUND - 13, r: 13 }] }; drawTruck(c); }
  }
  function drawTruck(car) {
    const [a, b] = car.w, ang = Math.atan2(b.y - a.y, b.x - a.x), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.fillStyle = "#10275e"; ctx.beginPath(); ctx.roundRect(-40, -38, 58, 30, 4); ctx.fill();
    ctx.fillStyle = "#f5c219"; ctx.beginPath(); ctx.roundRect(20, -32, 24, 24, 4); ctx.fill();
    ctx.fillStyle = "#cfe0f7"; ctx.fillRect(30, -28, 10, 9);
    ctx.fillStyle = "#fff"; ctx.font = "700 11px 'Plus Jakarta Sans',sans-serif"; ctx.fillText("UNMEKA", -36, -19);
    ctx.restore();
    car.w.forEach(w => { ctx.beginPath(); ctx.arc(w.x, w.y, 13, 0, 7); ctx.fillStyle = "#1b1f27"; ctx.fill(); ctx.beginPath(); ctx.arc(w.x, w.y, 5, 0, 7); ctx.fillStyle = "#c9ced8"; ctx.fill(); });
  }

  /* ---------- panel ---------- */
  let flashT = 0;
  function flash(msg) { const el = document.getElementById("bg-msg"); el.textContent = msg; el.classList.add("show"); clearTimeout(flashT); flashT = setTimeout(() => el.classList.remove("show"), 2600); }
  function stats() {
    const c = E.cost(design), b = LEVELS[lv].budget, pct = Math.min(100, c / b * 100);
    document.getElementById("bg-cost").textContent = rp(c);
    document.getElementById("bg-budget").textContent = rp(b);
    const bar = document.getElementById("bg-bar"); bar.style.width = pct + "%"; bar.classList.toggle("over", c > b);
    document.getElementById("bg-beams").textContent = design.beams.length;
    document.getElementById("bg-stress").textContent = world ? Math.round(world.maxStress * 100) + "%" : "-";
  }
  function renderLevels() {
    document.getElementById("bg-levels").innerHTML = LEVELS.map((l, i) => { const s = starsOf(i); return `<button class="${i === lv ? "on" : ""}" data-lv="${i}"><b>Level ${i + 1}</b><span>${l.nama}</span>${s ? `<em>${"★".repeat(s)}${"☆".repeat(3 - s)}</em>` : ""}</button>`; }).join("");
  }
  function refresh() {
    document.querySelectorAll("[data-tool]").forEach(b => { b.classList.toggle("on", b.dataset.tool === tool); b.disabled = mode === "sim"; });
    const t = document.getElementById("bg-test"); t.innerHTML = mode === "sim" ? "Kembali ke desain" : "Uji jembatan";
    t.classList.toggle("btn-primary", mode !== "sim"); t.classList.toggle("btn-outline", mode === "sim");
    document.getElementById("bg-undo").disabled = mode === "sim" || !undo.length;
    document.getElementById("bg-clear").disabled = mode === "sim";
    canvas.style.cursor = mode === "sim" ? "default" : tool === "erase" ? "not-allowed" : "crosshair";
    stats(); draw();
  }
  function setLevel(i) { if (mode === "sim") stopSim(); lv = i; design = load(i); undo = []; pending = null; renderLevels(); refresh(); }
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
    scale = box.width / W; canvas.width = Math.round(W * scale * dpr); canvas.height = Math.round(H * scale * dpr);
    canvas.style.width = box.width + "px"; canvas.style.height = box.width * H / W + "px"; draw();
  }

  window.initBridgeGame = function () {
    canvas = document.getElementById("bg-canvas"); ctx = canvas.getContext("2d");
    if (!ctx.roundRect) ctx.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); };
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", () => { hover = null; if (mode === "build") draw(); });
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    document.querySelectorAll("[data-tool]").forEach(b => b.addEventListener("click", () => { tool = b.dataset.tool; pending = null; refresh(); }));
    document.getElementById("bg-test").addEventListener("click", test);
    document.getElementById("bg-undo").addEventListener("click", () => { if (!undo.length) return; design = JSON.parse(undo.pop()); save(); refresh(); });
    document.getElementById("bg-clear").addEventListener("click", () => { if (!design.beams.length) return; pushUndo(); design = E.emptyDesign(lv); save(); refresh(); });
    document.getElementById("bg-levels").addEventListener("click", e => { const b = e.target.closest("[data-lv]"); if (b) setLevel(+b.dataset.lv); });
    document.getElementById("bg-result").addEventListener("click", e => {
      const a = e.target.closest("[data-act]"); if (!a) return;
      if (a.dataset.act === "next") setLevel(Math.min(lv + 1, LEVELS.length - 1)); else stopSim();
    });
    addEventListener("keydown", e => {
      if (e.target.closest("input,textarea")) return;
      if (e.key === "Escape") { pending = null; if (mode === "build") draw(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); document.getElementById("bg-undo").click(); }
      if (e.key === "1") { tool = "road"; refresh(); } if (e.key === "2") { tool = "steel"; refresh(); } if (e.key === "3") { tool = "erase"; refresh(); }
      if (e.key === " " && document.activeElement === canvas) { e.preventDefault(); test(); }
    });
    addEventListener("resize", resize);
    setLevel(0); resize();
    /* status ringkas untuk pengujian otomatis */
    window.bridgeState = () => ({ mode, level: lv, beams: design.beams.length, cost: E.cost(design), status: world && world.status, t: world && +world.t.toFixed(1) });
  };
})();
