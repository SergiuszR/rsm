// Reels section appear and zoom animation

const videoGrow = document.querySelector("[data-video-grow]");
const trigger = document.querySelector(".reels_zoom-trigger");
const growContainer = document.querySelector(".reels_grow-container-inner");
const originalParent = document.querySelector("[data-video-grow-wrapper]");

// Webflow breakpoints: Mobile Portrait: 0-479px, Mobile Landscape: 480-767px, Tablet: 768-991px, Desktop: 992px+
function isDesktopOrTablet() {
  return window.innerWidth >= 768; // Tablet and above
}

if (videoGrow && trigger && growContainer && originalParent) {
  let desktopZoomInitialized = false;

  const setupDesktopZoom = () => {
    if (desktopZoomInitialized) return true;

    const gsapInstance = window.gsap;
    const scrollTriggerPlugin = window.ScrollTrigger;
    const flipPlugin = window.Flip;

    if (!gsapInstance || !scrollTriggerPlugin) {
      return false;
    }

    if (!flipPlugin) {
      console.warn('[Reels] GSAP Flip plugin missing; skipping zoom animation.');
      return false;
    }

    gsapInstance.registerPlugin(scrollTriggerPlugin, flipPlugin);

    let scrollTriggerInstance = null;

    function initScrollTrigger() {
      const isDesktop = isDesktopOrTablet();

      if (isDesktop && !scrollTriggerInstance) {
        scrollTriggerInstance = scrollTriggerPlugin.create({
          trigger: trigger,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            gsapInstance.to(
              ".big-background-video-wrapper:not([data-video-grow-wrapper]), .background-video-wrapper",
              {
                opacity: 0,
                duration: 0.6,
              }
            );

            const state = flipPlugin.getState(videoGrow);
            growContainer.appendChild(videoGrow);

            flipPlugin.from(state, {
              duration: 1.2,
              ease: "power2.inOut",
              absolute: true,
            });
          },
          onLeaveBack: () => {
            const state = flipPlugin.getState(videoGrow);
            originalParent.appendChild(videoGrow);

            flipPlugin.from(state, {
              duration: 1.2,
              ease: "power2.inOut",
              absolute: true,
              zIndex: 999,
              absoluteOnLeave: true,
              onComplete: () => {
                gsapInstance.to(
                  ".big-background-video-wrapper:not([data-video-grow-wrapper]), .background-video-wrapper",
                  {
                    opacity: 1,
                    duration: 0.3,
                    delay: 0,
                  }
                );
              },
            });
          },
        });
      } else if (!isDesktop && scrollTriggerInstance) {
        scrollTriggerInstance.kill();
        scrollTriggerInstance = null;

        if (videoGrow.parentElement !== originalParent) {
          originalParent.appendChild(videoGrow);
        }
      }
    }

    initScrollTrigger();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (scrollTriggerPlugin && scrollTriggerPlugin.refresh) {
          scrollTriggerPlugin.refresh();
        }
        initScrollTrigger();
      }, 250);
    });

    desktopZoomInitialized = true;
    return true;
  };

  const initDesktopZoomWhenReady = () => {
    const attemptInit = () => setupDesktopZoom();

    if (window.AnimationManager?.onReady) {
      AnimationManager.onReady(() => {
        if (!attemptInit()) {
          console.warn('[Reels] Unable to start zoom animation even after AnimationManager ready.');
        }
      });
      return;
    }

    if (attemptInit()) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 60;
    const pollInterval = setInterval(() => {
      attempts += 1;

      if (attemptInit()) {
        clearInterval(pollInterval);
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        console.warn('[Reels] GSAP not available – zoom animation skipped.');
      }
    }, 100);
  };

  initDesktopZoomWhenReady();
}

// Mobile auto-scroll (independent of desktop animation)
let mobileAutoScrollControllers = [];
let pendingWrapperRetry = null;

function queueWrapperRetry() {
  if (pendingWrapperRetry) return;
  pendingWrapperRetry = setTimeout(() => {
    pendingWrapperRetry = null;
    initMobileAutoScroll();
  }, 400);
}

function cancelWrapperRetry() {
  if (!pendingWrapperRetry) return;
  clearTimeout(pendingWrapperRetry);
  pendingWrapperRetry = null;
}

function isLikelyMobileEnvironment() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return true;
  }
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
  return /Android|iP(hone|ad|od)|Mobile|Samsung|Pixel|OnePlus/i.test(ua);
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

function supportsNativeSmoothScroll() {
  if (typeof document === 'undefined' || !document.documentElement) return false;
  return 'scrollBehavior' in document.documentElement.style;
}

