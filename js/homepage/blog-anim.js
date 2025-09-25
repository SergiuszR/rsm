$(document).ready(function() {
  
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
        height: 1px;
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
    
  });
  