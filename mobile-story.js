/* mobile-story.js — GSAP pinned scene-stepper for #skills and #scouted on
   mobile (<= 860px). Desktop is driven by script.js and is left untouched.
   Each section pins, and scroll scrubs through discrete scenes that mirror the
   desktop narrative. Falls back to a readable stack without GSAP or under
   prefers-reduced-motion (the .is-ready class is simply never added). */

const SCENES = {
  skills: {
    labels: ["Train", "Scan", "Benchmark", "Improve"],
    titles: [
      "See the player clearly.",
      "Read the movement.",
      "See where you rank.",
      "Know what to train next.",
    ],
    ledes: [
      "Start with the athlete, then reveal the movement behind every rep.",
      "Pose analysis exposes alignment, hip rotation, and control.",
      "Every score is benchmarked against players at your level.",
      "Lucent builds a drill plan from your weakest scores.",
    ],
  },
  scouted: {
    labels: ["Radar", "Brief", "Proof", "Package", "Scout"],
    titles: [
      "See which clubs want you.",
      "Open the best match.",
      "Follow the brief.",
      "Submit your proof.",
      "Get in front of scouts.",
    ],
    ledes: [
      "Browse live opportunities from clubs recruiting for your role.",
      "Select a trial and see exactly what that club wants.",
      "Each trial becomes a clear checklist of requirements and drills.",
      "Complete the drills, attach evidence, send a club-ready package.",
      "Your verified profile reaches the recruitment team with full context.",
    ],
  },
};

function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

function setupSection(sec) {
  const key = sec.dataset.ms;
  const scenes = SCENES[key];
  const steps = Number(sec.dataset.msSteps) || scenes.labels.length;

  const bars = [...sec.querySelectorAll(".ms__progress i")];
  const labelEl = sec.querySelector("[data-ms-label]");
  const titleEl = sec.querySelector("[data-ms-title]");
  const ledeEl = sec.querySelector("[data-ms-lede]");
  const panels = [...sec.querySelectorAll(".ms__panel")];
  const scanline = sec.querySelector(".ms__scanline");
  const fills = [...sec.querySelectorAll(".ms__track i[data-fill]")];
  const rankEl = sec.querySelector("[data-ms-rank]");

  let current = -1;
  let rankDone = false;

  function setText(step) {
    if (labelEl) labelEl.textContent = scenes.labels[step];
    if (titleEl) titleEl.textContent = scenes.titles[step];
    if (ledeEl) ledeEl.textContent = scenes.ledes[step];
  }

  function countRank() {
    if (!rankEl || rankDone) return;
    rankDone = true;
    const target = 847, start = target + 153, dur = 900, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      rankEl.textContent = "#" + Math.round(start - (start - target) * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function apply(progress) {
    const f = progress * steps;
    const step = clamp(Math.floor(f), 0, steps - 1);
    const local = clamp(f - step, 0, 1);

    if (step !== current) {
      current = step;
      setText(step);
      bars.forEach((b, i) => {
        b.classList.toggle("is-past", i < step);
        b.classList.toggle("is-active", i === step);
      });
      panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.scene) === step));
      // skill bars fill once we reach the scan step and stay filled
      fills.forEach((el) => { el.style.width = step >= 1 ? el.dataset.fill + "%" : "0%"; });
      if (key === "skills" && step === 2) countRank();
      if (key === "skills" && step < 2) rankDone = false;
    }

    // scan-line sweep during the Scan step (skills only)
    if (scanline) {
      const scanning = key === "skills" && step === 1;
      sec.classList.toggle("is-scanning", scanning);
      if (scanning) {
        scanline.style.top = (local * 100).toFixed(1) + "%";
        scanline.style.opacity = Math.min(local / 0.12, (1 - local) / 0.12, 1).toFixed(2);
      } else {
        scanline.style.opacity = "0";
      }
    }
  }

  sec.classList.add("is-ready");

  ScrollTrigger.create({
    trigger: sec,
    start: "top top",
    end: () => "+=" + Math.round(steps * window.innerHeight * 0.85),
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    onUpdate: (self) => apply(self.progress),
    onRefresh: () => apply(0),
  });

  apply(0);
}

function initMobileStory() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  ScrollTrigger.matchMedia({
    "(max-width: 860px)": () => {
      const sections = [...document.querySelectorAll(".story__mobile-cards.ms")];
      sections.forEach(setupSection);
      return () => sections.forEach((s) => s.classList.remove("is-ready", "is-scanning"));
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileStory);
} else {
  initMobileStory();
}
