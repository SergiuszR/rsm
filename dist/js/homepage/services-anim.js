// On Reveal

$(document).ready(function() {
  // Only run on desktop (>= 992px)
  if (!window.matchMedia('(min-width: 992px)').matches) {
    return;
  }
  
  // Wait for GSAP and ScrollTrigger
  function initServicesReveal() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger not loaded for services-anim reveal');
      return;
    }
    
    gsap.registerPlugin(ScrollTrigger);
  
  // Create timeline for accordion items
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".section_services",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse"
    }
  });
  
  // Animate items from left with stagger
  tl.fromTo('.accordion_item', 
    {
      opacity: 0,
      x: -50
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    }
  );
  }
  
  // Initialize when GSAP is ready using AnimationManager with polling fallback
  (function waitForAnimationManager() {
    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
      window.AnimationManager.onReady(initServicesReveal);
    } else {
      let attempts = 0;
      const maxAttempts = 100; // 5s
      const timer = setInterval(function() {
        attempts++;
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
          clearInterval(timer);
          window.AnimationManager.onReady(initServicesReveal);
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          console.error('AnimationManager not loaded for services-anim reveal');
        }
      }, 50);
    }
  })();
});


// On hover

// Wait for DOM to be fully loaded
$(document).ready(function() {
  // Only run on desktop (>= 992px)
  if (!window.matchMedia('(min-width: 992px)').matches) {
    return;
  }
  
  // Check GSAP availability
  if (!window.gsap) {
    console.warn('GSAP not loaded for services-anim hover');
    return;
  }
  
  // Initialize GSAP
  gsap.registerPlugin();

  // Set initial state for all accordion bodies (blur applied)
  gsap.set('.accordion_body', {
    filter: 'blur(10px)',
    opacity: 0.6
  });

  // Track currently hovered item
  let currentlyHovered = null;

  // Create timeline for each accordion item
  document.querySelectorAll('.accordion_item').forEach((item, index) => {
    const header = item.querySelector('.accordion_header');
    const body = item.querySelector('.accordion_body');
    const arrowWrapper = item.querySelector('.arrow-wrapper.is-absolute');
    const arrow = arrowWrapper ? arrowWrapper.querySelector('.arrow') : null;
    const starBackground = arrowWrapper ? arrowWrapper.querySelector('.star-background') : null;
    
    // Function to activate item
    function activateItem() {
      // If this item is already active, do nothing
      if (currentlyHovered === item) return;
      
      // Deactivate previously hovered item
      if (currentlyHovered) {
        deactivateItem(currentlyHovered);
      }
      
      // Set this as currently hovered
      currentlyHovered = item;
      
      // Kill any existing animations on this item
      gsap.killTweensOf([header, body, arrow, starBackground].filter(Boolean));
      
      // Header goes way up with opacity fade
gsap.to(header, {
  y: '-100%',
  opacity: 0,
  duration: 0.4,
  ease: "power1.in"
});

// Body loses blur and becomes visible
gsap.to(body, {
  filter: 'blur(0px)',
  opacity: 1,
  duration: 0.5,
  ease: "power1.out"
});

// Rotate arrow 90 degrees clockwise
if (arrow) {
  gsap.to(arrow, {
    rotation: -45,
    duration: 0.5,
    ease: "power1.out"
  });
}

// Set star background opacity to 1
if (starBackground) {
  gsap.to(starBackground, {
    opacity: 1,
    duration: 0.6,
    ease: "power1.out"
  });
}

    }
    
    // Function to deactivate item
    function deactivateItem(targetItem) {
      const targetHeader = targetItem.querySelector('.accordion_header');
      const targetBody = targetItem.querySelector('.accordion_body');
      const targetArrowWrapper = targetItem.querySelector('.arrow-wrapper.is-absolute');
      const targetArrow = targetArrowWrapper ? targetArrowWrapper.querySelector('.arrow') : null;
      const targetStarBackground = targetArrowWrapper ? targetArrowWrapper.querySelector('.star-background') : null;
      
      // Kill any existing animations
      gsap.killTweensOf([targetHeader, targetBody, targetArrow, targetStarBackground].filter(Boolean));
      
      // First set header to bottom position (invisible)
      gsap.set(targetHeader, {
        y: '100%',
        opacity: 0
      });
      
      // Then animate header rolling back to original position
      gsap.to(targetHeader, {
        y: '0%',
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.1
      });
      
      // Body gets blur back
      gsap.to(targetBody, {
        filter: 'blur(10px)',
        opacity: 0.6,
        duration: 0.4,
        ease: "power2.in"
      });
      
      // Rotate arrow back to 0 degrees
      if (targetArrow) {
        gsap.to(targetArrow, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      }
      
      // Set star background opacity back to original (assuming 0)
      if (targetStarBackground) {
        gsap.to(targetStarBackground, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }
    
    // Mouse enter
    item.addEventListener('mouseenter', activateItem);
    
    // Mouse leave - only deactivate if no other item is being hovered
    item.addEventListener('mouseleave', (e) => {
      // Small delay to check if mouse entered another accordion item
      setTimeout(() => {
        // If this item is still the currently hovered one, deactivate it
        if (currentlyHovered === item) {
          deactivateItem(item);
          currentlyHovered = null;
        }
      }, 10);
    });
  });

  // Global mouse leave for the entire accordion container
  const container = document.querySelector('.layout_services_item-list');
  if (container) {
    container.addEventListener('mouseleave', () => {
      if (currentlyHovered) {
        const header = currentlyHovered.querySelector('.accordion_header');
        const body = currentlyHovered.querySelector('.accordion_body');
        const arrowWrapper = currentlyHovered.querySelector('.arrow-wrapper.is-absolute');
        const arrow = arrowWrapper ? arrowWrapper.querySelector('.arrow') : null;
        const starBackground = arrowWrapper ? arrowWrapper.querySelector('.star-background') : null;
        
        // Kill any existing animations
        gsap.killTweensOf([header, body, arrow, starBackground].filter(Boolean));
        
        // First set header to bottom position (invisible)
        gsap.set(header, {
          y: '100%',
          opacity: 0
        });
        
        // Then animate header rolling back to original position
        gsap.to(header, {
          y: '0%',
          opacity: 1,
          duration: 0.7,
          ease: "power2",
          delay: 0.1
        });
        
        // Body gets blur back
        gsap.to(body, {
          filter: 'blur(10px)',
          opacity: 0.6,
          duration: 0.7,
          ease: "power2.in"
        });
        
        // Rotate arrow back to 0 degrees
        if (arrow) {
          gsap.to(arrow, {
            rotation: 0,
            duration: 0.7,
            ease: "power2"
          });
        }
        
        // Set star background opacity back to 0
        if (starBackground) {
          gsap.to(starBackground, {
            opacity: 0,
            duration: 0.7,
            ease: "power2"
          });
        }
        
        currentlyHovered = null;
      }
    });
  }

});
