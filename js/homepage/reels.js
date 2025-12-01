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
    // Enable horizontal scrolling on each wrapper
    wrapper.style.overflowX = 'scroll';
    wrapper.style.overflowY = 'hidden';
    wrapper.style.webkitOverflowScrolling = 'touch';

    let isPaused = false;
    let animationRunning = false;
    let direction = 1; // 1 = right, -1 = left
    let hasUserInteracted = false;
    let timeoutId = null;
    
    function animateScroll() {
      if (isPaused || !animationRunning) return;
      
      const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
      
      if (maxScroll <= 0) {
        // Content not loaded yet, retry
        timeoutId = setTimeout(animateScroll, 100);
        return;
      }

      const currentScroll = wrapper.scrollLeft;
      const step = 1 * direction;
      let nextScroll = currentScroll + step;
      
      if (nextScroll >= maxScroll) {
        nextScroll = maxScroll;
        direction = -1;
      } else if (nextScroll <= 0) {
        nextScroll = 0;
        direction = 1;
      }
      
      // Try scrollTo with behavior instant (more compatible)
      try {
        wrapper.scrollTo({ left: nextScroll, behavior: 'instant' });
      } catch (e) {
        wrapper.scrollLeft = nextScroll;
      }
      
      if (animationRunning && !isPaused) {
        timeoutId = setTimeout(animateScroll, 30);
      }
    }

    // On first user interaction, just mark it - don't pause permanently
    const onFirstInteraction = () => {
      hasUserInteracted = true;
      isPaused = true;
    };
    
    const onInteractionEnd = () => {
      isPaused = false;
      if (animationRunning) {
        animateScroll();
      }
    };

    wrapper.addEventListener('touchstart', onFirstInteraction, { passive: true });
    wrapper.addEventListener('touchend', onInteractionEnd, { passive: true });
    wrapper.addEventListener('touchcancel', onInteractionEnd, { passive: true });
    
    // Also listen for scroll events - if user scrolls manually, we know interaction works
    const onManualScroll = () => {
      if (!hasUserInteracted) {
        hasUserInteracted = true;
        console.log('[Reels] User scroll detected, auto-scroll should now work');
      }
    };
    wrapper.addEventListener('scroll', onManualScroll, { passive: true });

    // Start animation when element becomes visible
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationRunning) {
            animationRunning = true;
            console.log('[Reels] Wrapper visible, starting auto-scroll. MaxScroll:', wrapper.scrollWidth - wrapper.clientWidth);
            // Delay to ensure content is rendered
            timeoutId = setTimeout(animateScroll, 800);
          } else if (!entry.isIntersecting) {
            animationRunning = false;
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }
        });
      }, { threshold: 0.1 });
      observer.observe(wrapper);
    } else {
      animationRunning = true;
      timeoutId = setTimeout(animateScroll, 1000);
    }

    const cleanup = function() {
      animationRunning = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      wrapper.style.overflowX = '';
      wrapper.style.overflowY = '';
      wrapper.style.webkitOverflowScrolling = '';
      wrapper.removeEventListener('touchstart', onFirstInteraction);
      wrapper.removeEventListener('touchend', onInteractionEnd);
      wrapper.removeEventListener('touchcancel', onInteractionEnd);
      wrapper.removeEventListener('scroll', onManualScroll);
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
