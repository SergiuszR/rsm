document.addEventListener('DOMContentLoaded', () => {
    // Webflow's default desktop breakpoint is 992px
    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;
    
    document.querySelectorAll('[data-showcase]').forEach(showcase => {
      const hover = showcase.querySelector('[data-hover]');
      const details = showcase.querySelector('[data-details]');
      const category = showcase.querySelector('[data-category]');
      
      showcase.addEventListener('mouseenter', () => {
        if (!isDesktop()) return; // Exit if not desktop
        
        gsap.to(showcase, {
          scale: 1.01,
          duration: 0.5,
          ease: 'power2.out'
        });
        
        if (hover) {
          gsap.to(hover, {
            duration: 0.4,
            ease: 'power2.out'
          });
          hover.classList.add('is-visible');
        }
        
        details?.classList.add('is-hover');
        category?.classList.add('is-hover');
      });
      
      showcase.addEventListener('mouseleave', () => {
        if (!isDesktop()) return; // Exit if not desktop
        
        // Kill any ongoing animations first
        gsap.killTweensOf(showcase);
        
        gsap.to(showcase, {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            // Clear all transforms after animation completes
            gsap.set(showcase, { clearProps: 'all' });
          }
        });
        
        if (hover) {
          gsap.to(hover, {
            duration: 0.5,
            ease: 'power2.out'
          });
          hover.classList.remove('is-visible');
        }
        
        details?.classList.remove('is-hover');
        category?.classList.remove('is-hover');
      });
      
      // Smooth follow cursor
      showcase.addEventListener('mousemove', (e) => {
        if (!isDesktop()) return; // Exit if not desktop
        
        const rect = showcase.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(showcase, {
          x: x * 0.008,
          y: y * 0.008,
          rotation: x * 0.003,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
    
    // Optional: Clean up animations on resize if switching to mobile
    window.addEventListener('resize', () => {
      if (!isDesktop()) {
        document.querySelectorAll('[data-showcase]').forEach(showcase => {
          gsap.killTweensOf(showcase);
          gsap.set(showcase, { clearProps: 'all' });
          
          const hover = showcase.querySelector('[data-hover]');
          if (hover) {
            hover.classList.remove('is-visible');
          }
          
          showcase.querySelector('[data-details]')?.classList.remove('is-hover');
          showcase.querySelector('[data-category]')?.classList.remove('is-hover');
        });
      }
    });
  });
  
  