(() => {
  // Hero cards scroll trigger
  const cards = document.querySelector('.hero-cards');
  const film  = document.querySelector('.film--redesign');
  if (cards && film) {
    let done = false;
    function checkCards() {
      if (done) return;
      if (window.scrollY >= film.offsetTop + film.offsetHeight - window.innerHeight * 0.6) {
        cards.classList.add('is-visible');
        done = true;
        window.removeEventListener('scroll', checkCards);
      }
    }
    window.addEventListener('scroll', checkCards, { passive: true });
    checkCards();
  }

  // Journey draggable scroll thumb
  const track = document.querySelector('.journey-track');
  const slider = document.querySelector('.journey-slider');
  const thumb = document.querySelector('.journey-slider__thumb');
  if (track && slider && thumb) {
    const scrollMax = () => track.scrollWidth - track.clientWidth;
    const thumbRange = () => slider.clientWidth - thumb.offsetWidth;

    const syncThumb = () => {
      const pct = scrollMax() > 0 ? track.scrollLeft / scrollMax() : 0;
      thumb.style.left = (pct * thumbRange()) + 'px';
    };

    track.addEventListener('scroll', syncThumb, { passive: true });
    syncThumb();

    let dragging = false, dragStartX, dragStartScroll, rafId;

    thumb.addEventListener('mousedown', e => {
      dragging = true;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      thumb.classList.add('is-dragging');
      track.style.scrollSnapType = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const dx = e.clientX - dragStartX;
        const ratio = thumbRange() > 0 ? dx / thumbRange() : 0;
        const newScroll = Math.max(0, Math.min(dragStartScroll + ratio * scrollMax(), scrollMax()));
        track.scrollLeft = newScroll;
        thumb.style.left = (newScroll / scrollMax() * thumbRange()) + 'px';
      });
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('is-dragging');
      track.style.scrollSnapType = 'x mandatory';
      cancelAnimationFrame(rafId);
    });

    thumb.addEventListener('touchstart', e => {
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartScroll = track.scrollLeft;
      thumb.classList.add('is-dragging');
      track.style.scrollSnapType = 'none';
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', e => {
      if (!dragging) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const dx = e.touches[0].clientX - dragStartX;
        const ratio = thumbRange() > 0 ? dx / thumbRange() : 0;
        const newScroll = Math.max(0, Math.min(dragStartScroll + ratio * scrollMax(), scrollMax()));
        track.scrollLeft = newScroll;
        thumb.style.left = (newScroll / scrollMax() * thumbRange()) + 'px';
      });
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('is-dragging');
      track.style.scrollSnapType = 'x mandatory';
      cancelAnimationFrame(rafId);
    });

    slider.addEventListener('click', e => {
      if (e.target === thumb) return;
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min((e.clientX - rect.left - thumb.offsetWidth / 2) / thumbRange(), 1));
      track.scrollLeft = pct * scrollMax();
    });
  }

  // Drag-to-scroll on journey track
  if (track) {
    let down = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      down = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
      track.style.scrollSnapType = 'none';
    });
    track.addEventListener('mouseleave', () => { down = false; });
    track.addEventListener('mouseup', () => {
      down = false; track.style.scrollSnapType = 'x mandatory';
    });
    track.addEventListener('mousemove', e => {
      if (!down) return;
      e.preventDefault();
      track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4;
    });
  }

  // Fluid auto-cycle: gently advance through tiles when section is in view and idle.
  if (track && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const section = document.querySelector('.journey-section');
    if (section) {
      const STEP_MS = 3800;
      const RESUME_MS = 5000;
      let inView = false;
      let paused = false;
      let resumeTimer = null;
      let cycleTimer = null;

      const tileWidth = () => {
        const tile = track.querySelector('.jtile');
        return tile ? tile.getBoundingClientRect().width + 16 : 0;
      };

      const advance = () => {
        if (!inView || paused) return;
        const max = track.scrollWidth - track.clientWidth;
        const step = tileWidth();
        if (step <= 0 || max <= 0) return;
        const next = track.scrollLeft + step >= max - 2 ? 0 : track.scrollLeft + step;
        track.scrollTo({ left: next, behavior: 'smooth' });
      };

      const start = () => {
        stop();
        cycleTimer = window.setInterval(advance, STEP_MS);
      };

      const stop = () => {
        if (cycleTimer) {
          window.clearInterval(cycleTimer);
          cycleTimer = null;
        }
      };

      const pause = () => {
        paused = true;
        stop();
        if (resumeTimer) window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(() => {
          paused = false;
          if (inView) start();
        }, RESUME_MS);
      };

      ['mousedown', 'touchstart', 'wheel', 'pointerdown'].forEach((evt) =>
        track.addEventListener(evt, pause, { passive: true }),
      );
      slider?.addEventListener('mousedown', pause, { passive: true });
      track.addEventListener('mouseenter', pause, { passive: true });

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              inView = entry.isIntersecting;
              if (inView && !paused) start();
              else stop();
            });
          },
          { threshold: 0.35 },
        );
        io.observe(section);
      } else {
        inView = true;
        start();
      }
    }
  }
})();
