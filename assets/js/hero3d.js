/* Jembatan kabel (cable-stayed) 3D interaktif di hero beranda, memakai three.js.
   Jembatan menyusun diri saat halaman dibuka, bisa diputar dengan seret, punya mode Render,
   Cetak biru, dan Malam, serta titik info pada bagian struktur. Bila WebGL tidak tersedia,
   hero tetap memakai efek 2D dari wow.js. */
(() => {
  const hero = document.getElementById("hero");
  const T = window.THREE;
  if (!hero || !T) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); } catch { return; }
  if (!renderer.getContext()) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  hero.classList.add("has-3d");

  /* ---------- DOM ---------- */
  const wrap = document.createElement("div");
  wrap.className = "hero-3d";
  wrap.innerHTML = `<div class="h3d-tags"></div>
    <div class="h3d-card" id="h3d-card" role="dialog" aria-live="polite" hidden></div>
    <div class="h3d-ui" role="group" aria-label="Mode tampilan jembatan 3D">
      <button data-m="render" class="on" aria-pressed="true">Render</button><button data-m="blue" aria-pressed="false">Cetak biru</button><button data-m="night" aria-pressed="false">Malam</button>
    </div>
    <p class="h3d-hint"><span class="hand"></span>Seret untuk memutar jembatan</p>`;
  const cv = renderer.domElement; cv.className = "h3d-cv"; cv.setAttribute("aria-hidden", "true");
  wrap.prepend(cv);
  hero.querySelector(".hero-slides").after(wrap);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = T.sRGBEncoding;

  /* ---------- Scene ---------- */
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x071331, 150, 380);
  const camera = new T.PerspectiveCamera(34, 1, 0.5, 900);
  const target = new T.Vector3(0, 14, 0);

  const hemi = new T.HemisphereLight(0xcfe0ff, 0x0b1c47, 1.0);
  const sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(60, 90, 50);
  const rim = new T.DirectionalLight(0xf5c219, 0.35); rim.position.set(-80, 30, -60);
  scene.add(hemi, sun, rim);

  const M = {
    beton: new T.MeshStandardMaterial({ color: 0xe3e9f4, roughness: 0.85 }),
    baja: new T.MeshStandardMaterial({ color: 0xc4cfe4, roughness: 0.45, metalness: 0.35 }),
    kuning: new T.MeshStandardMaterial({ color: 0xf5c219, roughness: 0.5, emissive: 0x000000 }),
    jalan: new T.MeshStandardMaterial({ color: 0x2b3650, roughness: 0.9 }),
    tanah: new T.MeshStandardMaterial({ color: 0x0f1f4a, roughness: 1 }),
    air: new T.MeshStandardMaterial({ color: 0x0c2257, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0.92 }),
    putih: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
  };
  const solid = Object.values(M);
  const edgeMat = new T.LineBasicMaterial({ color: 0x9fbfff, transparent: true, opacity: 0.22 });
  const cableMat = new T.LineBasicMaterial({ color: 0xf5c219, transparent: true, opacity: 0.95 });

  const box = (w, h, d, mat, x, y, z, parent = scene, edges = true) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m);
    if (edges) m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), edgeMat));
    return m;
  };

  /* tekstur cahaya untuk lampu (mode malam) */
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  })();
  const glows = [];
  const glow = (color, size, parent, x, y, z) => {
    const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    s.scale.set(size, size, 1); s.position.set(x, y, z); s.visible = false; parent.add(s); glows.push(s);
    return s;
  };

  /* air dan grid cetak biru */
  const water = new T.Mesh(new T.PlaneGeometry(900, 900), M.air);
  water.rotation.x = -Math.PI / 2; scene.add(water);
  const grid = new T.GridHelper(900, 180, 0x3a62c4, 0x1d3a85);
  grid.material.transparent = true; grid.material.opacity = 0.35; grid.position.y = 0.05; scene.add(grid);

  /* daratan di kedua ujung */
  [-1, 1].forEach(s => {
    box(90, 8.6, 44, M.tanah, s * 105, 4.3, 0, scene, true);
    box(90, 0.1, 9, M.jalan, s * 105, 8.66, 0, scene, false);
  });

  const parts = []; // { obj, t0, dur, from: Vector3 offset }
  const home = (obj, t0, dur, dx, dy) => { obj.userData.home = obj.position.clone(); parts.push({ obj, t0, dur, dx, dy }); };

  /* pilon berbentuk H dan pilar pendekat */
  const PX = 28, DECK = 8, LEG = 6.6;
  [-1, 1].forEach((s, i) => {
    const g = new T.Group(); g.position.set(s * PX, 0, 0); scene.add(g);
    box(9, 4, 20, M.beton, 0, -0.5, 0, g);
    [-LEG, LEG].forEach(z => box(2.3, 46, 2.3, M.beton, 0, 23, z, g));
    box(2.2, 2, LEG * 2 + 2.3, M.beton, 0, DECK - 1.6, 0, g);
    box(2.4, 2.6, LEG * 2 + 2.3, M.kuning, 0, 45, 0, g);
    box(2.2, 1.6, LEG * 2 + 2.3, M.beton, 0, 30, 0, g);
    glow(0xff4d4d, 4, g, 0, 47.2, LEG); glow(0xff4d4d, 4, g, 0, 47.2, -LEG);
    home(g, 0.15 + i * 0.2, 1.4, 0, -60);
    const p = new T.Group(); p.position.set(s * 48, 0, 0); scene.add(p);
    box(2.6, DECK - 0.6, 7, M.beton, 0, (DECK - 0.6) / 2, 0, p);
    home(p, 0.5 + i * 0.15, 1.1, 0, -20);
  });

  /* dek: 10 segmen gelagar dengan marka, pagar, dan lampu jalan */
  const SEG = 12;
  for (let k = 0; k < 10; k++) {
    const x = -54 + k * SEG;
    const seg = box(SEG, 1.2, 10, M.baja, x, DECK, 0);
    box(SEG, 0.06, 9, M.jalan, 0, 0.63, 0, seg, false);
    box(SEG, 0.04, 0.18, M.kuning, 0, 0.68, 0, seg, false);
    [-2.4, 2.4].forEach(z => [-3, 3].forEach(dx => box(3, 0.04, 0.16, M.putih, dx, 0.68, z, seg, false)));
    [-4.95, 4.95].forEach(z => box(SEG, 0.9, 0.18, M.kuning, 0, 1.05, z, seg, false));
    [-5.3, 5.3].forEach(z => {
      box(0.2, 5, 0.2, M.baja, 0, 3, z, seg, false);
      glow(0xffe08a, 4.5, seg, 0, 5.6, z);
    });
    const order = Math.abs(k - 4.5);
    home(seg, 1.3 + order * 0.12, 0.9, 0, 35);
  }

  /* kabel: pola kipas, 8 kabel per arah per bidang */
  const cablePts = [];
  [-1, 1].forEach(s => [-LEG, LEG].forEach(z => [-1, 1].forEach(dir => {
    for (let j = 0; j < 8; j++) {
      cablePts.push(s * PX, 43 - j * 1.5, z, s * PX + dir * (6 + j * 3.2), DECK + 0.6, Math.sign(z) * 5);
    }
  })));
  const cableGeo = new T.BufferGeometry();
  cableGeo.setAttribute("position", new T.Float32BufferAttribute(cablePts, 3));
  const cables = new T.LineSegments(cableGeo, cableMat); scene.add(cables);
  const nCable = cablePts.length / 3;

  /* kendaraan */
  const cars = [];
  const COLORS = [0xf5c219, 0xffffff, 0xe03131, 0x4dabf7, 0x51cf66, 0xffffff, 0xf5c219, 0xff922b];
  [-3.6, -1.2, 1.2, 3.6].forEach((z, lane) => {
    for (let k = 0; k < 2; k++) {
      const dir = z < 0 ? 1 : -1, g = new T.Group();
      const mat = new T.MeshStandardMaterial({ color: COLORS[lane * 2 + k], roughness: 0.4, metalness: 0.2 });
      solid.push(mat);
      box(4.2, 1.3, 2, mat, 0, 0.65, 0, g);
      box(2.2, 0.9, 1.8, mat, -0.4 * dir, 1.7, 0, g);
      glow(0xffffff, 3, g, 2.3 * dir, 0.8, 0.6); glow(0xffffff, 3, g, 2.3 * dir, 0.8, -0.6);
      glow(0xff3b3b, 2, g, -2.2 * dir, 0.8, 0.6); glow(0xff3b3b, 2, g, -2.2 * dir, 0.8, -0.6);
      g.position.set(-140 + k * 140 + lane * 33, DECK + 0.68, z);
      g.scale.setScalar(0.001);
      g.userData = { dir, v: 11 + Math.random() * 7 };
      scene.add(g); cars.push(g);
    }
  });

  /* partikel melayang */
  const pN = 260, pPos = new Float32Array(pN * 3);
  for (let i = 0; i < pN; i++) { pPos[i * 3] = (Math.random() - .5) * 260; pPos[i * 3 + 1] = Math.random() * 70; pPos[i * 3 + 2] = (Math.random() - .5) * 160; }
  const pGeo = new T.BufferGeometry(); pGeo.setAttribute("position", new T.BufferAttribute(pPos, 3));
  const dust = new T.Points(pGeo, new T.PointsMaterial({ color: 0xf5c219, size: 0.55, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  /* ---------- Mode tampilan ---------- */
  let mode = "render";
  const setMode = m => {
    mode = m;
    hero.classList.toggle("m-blue", m === "blue"); hero.classList.toggle("m-night", m === "night");
    solid.forEach(mat => { mat.visible = m !== "blue"; });
    edgeMat.opacity = m === "blue" ? 0.95 : m === "night" ? 0.1 : 0.22;
    edgeMat.color.set(m === "blue" ? 0x8ec5ff : 0x9fbfff);
    cableMat.color.set(m === "blue" ? 0xffffff : 0xf5c219);
    grid.material.opacity = m === "blue" ? 0.8 : m === "night" ? 0.12 : 0.35;
    hemi.intensity = m === "night" ? 0.2 : 1.0; sun.intensity = m === "night" ? 0.05 : 1.2; rim.intensity = m === "night" ? 0 : 0.35;
    M.kuning.emissive.set(m === "night" ? 0x7a5a00 : 0x000000);
    glows.forEach(g => { g.visible = m === "night"; });
    dust.material.color.set(m === "night" ? 0xfff3bf : 0xf5c219);
    $$(".h3d-ui button", wrap).forEach(b => { const on = b.dataset.m === m; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  };
  $(".h3d-ui", wrap).addEventListener("click", e => { const b = e.target.closest("button"); if (b) { setMode(b.dataset.m); interacted(); } });

  /* ---------- Titik info ---------- */
  const INFO = [
    { p: new T.Vector3(PX, 46, LEG), nama: "Pilon", isi: "Menara setinggi 46 m yang menahan kabel. Gaya tarik kabel diubah menjadi gaya tekan dan disalurkan ke pondasi." },
    { p: new T.Vector3(PX - 14, 30, 5.5), nama: "Kabel", isi: "Kabel baja disusun seperti kipas. Kabel hanya menahan gaya tarik dan menggantung dek dari pilon." },
    { p: new T.Vector3(2, DECK + 1, 5), nama: "Dek", isi: "Gelagar kotak baja yang menjadi lantai kendaraan. Beban lalu lintas disalurkan ke kabel dan pilar." },
    { p: new T.Vector3(-PX, 0, 10), nama: "Pondasi", isi: "Pondasi tiang bor di dasar sungai menahan seluruh beban jembatan hingga ke lapisan tanah keras." },
  ];
  const tagsEl = $(".h3d-tags", wrap), card = $("#h3d-card", wrap);
  INFO.forEach((it, i) => {
    const b = document.createElement("button"); b.className = "h3d-tag"; b.dataset.i = i;
    b.innerHTML = `<i></i><span>${it.nama}</span>`; b.setAttribute("aria-label", "Info " + it.nama);
    tagsEl.append(b); it.el = b;
  });
  let openInfo = -1;
  tagsEl.addEventListener("click", e => {
    const b = e.target.closest(".h3d-tag"); if (!b) return;
    const i = +b.dataset.i; interacted();
    if (openInfo === i) { card.hidden = true; openInfo = -1; return; }
    openInfo = i; card.hidden = false;
    card.innerHTML = `<b>${INFO[i].nama}</b><p>${INFO[i].isi}</p>`;
  });

  /* ---------- Kamera dan interaksi ---------- */
  const cam = { th: -1.25, ph: 0.04, r: 70 }, goal = { th: 0.62, ph: 0.2, r: 185 };
  let vth = 0, dragging = false, lastX = 0, lastY = 0, idleAt = 0, mx = 0, my = 0;
  const interacted = () => { idleAt = performance.now(); wrap.classList.add("used"); };
  const skip = e => e.target.closest("a, button, input, select, textarea, .h3d-card");
  hero.addEventListener("pointerdown", e => {
    if (skip(e) || e.button > 0) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; interacted(); hero.classList.add("grabbing");
  });
  addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    vth = -dx * 0.006; goal.th += vth;
    if (e.pointerType === "mouse") goal.ph = clamp(goal.ph + dy * 0.003, 0.03, 0.75);
    interacted();
  }, { passive: true });
  const up = () => { dragging = false; hero.classList.remove("grabbing"); };
  addEventListener("pointerup", up); addEventListener("pointercancel", up);

  /* ---------- Ukuran, putaran, dan siklus gambar ---------- */
  let W = 0, H = 0;
  const resize = () => {
    W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    camera.fov = W / H < 1 ? 46 : 34;
    camera.updateProjectionMatrix();
    /* jarak kamera menyesuaikan lebar kanvas agar seluruh bentang jembatan selalu terlihat */
    const tv = Math.tan(camera.fov * Math.PI / 360), th = tv * camera.aspect;
    goal.r = Math.max(88 / th, 34 / tv);
    scene.fog.near = goal.r * 0.85; scene.fog.far = goal.r * 2.4;
  };
  addEventListener("resize", resize);

  /* tunda intro sampai layar pembuka selesai */
  const t0 = performance.now() + (document.getElementById("preload") ? 1500 : 0), v = new T.Vector3();
  let running = false, raf = 0, prev = t0;
  const frame = now => {
    const dt = Math.min((now - prev) / 1000, 0.05), t = reduce ? 99 : Math.max((now - t0) / 1000, 0); prev = now;

    /* penyusunan jembatan */
    for (const p of parts) {
      const k = ease((t - p.t0) / p.dur), h = p.obj.userData.home;
      p.obj.position.set(h.x, h.y + p.dy * (1 - k), h.z);
    }
    cableGeo.setDrawRange(0, Math.floor(nCable * ease((t - 2.2) / 1.2) / 2) * 2);
    const show = ease((t - 3.2) / 0.6);

    /* kendaraan */
    for (const c of cars) {
      c.scale.setScalar(Math.max(show, 0.001));
      c.position.x += c.userData.dir * c.userData.v * dt * (show > 0 ? 1 : 0);
      if (c.position.x > 150) c.position.x = -150; if (c.position.x < -150) c.position.x = 150;
    }
    /* partikel dan arus air */
    const pa = pGeo.attributes.position.array;
    for (let i = 1; i < pa.length; i += 3) { pa[i] += dt * 1.2; if (pa[i] > 70) pa[i] = 0; }
    pGeo.attributes.position.needsUpdate = true;
    grid.position.x = (t * 1.5) % 5;

    /* kamera: intro menyapu, lalu berputar pelan bila tidak disentuh */
    const idle = now - idleAt > 3500;
    /* bila dibiarkan, kamera kembali berayun pelan di sekitar sudut pandang terbaik */
    if (!dragging) { goal.th += vth; vth *= 0.94; if (idle && t > 4) goal.th += (0.5 + 0.3 * Math.sin(t * 0.16) - goal.th) * 0.012; }
    const k = t < 4 ? 0.035 : 0.08;
    cam.th += (goal.th + (dragging ? 0 : mx * 0.25) - cam.th) * k;
    cam.ph += (goal.ph + (dragging ? 0 : my * 0.08) - cam.ph) * k;
    cam.r += (goal.r - cam.r) * k * 0.8;
    const r = cam.r;
    camera.position.set(target.x + r * Math.cos(cam.ph) * Math.sin(cam.th), target.y + r * Math.sin(cam.ph), target.z + r * Math.cos(cam.ph) * Math.cos(cam.th));
    camera.lookAt(target);
    renderer.render(scene, camera);

    /* posisi titik info */
    const tagVis = t > 3.6;
    INFO.forEach((it, i) => {
      v.copy(it.p).project(camera);
      const on = tagVis && v.z < 1 && Math.abs(v.x) < .95 && Math.abs(v.y) < .95;
      it.el.style.opacity = on ? 1 : 0; it.el.style.pointerEvents = on ? "auto" : "none";
      it.el.style.transform = `translate(${cv.offsetLeft + (v.x + 1) / 2 * W}px, ${cv.offsetTop + (1 - v.y) / 2 * H}px)`;
      if (i === openInfo) card.style.transform = `translate(${clamp(cv.offsetLeft + (v.x + 1) / 2 * W - 120, 8, hero.clientWidth - 248)}px, ${cv.offsetTop + (1 - v.y) / 2 * H + 22}px)`;
    });

    if (running) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; prev = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  resize();
  new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(hero);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  addEventListener("load", resize);
})();
