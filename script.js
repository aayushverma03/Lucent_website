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
const poseMap = document.querySelector(".pose-map");
const metrics = [...document.querySelectorAll(".metric")];
const poseLabels = [...document.querySelectorAll(".pose-label")];
const analysisChips = [...document.querySelectorAll(".analysis-chip")];
const storyCards = [...document.querySelectorAll(".story-card")];
const skillSteps = [...document.querySelectorAll(".story--skills .story-steps span")];
const scoutSteps = [...document.querySelectorAll(".story--scouted .story-steps span")];
const screens = [...document.querySelectorAll(".screen")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const skillScenes = [
  ["See the player clearly.", "Start with the athlete, then reveal the movement behind every rep."],
  ["Read the movement.", "Pose analysis exposes alignment, hip rotation, and control before small flaws become habits."],
  ["Turn reps into evidence.", "Touch quality, shot speed, and weak-foot control become measurable proof of improvement."],
  ["Know what to train next.", "Every drill makes your profile stronger."],
];

const scoutScenes = [
  ["Find the right trial.", "Browse open opportunities from clubs looking for players in your role."],
  ["Open the best match.", "Select a trial and instantly understand what that club wants to see."],
  ["Follow the brief.", "Lucent turns each trial into a clear checklist of requirements and drills."],
  ["Upload the proof.", "Complete the drills, attach the evidence, and submit a club-ready package."],
  ["Get scouted.", "Your verified profile reaches the club with the context they need to act faster."],
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function injectStyle(id, css) {
  if (document.querySelector(`[data-style-id="${id}"]`)) return;
  const style = document.createElement("style");
  style.setAttribute("data-style-id", id);
  style.textContent = css;
  document.head.appendChild(style);
}

function setupRelatsInspiredHeroContent() {
  const heroSubline = document.querySelector(".film__copy--brand .film__subline");
  if (heroSubline) heroSubline.textContent = "Creating the next gen of footballers";

  const heroBrandLockup = document.querySelector(".film__copy--brand .hero-brand-lockup");
  if (heroBrandLockup) heroBrandLockup.removeAttribute("aria-hidden");

  const playerSignalSection = document.querySelector(".player-signal");
  playerSignalSection?.remove();
}

function setupActiveNavigation() {
  const links = [...document.querySelectorAll(".nav.shell nav a[href^='#']")];
  const items = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  const setActive = (activeLink) => {
    links.forEach((link) => link.classList.toggle("is-active", link === activeLink));
  };

  const update = () => {
    const anchor = window.innerHeight * 0.38;
    let active = items[0];
    let nearestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item) => {
      const rect = item.section.getBoundingClientRect();
      const containsAnchor = rect.top <= anchor && rect.bottom >= anchor;
      const distance = Math.abs(rect.top - anchor);

      if (containsAnchor) {
        active = item;
        nearestDistance = -1;
      } else if (nearestDistance !== -1 && distance < nearestDistance) {
        active = item;
        nearestDistance = distance;
      }
    });

    if (active?.link) setActive(active.link);
  };

  links.forEach((link) => link.addEventListener("click", () => setActive(link)));
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupLaunchSequence() {
  let launch = document.querySelector(".launch-sequence");
  if (!launch) {
    launch = document.createElement("div");
    launch.className = "launch-sequence";
    launch.setAttribute("aria-hidden", "true");
    launch.innerHTML = `
      <div class="launch-sequence__word launch-sequence__word--stack">
        <img class="launch-sequence__logo" src="./assets/lucent-logo-lockup.svg?v=green-logo" alt="" />
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

function injectScoutedPolish() {
  injectStyle(
    "scouted-polish",
    `
    .story--scouted .story__sticky {
      background:
        radial-gradient(circle at 72% 42%, rgba(151, 255, 240, 0.10), transparent 30%),
        radial-gradient(circle at 20% 52%, rgba(224, 165, 255, 0.14), transparent 34%),
        linear-gradient(180deg, #160018 0%, #09000d 100%);
    }

    .story--scouted .story__sticky::after {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background:
        linear-gradient(90deg, rgba(9, 0, 13, 0.44) 0%, rgba(9, 0, 13, 0.18) 46%, rgba(9, 0, 13, 0.48) 100%),
        radial-gradient(circle at 70% 46%, rgba(151, 255, 240, 0.08), transparent 34%);
      content: "";
    }

    .story--scouted .scouted {
      min-height: 100svh;
      display: grid;
      grid-template-columns: minmax(300px, 0.42fr) minmax(560px, 0.58fr);
      align-items: center;
      gap: clamp(36px, 6vw, 96px);
      position: relative;
      z-index: 4;
    }

    .story--scouted .scouted__copy {
      position: relative;
      top: auto;
      left: auto;
      max-width: 430px;
      padding-top: 14px;
    }

    .story--scouted .scouted__copy h2 {
      max-width: 400px;
      text-shadow: 0 26px 70px rgba(0, 0, 0, 0.72);
    }

    .story--scouted .scouted__copy .lede {
      max-width: 390px;
      color: rgba(251, 250, 247, 0.82);
    }

    .story--scouted .product-shell {
      position: relative;
      top: auto;
      right: auto;
      width: 100%;
      min-height: min(66svh, 650px);
      transform: none;
      border-radius: 34px;
      background:
        linear-gradient(180deg, rgba(44, 36, 58, 0.68), rgba(15, 9, 24, 0.78)),
        rgba(12, 8, 20, 0.74);
      box-shadow:
        0 46px 120px rgba(0, 0, 0, 0.62),
        0 0 70px rgba(151, 255, 240, 0.06),
        inset 0 1px 0 rgba(251, 250, 247, 0.16);
      backdrop-filter: blur(18px);
    }

    .story--scouted .screen { padding: clamp(24px, 2.4vw, 30px); }
    .story--scouted .story-steps--scouted { z-index: 5; bottom: 38px; justify-content: flex-start; }

    @media (max-width: 1080px) {
      .story--scouted .scouted { grid-template-columns: minmax(250px, 0.38fr) minmax(480px, 0.62fr); gap: 32px; }
    }

    @media (max-width: 860px) {
      .story--scouted .scouted { display: block; }
      .story--scouted .scouted__copy { position: absolute; top: 88px; right: 0; left: 0; max-width: min(100%, 430px); }
      .story--scouted .product-shell { position: absolute; top: auto; right: 0; bottom: 68px; width: 100%; min-height: min(58svh, 590px); }
    }
    `,
  );
}

function setupScoutedVideoBackground() {
  const scoutSticky = document.querySelector(".story--scouted .story__sticky");
  if (!scoutSticky) return;

  const backgroundVideo = scoutSticky.querySelector(".scout-bg-video");
  const backgroundOverlay = scoutSticky.querySelector(".scout-bg-overlay");
  const scoutContent = scoutSticky.querySelector(".scouted");
  const scoutStepNav = scoutSticky.querySelector(".story-steps--scouted");

  if (backgroundVideo) {
    backgroundVideo.style.opacity = "0.58";
    backgroundVideo.style.filter = "saturate(1.02) contrast(1.12) brightness(0.94)";
    backgroundVideo.style.transform = "scale(1.02)";
    backgroundVideo.style.zIndex = "0";
    backgroundVideo.style.mixBlendMode = "normal";
    backgroundVideo.play?.().catch(() => {});
  }

  if (backgroundOverlay) {
    backgroundOverlay.style.zIndex = "1";
    backgroundOverlay.style.background = [
      "radial-gradient(circle at 67% 44%, rgba(151, 255, 240, 0.10), transparent 30%)",
      "linear-gradient(90deg, rgba(9, 0, 13, 0.46) 0%, rgba(9, 0, 13, 0.20) 45%, rgba(9, 0, 13, 0.52) 100%)",
      "linear-gradient(180deg, rgba(9, 0, 13, 0.18), rgba(9, 0, 13, 0.64))",
    ].join(", ");
  }

  if (scoutContent) {
    scoutContent.style.position = "relative";
    scoutContent.style.zIndex = "4";
  }
  if (scoutStepNav) scoutStepNav.style.zIndex = "5";
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
}

function setScoutStep(step) {
  scoutStory?.setAttribute("data-scout-step", String(step));
  const scene = scoutScenes[step];
  if (scene) {
    if (scoutTitle) scoutTitle.textContent = scene[0];
    if (scoutCopy) scoutCopy.textContent = scene[1];
  }
  scoutSteps.forEach((item, index) => item.classList.toggle("is-active", index === step));
  screens.forEach((screen, index) => screen.classList.toggle("is-active", index === step));
}

function setVisible(items, amount) {
  items.forEach((item, index) => {
    const local = clamp((amount - index * 0.16) / 0.22, 0, 1);
    item.style.opacity = local.toFixed(3);
    item.style.transform = `translateY(${(1 - local) * 16}px)`;
  });
}

function updateSkillStory() {
  if (!skillStory) return;
  if (prefersReducedMotion.matches) {
    root.style.setProperty("--skill-progress", "1");
    root.style.setProperty("--skill-scan-y", "0px");
    root.style.setProperty("--skill-scan-opacity", "0");
    root.style.setProperty("--skill-player-scale", "1");
    root.style.setProperty("--skill-player-y", "0px");
    root.style.setProperty("--skill-orbit", "0deg");
    setSkillStep(3);
    if (poseMap) poseMap.style.opacity = "1";
    [...metrics, ...poseLabels, ...analysisChips, ...storyCards].forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    return;
  }

  const progress = sectionProgress(skillStory);
  const step = Math.min(skillScenes.length - 1, Math.floor(progress * skillScenes.length));
  const localScan = clamp((progress - 0.18) / 0.24, 0, 1);
  const poseReveal = clamp((progress - 0.22) / 0.14, 0, 1);

  root.style.setProperty("--skill-progress", progress.toFixed(4));
  root.style.setProperty("--skill-scan-y", `${-260 + localScan * 520}px`);
  root.style.setProperty("--skill-scan-opacity", localScan > 0 && localScan < 1 ? "1" : "0");
  root.style.setProperty("--skill-player-scale", `${1 + progress * 0.05}`);
  root.style.setProperty("--skill-player-y", `${progress * -26}px`);
  root.style.setProperty("--skill-orbit", `${progress * 72}deg`);
  setSkillStep(step);
  if (poseMap) poseMap.style.opacity = poseReveal.toFixed(3);
  setVisible(poseLabels, clamp((progress - 0.24) / 0.18, 0, 1));
  setVisible(metrics, clamp((progress - 0.46) / 0.18, 0, 1));
  setVisible(analysisChips, clamp((progress - 0.62) / 0.16, 0, 1));
  setVisible(storyCards, clamp((progress - 0.76) / 0.12, 0, 1));
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
window.addEventListener("resize", updateStories);
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

setupRelatsInspiredHeroContent();
setupActiveNavigation();
setupLaunchSequence();
injectScoutedPolish();
setupScoutedVideoBackground();
setupFilmFallback();
setupRevealObserver();
updateStories();
