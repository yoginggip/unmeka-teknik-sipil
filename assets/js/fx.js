/* Efek interaksi: progres scroll, parallax, tilt, penghitung angka, teks hero, CTA mobile.
   Dimuat setelah app.js sehingga konten dari pageInit sudah tersedia. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Teks hero muncul per kata */
  function splitWords(el) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement("span"); s.className = "w"; s.style.animationDelay = (0.15 + i++ * 0.09) + "s"; s.textContent = part; frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el); el.classList.add("split");
  }

  /* Penghitung angka */
  function countUp(el) {
    const to = +el.dataset.count, dur = 1400, t0 = performance.now();
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("id-ID"); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* Kartu miring mengikuti kursor */
  function tilt(el) {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-3px)`;
      el.style.setProperty("--gx", (x + .5) * 100 + "%"); el.style.setProperty("--gy", (y + .5) * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    el.classList.add("tilt");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div"); bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true"); document.body.prepend(bar);

    const h1 = document.querySelector(".hero h1");
    if (h1 && !reduce) splitWords(h1);

    /* stagger untuk item di dalam grid */
    document.querySelectorAll(".grid, .routes, .mosaic, .bk-tabs").forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--stagger", (i % 6) * 70 + "ms")));

    if (fine && !reduce) document.querySelectorAll(".route, .person, .news-card, .card.jalur, .qlink").forEach(tilt);

    const counters = document.querySelectorAll("[data-count]");
    if (counters.length) {
      if (reduce || !("IntersectionObserver" in window)) counters.forEach(c => c.textContent = (+c.dataset.count).toLocaleString("id-ID"));
      else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } }), { threshold: .6 }); counters.forEach(c => io.observe(c)); }
    }

    /* CTA pendaftaran melayang di layar kecil */
    const onPmb = location.pathname.endsWith("pmb.html");
    let cta = null;
    if (!onPmb && document.querySelector(".header")) {
      cta = document.createElement("div"); cta.className = "m-cta";
      cta.innerHTML = `<span><b>Pendaftaran 2026 dibuka</b>Enam jalur, termasuk KIP-Kuliah</span><a class="btn btn-primary btn-sm" href="pmb.html">Daftar</a>`;
      document.body.append(cta);
    }

    /* sembunyikan tombol melayang saat bagian interaktif menempati tengah layar, agar tidak menutupi kontrolnya */
    const tools = document.querySelectorAll("#build, #lab-balok, #uji-gempa, .bg-wrap, .wiz, #kurikulum");
    if (tools.length && "IntersectionObserver" in window) {
      const on = new Set();
      const io = new IntersectionObserver(es => {
        es.forEach(e => e.isIntersecting ? on.add(e.target) : on.delete(e.target));
        document.body.classList.toggle("in-tool", on.size > 0);
      }, { rootMargin: "-30% 0px -30% 0px" });
      tools.forEach(t => io.observe(t));
    }

    const px = [...document.querySelectorAll(".hero-slides, .band > .bg, .blueprint > .bg, .page-head .bg")];
    const lines = [...document.querySelectorAll(".timeline")];
    let ticking = false;
    const frame = () => {
      const doc = document.documentElement, max = doc.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      if (!reduce) px.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        /* geser relatif ke tengah layar, dibatasi agar tepi gambar tidak terlihat */
        const lim = r.height * 0.08, off = Math.max(-lim, Math.min(lim, ((r.top + r.height / 2) - innerHeight / 2) * -0.12));
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.2)`;
      });
      lines.forEach(t => { const r = t.getBoundingClientRect(); const p = Math.min(Math.max((innerHeight * .65 - r.top) / r.height, 0), 1); t.style.setProperty("--p", p); });
      if (cta) cta.classList.toggle("show", scrollY > innerHeight * .8 && scrollY < max - 500);
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener("resize", frame);
    frame();
  });
})();
