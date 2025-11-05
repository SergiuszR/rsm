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
    return;
  }

  wrappers.forEach((wrapper) => {
    // Enable horizontal scrolling on each wrapper
    wrapper.style.overflowX = 'scroll';
    wrapper.style.overflowY = 'hidden';
    wrapper.style.scrollBehavior = 'auto';
    wrapper.style.webkitOverflowScrolling = 'touch';

    let intervalId = null;
    let isPaused = false;
    const speedPxPerSec = 28; // px per second (slightly faster for visibility)
    let direction = 1; // 1 = right, -1 = left

    function tick(dt) {
      if (isPaused) return;
      const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
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
    }

    // Pause on user interaction
    const pause = () => { isPaused = true; };
    const resume = () => { isPaused = false; };

    wrapper.addEventListener('touchstart', pause, { passive: true });
    wrapper.addEventListener('touchend', resume, { passive: true });

    // Use a fixed timestep for reliable movement on mobile Safari
    const intervalMs = 33; // ~30 FPS
    intervalId = setInterval(() => tick(intervalMs / 1000), intervalMs);

    const cleanup = function() {
      if (intervalId) clearInterval(intervalId);
      wrapper.style.overflowX = '';
      wrapper.style.overflowY = '';
      wrapper.removeEventListener('touchstart', pause);
      wrapper.removeEventListener('touchend', resume);
    };

    mobileAutoScrollControllers.push({ cleanup: cleanup });
  });
}

// Initialize mobile auto-scroll
initMobileAutoScroll();

// Handle window resize for mobile auto-scroll
let mobileResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(mobileResizeTimer);
  mobileResizeTimer = setTimeout(() => {
    initMobileAutoScroll();
  }, 250);
});
