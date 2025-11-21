$(document).ready(function () {
  const STATE_KEY = '__rsmMarqueeState';

  function cleanupMarquee(wrapper) {
    if (!wrapper || !wrapper[STATE_KEY]) return;

    const previous = wrapper[STATE_KEY];
    previous.tween?.kill();
    if (previous.onResize) {
      window.removeEventListener('resize', previous.onResize);
    }

    if (previous.resizeObserver && typeof previous.resizeObserver.disconnect === 'function') {
      previous.resizeObserver.disconnect();
    }

    if (previous.remeasureTimers?.length) {
      previous.remeasureTimers.forEach(function (timerId) {
        clearTimeout(timerId);
      });
    }

    if (previous.clone?.parentNode === wrapper) {
      previous.clone.remove();
    }

    if (previous.innerWrappers?.length) {
      previous.innerWrappers.forEach(function (node) {
        node.style.removeProperty('flex');
        node.style.removeProperty('width');
      });
    }

    wrapper.style.removeProperty('width');
    delete wrapper[STATE_KEY];
  }

  // Wait for GSAP to be ready
  function initMarqueeAnimation() {
    try {
      if (!window.gsap) {
        console.warn('GSAP not loaded for marquee');
        return;
      }

      const wrapper = document.querySelector('.banner_wrapper');
      if (!wrapper) return;

      const firstInner = wrapper.querySelector('.banner_wrapper-inner');
      if (!firstInner) return;

      const marqueeEl = firstInner.querySelector('.banner_marquee');
      if (!marqueeEl) return;

      cleanupMarquee(wrapper);

      const initialWidth = firstInner.scrollWidth || marqueeEl.scrollWidth || firstInner.getBoundingClientRect().width;
      if (!initialWidth) return;

      const clone = firstInner.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.marqueeClone = 'true';
      wrapper.appendChild(clone);

      const innerWrappers = Array.from(wrapper.querySelectorAll('.banner_wrapper-inner'));
      const state = {
        clone,
        innerWrappers,
        tween: null,
        distance: initialWidth,
        onResize: null,
        resizeObserver: null,
        remeasureTimers: [],
        resizePending: false
      };

      function measureTrackWidth() {
        const prevWrapperWidth = wrapper.style.width;
        const prevInnerStyles = innerWrappers.map(function (node) {
          return {
            flex: node.style.flex,
            width: node.style.width
          };
        });

        wrapper.style.removeProperty('width');
        innerWrappers.forEach(function (node) {
          node.style.removeProperty('flex');
          node.style.removeProperty('width');
        });

        const width = firstInner.scrollWidth || firstInner.getBoundingClientRect().width || marqueeEl.scrollWidth;

        if (prevWrapperWidth) wrapper.style.width = prevWrapperWidth;
        innerWrappers.forEach(function (node, index) {
          const prev = prevInnerStyles[index];
          if (prev.flex) node.style.flex = prev.flex;
          else node.style.removeProperty('flex');

          if (prev.width) node.style.width = prev.width;
          else node.style.removeProperty('width');
        });

        return width;
      }

      function normalizeMobileLayout(trackWidth) {
        const isMobile = window.innerWidth <= 991;
        if (!isMobile || !trackWidth) {
          wrapper.style.removeProperty('width');
          innerWrappers.forEach(function (node) {
            node.style.removeProperty('flex');
            node.style.removeProperty('width');
          });
          return;
        }

        const singleWidth = trackWidth;
        const totalWidth = singleWidth * innerWrappers.length;
        wrapper.style.width = totalWidth + 'px';
        innerWrappers.forEach(function (node) {
          node.style.flex = '0 0 auto';
          node.style.width = singleWidth + 'px';
        });
      }

      function updateTween(distance) {
        if (!distance) return;
        state.distance = distance;
        if (state.tween) state.tween.kill();

        gsap.set(wrapper, { x: 0 });
        state.tween = gsap.to(wrapper, {
          x: -distance,
          duration: 20,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: function (xValue) {
              const numeric = parseFloat(xValue);
              if (!Number.isFinite(numeric)) return xValue;
              const looped = ((numeric % distance) + distance) % distance;
              return looped + 'px';
            }
          }
        });
      }

      function handleResize() {
        if (state.resizePending) return;
        state.resizePending = true;

        const schedule = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
        schedule(function () {
          state.resizePending = false;

          const measuredWidth = measureTrackWidth();
          normalizeMobileLayout(measuredWidth);

          if (measuredWidth && Math.abs(measuredWidth - state.distance) > 1) {
            updateTween(measuredWidth);
          }
        });
      }

      normalizeMobileLayout(initialWidth);
      updateTween(initialWidth);

      state.onResize = handleResize;
      window.addEventListener('resize', handleResize);

      if (window.ResizeObserver) {
        state.resizeObserver = new ResizeObserver(function () {
          handleResize();
        });
        state.resizeObserver.observe(firstInner);
      }

      state.remeasureTimers = [250, 1000, 2000, 4000, 8000].map(function (delay) {
        return setTimeout(handleResize, delay);
      });

      wrapper[STATE_KEY] = state;


      // Check if desktop
      if (window.innerWidth > 991) {
        if (!window.ScrollTrigger) {
          console.warn('ScrollTrigger not loaded for marquee scroll effects');
          return;
        }

        gsap.registerPlugin(ScrollTrigger);
        const threshold = 200;
/*
        const section = document.querySelector('.section_reels');

        gsap.to('.left_videos_wrapper', {
          y: -threshold,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });

        gsap.to('.middle_left_videos_wrapper, .middle_right_videos_wrapper', {
          y: threshold,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });

        gsap.to('.right_videos_wrapper', {
          y: -threshold,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
        */
      }
    } catch (error) {
      console.error('Marquee animation initialization failed:', error);
      // Don't re-throw - allow other animations to continue
    }
  }

  // Initialize when GSAP is ready using AnimationManager with polling fallback
  (function waitForAnimationManager() {
    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
      window.AnimationManager.onReady(initMarqueeAnimation);
    } else {
      let attempts = 0;
      const maxAttempts = 100; // 5s
      const timer = setInterval(function () {
        attempts++;
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
          clearInterval(timer);
          window.AnimationManager.onReady(initMarqueeAnimation);
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          console.error('AnimationManager not loaded for marquee');
        }
      }, 50);
    }
  })();
})