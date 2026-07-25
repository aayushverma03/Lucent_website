const premiumMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupLenisSmoothScroll() {
  if (premiumMotionQuery.matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  const init = () => {
    if (typeof window.Lenis !== "function") return;
    const lenis = new window.Lenis({
      duration: 1.18,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.86,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lucentLenis = lenis;
  };

  if (typeof window.Lenis === "function") {
    init();
    return;
  }

  const s = document.createElement("script");
  s.src = "./assets/vendor/lenis.min.js";
  s.async = true;
  s.onload = init;
  document.head.appendChild(s);
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


function setupRouteTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (link.target && link.target !== "_self") return; // opens a new tab/window
    if (link.hasAttribute("download")) return; // download, no navigation
    if (link.protocol !== "http:" && link.protocol !== "https:") return; // mailto:, tel:, etc.
    if (link.origin === window.location.origin && link.pathname === window.location.pathname) return;

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
  setupPremiumTilt();
  setupRouteTransitions();
  setupPremiumRevealRefresh();
  setupLenisSmoothScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPremiumElements);
} else {
  initPremiumElements();
}
