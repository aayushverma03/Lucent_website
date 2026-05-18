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
  {
    title: "See the player clearly.",
    copy: "Start with the athlete, then reveal the movement behind every rep.",
  },
  {
    title: "Read the movement.",
    copy: "Pose analysis exposes alignment, hip rotation, and control before small flaws become habits.",
  },
  {
    title: "Turn reps into evidence.",
    copy: "Touch quality, shot speed, and weak-foot control become measurable proof of improvement.",
  },
  {
    title: "Know what to train next.",
    copy: "Lucent turns the readout into one clear recommendation for the next session.",
  },
];

const scoutScenes = [
  {
    title: "Find the right trial.",
    copy: "Browse open opportunities from clubs looking for players in your role.",
  },
  {
    title: "Open the best match.",
    copy: "Select a trial and instantly understand what that club wants to see.",
  },
  {
    title: "Follow the brief.",
    copy: "Lucent turns each trial into a clear checklist of requirements and drills.",
  },
  {
    title: "Upload the proof.",
    copy: "Complete the drills, attach the evidence, and submit a club-ready package.",
  },
  {
    title: "Get scouted.",
    copy: "Your verified profile reaches the club with the context they need to act faster.",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function revealAll() {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function injectScoutedPolish() {
  if (document.querySelector("[data-scouted-polish]")) return;

  const style = document.createElement("style");
  style.setAttribute("data-scouted-polish", "true");
  style.textContent = `
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
        linear-gradient(90deg, rgba(9, 0, 13, 0.92) 0%, rgba(9, 0, 13, 0.68) 42%, rgba(9, 0, 13, 0.78) 100%),
        radial-gradient(circle at 70% 46%, rgba(151, 255, 240, 0.10), transparent 34%);
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

    .story--scouted .scouted__copy .eyebrow {
      color: var(--lilac);
      text-shadow: 0 0 22px rgba(224, 165, 255, 0.28);
    }

    .story--scouted .scouted__copy h2 {
      max-width: 400px;
      text-shadow: 0 26px 70px rgba(0, 0, 0, 0.72);
    }

    .story--scouted .scouted__copy .lede {
      max-width: 390px;
      color: rgba(251, 250, 247, 0.78);
      font-size: clamp(1.02rem, 1.32vw, 1.18rem);
    }

    .story--scouted .product-shell {
      position: relative;
      top: auto;
      right: auto;
      width: 100%;
      min-height: min(62svh, 590px);
      transform: none;
      border: 1px solid rgba(251, 250, 247, 0.18);
      border-radius: 34px;
      background:
        linear-gradient(180deg, rgba(44, 36, 58, 0.78), rgba(15, 9, 24, 0.86)),
        rgba(12, 8, 20, 0.84);
      box-shadow:
        0 46px 120px rgba(0, 0, 0, 0.62),
        0 0 70px rgba(151, 255, 240, 0.06),
        inset 0 1px 0 rgba(251, 250, 247, 0.16);
      backdrop-filter: blur(18px);
    }

    .story--scouted .product-shell__chrome {
      min-height: 62px;
      background: rgba(251, 250, 247, 0.04);
    }

    .story--scouted .screen {
      padding: clamp(24px, 2.6vw, 34px);
    }

    .story--scouted .trial-card,
    .story--scouted .selected-trial,
    .story--scouted .trial-summary article,
    .story--scouted .requirements article,
    .story--scouted .upload-card,
    .story--scouted .success-card {
      border-color: rgba(251, 250, 247, 0.13);
      background: rgba(12, 8, 20, 0.72);
      box-shadow: inset 0 1px 0 rgba(251, 250, 247, 0.07);
    }

    .story--scouted .trial-card.is-selected {
      border-color: rgba(151, 255, 240, 0.42);
      background:
        linear-gradient(135deg, rgba(151, 255, 240, 0.10), rgba(224, 165, 255, 0.06)),
        rgba(12, 8, 20, 0.80);
      box-shadow:
        inset 0 0 0 1px rgba(151, 255, 240, 0.16),
        0 22px 44px rgba(0, 0, 0, 0.22);
    }

    .story--scouted .screen__header em,
    .story--scouted .upload-card strong,
    .story--scouted .requirements li::before {
      box-shadow: 0 0 22px rgba(151, 255, 240, 0.22);
    }

    .story--scouted .story-steps--scouted {
      z-index: 5;
      bottom: 38px;
      justify-content: flex-start;
    }

    .story--scouted .story-steps--scouted span {
      color: rgba(251, 250, 247, 0.34);
    }

    .story--scouted .story-steps--scouted span.is-active {
      color: var(--paper);
      text-shadow: 0 0 18px rgba(224, 165, 255, 0.22);
    }

    @media (max-width: 1080px) {
      .story--scouted .scouted {
        grid-template-columns: minmax(250px, 0.38fr) minmax(480px, 0.62fr);
        gap: 32px;
      }
    }

    @media (max-width: 860px) {
      .story--scouted .scouted {
        display: block;
      }

      .story--scouted .scouted__copy {
        position: absolute;
        top: 88px;
        right: 0;
        left: 0;
        max-width: min(100%, 430px);
      }

      .story--scouted .product-shell {
        position: absolute;
        top: auto;
        right: 0;
        bottom: 68px;
        width: 100%;
        min-height: min(56svh, 580px);
      }
    }
  `;

  document.head.appendChild(style);
}

function setupScoutedVideoBackground() {
  const scoutSticky = document.querySelector(".story--scouted .story__sticky");
  if (!scoutSticky) return;

  const backgroundVideo = scoutSticky.querySelector(":scope > video");
  const backgroundOverlay = backgroundVideo?.nextElementSibling;
  const scoutContent = scoutSticky.querySelector(".scouted");
  const scoutStepNav = scoutSticky.querySelector(".story-steps--scouted");

  if (backgroundVideo) {
    backgroundVideo.style.opacity = "0.18";
    backgroundVideo.style.filter = "saturate(0.82) contrast(1.08) brightness(0.58) blur(1px)";
    backgroundVideo.style.transform = "scale(1.04)";
    backgroundVideo.style.zIndex = "0";
    backgroundVideo.style.mixBlendMode = "normal";
    backgroundVideo.play?.().catch(() => {});
  }

  if (backgroundOverlay?.getAttribute("aria-hidden") === "true") {
    backgroundOverlay.style.zIndex = "1";
    backgroundOverlay.style.background = [
      "radial-gradient(circle at 67% 44%, rgba(151, 255, 240, 0.08), transparent 30%)",
      "linear-gradient(90deg, rgba(9, 0, 13, 0.94) 0%, rgba(9, 0, 13, 0.74) 42%, rgba(9, 0, 13, 0.86) 100%)",
      "linear-gradient(180deg, rgba(9, 0, 13, 0.58), rgba(9, 0, 13, 0.92))",
    ].join(", ");
  }

  if (scoutContent) {
    scoutContent.style.position = "relative";
    scoutContent.style.zIndex = "4";
  }

  if (scoutStepNav) {
    scoutStepNav.style.zIndex = "5";
  }
}

function setupFilmFallback() {
  if (!filmVideo || !film) return;

  const useFallback = () => {
    film.classList.add("is-fallback");
  };

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
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10%",
    },
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
    if (skillTitle) skillTitle.textContent = scene.title;
    if (skillCopy) skillCopy.textContent = scene.copy;
  }

  skillSteps.forEach((item, index) => {
    item.classList.toggle("is-active", index === step);
  });
}

function setScoutStep(step) {
  scoutStory?.setAttribute("data-scout-step", String(step));

  const scene = scoutScenes[step];
  if (scene) {
    if (scoutTitle) scoutTitle.textContent = scene.title;
    if (scoutCopy) scoutCopy.textContent = scene.copy;
  }

  scoutSteps.forEach((item, index) => {
    item.classList.toggle("is-active", index === step);
  });

  screens.forEach((screen, index) => {
    screen.classList.toggle("is-active", index === step);
  });
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
  if (prefersReducedMotion.matches) revealAll();
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

injectScoutedPolish();
setupScoutedVideoBackground();
setupFilmFallback();
setupRevealObserver();
updateStories();
