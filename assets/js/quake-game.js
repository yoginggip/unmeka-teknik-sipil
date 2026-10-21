/* Antarmuka simulator "Uji Gempa" di beranda. Fisika ada di quake-engine.js. */
(() => {
  const Q = window.QuakeEngine, cv = document.getElementById("qk-cv");
  if (!Q || !cv) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = cv.getContext("2d");
  const ui = {
    n: $("#qk-n"), pga: $("#qk-pga"), nv: $("#qk-nv"), pv: $("#qk-pv"), go: $("#qk-go"),
    tech: $("#qk-tech"), badge: $("#qk-badge"), over: $("#qk-over"), stage: $(".qk-stage"),
    T: $("#qk-T"), roof: $("#qk-roof"), drift: $("#qk-drift"),
  };
  const STATUS = {
    diam: ["Siap diuji", "idle"], aman: ["Aman", "ok"], retak: ["Retak ringan", "warn"],
    "rusak berat": ["Rusak berat", "bad"], runtuh: ["Runtuh", "bad"],
  };
  const pgaLabel = g => g < 0.2 ? "ringan" : g < 0.4 ? "sedang" : g < 0.7 ? "kuat" : g < 1 ? "sangat kuat" : "ekstrem";
  const num = (v, d = 1) => v.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

  let tech = "biasa", world, hist = [], collapse = null, shake = 0, seed = 1, cracks = [], lastBuzz = 0;
  const opt = () => ({ iso: tech === "iso", tmd: tech === "tmd" });

  /* retakan acak per lantai, dalam koordinat relatif (0..1) */
  const makeCracks = n => Array.from({ length: n }, () => Array.from({ length: 6 }, () => {
    let x = 0.1 + Math.random() * 0.8, y = Math.random() * 0.3; const pts = [[x, y]];
    for (let k = 0; k < 4; k++) { x += (Math.random() - .5) * .14; y += .12 + Math.random() * .12; pts.push([x, Math.min(y, 1)]); }
    return pts;
  }));

  const reset = () => {
    world = Q.createWorld(+ui.n.value, opt()); hist = []; collapse = null; cracks = makeCracks(world.n);
    ui.over.hidden = true; ui.go.disabled = false; ui.go.textContent = "Picu gempa";
    ui.stage.classList.remove("shaking");
    sync();
  };
  const sync = () => {
    const n = +ui.n.value, g = +ui.pga.value;
    ui.nv.textContent = `${n} lantai`; ui.pv.textContent = `${num(g, 2)} g · ${pgaLabel(g)}`;
    ui.T.textContent = num(tech === "iso" ? 2.6 : world.T1, 2) + " s";
    ui.roof.textContent = num(world.maxRoof * 100) + " cm";
    ui.drift.textContent = num(Math.max(...world.maxDrift) * 100, 2) + " %";
    const [txt, cls] = STATUS[world.status];
    ui.badge.textContent = world.running ? `${txt} · t = ${num(world.t)} s` : txt; ui.badge.className = "qk-badge " + cls;
  };
  ui.n.addEventListener("input", reset);
  ui.pga.addEventListener("input", () => { if (world.running || collapse) reset(); else sync(); });
  ui.tech.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    tech = b.dataset.t;
    $$("button", ui.tech).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
    reset();
  });
  ui.go.addEventListener("click", () => {
    if (world.t > 0) reset();
    Q.start(world, +ui.pga.value, seed++);
    ui.go.disabled = true; ui.go.textContent = "Gempa berlangsung…";
  });
  $("#qk-again").addEventListener("click", reset);

  /* ---------- ukuran kanvas ---------- */
  let W = 0, H = 0, city = [];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    city = Array.from({ length: Math.ceil(W / 34) }, (_, i) => ({ x: i * 34 + Math.random() * 10, w: 22 + Math.random() * 18, h: 40 + Math.random() * 120, lit: Math.random() }));
  };
  new ResizeObserver(resize).observe(cv);

  /* ---------- gambar ---------- */
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const dmgColor = d => {
    const t = Math.min(d / Q.LIMIT.runtuh, 1);
    const c = t < .5 ? mix([230, 238, 255], [245, 194, 25], t * 2) : mix([245, 194, 25], [255, 70, 70], (t - .5) * 2);
    return `rgb(${c})`;
  };

  function geometry() {
    const n = world.n, gy = H - 64, iso = world.opt.iso ? 20 : 0;
    const fh = Math.min(36, (gy - iso - (W < 560 ? 110 : 70)) / (n + .6)), bw = Math.min(W * .34, 230), scale = fh / Q.H * 22;
    const gx = world.agNow / Q.G * 14;
    const cx = W * (W < 560 ? .5 : .56) + gx;
    const xs = [cx + Q.disp(world, -1) * scale]; // dasar bangunan
    for (let i = 0; i < n; i++) xs.push(cx + Q.disp(world, i) * scale);
    return { n, gy, iso, fh, bw, scale, gx, cx, xs, base: gy - iso };
  }

  function drawStory(g, i, xb, xt, yb) {
    const { fh, bw } = g, yt = yb - fh, d = world.maxDrift[i];
    /* dinding kaca */
    ctx.fillStyle = "rgba(120,160,255,.13)";
    ctx.beginPath(); ctx.moveTo(xb - bw / 2, yb); ctx.lineTo(xb + bw / 2, yb); ctx.lineTo(xt + bw / 2, yt); ctx.lineTo(xt - bw / 2, yt); ctx.fill();
    /* jendela */
    const bays = 3, cols = [-bw / 2 + 5, -bw / 6, bw / 6, bw / 2 - 5];
    for (let b = 0; b < bays; b++) for (let w = 0; w < 2; w++) {
      const fx = cols[b] + 8 + w * ((cols[b + 1] - cols[b] - 16) / 2 + 2), ww = (cols[b + 1] - cols[b] - 22) / 2;
      const lit = ((i * 7 + b * 3 + w) % 5) !== 0 && !(world.running && Math.random() < Math.abs(world.agNow) / Q.G * .3);
      const y0 = yb - fh * .78, y1 = yb - fh * .3, sh = (xt - xb);
      ctx.fillStyle = lit ? "rgba(245,194,25,.85)" : "rgba(255,255,255,.08)";
      ctx.beginPath();
      ctx.moveTo(xb + sh * .3 + fx, y1); ctx.lineTo(xb + sh * .3 + fx + ww, y1);
      ctx.lineTo(xb + sh * .78 + fx + ww, y0); ctx.lineTo(xb + sh * .78 + fx, y0); ctx.fill();
    }
    /* retakan */
    const nc = d >= Q.LIMIT.berat ? 6 : d >= Q.LIMIT.retak ? 2 : 0;
    if (nc) {
      ctx.strokeStyle = d >= Q.LIMIT.berat ? "#ff6b6b" : "#ffa94d"; ctx.lineWidth = 1.4;
      cracks[i].slice(0, nc).forEach(pts => {
        ctx.beginPath();
        pts.forEach(([u, v], k) => { const y = yt + v * fh, x = xt + (xb - xt) * v + (u - .5) * bw; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke();
      });
    }
    /* kolom melengkung ganda (seperti kolom portal yang bergoyang) */
    ctx.strokeStyle = dmgColor(Math.max(d, world.drift[i] * 1.2)); ctx.lineWidth = 5; ctx.lineCap = "round";
    cols.forEach(o => {
      ctx.beginPath(); ctx.moveTo(xb + o, yb);
      ctx.bezierCurveTo(xb + o, yb - fh * .5, xt + o, yt + fh * .5, xt + o, yt); ctx.stroke();
    });
    /* pelat lantai */
    ctx.fillStyle = "#d6def0"; ctx.fillRect(xt - bw / 2 - 7, yt - 4, bw + 14, 7);
  }

  function drawIsolator(g) {
    const { gy, iso, xs, bw, cx } = g;
    [-bw / 2 + 18, 0, bw / 2 - 18].forEach(o => {
      const xb = cx + o, xt = xs[0] + o;
      ctx.fillStyle = "#26324d"; ctx.strokeStyle = "#f5c219"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xb - 12, gy); ctx.lineTo(xb + 12, gy); ctx.lineTo(xt + 12, gy - iso + 4); ctx.lineTo(xt - 12, gy - iso + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(245,194,25,.5)"; ctx.lineWidth = 1;
      for (let k = 1; k < 4; k++) { const f = k / 4, y = gy - (iso - 4) * f, x = xb + (xt - xb) * f; ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y); ctx.stroke(); }
    });
    ctx.fillStyle = "#d6def0"; ctx.fillRect(xs[0] - bw / 2 - 10, gy - iso - 4, bw + 20, 8);
    label("Isolator dasar", cx + bw / 2 + 18, gy - 6);
  }

  function drawTmd(g) {
    const { xs, n, fh, base, scale } = g, top = base - n * fh, xr = xs[n];
    const xm = xr + (world.u[world.tmd] - world.u[world.floors[n - 1]]) * scale * 1.6;
    ctx.strokeStyle = "#8ec5ff"; ctx.lineWidth = 1.5;
    [[xr - 34, xm - 14], [xr + 34, xm + 14]].forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(a, top - 14);
      for (let k = 1; k <= 6; k++) ctx.lineTo(a + (b - a) * k / 6, top - 14 + (k % 2 ? -4 : 4));
      ctx.lineTo(b, top - 14); ctx.stroke();
    });
    ctx.fillStyle = "#4dabf7"; ctx.fillRect(xm - 14, top - 26, 28, 22);
    ctx.fillStyle = "#d6def0"; ctx.fillRect(xr - 38, top - 28, 4, 24); ctx.fillRect(xr + 34, top - 28, 4, 24);
    label("Peredam massa (TMD)", xr + 46, top - 14);
  }

  function label(t, x, y) {
    ctx.font = "600 11px Plus Jakarta Sans, system-ui, sans-serif"; ctx.fillStyle = "#9fb0d6";
    ctx.textAlign = x > W - 120 ? "right" : "left"; ctx.fillText(t, x > W - 120 ? W - 10 : x, y); ctx.textAlign = "left";
  }

  function drawSeismo() {
    const x0 = 14, y0 = 14, w = Math.min(230, W * .42), h = W < 560 ? 42 : 58;
    ctx.fillStyle = "rgba(7,19,49,.75)"; ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(x0, y0, w, h); ctx.strokeRect(x0 + .5, y0 + .5, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.moveTo(x0, y0 + h / 2); ctx.lineTo(x0 + w, y0 + h / 2); ctx.stroke();
    ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 1.4; ctx.beginPath();
    hist.forEach((a, i) => { const x = x0 + w - (hist.length - i) * (w / 240), y = y0 + h / 2 - a / (1.3 * Q.G) * (h / 2); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
    ctx.font = "600 10px ui-monospace, Menlo, Consolas, monospace"; ctx.fillStyle = "#9fb0d6";
    ctx.fillText(`SEISMOGRAF  a = ${num(Math.abs(world.agNow) / Q.G, 2)} g`, x0 + 6, y0 + h + 14);
  }

  function draw() {
    const g = geometry(), { gy, base, fh, bw, n, xs } = g;
    ctx.save();
    if (shake > .2 && !reduce) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake * .6);
    /* langit dan kota di kejauhan */
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#071331"); sky.addColorStop(1, "#13306e");
    ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.fillStyle = "rgba(255,255,255,.035)";
    for (let x = 0; x < W; x += 28) ctx.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 28) ctx.fillRect(0, y, W, 1);
    city.forEach((b, i) => {
      const wob = g.gx * .5 * Math.sin(i);
      ctx.fillStyle = "rgba(30,58,128,.55)"; ctx.fillRect(b.x + wob, gy - b.h, b.w, b.h);
      ctx.fillStyle = "rgba(245,194,25,.25)";
      for (let y = gy - b.h + 8; y < gy - 8; y += 12) if ((y + i * 13) % 3 < b.lit * 3) ctx.fillRect(b.x + wob + 5, y, 3, 4);
    });
    /* tanah */
    ctx.fillStyle = "#0e1f4d"; ctx.fillRect(-20, gy, W + 40, H - gy + 20);
    ctx.fillStyle = "#f5c219"; ctx.fillRect(-20, gy, W + 40, 2);
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1;
    for (let x = -40 + (g.gx % 20); x < W + 20; x += 20) { ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x - 12, H); ctx.stroke(); }

    if (world.opt.iso) drawIsolator(g);
    else { ctx.fillStyle = "#d6def0"; ctx.fillRect(xs[0] - bw / 2 - 10, gy - 4, bw + 20, 8); }

    const upto = collapse ? collapse.f : n;
    for (let i = 0; i < upto; i++) drawStory(g, i, xs[i], xs[i + 1], base - i * fh);
    if (!collapse) {
      const top = base - n * fh, xr = xs[n];
      ctx.fillStyle = "#d6def0"; ctx.fillRect(xr - 30, top - 16, 20, 12); ctx.fillRect(xr + 20, top - 30, 2, 26);
      ctx.fillStyle = "#ff6b6b"; ctx.beginPath(); ctx.arc(xr + 21, top - 32, 2.5, 0, 7); ctx.fill();
      if (world.opt.tmd) drawTmd(g);
    } else drawCollapse(g);

    drawSeismo();
    ctx.restore();
  }

  /* ---------- keruntuhan: lantai di atas lantai yang gagal jatuh bertumpuk ---------- */
  function startCollapse() {
    const g = geometry(), f = world.failed;
    collapse = {
      f, floorY: g.base - f * g.fh, t: 0, dust: [],
      blocks: Array.from({ length: g.n - f }, (_, k) => ({ x: g.xs[f + k + 1], y: g.base - (f + k) * g.fh, vy: 0, rot: 0, vr: (Math.random() - .5) * .6, h: g.fh, landed: false })),
    };
    shake = 16; world.agNow = 0;
    if (navigator.vibrate) navigator.vibrate([90, 50, 160]);
  }
  function stepCollapse(dt) {
    const c = collapse, g = geometry(); c.t += dt;
    /* lantai hanya mendarat di atas tumpukan yang sudah diam; selama yang di bawahnya masih jatuh, ikut jatuh */
    let floor = c.floorY, below = null;
    c.blocks.forEach(b => {
      if (!b.landed) {
        b.vy += 1600 * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
        if (b.y >= floor && below && !below.landed) { b.y = floor; b.vy = below.vy; }
        else if (b.y >= floor) {
          b.y = floor; b.landed = true; b.h = 9; b.rot *= .3; shake = Math.max(shake, 10);
          for (let k = 0; k < 6; k++) c.dust.push({ x: b.x + (Math.random() - .5) * g.bw, y: b.y, vx: (Math.random() - .5) * 140, vy: -Math.random() * 50, r: 4 + Math.random() * 7, a: .45 });
        }
      }
      floor = b.y - b.h; below = b;
    });
    c.dust.forEach(d => { d.x += d.vx * dt; d.y += d.vy * dt; d.r += 16 * dt; d.a -= .5 * dt; });
    c.dust = c.dust.filter(d => d.a > 0);
    if (c.t > 1.6 && ui.over.hidden) showResult();
  }
  function drawCollapse(g) {
    collapse.blocks.forEach(b => {
      ctx.save(); ctx.translate(b.x, b.y - b.h / 2); ctx.rotate(b.rot);
      ctx.fillStyle = b.landed ? "#8b97b3" : "rgba(120,160,255,.25)"; ctx.fillRect(-g.bw / 2 - 6, -b.h / 2, g.bw + 12, b.h);
      ctx.strokeStyle = b.landed ? "#ff6b6b" : "#e6eeff"; ctx.lineWidth = 2; ctx.strokeRect(-g.bw / 2 - 6, -b.h / 2, g.bw + 12, b.h);
      ctx.restore();
    });
    collapse.dust.forEach(d => { ctx.fillStyle = `rgba(200,205,220,${d.a})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill(); });
  }

  function showResult() {
    const worst = Math.max(...world.maxDrift) * 100, s = world.status;
    const msg = {
      aman: ["Gedung aman!", `Simpangan antarlantai maksimum ${num(worst, 2)}% masih di bawah batas retak. Coba naikkan kekuatan gempa.`],
      retak: ["Bertahan, tetapi retak", `Simpangan maksimum ${num(worst, 2)}%. Dinding retak ringan dan perlu perbaikan nonstruktural.`],
      "rusak berat": ["Rusak berat", `Simpangan maksimum ${num(worst, 2)}%. Gedung masih berdiri tetapi perlu perkuatan struktur. Coba isolator dasar.`],
      runtuh: ["Gedung runtuh!", `Kolom lantai ${world.failed + 1} gagal. ` + ({
        biasa: "Coba pasang isolator dasar atau peredam massa, atau kurangi jumlah lantai.",
        tmd: "Peredam massa saja belum cukup untuk gempa sebesar ini. Coba isolator dasar atau kurangi jumlah lantai.",
        iso: "Coba kurangi jumlah lantai atau kekuatan gempa.",
      })[tech]],
    }[s] || ["Selesai", ""];
    /* saran isolator hanya relevan bila isolator belum dipasang */
    if (s === "rusak berat" && tech === "iso") msg[1] = `Simpangan maksimum ${num(worst, 2)}%. Gedung masih berdiri tetapi perlu perkuatan struktur.`;
    ui.over.hidden = false; ui.over.className = "qk-over " + (STATUS[s] || STATUS.aman)[1];
    $("b", ui.over).textContent = msg[0]; $("p", ui.over).textContent = msg[1];
    ui.go.disabled = false; ui.go.textContent = "Ulangi gempa";
  }

  /* ---------- siklus ---------- */
  let prev = performance.now(), running = false, raf = 0, wasRunning = false;
  const frame = now => {
    const dt = Math.min((now - prev) / 1000, 0.04); prev = now;
    if (world.running) {
      Q.step(world, dt);
      hist.push(world.agNow); if (hist.length > 240) hist.shift();
      shake = Math.abs(world.agNow) / Q.G * 7;
      ui.stage.classList.add("shaking");
      if (navigator.vibrate && Math.abs(world.agNow) > .45 * Q.G && now - lastBuzz > 400) { navigator.vibrate(60); lastBuzz = now; }
      wasRunning = true;
    } else if (wasRunning) {
      wasRunning = false; ui.stage.classList.remove("shaking");
      if (world.status === "runtuh") startCollapse(); else showResult();
    } else { hist.push(0); if (hist.length > 240) hist.shift(); }
    if (collapse) stepCollapse(dt);
    shake *= 0.9;
    draw(); sync();
    if (running) raf = requestAnimationFrame(frame);
  };
  reset(); resize();
  const start = () => { if (!running) { running = true; prev = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(cv);
})();
