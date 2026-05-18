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
  if (heroSubline) heroSubline.textContent = "Empowering future athletes.";

  const heroBrandLockup = document.querySelector(".film__copy--brand .hero-brand-lockup");
  if (heroBrandLockup) heroBrandLockup.setAttribute("aria-hidden", "true");

  const playerSignalSection = document.querySelector(".player-signal");
  playerSignalSection?.remove();
}

function setupLaunchSequence() {
  injectStyle(
    "lucent-launch",
    `
    body.is-intro-running { overflow: hidden; }

    .launch-sequence {
      position: fixed;
      inset: 0;
      z-index: 999;
      display: grid;
      place-items: center;
      overflow: hidden;
      background:
        radial-gradient(circle at 52% 47%, rgba(224, 165, 255, 0.16), transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(151, 255, 240, 0.08), transparent 42%),
        #050007;
      color: var(--paper);
      pointer-events: none;
      transform-origin: center;
      transition:
        opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 1200ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 1200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .launch-sequence::before {
      position: absolute;
      inset: 0;
      background:
        url("./assets/images/opening-poster.webp") center / cover no-repeat;
      opacity: 0.18;
      filter: blur(16px) saturate(0.86) contrast(1.08);
      transform: scale(1.18);
      content: "";
      transition:
        opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 1200ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 1200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .launch-sequence::after {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(5, 0, 7, 0.90), rgba(5, 0, 7, 0.38), rgba(5, 0, 7, 0.88)),
        linear-gradient(180deg, rgba(5, 0, 7, 0.24), rgba(5, 0, 7, 0.72));
      content: "";
    }

    .launch-sequence__word {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: clamp(14px, 2vw, 28px);
      font-family: var(--display-font);
      font-size: clamp(4.4rem, 12vw, 12rem);
      letter-spacing: 0.08em;
      line-height: 0.78;
      text-transform: uppercase;
      transform: translateY(0) scale(1);
      transform-origin: center;
      text-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
      transition:
        transform 1200ms cubic-bezier(0.16, 1, 0.3, 1),
        opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
        letter-spacing 1200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .launch-sequence__mark {
      width: 0.18em;
      height: 0.18em;
      border: 0.025em solid currentColor;
      border-radius: 999px;
      box-shadow: 0 0 34px rgba(224, 165, 255, 0.28);
    }

    body.is-intro-complete .launch-sequence {
      opacity: 0;
      filter: blur(10px);
      transform: scale(1.34);
    }

    body.is-intro-complete .launch-sequence::before {
      opacity: 0;
      filter: blur(0) saturate(0.9) contrast(1.06);
      transform: scale(0.98);
    }

    body.is-intro-complete .launch-sequence__word {
      opacity: 0;
      letter-spacing: 0.18em;
      transform: translateY(-8svh) scale(0.34);
    }

    body.is-intro-running .film__video {
      transform: scale(1.16);
      filter: saturate(0.74) contrast(1.06) brightness(0.58) blur(8px);
    }

    .film__video {
      transition:
        transform 1500ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 1500ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    body.is-intro-complete .film__video {
      transform: scale(1);
      filter: saturate(0.88) contrast(1.08) brightness(0.76);
    }

    @media (prefers-reduced-motion: reduce) {
      .launch-sequence { display: none; }
      body.is-intro-running { overflow: auto; }
    }
    `,
  );

  let launch = document.querySelector(".launch-sequence");
  if (!launch) {
    launch = document.createElement("div");
    launch.className = "launch-sequence";
    launch.setAttribute("aria-hidden", "true");
    launch.innerHTML = `<div class="launch-sequence__word launch-sequence__word--stack"><span>Lucent</span><span class="launch-sequence__mark"></span></div>`;
    document.body.prepend(launch);
  }

  if (prefersReducedMotion.matches) {
    launch.remove();
    document.body.classList.add("is-intro-complete");
    return;
  }

  document.body.classList.add("is-intro-running");
  const finishLaunch = () => {
    document.body.classList.remove("is-intro-running");
    document.body.classList.add("is-intro-complete");
    window.setTimeout(() => launch.remove(), 1400);
  };

  window.setTimeout(finishLaunch, 1850);
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
setupLaunchSequence();
injectScoutedPolish();
setupScoutedVideoBackground();
setupFilmFallback();
setupRevealObserver();
updateStories();
