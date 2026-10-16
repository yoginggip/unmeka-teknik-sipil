/* Sentuhan interaksi di seluruh situs: kursor khusus, tombol magnetis, label yang muncul dengan
   efek dekode, efek ketukan, dan teks berjalan yang mengikuti kecepatan gulir. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const make = (cls, html = "") => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; d.setAttribute("aria-hidden", "true"); return d; };

  /* ---------- kursor: titik + cincin yang mengikuti dengan jeda ---------- */
  function cursor() {
    if (!fine || reduce) return;
    const dot = make("cur-dot"), ring = make("cur-ring", "<span></span>"), txt = ring.firstChild;
    document.body.append(dot, ring); root.classList.add("has-cursor");
    const LABELS = [["#hero.has-3d", "Seret"], ["#beam-svg", "Seret"], ["#build", "Gulir"], [".mosaic button, .gallery button", "Lihat"], ["#qk-go", "Gempa!"]];
    let x = -100, y = -100, rx = x, ry = y, on = false;
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`;
      if (!on) { on = true; rx = x; ry = y; root.classList.add("cur-on"); }
    }, { passive: true });
    document.addEventListener("mouseleave", () => { on = false; root.classList.remove("cur-on"); });
    addEventListener("pointerover", e => {
      const t = e.target;
      ring.classList.toggle("hover", !!t.closest("a, button, [role=tab], label, select, summary, input[type=range], .bm-load"));
      const hit = LABELS.find(([s]) => t.closest(s));
      const lbl = hit && !t.closest("a, .h3d-ui, .h3d-tag, .h3d-card") ? hit[1] : "";
      txt.textContent = lbl; ring.classList.toggle("label", !!lbl);
    });
    addEventListener("pointerdown", () => ring.classList.add("press"));
    addEventListener("pointerup", () => ring.classList.remove("press"));
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- tombol magnetis ---------- */
  function magnets() {
    if (!fine || reduce) return;
    $$(".btn").forEach(b => {
      if (b.closest(".nav")) return;
      b.classList.add("magnet");
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 12}px, ${((e.clientY - r.top) / r.height - .5) * 10}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- label bagian muncul dengan efek dekode ---------- */
  function scramble() {
    if (reduce || !("IntersectionObserver" in window)) return;
    const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>+=";
    const run = el => {
      const final = el.textContent, t0 = performance.now(), dur = 650 + final.length * 18;
      el.setAttribute("aria-label", final);
      const step = now => {
        const k = Math.min((now - t0) / dur, 1), n = Math.floor(final.length * k);
        let s = final.slice(0, n);
        for (let i = n; i < final.length; i++) s += final[i] === " " ? " " : CH[(Math.random() * CH.length) | 0];
        el.textContent = s;
        if (k < 1) requestAnimationFrame(step); else { el.textContent = final; el.removeAttribute("aria-label"); }
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 1 });
    $$(".label").forEach(el => { if (el.children.length === 0 && el.textContent.trim()) io.observe(el); });
  }

  /* ---------- efek ketukan: cincin bidik ala layar CAD ---------- */
  function bursts() {
    if (reduce) return;
    addEventListener("pointerdown", e => {
      if (e.target.closest("input, select, textarea, canvas, #beam-svg")) return;
      const b = make("burst", "<i></i><i></i>");
      b.style.left = e.clientX + "px"; b.style.top = e.clientY + "px";
      document.body.append(b); setTimeout(() => b.remove(), 700);
    }, { passive: true });
  }

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

  document.addEventListener("DOMContentLoaded", () => { cursor(); magnets(); scramble(); bursts(); marquee(); });
})();
