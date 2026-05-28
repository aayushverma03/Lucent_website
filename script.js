const root = document.documentElement;
root.classList.add("js");

const skillStory = document.querySelector(".story--skills");
const scoutStory = document.querySelector(".story--scouted");
const film = document.querySelector(".film");
const filmVideo = document.querySelector("[data-film-video]");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const skillTitle = document.querySelector("[data-skill-title]");
const skillCopy = document.querySelector("[data-skill-copy]");
const scoutTitle = document.querySelector("[data-scout-title]");
const scoutCopy = document.querySelector("[data-scout-copy]");
const skillSteps = [...document.querySelectorAll(".story--skills .story-steps span")];
const scoutSteps = [...document.querySelectorAll(".story--scouted .story-steps span")];
const skillDots = [...document.querySelectorAll(".story--skills .story-progress span")];
const scoutDots = [...document.querySelectorAll(".story--scouted .story-progress span")];
const screens = [...document.querySelectorAll(".screen")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const skillScenes = [
  ["See the player clearly.", "Start with the athlete, then reveal the movement behind every rep."],
  ["Read the movement.", "Pose analysis exposes alignment, hip rotation, and control before small flaws become habits."],
  ["See where you rank.", "Every score is benchmarked against players at your level, across your position and age group."],
  ["Know what to train next.", "Lucent builds a drill plan from your weakest scores and updates it every session."],
];

const scoutScenes = [
  ["See which clubs want you.", "Browse live opportunities from clubs recruiting for your exact role."],
  ["Open the best match.", "Select a trial and instantly understand what that club wants to see."],
  ["Follow the brief.", "Lucent turns each trial into a clear checklist of requirements and drills."],
  ["Submit your proof.", "Complete the drills, attach the evidence, and send a club-ready package."],
  ["Get in front of scouts.", "Your verified profile reaches the recruitment team with full context."],
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupActiveNavigation() {
  const navLinks = [...document.querySelectorAll(".top-nav__links a[href^='#']")];
  const items = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  const setActive = (activeLink) => {
    navLinks.forEach((link) => link.classList.toggle("is-active", link === activeLink));
  };

  const update = () => {
    // Only highlight a nav link when its section actually contains the viewport
    // anchor. On the hero (#top) and any other non-nav section, no link is
    // active. The previous "nearest section" fallback wrongly highlighted
    // "How it works" while sitting on the hero.
    const anchor = window.innerHeight * 0.42;
    const active = items.find((item) => {
      const rect = item.section.getBoundingClientRect();
      return rect.top <= anchor && rect.bottom >= anchor;
    });

    if (active?.link) setActive(active.link);
    else navLinks.forEach((link) => link.classList.remove("is-active"));
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href")?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${targetId}`);
      setActive(link);
    });
  });

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
}

function setupHamburger() {
  const hamburger = document.querySelector(".top-nav__hamburger");
  const nav = document.getElementById("top-nav-links");
  if (!hamburger || !nav) return;

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!isOpen));
    hamburger.classList.toggle("is-active", !isOpen);
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-is-open", !isOpen);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.classList.remove("is-active");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-is-open");
      hamburger.focus();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.classList.remove("is-active");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-is-open");
    });
  });
}

function setupLaunchSequence() {
  let launch = document.querySelector(".launch-sequence");
  if (!launch) {
    launch = document.createElement("div");
    launch.className = "launch-sequence";
    launch.setAttribute("aria-hidden", "true");
    launch.innerHTML = `
      <div class="launch-sequence__word launch-sequence__word--stack">
        <img class="launch-sequence__logo" src="./assets/lucent-logo-lockup.png" alt="Lucent" />
      </div>
      <div class="launch-sequence__status">
        <div class="launch-sequence__bar"><i></i></div>
      </div>
    `;
    document.body.prepend(launch);
  }

  if (prefersReducedMotion.matches) {
    launch.remove();
    document.body.classList.add("is-intro-complete");
    return;
  }

  document.body.classList.add("is-intro-running");
  let launchFinished = false;

  const finishLaunch = () => {
    if (launchFinished) return;
    launchFinished = true;
    document.body.classList.remove("is-intro-running");
    document.body.classList.add("is-intro-complete");
    window.setTimeout(() => launch.remove(), 420);
  };

  window.setTimeout(finishLaunch, 1650);
}

function setupVideoLazyLoad() {
  if (!("IntersectionObserver" in window)) return;

  const lazyVideos = [...document.querySelectorAll("video[data-lazy-video]")];
  if (!lazyVideos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        video.querySelectorAll("source[data-src]").forEach((source) => {
          source.src = source.dataset.src;
        });
        video.load();
        video.play().catch(() => {});
        observer.unobserve(video);
      });
    },
    { rootMargin: "200px 0px 200px 0px" },
  );

  lazyVideos.forEach((v) => observer.observe(v));
}

function setupWaitlistForm() {
  const form = document.getElementById("waitlist-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('[type="email"]');
    const note = form.querySelector(".waitlist-form__note");
    const email = emailInput?.value?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (note) note.textContent = "Please enter a valid email address.";
      emailInput?.focus();
      return;
    }

    const subject = encodeURIComponent("Lucent waitlist");
    const body = encodeURIComponent(
      `Hi Lucent team,\n\nI'd like to join the waitlist.\n\nEmail: ${email}\n\nLooking forward to it!`,
    );
    window.location.href = `mailto:hello@lucent.app?subject=${subject}&body=${body}`;

    if (note) {
      note.textContent = "Opening your email client — if nothing happens, email us at hello@lucent.app";
    }
  });
}

