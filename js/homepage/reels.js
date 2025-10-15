gsap.registerPlugin(ScrollTrigger, Flip);

const videoGrow = document.querySelector("[data-video-grow]");
const trigger = document.querySelector(".reels_zoom-trigger");
const growContainer = document.querySelector(".reels_grow-container-inner");
const originalParent = document.querySelector("[data-video-grow-wrapper]");

// Webflow breakpoints: Mobile Portrait: 0-479px, Mobile Landscape: 480-767px, Tablet: 768-991px, Desktop: 992px+
function isDesktopOrTablet() {
  return window.innerWidth >= 768; // Tablet and above
}

if (!videoGrow || !trigger || !growContainer || !originalParent) {
  console.error("Missing elements");
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
