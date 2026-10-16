/* Mesin fisika mini game "Uji Jembatan".
   Model: titik bermassa + batang pegas (gaya aksial), integrasi semi-implisit Euler dengan sub-langkah.
   Batang putus bila gaya aksialnya melebihi kekuatan. Tidak bergantung pada DOM agar bisa diuji di Node. */
(function (root) {
  const W = 960, H = 540, GROUND = 360, GRID = 20;

  const MAT = {
    road:  { nama: "Jalan", k: 900000, kuat: 7200, rho: 0.02, biaya: 14, maks: 140 },
    steel: { nama: "Rangka baja", k: 1100000, kuat: 9000, rho: 0.008, biaya: 8, maks: 160 },
  };

  /* L/R = tepi tebing, budget = anggaran, pilar = titik tumpu tambahan */
  const LEVELS = [
    { nama: "Sungai kecil", L: 380, R: 580, budget: 8000, pilar: null },
    { nama: "Lembah", L: 320, R: 640, budget: 14000, pilar: null },
    { nama: "Ngarai dengan pilar", L: 240, R: 720, budget: 22000, pilar: { x: 480, y: 440 } },
  ];

  function anchors(lv) {
    const a = [{ x: lv.L, y: GROUND }, { x: lv.R, y: GROUND }, { x: lv.L, y: GROUND + 60 }, { x: lv.R, y: GROUND + 60 }];
    if (lv.pilar) a.push({ x: lv.pilar.x, y: lv.pilar.y });
    return a.map(p => ({ ...p, fixed: true }));
  }

  /* segmen tanah statis untuk tumbukan roda */
  function groundSegs(lv) {
    const s = [[0, GROUND, lv.L, GROUND], [lv.L, GROUND, lv.L, H], [lv.R, GROUND, W, GROUND], [lv.R, H, lv.R, GROUND]];
    if (lv.pilar) s.push([lv.pilar.x - 16, lv.pilar.y, lv.pilar.x + 16, lv.pilar.y]);
    return s;
  }

  const len = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  function cost(design) {
    return Math.round(design.beams.reduce((s, b) => s + len(design.nodes[b.a], design.nodes[b.b]) * MAT[b.type].biaya, 0));
  }

  /* ---------- simulasi ---------- */
  function createWorld(lvIndex, design) {
    const lv = LEVELS[lvIndex];
    const P = design.nodes.map(n => ({ x: n.x, y: n.y, vx: 0, vy: 0, fx: 0, fy: 0, m: 0, fixed: !!n.fixed }));
    const B = design.beams.map(b => {
      const r = len(P[b.a], P[b.b]), mt = MAT[b.type];
      P[b.a].m += r * mt.rho / 2; P[b.b].m += r * mt.rho / 2;
      return { a: b.a, b: b.b, type: b.type, rest: r, k: mt.k, kuat: mt.kuat, f: 0, stress: 0, broken: false };
    });
    P.forEach(p => { p.m = Math.max(p.m, 0.4); });

    /* truk: dua roda + bodi (pegas kaku) */
    const y0 = GROUND - 14, x0 = 90;
    const car = {
      w: [{ x: x0, y: y0, vx: 0, vy: 0, fx: 0, fy: 0, m: 3, r: 13, contact: false }, { x: x0 + 52, y: y0, vx: 0, vy: 0, fx: 0, fy: 0, m: 3, r: 13, contact: false }],
      rest: 52,
    };
    return { lv, lvIndex, P, B, car, t: 0, status: "jalan", ground: groundSegs(lv), maxStress: 0 };
  }

  /* KC/CC = kekakuan & redaman kontak roda, DAMP = redaman aksial batang (meredam getaran) */
  const G = 520, SUB = 32, KC = 70000, CC = 650, SPEED = 75, DAMP = 0.006;

  function collide(w, x1, y1, x2, y2, beam, world) {
    const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
    let t = ((w.x - x1) * dx + (w.y - y1) * dy) / L2; t = Math.max(0, Math.min(1, t));
    const cx = x1 + dx * t, cy = y1 + dy * t, ex = w.x - cx, ey = w.y - cy, d = Math.hypot(ex, ey);
    if (d >= w.r || d === 0) return;
    const nx = ex / d, ny = ey / d, pen = w.r - d;
    let vrel = w.vx * nx + w.vy * ny;
    if (beam) { const A = world.P[beam.a], Bp = world.P[beam.b]; vrel -= ((A.vx * (1 - t) + Bp.vx * t) * nx + (A.vy * (1 - t) + Bp.vy * t) * ny); }
    const f = Math.max(0, KC * pen - CC * vrel);
    w.fx += nx * f; w.fy += ny * f; w.contact = true;
    if (beam) {
      const A = world.P[beam.a], Bp = world.P[beam.b];
      A.fx -= nx * f * (1 - t); A.fy -= ny * f * (1 - t); Bp.fx -= nx * f * t; Bp.fy -= ny * f * t;
    }
  }

  function substep(world, dt) {
    const { P, B, car } = world;
    const g = G * Math.min(1, world.t / 0.6 + 0.05); /* beban dinaikkan bertahap agar tidak menghentak */
    for (const p of P) { p.fx = 0; p.fy = p.m * g; }
    for (const w of car.w) { w.fx = 0; w.fy = w.m * G; w.contact = false; }

    for (const b of B) {
      if (b.broken) continue;
      const A = P[b.a], Bp = P[b.b], dx = Bp.x - A.x, dy = Bp.y - A.y, L = Math.hypot(dx, dy) || 1e-6;
      const ux = dx / L, uy = dy / L;
      const vrel = (Bp.vx - A.vx) * ux + (Bp.vy - A.vy) * uy;
      b.f = b.k * (L - b.rest) / b.rest;
      const f = b.f + DAMP * b.k / b.rest * vrel;
      b.stress = Math.abs(b.f) / b.kuat;
      if (b.stress > 1) { b.broken = true; continue; }
      A.fx += ux * f; A.fy += uy * f; Bp.fx -= ux * f; Bp.fy -= uy * f;
    }

    /* roda vs jalan & tanah */
    for (const w of car.w) {
      for (const b of B) if (!b.broken && b.type === "road") { const A = P[b.a], Bp = P[b.b]; collide(w, A.x, A.y, Bp.x, Bp.y, b, world); }
      for (const s of world.ground) collide(w, s[0], s[1], s[2], s[3], null, world);
    }
    /* bodi truk */
    const [w1, w2] = car.w, dx = w2.x - w1.x, dy = w2.y - w1.y, L = Math.hypot(dx, dy) || 1e-6, ux = dx / L, uy = dy / L;
    const fb = 60000 * (L - car.rest) / car.rest + 400 * ((w2.vx - w1.vx) * ux + (w2.vy - w1.vy) * uy);
    w1.fx += ux * fb; w1.fy += uy * fb; w2.fx -= ux * fb; w2.fy -= uy * fb;
    /* motor */
    for (const w of car.w) if (w.contact) w.fx += Math.max(-900, Math.min(900, (SPEED - w.vx) * w.m * 6));

    for (const p of P) {
      if (p.fixed) { p.vx = p.vy = 0; continue; }
      p.vx = (p.vx + p.fx / p.m * dt) * 0.9995; p.vy = (p.vy + p.fy / p.m * dt) * 0.9995;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (const w of car.w) { w.vx += w.fx / w.m * dt; w.vy += w.fy / w.m * dt; w.x += w.vx * dt; w.y += w.vy * dt; }
  }

  function step(world, frameDt = 1 / 60) {
    if (world.status !== "jalan") return world;
    const dt = frameDt / SUB;
    for (let i = 0; i < SUB; i++) substep(world, dt);
    world.t += frameDt;
    for (const b of world.B) {
      if (b.broken) continue;
      world.maxStress = Math.max(world.maxStress, b.stress);
      /* nilai tampilan dihaluskan agar warna tidak berkedip */
      b.shown = b.shown === undefined ? b.stress : b.shown + (b.stress - b.shown) * 0.18;
    }
    const c = world.car.w;
    if (c[0].x > world.lv.R + 120) world.status = "lolos";
    else if (c[0].y > H + 40 || c[1].y > H + 40) world.status = "gagal";
    else if (world.t > 25) world.status = "gagal";
    return world;
  }

  /* desain awal: hanya titik tumpu */
  function emptyDesign(lvIndex) { return { nodes: anchors(LEVELS[lvIndex]), beams: [] }; }

  const api = { W, H, GROUND, GRID, MAT, LEVELS, anchors, groundSegs, cost, createWorld, step, emptyDesign, len };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BridgeEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