function createMobileScrollNudgeController(wrapper) {
  const noop = { cleanup: function () {} };
  if (!wrapper || prefersReducedMotion() || !isLikelyMobileEnvironment()) {
    return noop;
  }

  let hasNudged = false;
  let observer = null;
  let pendingTimeout = null;
  let pendingDelays = [];
  const hasSmoothScroll = supportsNativeSmoothScroll();

  function settleDelayEntries() {
    if (!pendingDelays.length) return;
    const entries = pendingDelays.slice();
    pendingDelays.length = 0;
    entries.forEach((entry) => {
      if (entry.done) return;
      entry.done = true;
      if (entry.cancel) {
        try { entry.cancel(); } catch (err) {}
      }
      if (typeof entry.resolve === 'function') {
        try { entry.resolve(); } catch (err) {}
      }
    });
  }

  function clearTimers() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    settleDelayEntries();
  }

  function disconnectObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function removeDelayEntry(entry) {
    const idx = pendingDelays.indexOf(entry);
    if (idx !== -1) {
      pendingDelays.splice(idx, 1);
    }
  }

  function smoothScrollTo(targetLeft) {
    return new Promise((resolve) => {
      if (hasSmoothScroll && typeof wrapper.scrollTo === 'function') {
        const current = wrapper.scrollLeft;
        wrapper.scrollTo({ left: targetLeft, behavior: 'smooth' });
        const duration = Math.min(1600, Math.max(450, Math.abs(current - targetLeft) * 4));
        const entry = { id: null, resolve, done: false, cancel: null };
        entry.id = setTimeout(() => {
          if (entry.done) return;
          entry.done = true;
          entry.id = null;
          removeDelayEntry(entry);
          resolve();
        }, duration);
        entry.cancel = () => {
          if (entry.id !== null) {
            clearTimeout(entry.id);
            entry.id = null;
          }
        };
        pendingDelays.push(entry);
        return;
      }

      if (typeof requestAnimationFrame !== 'function') {
        wrapper.scrollLeft = targetLeft;
        resolve();
        return;
      }

      const start = wrapper.scrollLeft;
      const delta = targetLeft - start;
      const duration = 600;
      let startTime = null;

      function ease(progress) {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }

      function animate(timestamp) {
        if (startTime === null) startTime = timestamp;
        const rawProgress = Math.min(1, (timestamp - startTime) / duration);
        wrapper.scrollLeft = start + delta * ease(rawProgress);
        if (rawProgress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }

      const rafEntry = { id: null, resolve, done: false, cancel: null };
      const rafCallback = (timestamp) => {
        if (startTime === null) startTime = timestamp;
        const rawProgress = Math.min(1, (timestamp - startTime) / duration);
        wrapper.scrollLeft = start + delta * ease(rawProgress);
        if (rawProgress < 1 && typeof requestAnimationFrame === 'function') {
          rafEntry.id = requestAnimationFrame(rafCallback);
        } else {
          rafEntry.done = true;
          rafEntry.id = null;
          removeDelayEntry(rafEntry);
          resolve();
        }
      };

      rafEntry.cancel = () => {
        if (typeof cancelAnimationFrame === 'function' && rafEntry.id) {
          cancelAnimationFrame(rafEntry.id);
          rafEntry.id = null;
        }
      };

      rafEntry.id = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(rafCallback) : null;
      pendingDelays.push(rafEntry);
    });
  }

  function delay(ms) {
    return new Promise((resolve) => {
      const entry = { id: null, resolve, done: false, cancel: null };
      entry.id = setTimeout(() => {
        if (entry.done) return;
        entry.done = true;
        entry.id = null;
        removeDelayEntry(entry);
        resolve();
      }, ms);
      entry.cancel = () => {
        if (entry.id !== null) {
          clearTimeout(entry.id);
          entry.id = null;
        }
      };
      pendingDelays.push(entry);
    });
  }

  function runNudgeSequence(overflow) {
    if (hasNudged || overflow <= 0) return;
    hasNudged = true;

    const distance = Math.min(overflow, Math.max(wrapper.clientWidth * 0.55, 140));

    smoothScrollTo(distance)
      .then(() => delay(900))
      .then(() => smoothScrollTo(0))
      .catch(() => {});
  }

  function scheduleNudge(attempt) {
    if (hasNudged) return;
    const overflow = wrapper.scrollWidth - wrapper.clientWidth;
    if (overflow <= 6) {
      if (attempt >= 6) return;
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
        scheduleNudge(attempt + 1);
      }, 450);
      return;
    }
    runNudgeSequence(overflow);
  }

  function userInteractionHandler() {
    if (hasNudged) return;
    hasNudged = true;
    clearTimers();
    disconnectObserver();
  }

  wrapper.addEventListener('touchstart', userInteractionHandler, { passive: true });
  wrapper.addEventListener('wheel', userInteractionHandler, { passive: true });
  wrapper.addEventListener('pointerdown', userInteractionHandler, { passive: true });

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        scheduleNudge(0);
        disconnectObserver();
      });
    }, { threshold: 0.45 });
    observer.observe(wrapper);
  } else {
    pendingTimeout = setTimeout(() => {
      pendingTimeout = null;
      scheduleNudge(0);
    }, 1200);
  }

  return {
    cleanup: function () {
      wrapper.removeEventListener('touchstart', userInteractionHandler);
      wrapper.removeEventListener('wheel', userInteractionHandler);
      wrapper.removeEventListener('pointerdown', userInteractionHandler);
      clearTimers();
      disconnectObserver();
    }
  };
}

