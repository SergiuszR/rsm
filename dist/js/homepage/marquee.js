$(document).ready(function() {

const wrapper = document.querySelector('.banner_wrapper');
const firstInner = wrapper.querySelector('.banner_wrapper-inner');
const marqueeWidth = firstInner.querySelector('.banner_marquee').scrollWidth;
const threshold = 200;

gsap.to(wrapper, {
  x: -marqueeWidth,
  duration: 20,
  ease: "none",
  repeat: -1
});


// Check if desktop
if (window.innerWidth > 991) {
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
})