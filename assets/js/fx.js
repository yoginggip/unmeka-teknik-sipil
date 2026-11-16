/* Efek ringan: penghitung angka, jeda muncul item grid, dan garis linimasa.
   Sengaja dibuat minimal agar tampilan bersih (tanpa parallax, bar progres, atau teks beranimasi).
   Dimuat setelah app.js sehingga konten dari pageInit sudah tersedia. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Penghitung angka */
  function countUp(el) {
    const to = +el.dataset.count, dur = 1400, t0 = performance.now();
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("id-ID"); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", () => {
    /* jeda kecil untuk item di dalam grid saat muncul */
    document.querySelectorAll(".grid, .routes, .mosaic, .bk-tabs").forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--stagger", (i % 6) * 70 + "ms")));

    const counters = document.querySelectorAll("[data-count]");
    if (counters.length) {
      if (reduce || !("IntersectionObserver" in window)) counters.forEach(c => c.textContent = (+c.dataset.count).toLocaleString("id-ID"));
      else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } }), { threshold: .6 }); counters.forEach(c => io.observe(c)); }
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

    /* garis linimasa di halaman Profil terisi mengikuti posisi gulir */
    const lines = [...document.querySelectorAll(".timeline")];
    if (lines.length) {
      let ticking = false;
      const frame = () => {
        lines.forEach(t => { const r = t.getBoundingClientRect(); const p = Math.min(Math.max((innerHeight * .65 - r.top) / r.height, 0), 1); t.style.setProperty("--p", p); });
        ticking = false;
      };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
      frame();
    }
  });
})();
