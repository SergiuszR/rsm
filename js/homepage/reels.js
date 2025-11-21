// Reels section appear and zoom animation

gsap.registerPlugin(ScrollTrigger, Flip);

const videoGrow = document.querySelector("[data-video-grow]");
const trigger = document.querySelector(".reels_zoom-trigger");
const growContainer = document.querySelector(".reels_grow-container-inner");
const originalParent = document.querySelector("[data-video-grow-wrapper]");

// Webflow breakpoints: Mobile Portrait: 0-479px, Mobile Landscape: 480-767px, Tablet: 768-991px, Desktop: 992px+
function isDesktopOrTablet() {
  return window.innerWidth >= 768; // Tablet and above
}

// Desktop zoom animation
if (!videoGrow || !trigger || !growContainer || !originalParent) {
} else {
  let scrollTriggerInstance = null;

  function initScrollTrigger() {
    if (isDesktopOrTablet() && !scrollTriggerInstance) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: trigger,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          gsap.to(
            ".big-background-video-wrapper:not([data-video-grow-wrapper]), .background-video-wrapper",
            {
              opacity: 0,
              duration: 0.6,
            }
          );

          const state = Flip.getState(videoGrow);
          growContainer.appendChild(videoGrow);

          Flip.from(state, {
            duration: 1.2,
            ease: "power2.inOut",
            absolute: true,
          });
        },
        onLeaveBack: () => {
          const state = Flip.getState(videoGrow);
          originalParent.appendChild(videoGrow);

          Flip.from(state, {
            duration: 1.2,
            ease: "power2.inOut",
            absolute: true,
            zIndex: 999,
            absoluteOnLeave: true,
            onComplete: () => {
              gsap.to(
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
    } else if (!isDesktopOrTablet() && scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
      // Reset video to original position
      if (videoGrow.parentElement !== originalParent) {
        originalParent.appendChild(videoGrow);
      }
    }
  }

  // Initialize on load
  initScrollTrigger();

  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      initScrollTrigger();
    }, 250);
  });
}

// Mobile auto-scroll (independent of desktop animation)
let mobileAutoScrollControllers = [];

function initMobileAutoScroll() {
  // Mobile Landscape and below (<= 767px)
  // Use window.innerWidth for consistency, but also check for mobile user agent as fallback
  const isMobileLandscapeOrBelow = window.innerWidth <= 767;
  
  // Cleanup any previous controllers
  mobileAutoScrollControllers.forEach(c => c.cleanup && c.cleanup());
  mobileAutoScrollControllers = [];

  if (!isMobileLandscapeOrBelow) {
    return;
  }

  // Support multiple horizontal wrappers on mobile
  const wrappers = Array.from(document.querySelectorAll('.reels_wrapper, .position_videos.is-horizontal'));
  if (wrappers.length === 0) {
    console.log('[Reels] No wrappers found for mobile auto-scroll');
    return;
  }

  wrappers.forEach((wrapper) => {
    // Check if wrapper has scrollable content
    const hasScrollableContent = wrapper.scrollWidth > wrapper.clientWidth;
    if (!hasScrollableContent) {
      console.log('[Reels] Wrapper has no scrollable content, skipping:', wrapper.className);
      return;
    }

    // Enable horizontal scrolling on each wrapper
    wrapper.style.overflowX = 'scroll';
    wrapper.style.overflowY = 'hidden';
    wrapper.style.scrollBehavior = 'auto';
    wrapper.style.webkitOverflowScrolling = 'touch';
    // Ensure wrapper can scroll
    wrapper.style.display = wrapper.style.display || 'flex';
    wrapper.style.position = 'relative';

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
      wrapper.style.display = '';
      wrapper.style.position = '';
      wrapper.removeEventListener('touchstart', pause);
      wrapper.removeEventListener('touchend', resume);
      wrapper.removeEventListener('touchcancel', resume);
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
