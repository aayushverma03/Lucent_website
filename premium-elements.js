const premiumMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupLenisSmoothScroll() {
  if (premiumMotionQuery.matches || typeof window.Lenis !== "function") return;

  const lenis = new window.Lenis({
    duration: 1.18,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.86,
    touchMultiplier: 1.1,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  window.lucentLenis = lenis;
}

function setupPremiumAmbient() {
  if (document.querySelector(".premium-ambient")) return;

  const ambient = document.createElement("div");
  ambient.className = "premium-ambient";
  ambient.setAttribute("aria-hidden", "true");
  ambient.innerHTML = `
    <span class="premium-orb premium-orb--one"></span>
    <span class="premium-orb premium-orb--two"></span>
    <span class="premium-orb premium-orb--three"></span>
  `;

  const grid = document.createElement("div");
  grid.className = "premium-tactical-grid";
  grid.setAttribute("aria-hidden", "true");

  const cursorGlow = document.createElement("div");
  cursorGlow.className = "premium-cursor-glow";
  cursorGlow.setAttribute("aria-hidden", "true");

  const curtain = document.createElement("div");
  curtain.className = "premium-page-curtain";
  curtain.setAttribute("aria-hidden", "true");

  document.body.prepend(grid);
  document.body.prepend(ambient);
  document.body.append(cursorGlow, curtain);
  document.body.classList.add("premium-motion-ready");
}

function setupMouseTracking() {
  const root = document.documentElement;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let ticking = false;

  const render = () => {
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;
    root.style.setProperty("--cursor-x", `${currentX}px`);
    root.style.setProperty("--cursor-y", `${currentY}px`);

    if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
      requestAnimationFrame(render);
    } else {
      ticking = false;
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    },
    { passive: true },
  );
}

function enhanceHeroTypography() {
  const heroCopy = document.querySelector(".film__copy--brand");
  if (!heroCopy || heroCopy.querySelector(".premium-kinetic-headline")) return;

  const subline = heroCopy.querySelector(".film__subline");
  const headline = document.createElement("div");
  headline.className = "premium-kinetic-headline";
  headline.setAttribute("aria-label", "Train better. Showcase skills. Get scouted.");
  headline.innerHTML = `
    <span>Train better</span>
    <span>Showcase skills</span>
    <span>Get scouted</span>
  `;

  if (subline) subline.after(headline);
  requestAnimationFrame(() => headline.classList.add("is-visible"));
}

function createPremiumFilmstrip() {
  const howSection = document.querySelector(".how");
  if (!howSection || document.querySelector(".premium-filmstrip")) return;

  const section = document.createElement("section");
  section.className = "premium-filmstrip";
  section.id = "premium-experience";
  section.setAttribute("aria-label", "Premium Lucent product film");
  section.innerHTML = `
    <div class="premium-filmstrip__sticky shell">
      <div class="premium-filmstrip__copy" data-reveal>
        <p class="eyebrow">Product film</p>
        <h2>From raw training clip to scout-ready signal.</h2>
        <p>
          A cinematic scroll journey that turns every rep into product evidence: capture the moment,
          analyse the movement, package the proof, and surface the player to the right club.
        </p>
        <div class="premium-filmstrip__numbers" aria-label="Lucent live product metrics">
          <span><strong>+18%</strong>Ball control</span>
          <span><strong>82</strong>First-touch consistency</span>
          <span><strong>3</strong>Proof drills</span>
          <span><strong>High</strong>Scout readiness</span>
        </div>
      </div>

      <div class="premium-product-cinema" aria-label="Scroll-scrubbed Lucent app demo">
        <div class="premium-phone-frame premium-tilt">
          <div class="premium-phone-frame__notch"></div>
          <div class="premium-phone-screen">
            <article class="premium-scene is-active" data-premium-scene="0">
              <div class="premium-scene__topline"><span>01 Capture</span><em>00:58 clip</em></div>
              <h3>Player records a finishing ladder.</h3>
              <p>Training footage becomes structured evidence instead of disappearing inside a camera roll.</p>
              <div class="premium-heatmap"><div class="premium-path"><svg viewBox="0 0 280 150" aria-hidden="true"><path d="M18 110 C74 48, 118 142, 166 72 S232 34, 262 82" /></svg></div></div>
              <span class="premium-scene__cta">Upload accepted</span>
            </article>

            <article class="premium-scene" data-premium-scene="1">
              <div class="premium-scene__topline"><span>02 Analyse</span><em>AI readout</em></div>
              <h3>Technique becomes a measurable signal.</h3>
              <p>Lucent reads ball control, body shape, rhythm, and consistency across repeatable drills.</p>
              <div class="premium-data-stack">
                <div class="premium-data-row"><span>Ball control</span><strong>94%</strong></div>
                <div class="premium-data-row"><span>Weak-foot finish</span><strong>82%</strong></div>
                <div class="premium-data-row"><span>Sprint recovery</span><strong>Improving</strong></div>
                <div class="premium-data-row"><span>Drill grade</span><strong>A−</strong></div>
              </div>
            </article>

            <article class="premium-scene" data-premium-scene="2">
              <div class="premium-scene__topline"><span>03 Package</span><em>Verified</em></div>
              <h3>Proof is packaged for the club brief.</h3>
              <p>Clubs receive the drill evidence, match context, coach notes, and role-specific player signal.</p>
              <div class="premium-data-stack">
                <div class="premium-data-row"><span>Finishing ladder</span><strong>Ready</strong></div>
                <div class="premium-data-row"><span>First-touch escape</span><strong>Ready</strong></div>
                <div class="premium-data-row"><span>20m burst test</span><strong>Ready</strong></div>
              </div>
              <span class="premium-scene__cta">Evidence pack built</span>
            </article>

            <article class="premium-scene" data-premium-scene="3">
              <div class="premium-scene__topline"><span>04 Scout</span><em>Live radar</em></div>
              <h3>The right scouts see the right signal.</h3>
              <p>Verified profiles can be matched to live club briefs based on role, evidence, and readiness.</p>
              <div class="premium-radar"><span></span><span></span><span></span></div>
            </article>
          </div>
        </div>

        <div class="premium-card-stack" aria-hidden="true">
          <div class="premium-floating-card premium-tilt"><span>AI insight</span><strong>First touch +12% over last 4 drills</strong></div>
          <div class="premium-floating-card premium-tilt"><span>Club signal</span><strong>Aurelia SC opened the player package</strong></div>
          <div class="premium-floating-card premium-tilt"><span>Next action</span><strong>Repeat weak-foot finish under pressure</strong></div>
        </div>
      </div>
    </div>
  `;

  howSection.after(section);
}

function setupPremiumFilmstripScroll() {
  const section = document.querySelector(".premium-filmstrip");
  if (!section) return;

  const scenes = [...section.querySelectorAll(".premium-scene")];
  const steps = scenes.length;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const range = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = Math.min(Math.max(-rect.top / range, 0), 1);
    const activeIndex = Math.min(steps - 1, Math.floor(progress * steps));

    document.documentElement.style.setProperty("--premium-progress", progress.toFixed(4));
    document.documentElement.style.setProperty("--premium-scene", String(activeIndex));
    scenes.forEach((scene, index) => scene.classList.toggle("is-active", index === activeIndex));
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupPremiumTilt() {
  const cards = [...document.querySelectorAll(".premium-tilt, .hero-console, .journey-device, .how-card, .proof-strip article, .why-grid article, .signal-card")];

  cards.forEach((card) => {
    card.classList.add("premium-tilt");

    card.addEventListener("pointermove", (event) => {
      if (premiumMotionQuery.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 5.5;
      const rotateY = (x - 0.5) * 7;

      card.style.setProperty("--shine-x", `${x * 100}%`);
      card.style.setProperty("--shine-y", `${y * 100}%`);
      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--shine-x", "50%");
      card.style.setProperty("--shine-y", "50%");
    });
  });
}

function setupMagneticButtons() {
  const buttons = [...document.querySelectorAll(".nav__cta, .button, .premium-scene__cta")];

  buttons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (premiumMotionQuery.matches) return;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function setupRouteTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || link.getAttribute("href") === "#") return;

    document.body.classList.add("premium-page-transition");
    window.setTimeout(() => document.body.classList.remove("premium-page-transition"), 520);
  });
}

function setupPremiumRevealRefresh() {
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!revealItems.length || premiumMotionQuery.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
    { threshold: 0.18, rootMargin: "0px 0px -12%" },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initPremiumElements() {
  setupPremiumAmbient();
  setupMouseTracking();
  enhanceHeroTypography();
  createPremiumFilmstrip();
  setupPremiumFilmstripScroll();
  setupPremiumTilt();
  setupMagneticButtons();
  setupRouteTransitions();
  setupPremiumRevealRefresh();
  setupLenisSmoothScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPremiumElements);
} else {
  initPremiumElements();
}
