/* Mesin simulasi "Uji Gempa".
   Model: bangunan geser bertingkat dengan massa terpusat per lantai, pegas dan redaman antarlantai,
   dieksitasi percepatan tanah. Opsi isolator dasar (base isolation) dan peredam massa tertala (TMD).
   Integrasi semi-implisit Euler dengan sub-langkah. Tidak bergantung pada DOM agar bisa diuji di Node.
   Satuan: meter, detik, massa per lantai = 1. */
(function (root) {
  const G = 9.81, H = 3.5;
  /* batas simpangan antarlantai (drift ratio) untuk tingkat kerusakan */
  const LIMIT = { retak: 0.006, berat: 0.014, runtuh: 0.022 };
  const DUR = 12;

  /* acak dengan benih agar hasil uji bisa diulang */
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* percepatan tanah: jumlah gelombang sinus dengan selubung naik-tahan-turun, puncak = pga (g) */
  function groundMotion(pga, seed = Math.floor(Math.random() * 1e9) + 1) {
    const r = rng(seed);
    const waves = [0.7, 1.1, 1.6, 2.2, 3.1, 4.4].map((f, i) => ({ f: f * (0.9 + 0.2 * r()), a: [1, .9, .8, .6, .45, .3][i], ph: r() * Math.PI * 2 }));
    const env = t => t < 1.5 ? (t / 1.5) ** 2 : t < 6.5 ? 1 : Math.exp(-(t - 6.5) / 1.6);
    const raw = t => waves.reduce((s, w) => s + w.a * Math.sin(2 * Math.PI * w.f * t + w.ph), 0);
    let peak = 0;
    for (let t = 0; t < DUR; t += 0.005) peak = Math.max(peak, Math.abs(raw(t) * env(t)));
    return t => (t > DUR ? 0 : raw(t) * env(t) / peak * pga * G);
  }

  /* n = jumlah lantai; opt.iso = isolator dasar; opt.tmd = peredam massa di atap */
  function createWorld(n, opt = {}) {
    const T1 = 0.1 * n, w1 = 2 * Math.PI / T1;
    const k = (w1 / (2 * Math.sin(Math.PI / (2 * (2 * n + 1))))) ** 2;
    const c = 2 * 0.05 / w1 * k;
    const m = [], springs = [];
    let base = -1;
    if (opt.iso) {
      const M = n + 1, wb = 2 * Math.PI / 2.6;
      m.push(1); base = 0;
      springs.push({ a: -1, b: 0, k: M * wb * wb, c: 2 * 0.15 * M * wb });
    }
    for (let i = 0; i < n; i++) { const below = m.length - 1; m.push(1); springs.push({ a: below, b: below + 1, k, c }); }
    const floors = m.map((_, i) => i).slice(opt.iso ? 1 : 0);
    let tmd = -1;
    if (opt.tmd) {
      const mu = 0.08, mt = mu * n, wt = w1 / (1 + mu);
      m.push(mt); tmd = m.length - 1;
      springs.push({ a: floors[n - 1], b: tmd, k: mt * wt * wt, c: 2 * 0.12 * mt * wt });
    }
    return {
      n, opt, m, springs, floors, base, tmd, T1,
      u: m.map(() => 0), v: m.map(() => 0),
      t: 0, ag: () => 0, ug: 0, vg: 0, agNow: 0,
      drift: Array(n).fill(0), maxDrift: Array(n).fill(0), maxRoof: 0,
      status: "diam", failed: -1, running: false,
    };
  }

  function start(world, pga, seed) {
    world.ag = groundMotion(pga, seed); world.t = 0; world.running = true; world.status = "aman";
    return world;
  }

  /* posisi lantai i relatif terhadap tanah; i = -1 berarti dasar bangunan */
  const disp = (world, i) => i < 0 ? (world.base >= 0 ? world.u[world.base] : 0) : world.u[world.floors[i]];

  function step(world, dt, sub = 20) {
    if (!world.running) return world;
    const h = dt / sub, { m, springs, u, v } = world, f = new Float64Array(m.length);
    for (let s = 0; s < sub; s++) {
      const ag = world.ag(world.t);
      f.fill(0);
      for (const sp of springs) {
        const ua = sp.a < 0 ? 0 : u[sp.a], va = sp.a < 0 ? 0 : v[sp.a];
        const F = sp.k * (u[sp.b] - ua) + sp.c * (v[sp.b] - va);
        f[sp.b] -= F; if (sp.a >= 0) f[sp.a] += F;
      }
      for (let i = 0; i < m.length; i++) { v[i] += (f[i] / m[i] - ag) * h; u[i] += v[i] * h; }
      world.vg += ag * h; world.ug += world.vg * h; world.t += h; world.agNow = ag;
    }
    /* simpangan antarlantai dan tingkat kerusakan */
    for (let i = 0; i < world.n; i++) {
      const d = Math.abs(disp(world, i) - disp(world, i - 1)) / H;
      world.drift[i] = d; world.maxDrift[i] = Math.max(world.maxDrift[i], d);
    }
    world.maxRoof = Math.max(world.maxRoof, Math.abs(disp(world, world.n - 1)));
    const worst = Math.max(...world.maxDrift);
    if (worst >= LIMIT.runtuh) { world.status = "runtuh"; world.failed = world.maxDrift.indexOf(worst); world.running = false; }
    else world.status = worst >= LIMIT.berat ? "rusak berat" : worst >= LIMIT.retak ? "retak" : "aman";
    if (world.t > DUR + 3) world.running = false;
    return world;
  }

  const api = { G, H, LIMIT, DUR, groundMotion, createWorld, start, step, disp };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.QuakeEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
