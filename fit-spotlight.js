/* Fit Spotlight — scroll-driven Trials narrative.
   Reads native scroll (Lenis dispatches native scroll events) and scrubs the
   pinned .fitspot__track: fit ring fills, requirements check in, copy beats
   cross-fade, resolve state opens. Static resolved state under reduced-motion
   only, matching the CSS fallback; mobile runs the same pinned narrative.
   Self-contained; does not touch the Skill Engine driver in script.js. */
(function () {
  "use strict";
  var track = document.querySelector(".fitspot__track");
  if (!track) return;

  var card = document.querySelector(".fs-card");
  var ringArc = document.querySelector(".fs-ring__arc");
  var ringNum = document.querySelector(".fs-ring__num");
  var fitWord = document.querySelector(".fs-ring__word");
  var resolve = document.querySelector(".fs-resolve");
  var rails = Array.prototype.slice.call(document.querySelectorAll(".fs-rail__seg"));
  var copies = Array.prototype.slice.call(document.querySelectorAll(".fs-copy"));
  var reqs = Array.prototype.slice.call(document.querySelectorAll(".fs-req[data-req]"));

  var RC = 2 * Math.PI * 80; // must match the ring <circle r="80">
  if (ringArc) {
    ringArc.style.strokeDasharray = RC.toFixed(2);
    ringArc.style.strokeDashoffset = RC.toFixed(2);
  }

  var reduceQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function isStatic() { return reduceQ.matches; }

  function render(p) {
    var beat = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
    for (var i = 0; i < copies.length; i++) copies[i].classList.toggle("is-active", i === beat);
    for (var r = 0; r < rails.length; r++) rails[r].classList.toggle("is-active", r === beat);

    var cp = clamp((p - 0.2) / (0.6 - 0.2), 0, 1);
    if (ringArc) ringArc.style.strokeDashoffset = (RC * (1 - cp)).toFixed(2);
    var checked = Math.min(3, Math.floor(cp * 3 + 0.0001));
    for (var q = 0; q < reqs.length; q++) reqs[q].classList.toggle("is-met", q < checked);
    if (ringNum) ringNum.textContent = checked + "/3";
    if (fitWord) {
      fitWord.textContent = checked >= 3 ? "Good — top match" : "checking…";
      fitWord.classList.toggle("is-good", checked >= 3);
    }
    if (card) {
      card.style.setProperty("--fs-glow", cp.toFixed(3));
      card.classList.toggle("is-scanning", p > 0.14 && p < 0.66);
    }
    if (resolve) resolve.classList.toggle("is-on", p >= 0.66);
  }

  function progress() {
    if (isStatic()) { render(1); return; }
    var total = track.offsetHeight - window.innerHeight;
    var p = total <= 0 ? 0 : clamp(-track.getBoundingClientRect().top / total, 0, 1);
    render(p);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { progress(); ticking = false; });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", progress, { passive: true });
  if (reduceQ.addEventListener) reduceQ.addEventListener("change", progress);
  progress();
})();
