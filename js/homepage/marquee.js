$(document).ready(function() {

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
      
      const marqueeWidth = marqueeEl.scrollWidth;
      const threshold = 200;

      // Clone the inner wrapper for seamless loop
      const clone = firstInner.cloneNode(true);
      wrapper.appendChild(clone);

      // Animate for seamless infinite marquee
      // Move exactly one marquee width, then reset seamlessly
      gsap.set(wrapper, { x: 0 });
      gsap.to(wrapper, {
        x: -marqueeWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: function(x) {
            return (parseFloat(x) % marqueeWidth) + "px";
          }
        }
      });


      // Check if desktop
      if (window.innerWidth > 991) {
        if (!window.ScrollTrigger) {
          console.warn('ScrollTrigger not loaded for marquee scroll effects');
          return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
    
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
      const timer = setInterval(function() {
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