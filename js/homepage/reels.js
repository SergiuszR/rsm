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

function createMobileScrollNudgeController(wrapper) {
  const noop = { cleanup: function () {} };
  if (!wrapper || prefersReducedMotion() || !isLikelyMobileEnvironment()) {
    return noop;
  }

  let hasNudged = false;
  let observer = null;
  let pendingTimeout = null;
  let activeDragRaf = null;
  let cancelled = false;

  function clearTimers() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    if (activeDragRaf) {
      cancelAnimationFrame(activeDragRaf);
      activeDragRaf = null;
    }
    cancelled = true;
  }

  function disconnectObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Create a synthetic Touch object
  function createTouch(target, x, y, id) {
    if (typeof Touch === 'function') {
      try {
        return new Touch({
          identifier: id,
          target: target,
          clientX: x,
          clientY: y,
          screenX: x,
          screenY: y,
          pageX: x + window.scrollX,
          pageY: y + window.scrollY,
          radiusX: 25,
          radiusY: 25,
          rotationAngle: 0,
          force: 1
        });
      } catch (e) {
        // fallback below
      }
    }
    // Fallback for older browsers
    return {
      identifier: id,
      target: target,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      pageX: x + window.scrollX,
      pageY: y + window.scrollY,
      radiusX: 25,
      radiusY: 25,
      rotationAngle: 0,
      force: 1
    };
  }

  // Create and dispatch a TouchEvent
  function dispatchTouchEvent(type, target, touch) {
    const touchList = [touch];
    
    // Try native TouchEvent constructor first
    if (typeof TouchEvent === 'function') {
      try {
        const evt = new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          touches: type === 'touchend' ? [] : touchList,
          targetTouches: type === 'touchend' ? [] : touchList,
          changedTouches: touchList
        });
        target.dispatchEvent(evt);
        return;
      } catch (e) {
        // fallback below
      }
    }

    // Fallback: use CustomEvent with touch properties
    try {
      const evt = new CustomEvent(type, {
        bubbles: true,
        cancelable: true
      });
      evt.touches = type === 'touchend' ? [] : touchList;
      evt.targetTouches = type === 'touchend' ? [] : touchList;
      evt.changedTouches = touchList;
      target.dispatchEvent(evt);
    } catch (e) {
      // Silently fail - scroll will just not animate
    }
  }

  // Simulate a drag gesture by dispatching touch events over time
  function simulateDrag(startX, endX, duration) {
    return new Promise((resolve) => {
      if (cancelled) {
        resolve();
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const touchId = Date.now();
      
      // Start position (relative to viewport)
      let currentX = rect.left + startX;
      const targetX = rect.left + endX;
      const deltaX = targetX - currentX;
      
      const startTime = performance.now();
      
      // Dispatch touchstart
      const startTouch = createTouch(wrapper, currentX, centerY, touchId);
      dispatchTouchEvent('touchstart', wrapper, startTouch);

      function animateMove(now) {
        if (cancelled) {
          // End the touch immediately
          const endTouch = createTouch(wrapper, currentX, centerY, touchId);
          dispatchTouchEvent('touchend', wrapper, endTouch);
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Ease out for natural feel
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        currentX = rect.left + startX + (deltaX * easedProgress);

        const moveTouch = createTouch(wrapper, currentX, centerY, touchId);
        dispatchTouchEvent('touchmove', wrapper, moveTouch);

        if (progress < 1) {
          activeDragRaf = requestAnimationFrame(animateMove);
        } else {
          // Dispatch touchend
          const endTouch = createTouch(wrapper, currentX, centerY, touchId);
          dispatchTouchEvent('touchend', wrapper, endTouch);
          activeDragRaf = null;
          resolve();
        }
      }

      activeDragRaf = requestAnimationFrame(animateMove);
    });
  }

  // Fallback: directly animate scrollLeft if touch simulation doesn't work
  function directScrollNudge(distance) {
    return new Promise((resolve) => {
      if (cancelled) {
        resolve();
        return;
      }

      const startScroll = wrapper.scrollLeft;
      const targetScroll = startScroll + distance;
      const duration = 500;
      const startTime = performance.now();

      function animate(now) {
        if (cancelled) {
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        wrapper.scrollLeft = startScroll + (distance * easedProgress);

        if (progress < 1) {
          activeDragRaf = requestAnimationFrame(animate);
        } else {
          activeDragRaf = null;
          resolve();
        }
      }

      activeDragRaf = requestAnimationFrame(animate);
    });
  }

  function delay(ms) {
    return new Promise((resolve) => {
      if (cancelled) {
        resolve();
        return;
      }
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
        resolve();
      }, ms);
    });
  }

  function runNudgeSequence(overflow) {
    if (hasNudged || overflow <= 0 || cancelled) return;
    hasNudged = true;

    const distance = Math.min(overflow, Math.max(wrapper.clientWidth * 0.55, 140));
    const wrapperWidth = wrapper.clientWidth;
    
    // Try touch simulation first - simulate dragging from right to left (scrolling right)
    // Start from center-right, drag to center-left
    const startX = wrapperWidth * 0.7;
    const endX = wrapperWidth * 0.7 - distance;
    
    const initialScroll = wrapper.scrollLeft;

    simulateDrag(startX, endX, 600)
      .then(() => {
        // Check if touch simulation worked (scroll position changed)
        if (Math.abs(wrapper.scrollLeft - initialScroll) < 10 && !cancelled) {
          // Touch simulation didn't work, use direct scroll
          wrapper.scrollLeft = initialScroll; // Reset
          return directScrollNudge(distance);
        }
        return Promise.resolve();
      })
      .then(() => delay(800))
      .then(() => {
        if (cancelled) return Promise.resolve();
        // Drag back - from left to right
        const currentScroll = wrapper.scrollLeft;
        if (currentScroll > 10) {
          const backStartX = wrapperWidth * 0.3;
          const backEndX = wrapperWidth * 0.3 + Math.min(currentScroll, distance);
          const beforeBack = wrapper.scrollLeft;
          
          return simulateDrag(backStartX, backEndX, 600).then(() => {
            // If touch didn't work for the back swipe either, use direct scroll
            if (Math.abs(wrapper.scrollLeft - beforeBack) < 10 && !cancelled) {
              return directScrollNudge(-currentScroll);
            }
          });
        }
      })
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