function initMobileAutoScroll() {
  // Mobile Landscape and below (<= 767px)
  // Use window.innerWidth for consistency, but also check for mobile user agent as fallback
  const isMobileLandscapeOrBelow = window.innerWidth <= 767;
  
  // Cleanup any previous controllers
  mobileAutoScrollControllers.forEach(c => c.cleanup && c.cleanup());
  mobileAutoScrollControllers = [];

  if (!isMobileLandscapeOrBelow) {
    cancelWrapperRetry();
    return;
  }

  // Support multiple horizontal wrappers on mobile
  const wrappers = Array.from(document.querySelectorAll('.reels_wrapper, .position_videos.is-horizontal'));
  if (wrappers.length === 0) {
    console.log('[Reels] No wrappers found for mobile auto-scroll');
    queueWrapperRetry();
    return;
  }

  cancelWrapperRetry();

  wrappers.forEach((wrapper) => {
    const scrollNudgeController = createMobileScrollNudgeController(wrapper);
    // Enable horizontal scrolling on each wrapper regardless of current width.
    // Content (videos/images) often loads asynchronously on mobile, so we can't
    // rely on scrollWidth at init time to decide whether to set up the loop.
    wrapper.style.overflowX = 'scroll';
    wrapper.style.overflowY = 'hidden';
    wrapper.style.scrollBehavior = 'auto';
    wrapper.style.webkitOverflowScrolling = 'touch';
    // Do not override layout display/position — Webflow controls grid/flex there.

    let isPaused = false;
    let rafId = null;
    const speedPxPerSec = 28; // px per second (slightly faster for visibility)
    let direction = 1; // 1 = right, -1 = left
    let lastTime = performance.now();

    function tick(currentTime) {
      if (isPaused) {
        lastTime = currentTime;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const dt = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      if (dt > 0.1) {
        // Skip large time deltas (e.g., when tab was inactive)
        rafId = requestAnimationFrame(tick);
        return;
      }

      const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
      if (maxScroll <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const delta = speedPxPerSec * dt * direction;
      let next = wrapper.scrollLeft + delta;
      
      if (next >= maxScroll) {
        next = maxScroll;
        direction = -1;
      } else if (next <= 0) {
        next = 0;
        direction = 1;
      }
      
      wrapper.scrollLeft = next;
      rafId = requestAnimationFrame(tick);
    }

    // Pause on user interaction
    const pause = () => { 
      isPaused = true; 
    };
    const resume = () => { 
      isPaused = false;
      lastTime = performance.now();
    };

    wrapper.addEventListener('touchstart', pause, { passive: true });
    wrapper.addEventListener('touchend', resume, { passive: true });
    wrapper.addEventListener('touchcancel', resume, { passive: true });

    // Start animation using requestAnimationFrame for better mobile performance
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);

    const cleanup = function() {
      if (rafId) cancelAnimationFrame(rafId);
      wrapper.style.overflowX = '';
      wrapper.style.overflowY = '';
      wrapper.style.scrollBehavior = '';
      wrapper.style.webkitOverflowScrolling = '';
      wrapper.removeEventListener('touchstart', pause);
      wrapper.removeEventListener('touchend', resume);
      wrapper.removeEventListener('touchcancel', resume);
      scrollNudgeController.cleanup();
    };

    mobileAutoScrollControllers.push({ cleanup: cleanup });
  });
}

// Initialize mobile auto-scroll when DOM is ready
function initMobileAutoScrollWhenReady() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Add a small delay to ensure elements are rendered
      setTimeout(() => {
        initMobileAutoScroll();
      }, 100);
    });
  } else {
    // DOM already ready, but wait a bit for rendering
    setTimeout(() => {
      initMobileAutoScroll();
    }, 100);
  }
}

// Initialize mobile auto-scroll
initMobileAutoScrollWhenReady();

// Handle window resize for mobile auto-scroll
let mobileResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(mobileResizeTimer);
  mobileResizeTimer = setTimeout(() => {
    initMobileAutoScroll();
  }, 250);
});

// Also reinitialize when page becomes visible (handles mobile browser tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setTimeout(() => {
      initMobileAutoScroll();
    }, 100);
  }
});
