$(document).ready(function() {
  
    // Wait for GSAP and ScrollTrigger
    function initBlogAnimation() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for blog-anim');
            return;
        }
        
        // Add blog line CSS dynamically
        const blogStyle = document.createElement('style');
        blogStyle.textContent = `
          .w-dyn-item {
            position: relative;
            --blog-line-scale: 0;
          }
          .w-dyn-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: black;
            transform: scaleX(var(--blog-line-scale));
            transform-origin: left center;
          }
        `;
        document.head.appendChild(blogStyle);
        
        // Create timeline for each blog item
        $('.section_blog .w-dyn-item').each(function(index) {
          const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".section_blog",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });
      
      // Animate item appearance and line drawing together
      tl.fromTo(this, 
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.5 + (index * 0.3),
          ease: "power2.out"
        }
      )
      .to(this, 
        {
          '--blog-line-scale': 1,
          duration: 0.8,
          ease: "power2.out"
        }, 
        "-=0.6" 
      );
        });
    }
    
    // Initialize when GSAP is ready using AnimationManager with polling fallback
    (function waitForAnimationManager() {
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            window.AnimationManager.onReady(initBlogAnimation);
        } else {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(initBlogAnimation);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.error('AnimationManager not loaded for blog-anim');
                }
            }, 50);
        }
    })();
  });
  