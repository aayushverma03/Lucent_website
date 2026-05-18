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

function setupScoutedVideoBackground() {
  const scoutSticky = document.querySelector(".story--scouted .story__sticky");
  if (!scoutSticky) return;

  const backgroundVideo = scoutSticky.querySelector(":scope > video");
  const backgroundOverlay = backgroundVideo?.nextElementSibling;
  const scoutContent = scoutSticky.querySelector(".scouted");
  const scoutStepNav = scoutSticky.querySelector(".story-steps--scouted");

  if (backgroundVideo) {
    backgroundVideo.style.opacity = "0.52";
    backgroundVideo.style.filter = "saturate(1.22) contrast(1.08) brightness(0.92)";
    backgroundVideo.style.zIndex = "0";
    backgroundVideo.style.mixBlendMode = "screen";
    backgroundVideo.play?.().catch(() => {});
  }

  if (backgroundOverlay?.getAttribute("aria-hidden") === "true") {
    backgroundOverlay.style.zIndex = "1";
    backgroundOverlay.style.background = [
      "radial-gradient(circle at 67% 44%, rgba(151, 255, 240, 0.12), transparent 30%)",
      "linear-gradient(90deg, rgba(16, 0, 19, 0.9) 0%, rgba(16, 0, 19, 0.66) 34%, rgba(16, 0, 19, 0.38) 68%, rgba(16, 0, 19, 0.68) 100%)",
      "linear-gradient(180deg, rgba(16, 0, 19, 0.56), rgba(16, 0, 19, 0.84))",
    ].join(", ");
  }

  if (scoutContent) {
    scoutContent.style.position = "relative";
    scoutContent.style.zIndex = "3";
  }

  if (scoutStepNav) {
    scoutStepNav.style.zIndex = "4";
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

setupScoutedVideoBackground();
setupFilmFallback();
setupRevealObserver();
updateStories();
