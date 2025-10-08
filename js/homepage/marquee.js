$(document).ready(function() {

  // Wait for GSAP to be ready
  function initMarqueeAnimation() {
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

    gsap.to(wrapper, {
      x: -marqueeWidth,
      duration: 20,
      ease: "none",
      repeat: -1
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
  }
  
  // Initialize with delay to ensure GSAP is loaded
  setTimeout(initMarqueeAnimation, 100);
})