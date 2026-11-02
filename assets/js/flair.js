/* Sentuhan interaksi di seluruh situs: teks berjalan yang mengikuti kecepatan gulir. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- teks berjalan: makin cepat dan miring saat digulir ---------- */
  function marquee() {
    const tracks = $$(".marquee .mq-track"); if (!tracks.length) return;
    tracks.forEach(t => { t.innerHTML += t.innerHTML; });
    if (reduce) return;
    let last = scrollY, vel = 0, x = 0, dir = 1, visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(tracks[0].parentElement);
    const loop = () => {
      const sy = scrollY; vel = vel * 0.9 + (sy - last) * 0.1; last = sy;
      if (Math.abs(vel) > 0.5) dir = vel > 0 ? 1 : -1;
      if (visible) {
        x -= (1.1 + Math.min(Math.abs(vel) * 0.5, 22)) * dir;
        tracks.forEach((t, i) => {
          const half = t.scrollWidth / 2, off = ((i % 2 ? -x : x) % half + half) % half;
          t.style.transform = `translateX(${-off}px) skewX(${Math.max(-14, Math.min(14, -vel * 0.35))}deg)`;
        });
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  document.addEventListener("DOMContentLoaded", () => { marquee(); });
})();
