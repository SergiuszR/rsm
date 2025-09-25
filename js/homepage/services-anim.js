$(document).ready(function() {
  
    gsap.registerPlugin(ScrollTrigger);
    
    // Add black line CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
      .accordion_header {
        position: relative;
        --line-scale: 0;
        cursor: pointer;
      }
      .accordion_header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: black;
        transform: scaleX(var(--line-scale));
        transform-origin: left center;
      }
      .accordion_header:focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
      .accordion_header .arrow-wrapper {
        transition: transform 0.3s ease;
      }
      .accordion_header[aria-expanded="true"] .arrow-wrapper {
        transform: rotate(90deg);
      }
    `;
    document.head.appendChild(style);
    
    // Create timeline for each item
    $('[data-item="service-item"]').each(function(index) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".section_services",
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
          delay: 0.5 + (index * 0.4),
          ease: "power2.out"
        }
      )
      .fromTo($(this).find('.accordion_header')[0], 
        {
          '--line-scale': 0
        },
        {
          '--line-scale': 1,
          duration: 0.8,
          ease: "power2.out"
        }, 
        "-=0.6"
      );
    });
    
    // Function to collapse all items
    function collapseAll(except = null) {
      $('[data-item="service-item"]').each(function() {
        if (except && this === except[0]) return;
        
        const $accordionBody = $(this).find('.accordion_body');
        const $accordionHeader = $(this).find('.accordion_header');
        
        if ($accordionBody.hasClass('expanded')) {
          gsap.killTweensOf($accordionBody);
          gsap.set($accordionBody, { maxHeight: 0 });
          $accordionBody.removeClass('expanded');
          
          // Update ARIA attributes
          $accordionHeader.attr('aria-expanded', 'false');
        }
      });
    }
    
    // Function to expand item
    function expandItem($item) {
      const $accordionBody = $item.find('.accordion_body');
      const $accordionHeader = $item.find('.accordion_header');
      
      // Skip if already expanded
      if ($accordionBody.hasClass('expanded')) return;
      
      // Collapse all other items first
      collapseAll($item);
      
      // Expand current item
      const contentHeight = $accordionBody[0].scrollHeight;
      gsap.killTweensOf($accordionBody);
      gsap.to($accordionBody, {
        maxHeight: contentHeight + "px",
        duration: 0.4,
        ease: "power2.out"
      });
      
      $accordionBody.addClass('expanded');
      
      // Update ARIA attributes
      $accordionHeader.attr('aria-expanded', 'true');
    }
    
    // Function to collapse item
    function collapseItem($item) {
      const $accordionBody = $item.find('.accordion_body');
      const $accordionHeader = $item.find('.accordion_header');
      
      // Skip if not expanded
      if (!$accordionBody.hasClass('expanded')) return;
      
      // Collapse current item
      gsap.killTweensOf($accordionBody);
      gsap.to($accordionBody, {
        maxHeight: 0,
        duration: 0.3,
        ease: "power2.in"
      });
      
      $accordionBody.removeClass('expanded');
      
      // Update ARIA attributes
      $accordionHeader.attr('aria-expanded', 'false');
    }
    
    // Hover functionality with debouncing
    let hoverTimeout;
    
    $('[data-item="service-item"]').hover(
      function() {
        clearTimeout(hoverTimeout);
        const $item = $(this);
        hoverTimeout = setTimeout(() => {
          expandItem($item);
        }, 50);
      },
      function() {
        clearTimeout(hoverTimeout);
        const $item = $(this);
        hoverTimeout = setTimeout(() => {
          collapseItem($item);
        }, 100);
      }
    );
    
    // Keyboard accessibility
    $('.accordion_header').on('keydown', function(e) {
      const $item = $(this).closest('[data-item="service-item"]');
      
      // Enter or Space to toggle
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const $accordionBody = $item.find('.accordion_body');
        
        if ($accordionBody.hasClass('expanded')) {
          collapseItem($item);
        } else {
          expandItem($item);
        }
      }
      
      // Arrow key navigation
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const $allHeaders = $('.accordion_header');
        const currentIndex = $allHeaders.index(this);
        let nextIndex;
        
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % $allHeaders.length;
        } else {
          nextIndex = currentIndex === 0 ? $allHeaders.length - 1 : currentIndex - 1;
        }
        
        $allHeaders.eq(nextIndex).focus();
      }
      
      // Home/End keys
      else if (e.key === 'Home') {
        e.preventDefault();
        $('.accordion_header').first().focus();
      }
      else if (e.key === 'End') {
        e.preventDefault();
        $('.accordion_header').last().focus();
      }
    });
    
    // Initialize ARIA attributes
    $('.accordion_header').attr('aria-expanded', 'false');
    
  });
  