function setupFilmFallback() {
  if (!filmVideo || !film) return;
  const useFallback = () => film.classList.add("is-fallback");
  if (prefersReducedMotion.matches) {
    filmVideo.pause();
    useFallback();
  }
  filmVideo.addEventListener("error", useFallback);
  filmVideo.addEventListener("stalled", useFallback);
  filmVideo.addEventListener("canplay", () => {
    if (!prefersReducedMotion.matches) film.classList.remove("is-fallback");
  });
}

function setupRevealObserver() {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
    { threshold: 0.18, rootMargin: "0px 0px -10%" },
  );
  revealItems.forEach((item) => observer.observe(item));
}

function sectionProgress(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const range = section.offsetHeight - window.innerHeight;
  if (range <= 0) return 1;
  return clamp(-rect.top / range, 0, 1);
}

function setSkillStep(step) {
  skillStory?.setAttribute("data-skill-step", String(step));
  const scene = skillScenes[step];
  if (scene) {
    if (skillTitle) skillTitle.textContent = scene[0];
    if (skillCopy) skillCopy.textContent = scene[1];
  }
  skillSteps.forEach((item, index) => item.classList.toggle("is-active", index === step));
  skillDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === step);
    dot.classList.toggle("is-past", index < step);
  });
}

function setScoutStep(step) {
  scoutStory?.setAttribute("data-scout-step", String(step));
  const scene = scoutScenes[step];
  if (scene) {
    if (scoutTitle) scoutTitle.textContent = scene[0];
    if (scoutCopy) scoutCopy.textContent = scene[1];
  }
  scoutSteps.forEach((item, index) => item.classList.toggle("is-active", index === step));
  scoutDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === step);
    dot.classList.toggle("is-past", index < step);
  });
  screens.forEach((screen, index) => screen.classList.toggle("is-active", index === step));
}

const clipFrameEl  = document.querySelector(".clip-frame");
const skillCardsEl = document.querySelector(".skill-cards");
const scanLineEl   = document.querySelector(".clip-scan-line");
const rankCardEl   = document.querySelector(".rank-card");
const drillQueueEl = document.querySelector(".drill-queue");
let rankAnimated   = false;

function updateSkillStory() {
  if (!skillStory) return;
  if (prefersReducedMotion.matches) {
    setSkillStep(3);
    if (skillCardsEl) skillCardsEl.classList.add("is-revealed");
    return;
  }

  const progress = sectionProgress(skillStory);

  const stepBounds = [0, 0.14, 0.58, 0.76];
  let step = 0;
  for (let i = stepBounds.length - 1; i >= 0; i--) {
    if (progress >= stepBounds[i]) { step = i; break; }
  }
  step = Math.min(step, skillScenes.length - 1);

  const localScan = clamp((progress - 0.14) / 0.12, 0, 1);

  setSkillStep(step);

  if (scanLineEl) {
    const pct = (localScan * 100).toFixed(2);
    const opacity = localScan <= 0 || localScan >= 1
      ? 0
      : Math.min(localScan / 0.08, (1 - localScan) / 0.08, 1);
    scanLineEl.style.top     = pct + "%";
    scanLineEl.style.opacity = opacity.toFixed(3);
  }

  if (skillCardsEl) {
    if (localScan >= 1) {
      skillCardsEl.classList.add("is-revealed");
    } else {
      skillCardsEl.classList.remove("is-revealed");
    }
  }

  if (step === 2 && !rankAnimated && rankCardEl) {
    rankAnimated = true;
    const numEl = rankCardEl.querySelector(".rank-card__number");
    if (numEl) {
      const target = 847, start = target + 153, dur = 900;
      const t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = "#" + Math.round(start - (start - target) * eased);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  }
  if (step < 2) rankAnimated = false;

  if (drillQueueEl) {
    if (step >= 3) {
      drillQueueEl.classList.add("is-revealed");
    } else {
      drillQueueEl.classList.remove("is-revealed");
    }
  }
}

function updateScoutStory() {
  if (!scoutStory) return;
  if (prefersReducedMotion.matches) {
    setScoutStep(4);
    return;
  }
  const progress = sectionProgress(scoutStory);
  const step = Math.min(scoutScenes.length - 1, Math.floor(progress * scoutScenes.length));
  setScoutStep(step);
}

function updateStories() {
  updateSkillStory();
  updateScoutStory();
}

window.addEventListener("scroll", updateStories, { passive: true });
window.addEventListener("resize", updateStories, { passive: true });
prefersReducedMotion.addEventListener("change", () => {
  if (prefersReducedMotion.matches) revealItems.forEach((item) => item.classList.add("is-visible"));
  if (filmVideo && film) {
    if (prefersReducedMotion.matches) {
      filmVideo.pause();
      film.classList.add("is-fallback");
    } else {
      film.classList.remove("is-fallback");
      filmVideo.play().catch(() => film.classList.add("is-fallback"));
    }
  }
  updateStories();
});

setupActiveNavigation();
setupHamburger();
setupLaunchSequence();
setupVideoLazyLoad();
setupWaitlistForm();
setupFilmFallback();
setupRevealObserver();
updateStories();
