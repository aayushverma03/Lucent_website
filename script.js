const root = document.documentElement;
root.classList.add("js");

const skillStory = document.querySelector(".story--skills");
const scoutStory = document.querySelector(".story--scouted");
const film = document.querySelector(".film");
const filmVideo = document.querySelector(".film__stage-video");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const skillTitle = document.querySelector("[data-skill-title]");
const skillCopy = document.querySelector("[data-skill-copy]");
const skillKicker = document.querySelector("[data-skill-kicker]");
const skillIntroEl = document.querySelector(".story--skills .story__intro");
const scoutTitle = document.querySelector("[data-scout-title]");
const scoutCopy = document.querySelector("[data-scout-copy]");
const skillSteps = [...document.querySelectorAll(".story--skills .story-steps span")];
const scoutSteps = [...document.querySelectorAll(".story--scouted .story-steps span")];
const skillDots = [...document.querySelectorAll(".story--skills .story-progress span")];
const scoutDots = [...document.querySelectorAll(".story--scouted .story-progress span")];
const screens = [...document.querySelectorAll(".screen")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const skillScenes = [
  ["See the player clearly", "Start with the athlete, then reveal the movement behind every rep."],
  ["Read the movement", "Pose analysis exposes alignment, hip rotation, and control before small flaws become habits."],
  ["See where you stand", "Your technical and physical scores are benchmarked against players at your level, across your position and age group."],
  ["Know what to train next", "Lucent builds a drill plan from your weakest scores and updates it every session."],
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

  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  const setInert = (on) => {
    [main, footer].forEach((el) => {
      if (!el) return;
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const open = () => {
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.classList.add("is-active");
    nav.classList.add("is-open");
    document.body.classList.add("nav-is-open");
    setInert(true);
    nav.querySelector("a")?.focus();
  };

  const close = ({ returnFocus = false } = {}) => {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.classList.remove("is-active");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-is-open");
    setInert(false);
    if (returnFocus) hamburger.focus();
  };

  hamburger.addEventListener("click", () => {
    if (hamburger.getAttribute("aria-expanded") === "true") close();
    else open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) close({ returnFocus: true });
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => close());
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
        <span class="launch-sequence__ring" aria-hidden="true"></span>
        <span class="launch-sequence__ring launch-sequence__ring--counter" aria-hidden="true"></span>
        <img class="launch-sequence__logo" src="./assets/lucent-logo-lockup.png" alt="Lucent" />
      </div>
      <p class="launch-sequence__tagline beats"><span class="beats__beat">Record</span> <span class="beats__beat">Train</span> <span class="beats__beat beats__go">Get Scouted</span></p>
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
  if (prefersReducedMotion.matches) return;
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

  const nameInput = document.getElementById("waitlist-name");
  const emailInput = document.getElementById("waitlist-email");
  const note = document.getElementById("waitlist-note");
  const button = form.querySelector('button[type="submit"]');
  const honeypot = form.querySelector('input[name="company"]');

  const ENDPOINT = "/api/waitlist";
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let submitting = false;

  const CHECK_SVG =
    '<svg class="waitlist-form__check" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="11" fill="currentColor" opacity=".16"/>' +
    '<path class="tick" d="M6.5 12.5l3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>";

  const setState = (state, message, assertive = false) => {
    form.dataset.state = state;
    if (!note) return;
    note.setAttribute("aria-live", assertive ? "assertive" : "polite");
    if (state === "success") {
      note.innerHTML = CHECK_SVG + '<span class="waitlist-form__note-text"></span>';
      note.querySelector(".waitlist-form__note-text").textContent = message;
    } else {
      note.textContent = message;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Bots fill the hidden field: pretend success, store nothing.
    if (honeypot?.value?.trim()) {
      setState("success", "You're in. We'll email you when the first invites go out.");
      return;
    }

    const name = nameInput?.value?.trim() ?? "";
    if (!name) {
      nameInput?.setAttribute("aria-invalid", "true");
      nameInput?.focus();
      setState("error", "Please enter your name.", true);
      return;
    }
    nameInput?.setAttribute("aria-invalid", "false");

    const email = emailInput?.value?.trim() ?? "";
    if (!EMAIL_RE.test(email)) {
      emailInput?.setAttribute("aria-invalid", "true");
      emailInput?.focus();
      setState("error", "Enter a valid email address.", true);
      return;
    }
    emailInput?.setAttribute("aria-invalid", "false");

    submitting = true;
    if (button) button.disabled = true;
    setState("loading", "Adding you to the waitlist…");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, company: honeypot?.value ?? "", source: "website" }),
      });

      if (res.status === 409) {
        setState("success", "You're already on the list — see you at launch.");
      } else if (res.ok) {
        setState("success", "You're in. We'll email you when the first invites go out.");
        form.reset();
      } else if (res.status === 429) {
        setState("error", "You're going a bit fast — please wait a moment and try again.", true);
      } else {
        setState("error", "Something went wrong. Please try again, or email support@lucent-ai.app.", true);
      }
    } catch {
      setState("error", "Something went wrong. Please try again, or email support@lucent-ai.app.", true);
    } finally {
      submitting = false;
      if (button) button.disabled = false;
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

const skillKickers = ["Train", "Scan", "Benchmark", "Improve"];
const skillRailSegs = [...document.querySelectorAll(".story--skills .story__rail span")];
let activeSkillStep = -1;
let skillSwapTimer = 0;

function setSkillStep(step) {
  skillStory?.setAttribute("data-skill-step", String(step));
  skillRailSegs.forEach((seg, index) => seg.classList.toggle("is-active", index === step));
  skillSteps.forEach((item, index) => item.classList.toggle("is-active", index === step));
  skillDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === step);
    dot.classList.toggle("is-past", index < step);
  });
  if (step === activeSkillStep) return;
  const firstRun = activeSkillStep === -1;
  activeSkillStep = step;
  const apply = () => {
    const scene = skillScenes[step];
    if (!scene) return;
    if (skillKicker) skillKicker.textContent = skillKickers[step] || "";
    if (skillTitle) skillTitle.textContent = scene[0];
    if (skillCopy) skillCopy.textContent = scene[1];
  };
  if (firstRun || prefersReducedMotion.matches || !skillIntroEl) {
    apply();
    return;
  }
  clearTimeout(skillSwapTimer);
  skillIntroEl.classList.add("is-swapping");
  skillSwapTimer = setTimeout(() => {
    apply();
    skillIntroEl.classList.remove("is-swapping");
  }, 180);
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
const drillQueueEl = document.querySelector(".drill-queue");

function updateSkillStory() {
  if (!skillStory) return;
  if (prefersReducedMotion.matches) {
    setSkillStep(3);
    if (drillQueueEl) drillQueueEl.classList.add("is-revealed");
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
