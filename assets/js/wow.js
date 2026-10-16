/* Interaksi unggulan beranda: hero bergaya layar CAD (cadangan bila WebGL tidak tersedia),
   simulasi pembangunan gedung yang digerakkan scroll, dan lab balok interaktif. Dimuat setelah app.js. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const num = (v, d = 1) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- 1. Hero: grid cetak biru, kursor CAD, dan rangka yang tersambung ---------- */
  function heroFx() {
    const hero = document.getElementById("hero"); if (!hero || hero.classList.contains("has-3d")) return;
    const cv = document.createElement("canvas"); cv.className = "hero-fx"; cv.setAttribute("aria-hidden", "true");
    hero.querySelector(".hero-slides").after(cv);
    const ctx = cv.getContext("2d");
    const GRID = 40, R = 190, LINK = 130;
    let W = 0, H = 0, nodes = [], mouse = null, running = false, raf = 0;
    const cur = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: Math.round(W * H / 14000) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
      cur.x = W * .7; cur.y = H * .45;
    };

    const draw = now => {
      const t = now / 1000;
      const tgt = mouse || { x: W * (.7 + .18 * Math.sin(t * .45)), y: H * (.45 + .22 * Math.sin(t * .7 + 1)) };
      cur.x += (tgt.x - cur.x) * .14; cur.y += (tgt.y - cur.y) * .14;
      ctx.clearRect(0, 0, W, H);

      /* grid: garis tipis, lebih terang di sekitar kursor */
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(170,195,255,.06)"; ctx.beginPath();
      for (let x = 0; x < W; x += GRID) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = 0; y < H; y += GRID) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
      const g = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, R * 1.3);
      g.addColorStop(0, "rgba(245,194,25,.13)"); g.addColorStop(1, "rgba(245,194,25,0)");
      ctx.fillStyle = g; ctx.fillRect(cur.x - R * 1.3, cur.y - R * 1.3, R * 2.6, R * 2.6);

      /* titik buhul bergerak pelan; yang dekat kursor saling tersambung seperti rangka batang */
      const near = [];
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1; }
        const d = Math.hypot(n.x - cur.x, n.y - cur.y);
        if (d < R) near.push([n, d]);
        ctx.fillStyle = d < R ? `rgba(245,194,25,${.35 + .6 * (1 - d / R)})` : "rgba(255,255,255,.18)";
        ctx.beginPath(); ctx.arc(n.x, n.y, d < R ? 2.6 : 1.5, 0, 7); ctx.fill();
      }
      for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
        const [a, da] = near[i], [b, db] = near[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK) continue;
        ctx.strokeStyle = `rgba(245,194,25,${(1 - d / LINK) * (1 - Math.max(da, db) / R) * .8})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      near.sort((a, b) => a[1] - b[1]).slice(0, 3).forEach(([n, d]) => {
        ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - d / R)})`;
        ctx.beginPath(); ctx.moveTo(cur.x, cur.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      });

      /* crosshair dan koordinat ala perangkat lunak CAD */
      const gap = 12;
      ctx.strokeStyle = "rgba(245,194,25,.28)"; ctx.beginPath();
      ctx.moveTo(0, cur.y); ctx.lineTo(cur.x - gap, cur.y); ctx.moveTo(cur.x + gap, cur.y); ctx.lineTo(W, cur.y);
      ctx.moveTo(cur.x, 0); ctx.lineTo(cur.x, cur.y - gap); ctx.moveTo(cur.x, cur.y + gap); ctx.lineTo(cur.x, H);
      ctx.stroke();
      ctx.strokeStyle = "rgba(245,194,25,.9)"; ctx.strokeRect(cur.x - 5, cur.y - 5, 10, 10);
      if (W < 700) { if (running) raf = requestAnimationFrame(draw); return; }
      ctx.font = "600 11px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
      const label = `X ${num(cur.x / GRID, 2)}  Y ${num((H - cur.y) / GRID, 2)} m`;
      const tw = ctx.measureText(label).width;
      const lx = Math.min(cur.x + 14, W - tw - 18), ly = Math.min(cur.y + 30, H - 12);
      ctx.fillStyle = "rgba(7,19,49,.7)"; ctx.fillRect(lx - 6, ly - 14, tw + 12, 20);
      ctx.fillStyle = "#f5c219"; ctx.fillText(label, lx, ly);

      if (running) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    hero.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (reduce) draw(performance.now());
    });
    hero.addEventListener("pointerleave", () => { mouse = null; });
    addEventListener("resize", () => { resize(); if (reduce) draw(0); });
    resize();
    if (reduce) { draw(0); return; }
    new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(hero);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  }

  /* ---------- 2. Gulir untuk membangun: tahapan proyek gedung ---------- */
  const STAGES = [
    { nama: "Survei dan pengukuran", bidang: "Survei & Pemetaan", icon: "ruler", desk: "Lahan diukur dan dipetakan. Titik as bangunan dipatok sebelum pekerjaan fisik dimulai.", mk: "Ilmu Ukur Tanah, Survei & Pemetaan" },
    { nama: "Pondasi", bidang: "Geoteknik", icon: "layers", desk: "Tiang pancang menembus tanah lunak hingga lapisan tanah keras agar bangunan tidak turun atau miring.", mk: "Mekanika Tanah, Rekayasa Pondasi" },
    { nama: "Struktur rangka", bidang: "Struktur", icon: "bridge", desk: "Kolom dan balok beton bertulang dibangun lantai demi lantai, dihitung agar kuat menahan beban dan gempa.", mk: "Analisis Struktur, Struktur Beton, Rekayasa Gempa" },
    { nama: "Sistem keairan", bidang: "Keairan", icon: "droplet", desk: "Talang, pipa, dan saluran drainase mengalirkan air hujan sehingga kawasan tidak tergenang.", mk: "Hidrologi, Hidrolika, Bangunan Air" },
    { nama: "Akses jalan", bidang: "Transportasi", icon: "road", desk: "Jalan akses dengan perkerasan dan marka dirancang agar kendaraan dapat melintas dengan aman.", mk: "Perancangan Jalan, Perkerasan Jalan" },
    { nama: "Serah terima", bidang: "Manajemen Konstruksi", icon: "clipboard", desk: "Biaya, waktu, mutu, dan keselamatan kerja dikendalikan hingga gedung siap digunakan.", mk: "Manajemen Konstruksi, Estimasi Biaya, K3 Konstruksi" },
  ];
  const BOUNDS = [0, .14, .3, .56, .7, .84, 1];

  function buildFx() {
    const sec = document.getElementById("build"), svg = document.getElementById("build-svg");
    if (!sec || !svg) return;
    const parts = [];
    /* setiap bagian muncul antara progres a..b dan (opsional) menghilang antara c..d */
    const part = (tag, attrs, kind, a, b, c, d) => {
      const n = svgEl(tag, { ...attrs, class: `bp ${kind} ${attrs.class || ""}` }, svg);
      if (kind === "draw") n.setAttribute("pathLength", "1");
      parts.push({ n, a, b, c, d });
      return n;
    };
    const G = 430, XS = [170, 257, 343, 430], LV = [430, 360, 290, 220, 150];

    /* langit cetak biru */
    for (let x = 0; x <= 600; x += 30) svgEl("path", { d: `M${x} 0V640`, class: "bp-grid" }, svg);
    for (let y = 0; y <= 640; y += 30) svgEl("path", { d: `M0 ${y}H600`, class: "bp-grid" }, svg);

    /* 1. survei */
    part("path", { d: `M10 ${G}H590`, class: "ln-w" }, "draw", .01, .06);
    XS.forEach((x, i) => part("path", { d: `M${x} 110V${G}`, class: "ln-dash" }, "fade", .04 + i * .015, .08 + i * .015));
    part("path", { d: `M170 100H430M170 94v12M430 94v12`, class: "ln-y" }, "draw", .08, .12);
    part("text", { x: 300, y: 90, class: "bp-t", "text-anchor": "middle" }, "fade", .1, .13).textContent = "L = 26,0 m";
    XS.forEach((x, i) => {
      part("path", { d: `M${x} ${G}V${G - 18}`, class: "ln-w" }, "up", .06 + i * .015, .09 + i * .015);
      part("path", { d: `M${x} ${G - 18}l11 4-11 4z`, class: "fill-y" }, "pop", .07 + i * .015, .1 + i * .015);
    });
    part("path", { d: `M62 ${G}l14-38 14 38M76 ${G - 38}V${G}M66 ${G - 46}h20v-10h-20z`, class: "ln-w" }, "fade", .02, .06, .7, .73);

    /* 2. pondasi */
    [["Tanah lunak", G, 60, .04], ["Lempung", G + 60, 70, .07], ["Tanah keras", G + 130, 80, .11]].forEach(([nm, y, h, op], i) => {
      part("rect", { x: 0, y, width: 600, height: h, fill: `rgba(255,255,255,${op})` }, "fade", .14 + i * .015, .17 + i * .015);
      part("text", { x: 590, y: y + 42, class: "bp-t sm", "text-anchor": "end" }, "fade", .15 + i * .015, .18 + i * .015).textContent = nm;
    });
    XS.forEach((x, i) => part("rect", { x: x - 5, y: G + 8, width: 10, height: 150, class: "fill-w" }, "down", .18 + i * .018, .23 + i * .018));
    XS.forEach((x, i) => part("rect", { x: x - 16, y: G - 2, width: 32, height: 12, class: "fill-y" }, "pop", .25 + i * .01, .27 + i * .01));
    part("path", { d: `M154 ${G + 2}H446`, class: "ln-w thick" }, "draw", .27, .3);

    /* crane: berdiri saat struktur dibangun, dibongkar saat serah terima */
    part("path", { d: `M520 ${G}V60M508 ${G}V60M508 ${G}l12-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12-20-12-20 12-20`, class: "ln-y" }, "up", .29, .34, .9, .94);
    part("path", { d: "M330 60H590M560 60v18h28V60M514 60l-60-28h26l60 28", class: "ln-y" }, "draw", .33, .36, .9, .94);
    const hook = part("path", { d: "M380 60V120M374 120h12l-6 10z", class: "ln-w" }, "draw", .35, .37, .9, .94);
    hook.classList.add("hook");

    /* 3. struktur, lantai demi lantai */
    for (let f = 0; f < 4; f++) {
      const s = .33 + f * .055;
      XS.forEach((x, i) => part("rect", { x: x - 6, y: LV[f + 1], width: 12, height: 70, class: "fill-w" }, "up", s + i * .006, s + .026 + i * .006));
      part("rect", { x: 162, y: LV[f + 1] - 5, width: 276, height: 10, class: "fill-w" }, "right", s + .028, s + .05);
    }
    part("path", { d: "M162 140H438M162 145V135M438 145V135", class: "ln-w" }, "draw", .54, .56);

    /* 4. keairan */
    part("rect", { x: 210, y: 104, width: 60, height: 30, rx: 4, class: "ln-w fill-n" }, "pop", .56, .59);
    part("path", { d: "M218 134v12M262 134v12", class: "ln-w" }, "fade", .56, .59);
    part("path", { d: `M438 152h12V${G - 4}q0 10 10 10h40`, class: "ln-b thick" }, "draw", .58, .63);
    part("path", { d: `M470 ${G + 4}v16h90v-16`, class: "ln-w" }, "draw", .6, .63);
    part("rect", { x: 472, y: G + 10, width: 86, height: 9, class: "fill-b" }, "right", .63, .68);
    const rain = svgEl("g", { class: "rain" }, svg);
    for (let i = 0; i < 18; i++) svgEl("path", { d: `M${150 + (i * 97) % 320} ${30 + (i * 53) % 80}l-4 14`, style: `animation-delay:${(i * .13) % 1}s` }, rain);
    parts.push({ n: rain, a: .57, b: .6, c: .68, d: .71, kind: "fade" });
    rain.classList.add("bp", "fade");

    /* 5. jalan */
    part("rect", { x: 0, y: G - 12, width: 150, height: 12, class: "fill-road" }, "right", .7, .74);
    part("path", { d: `M6 ${G - 6}H146`, class: "ln-mark" }, "fade", .73, .76);
    const car = part("g", {}, "drive", .75, .83);
    svgEl("path", { d: `M0 ${G - 14}v-14h10l8-10h26l8 10h12v14z`, class: "fill-y" }, car);
    svgEl("circle", { cx: 14, cy: G - 14, r: 6, class: "wheel" }, car);
    svgEl("circle", { cx: 50, cy: G - 14, r: 6, class: "wheel" }, car);
    part("path", { d: `M140 ${G - 12}V${G - 70}h-14`, class: "ln-w" }, "up", .74, .77);
    part("circle", { cx: 124, cy: G - 70, r: 4, class: "fill-y" }, "pop", .76, .78);

    /* 6. serah terima: lampu menyala, bendera, stempel */
    for (let f = 0; f < 4; f++) for (let b = 0; b < 3; b++) for (let w = 0; w < 2; w++) {
      const x = XS[b] + 16 + w * 34, y = LV[f + 1] + 18, k = .85 + (f * 6 + b * 2 + w) * .004;
      part("rect", { x, y, width: 22, height: 34, rx: 2, class: "win" }, "pop", k, k + .02);
    }
    part("path", { d: "M300 140V96", class: "ln-w" }, "up", .93, .95);
    part("path", { d: "M300 96h28l-6 8 6 8h-28z", class: "fill-y" }, "pop", .94, .96);
    [[480, 30], [560, 24]].forEach(([x, r], i) => {
      part("path", { d: `M${x} ${G}V${G - r}`, class: "ln-w" }, "up", .9 + i * .01, .92 + i * .01);
      part("circle", { cx: x, cy: G - r - 14, r: 16 - i * 3, class: "tree" }, "pop", .91 + i * .01, .93 + i * .01);
    });
    const stamp = part("g", { transform: "translate(150 50) rotate(-8)" }, "stamp", .96, .99);
    svgEl("rect", { x: -96, y: -26, width: 192, height: 52, rx: 8 }, stamp);
    svgEl("text", { x: 0, y: 8, "text-anchor": "middle" }, stamp).textContent = "SELESAI 100%";

    /* teks tahapan */
    const steps = document.getElementById("build-steps"), stage = document.getElementById("build-stage");
    steps.innerHTML = STAGES.map((s, i) => `<li><button data-i="${i}"><span>${String(i + 1).padStart(2, "0")}</span>${s.nama}</button></li>`).join("");
    const pct = document.getElementById("build-pct"), bar = document.getElementById("build-bar");
    let cur = -1, ticking = false;
    const showStage = i => {
      if (i === cur) return; cur = i;
      const s = STAGES[i];
      stage.innerHTML = `<div class="bs-in"><span class="bs-num">Tahap ${i + 1} dari ${STAGES.length}</span><h3>${ic(s.icon)}${s.nama}</h3><p>${s.desk}</p><small><b>${s.bidang}</b> · ${s.mk}</small></div>`;
      $$("button", steps).forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("done", k < i); });
    };
    const progress = () => {
      const r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight;
      return clamp(-r.top / (span || 1));
    };
    const frame = () => {
      ticking = false;
      const p = progress();
      for (const { n, a, b, c, d } of parts) {
        let t = clamp((p - a) / (b - a));
        if (c !== undefined) t *= 1 - clamp((p - c) / (d - c));
        n.style.setProperty("--t", t.toFixed(3));
      }
      let i = BOUNDS.findIndex((v, k) => p >= v && p < BOUNDS[k + 1]); if (i < 0) i = STAGES.length - 1;
      showStage(i);
      document.body.classList.toggle("in-build", p > 0 && p < 1);
      pct.textContent = Math.round(p * 100) + "%"; bar.style.transform = `scaleX(${p})`;
    };
    steps.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const i = +b.dataset.i, mid = (BOUNDS[i] + BOUNDS[i + 1]) / 2 + .03;
      scrollTo({ top: sec.offsetTop + Math.min(mid, 1) * (sec.offsetHeight - innerHeight), behavior: reduce ? "auto" : "smooth" });
    });
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener("resize", frame);
    frame();
  }

  /* ---------- 3. Lab balok: balok baja di atas dua tumpuan ---------- */
  const PROFIL = [
    { nama: "WF 300×150", I: 7210e-8, Z: 481e-6 },
    { nama: "WF 400×200", I: 23700e-8, Z: 1190e-6 },
    { nama: "WF 500×200", I: 47800e-8, Z: 1910e-6 },
  ];
  function beamLab() {
    const svg = document.getElementById("beam-svg"); if (!svg) return;
    const L = 10, E = 200e6, FY = 240, X0 = 70, X1 = 730, Y = 140, SC = (X1 - X0) / L, AMP = 12, BY = 290;
    const st = { a: 3.5, P: 60, q: 5, prof: 2 };
    const px = x => X0 + x * SC;

    /* elemen statis */
    for (let x = 0; x <= 800; x += 40) svgEl("path", { d: `M${x} 0V400`, class: "bm-grid" }, svg);
    for (let y = 0; y <= 400; y += 40) svgEl("path", { d: `M0 ${y}H800`, class: "bm-grid" }, svg);
    svgEl("path", { d: `M${X0} ${Y}H${X1}`, class: "bm-ghost" }, svg);
    [X0, X1].forEach((x, i) => {
      svgEl("path", { d: `M${x} ${Y + 7}l-16 ${i ? 24 : 30}h32z`, class: "bm-sup" }, svg);
      if (i) [-9, 9].forEach(dx => svgEl("circle", { cx: x + dx, cy: Y + 36, r: 5, class: "bm-sup" }, svg));
      svgEl("path", { d: `M${x - 24} ${Y + 42}h48` + Array.from({ length: 6 }, (_, k) => `M${x - 22 + k * 9} ${Y + 42}l-7 8`).join(""), class: "bm-gnd" }, svg);
    });
    svgEl("text", { x: X0 - 30, y: Y + 34, class: "bm-lbl", "text-anchor": "end" }, svg).textContent = "A";
    svgEl("text", { x: X1 + 30, y: Y + 34, class: "bm-lbl" }, svg).textContent = "B";
    svgEl("path", { d: `M${X0} ${BY}H${X1}`, class: "bm-axis" }, svg);
    svgEl("text", { x: X0 - 8, y: BY + 4, class: "bm-lbl", "text-anchor": "end" }, svg).textContent = "M";

    const qG = svgEl("g", { class: "bm-q" }, svg);
    const beam = svgEl("path", { class: "bm-beam" }, svg);
    const bmd = svgEl("path", { class: "bm-bmd" }, svg);
    const mLbl = svgEl("text", { class: "bm-val", "text-anchor": "middle" }, svg);
    const rA = svgEl("g", { class: "bm-r" }, svg), rB = svgEl("g", { class: "bm-r" }, svg);
    [rA, rB].forEach(g => { svgEl("path", {}, g); svgEl("text", { "text-anchor": "middle" }, g); });
    const load = svgEl("g", { class: "bm-load", tabindex: "0", role: "slider", "aria-label": "Posisi beban P (meter dari tumpuan A)", "aria-valuemin": "0.5", "aria-valuemax": "9.5" }, svg);
    svgEl("rect", { x: -46, y: 18, width: 92, height: 34, rx: 8 }, load);
    const pTxt = svgEl("text", { x: 0, y: 40, "text-anchor": "middle" }, load);
    svgEl("path", { d: "M0 52V0", class: "stem" }, load);
    const tip = svgEl("path", { class: "tip" }, load);
    const aTxt = svgEl("text", { y: 12, "text-anchor": "middle", class: "pos" }, load);

    const out = id => document.getElementById(id);
    const ui = { P: out("bm-p"), q: out("bm-q"), prof: out("bm-prof") };
    ui.prof.innerHTML = PROFIL.map((p, i) => `<option value="${i}">${p.nama}</option>`).join("");
    ui.prof.value = st.prof; ui.P.value = st.P; ui.q.value = st.q;

    let failed = false;
    const render = () => {
      const { a, P, q } = st, { I, Z } = PROFIL[st.prof], EI = E * I, b = L - a;
      const RA = P * b / L + q * L / 2, RB = P * a / L + q * L / 2;
      const M = x => RA * x - q * x * x / 2 - (x > a ? P * (x - a) : 0);
      const dfl = x => (x <= a ? P * b * x * (L * L - b * b - x * x) : P * a * (L - x) * (L * L - a * a - (L - x) * (L - x))) / (6 * L * EI)
        + q * x * (L ** 3 - 2 * L * x * x + x ** 3) / (24 * EI);
      const xs = Array.from({ length: 101 }, (_, i) => i * L / 100).concat(a).sort((m, n) => m - n);
      let Mmax = 0, xM = 0, dmax = 0;
      xs.forEach(x => { const m = M(x), d = dfl(x); if (m > Mmax) { Mmax = m; xM = x; } if (d > dmax) dmax = d; });
      const sigma = Mmax / Z / 1000, dlim = L / 240, util = Math.max(sigma / FY, dmax / dlim);

      const k = Math.min(SC * AMP, 100 / (dmax || 1)), yAt = x => Y + dfl(x) * k;
      const col = util <= .7 ? "#2f9e44" : util <= 1 ? "#e0a312" : "#e03131";
      beam.setAttribute("d", "M" + xs.map(x => `${px(x).toFixed(1)} ${yAt(x).toFixed(1)}`).join("L"));
      beam.style.stroke = col;

      const ms = 92 / Math.max(Mmax, 300);
      bmd.setAttribute("d", `M${X0} ${BY}` + xs.map(x => `L${px(x).toFixed(1)} ${(BY + M(x) * ms).toFixed(1)}`).join("") + `L${X1} ${BY}Z`);
      mLbl.setAttribute("x", px(xM)); mLbl.setAttribute("y", BY + Mmax * ms + 18);
      mLbl.textContent = `Mmaks = ${num(Mmax)} kNm`;

      qG.innerHTML = "";
      if (q > 0) {
        for (let x = 0; x <= L + 1e-9; x += .5) {
          const X = px(x), yb = yAt(x) - 7;
          svgEl("path", { d: `M${X} ${yb - 30}V${yb}M${X - 4} ${yb - 6}l4 6 4-6` }, qG);
        }
        svgEl("path", { d: `M${X0} ${yAt(0) - 37}` + xs.filter((_, i) => i % 5 === 0).map(x => `L${px(x)} ${yAt(x) - 37}`).join("") + `L${X1} ${yAt(L) - 37}` }, qG);
        svgEl("text", { x: px(a < 5 ? 8 : 2), y: yAt(a < 5 ? 8 : 2) - 44, "text-anchor": "middle" }, qG).textContent = `q = ${q} kN/m`;
      }

      const ly = yAt(a) - 8;
      load.setAttribute("transform", `translate(${px(a)} ${ly - 70})`);
      load.querySelector(".stem").setAttribute("d", "M0 52V70");
      tip.setAttribute("d", "M-6 62l6 8 6-8");
      pTxt.textContent = `P = ${P} kN`;
      aTxt.textContent = `a = ${num(a)} m`;
      load.setAttribute("aria-valuenow", a.toFixed(1)); load.setAttribute("aria-valuetext", `${num(a)} meter`);

      [[rA, X0, RA, "RA"], [rB, X1, RB, "RB"]].forEach(([g, x, r, n]) => {
        const h = 18 + Math.min(r, 300) / 300 * 34;
        g.firstChild.setAttribute("d", `M${x} ${Y + 52 + h}V${Y + 52}M${x - 6} ${Y + 60}l6-8 6 8`);
        g.lastChild.setAttribute("x", x); g.lastChild.setAttribute("y", Y + 70 + h);
        g.lastChild.textContent = `${n} = ${num(r)} kN`;
      });

      out("o-ra").textContent = num(RA) + " kN"; out("o-rb").textContent = num(RB) + " kN";
      out("o-m").textContent = num(Mmax) + " kNm"; out("o-d").textContent = num(dmax * 1000) + " mm";
      out("o-s").textContent = num(sigma) + " MPa"; out("o-dl").textContent = `batas L/240 = ${num(dlim * 1000)} mm`;
      out("bm-pv").textContent = P + " kN"; out("bm-qv").textContent = q + " kN/m";
      const s = out("bm-status");
      s.className = "bm-status " + (util <= .7 ? "ok" : util <= 1 ? "warn" : "bad");
      s.querySelector("b").textContent = util <= .7 ? "Aman" : util <= 1 ? "Mendekati batas" : "Tidak memenuhi syarat";
      s.querySelector("small").textContent = `Rasio pemakaian ${num(util * 100, 0)}% (tegangan leleh ${FY} MPa, lendutan L/240)`;
      s.querySelector("i").style.transform = `scaleX(${Math.min(util, 1.2) / 1.2})`;
      if (util > 1 && !failed && !reduce) { svg.classList.remove("shake"); void svg.getBBox(); svg.classList.add("shake"); }
      failed = util > 1;
    };

    /* seret beban */
    const toA = e => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const x = pt.matrixTransform(svg.getScreenCTM().inverse()).x;
      return Math.round(clamp((x - X0) / SC, .5, 9.5) * 10) / 10;
    };
    let dragging = false, demo = null;
    const stopDemo = () => { if (demo) { cancelAnimationFrame(demo); demo = null; } svg.classList.add("touched"); };
    svg.addEventListener("pointerdown", e => {
      stopDemo(); dragging = true; svg.setPointerCapture(e.pointerId); st.a = toA(e); render(); svg.classList.add("drag");
    });
    svg.addEventListener("pointermove", e => { if (dragging) { st.a = toA(e); render(); } });
    const end = () => { dragging = false; svg.classList.remove("drag"); };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    load.addEventListener("keydown", e => {
      const d = { ArrowLeft: -.1, ArrowRight: .1, PageDown: -1, PageUp: 1 }[e.key];
      if (d === undefined && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault(); stopDemo();
      st.a = e.key === "Home" ? .5 : e.key === "End" ? 9.5 : Math.round(clamp(st.a + d, .5, 9.5) * 10) / 10; render();
    });
    ui.P.addEventListener("input", () => { stopDemo(); st.P = +ui.P.value; render(); });
    ui.q.addEventListener("input", () => { stopDemo(); st.q = +ui.q.value; render(); });
    ui.prof.addEventListener("change", () => { stopDemo(); st.prof = +ui.prof.value; render(); });
    render();

    /* demo singkat saat pertama terlihat: beban bergeser bolak-balik sampai pengunjung menyentuhnya */
    if (!reduce && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; io.disconnect();
        if (svg.classList.contains("touched")) return;
        const t0 = performance.now();
        const step = now => {
          const k = (now - t0) / 1000; if (k > 6) { demo = null; return; }
          st.a = Math.round((5 - 3.2 * Math.sin(k * 1.05)) * 10) / 10; render();
          demo = requestAnimationFrame(step);
        };
        demo = requestAnimationFrame(step);
      }, { threshold: .5 });
      io.observe(svg);
    }
  }

  document.addEventListener("DOMContentLoaded", () => { heroFx(); buildFx(); beamLab(); });
})();
