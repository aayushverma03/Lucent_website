// Lucent QA polish layer
// Purpose: repair dynamic anchors, final CTA behaviour, and post-injection nav state.

function setupLucentQAPolish() {
  const navLinks = [...document.querySelectorAll(".nav.shell nav a[href^='#']")];
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const setActiveNavigation = () => {
    if (!sections.length) return;

    const anchor = Math.min(window.innerHeight * 0.42, 420);
    let active = sections[0];

    sections.forEach((item) => {
      const rect = item.section.getBoundingClientRect();
      if (rect.top <= anchor && rect.bottom >= anchor) {
        active = item;
      }
    });

    navLinks.forEach((link) => link.classList.toggle("is-active", link === active.link));
  };

  setActiveNavigation();
  window.addEventListener("scroll", setActiveNavigation, { passive: true });
  window.addEventListener("resize", setActiveNavigation);

  // Make in-page links robust after the premium product section is injected by JS.
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href")?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;

      event.preventDefault();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${targetId}`);
      navLinks.forEach((item) => item.classList.toggle("is-active", item === link));
    });
  });

  // Convert placeholder waitlist button into a safe, explicit mailto action.
  const waitlistButton = document.querySelector(".button--placeholder");
  if (waitlistButton && waitlistButton.tagName === "BUTTON") {
    const waitlistLink = document.createElement("a");
    waitlistLink.className = waitlistButton.className;
    waitlistLink.href = "mailto:hello@lucent.app?subject=Lucent%20waitlist&body=Hi%20Lucent%2C%20I%27d%20like%20to%20join%20the%20waitlist.";
    waitlistLink.textContent = waitlistButton.textContent || "Join the waitlist";
    waitlistLink.setAttribute("aria-label", "Join the Lucent waitlist by email");
    waitlistButton.replaceWith(waitlistLink);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.requestAnimationFrame(setupLucentQAPolish));
} else {
  window.requestAnimationFrame(setupLucentQAPolish);
}
