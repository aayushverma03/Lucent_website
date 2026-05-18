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
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minSide = Math.min(vw, vh);

    let w, h, r;
    if (p < 0.55) {
      // Phase 1: full bleed -> rounded rectangle
      const t = p / 0.55;
      w = lerp(vw, vw * 0.72, t);
      h = lerp(vh, vh * 0.68, t);
      r = lerp(0, 96, t);
    } else {
      // Phase 2: rounded rectangle -> circle
      const t = (p - 0.55) / 0.45;
      const targetSize = minSide * 0.58;
      w = lerp(vw * 0.72, targetSize, t);
      h = lerp(vh * 0.68, targetSize, t);
      r = lerp(96, targetSize, t);
    }

    section.style.setProperty("--stage-w", `${w}px`);
    section.style.setProperty("--stage-h", `${h}px`);
    section.style.setProperty("--stage-r", `${r}px`);

    // Caption fades in during phase 2
    const captionP = clamp((p - 0.65) / 0.3, 0, 1);
    section.style.setProperty("--caption-opacity", captionP.toFixed(3));
    section.style.setProperty("--caption-y", `${lerp(24, 0, captionP)}px`);

    // Pill nav transitions from center to ~48px from top during last 30% of hero.
    // Use global scrollY so the pill keeps its position past the hero.
    const heroEnd = section.offsetTop + section.offsetHeight - vh;
    const transitionStart = heroEnd * 0.7;
    const transitionRange = Math.max(1, heroEnd - transitionStart);
    const pillP = clamp((window.scrollY - transitionStart) / transitionRange, 0, 1);
    const pillTopPx = lerp(vh / 2, 48, pillP);
    document.documentElement.style.setProperty("--pill-top", `${pillTopPx}px`);

    renderMosaic(vh);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  };

  render();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
