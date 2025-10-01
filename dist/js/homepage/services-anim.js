// On Reveal

$(document).ready(function() {
  
  gsap.registerPlugin(ScrollTrigger);
  
  // Create timeline for accordion items
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".section_services",
      start: "top 50%",
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
      duration: 1.2,
      stagger: 0.4,
      ease: "power2.out"
    }
  );
  
});


// On hover

// Wait for DOM to be fully loaded
$(document).ready(function() {
  
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
      gsap.killTweensOf([header, body]);
      
      // Header goes way up with opacity fade
      gsap.to(header, {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
      });
      
      // Body loses blur and becomes visible
      gsap.to(body, {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
    
    // Function to deactivate item
    function deactivateItem(targetItem) {
      const targetHeader = targetItem.querySelector('.accordion_header');
      const targetBody = targetItem.querySelector('.accordion_body');
      
      // Kill any existing animations
      gsap.killTweensOf([targetHeader, targetBody]);
      
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
        
        // Kill any existing animations
        gsap.killTweensOf([header, body]);
        
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
        
        currentlyHovered = null;
      }
    });
  }

});
