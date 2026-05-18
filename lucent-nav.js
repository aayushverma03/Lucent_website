(() => {
  const HERO_TAGLINE = "Creating the next gen of footballers";

  function restoreHeroTagline() {
    const heroSubline = document.querySelector(".film__copy--brand .film__subline");
    const heroBrandLockup = document.querySelector(".film__copy--brand .hero-brand-lockup");

    if (heroSubline) heroSubline.textContent = HERO_TAGLINE;
    if (heroBrandLockup) heroBrandLockup.removeAttribute("aria-hidden");
  }

  function setupActiveNav() {
    const navLinks = Array.from(document.querySelectorAll(".nav.shell nav a[href^='#']"));
    if (!navLinks.length) return;

    const sectionMap = navLinks
      .map((link) => {
        const id = link.getAttribute("href")?.slice(1);
        const section = id ? document.getElementById(id) : null;
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    const setActive = (activeLink) => {
      navLinks.forEach((link) => link.classList.toggle("is-active", link === activeLink));
    };

    const updateActiveNav = () => {
      const viewportAnchor = window.innerHeight * 0.36;
      let best = sectionMap[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionMap.forEach((item) => {
        const rect = item.section.getBoundingClientRect();
        const distance = Math.abs(rect.top - viewportAnchor);
        const isWithin = rect.top <= viewportAnchor && rect.bottom >= viewportAnchor;

        if (isWithin) {
          best = item;
          bestDistance = -1;
          return;
        }

        if (bestDistance !== -1 && distance < bestDistance) {
          best = item;
          bestDistance = distance;
        }
      });

      if (best?.link) setActive(best.link);
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setActive(link));
    });

    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
  }

  function init() {
    restoreHeroTagline();
    setupActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("load", restoreHeroTagline, { once: true });
})();
