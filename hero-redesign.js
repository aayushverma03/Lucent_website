(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const section = document.querySelector(".film--redesign");
  const mosaic = document.querySelector(".mosaic");
  if (!section) return;

  const stage = section.querySelector("[data-hero-stage]");
  const caption = section.querySelector("[data-hero-caption]");
  if (!stage || !caption) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  let ticking = false;

  const renderMosaic = (vh) => {
    if (!mosaic) return;
    const r = mosaic.getBoundingClientRect();
    const total = mosaic.offsetHeight - vh;
    const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;

    // Phase A (0.05-0.30): side columns grow
    const colP = clamp((p - 0.05) / 0.25, 0, 1);
    const colSide = lerp(0, 0.42, colP);

    // Phase B (0.30-0.55): top + bottom rows grow
    const rowP = clamp((p - 0.30) / 0.25, 0, 1);
    const rowSide = lerp(0, 0.42, rowP);

    mosaic.style.setProperty("--col-side", `${colSide}fr`);
    mosaic.style.setProperty("--row-side", `${rowSide}fr`);

    // Headline A: in 0.18-0.30, out 0.50-0.62
    let aOp = 0;
    if (p >= 0.18 && p < 0.50) aOp = clamp((p - 0.18) / 0.12, 0, 1);
    else if (p >= 0.50 && p < 0.62) aOp = 1 - clamp((p - 0.50) / 0.12, 0, 1);
    mosaic.style.setProperty("--headline-a-op", aOp.toFixed(3));
    mosaic.style.setProperty("--headline-a-y", `${lerp(16, 0, aOp)}px`);

    // Headline B: in 0.55-0.68, out 0.82-0.92
    let bOp = 0;
    if (p >= 0.55 && p < 0.82) bOp = clamp((p - 0.55) / 0.13, 0, 1);
    else if (p >= 0.82 && p < 0.92) bOp = 1 - clamp((p - 0.82) / 0.10, 0, 1);
    mosaic.style.setProperty("--headline-b-op", bOp.toFixed(3));
    mosaic.style.setProperty("--headline-b-y", `${lerp(16, 0, bOp)}px`);
  };

  const render = () => {
    ticking = false;
    const vh = window.innerHeight;
    renderMosaic(vh);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  };

  // Scroll-activated nav background
  const topNav = document.querySelector(".top-nav");
  if (topNav) {
    const updateNav = () => topNav.classList.toggle("is-scrolled", window.scrollY > 40);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  render();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Lazy-load mosaic videos: only attach src + play when section is near viewport.
  if (mosaic && "IntersectionObserver" in window) {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      mosaic.querySelectorAll("video[data-lazy-src]").forEach((v) => {
        v.src = v.dataset.lazySrc;
        v.load();
        const tryPlay = () => v.play().catch(() => {});
        if (v.readyState >= 2) tryPlay();
        else v.addEventListener("loadeddata", tryPlay, { once: true });
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { start(); io.disconnect(); break; }
      },
      { rootMargin: "200px 0px 200px 0px" }
    );
    io.observe(mosaic);
  }

  // Layering depth effect on journey tiles — active tile rises, others recede.
  const journeyTrack = document.querySelector(".journey-track");
  if (journeyTrack) {
    const applyDepth = () => {
      const tiles = Array.from(journeyTrack.querySelectorAll(".jtile"));
      const trackRect = journeyTrack.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;

      tiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const tileCenter = rect.left + rect.width / 2;
        const dist = Math.abs(tileCenter - centerX);
        const maxDist = trackRect.width * 0.72;
        const t = Math.min(dist / maxDist, 1);

        const scale = 1 - t * 0.06;
        const translateY = t * 20;
        const opacity = 1 - t * 0.42;

        tile.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
        tile.style.opacity = opacity.toFixed(3);
      });
    };

    journeyTrack.addEventListener("scroll", applyDepth, { passive: true });
    window.addEventListener("resize", applyDepth, { passive: true });
    applyDepth();
  }
})();
