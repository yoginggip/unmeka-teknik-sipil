/* Animasi situs: judul muncul per baris, parallax latar, penghitung angka, dan CTA mobile.
   Dimuat setelah app.js sehingga konten dari pageInit sudah tersedia. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Judul muncul baris demi baris dari balik garis: tiap baris (dipisah <br>) dibungkus
     .ln (overflow tersembunyi) dan isinya bergeser naik */
  function splitLines(el) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((html, i) => `<span class="ln"><span style="animation-delay:${(0.12 + i * 0.12).toFixed(2)}s">${html.trim()}</span></span>`).join("");
    el.classList.add("lines");
  }

  /* Penghitung angka */
  function countUp(el) {
    const to = +el.dataset.count, dur = 1800, t0 = performance.now();
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (k === 1 ? 1 : 1 - Math.pow(2, -10 * k))).toLocaleString("id-ID"); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!reduce) document.querySelectorAll(".hero h1, .page-head h1").forEach(splitLines);

    /* item di dalam grid muncul berurutan */
    document.querySelectorAll(".grid, .routes, .mosaic, .bk-tabs").forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--stagger", (i % 6) * 80 + "ms")));

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
    const tools = document.querySelectorAll(".wiz, #kurikulum");
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
      const max = document.documentElement.scrollHeight - innerHeight;
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
