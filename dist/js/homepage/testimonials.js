$(document).ready(function() {
  if (typeof $ === 'undefined') return;
  
  // Check GSAP availability before proceeding
  function initTestimonials() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded for testimonials');
      return;
    }
  
  const $wrapper = $('.testimonials_list-wrapper');
  const $cards = $wrapper.find('.testimonials_item');
  const $controlsWrapper = $('.slider_controls-wrapper');
  const $prevBtn = $('[data-slider-previous]');
  const $nextBtn = $('[data-slider-next]');
  const $counter = $controlsWrapper.find('.text-weight-bold');

  if ($wrapper.length === 0 || $cards.length === 0 || $controlsWrapper.length === 0) return;
  
  let isAnimating = false;
  let currentSlidePosition = 1; // Track how many cards have been revealed (1 = no cards pushed, 2 = 1 card pushed, etc.)
  const totalCards = $cards.length;
  const maxSlidePosition = totalCards; // We can push cards until only one is visible
  const BREAKPOINT_TABLET = 991;
  const isTabletOrLess = window.innerWidth <= BREAKPOINT_TABLET;
  
  if (!isTabletOrLess) {
    // Generate much more random top positions
    function generateRandomTopPositions() {
      const minTop = 20;
      const maxTop = 180;
      const positions = [];
      
      // Create completely random positions for each card
      const randomPositions = [
        minTop + Math.random() * (maxTop - minTop),
        minTop + Math.random() * (maxTop - minTop),
        minTop + Math.random() * (maxTop - minTop),
        minTop + Math.random() * (maxTop - minTop)
      ];
      
      // Add some extra randomization - sometimes cluster cards, sometimes spread them
      const randomFactor = Math.random();
      
      if (randomFactor < 0.3) {
        // Cluster some cards closer together
        const basePosition = 60 + Math.random() * 80;
        randomPositions[0] = basePosition + (Math.random() - 0.5) * 40;
        randomPositions[1] = basePosition + (Math.random() - 0.5) * 40;
        randomPositions[2] = basePosition + 50 + Math.random() * 60;
        randomPositions[3] = basePosition + 50 + Math.random() * 60;
      } else if (randomFactor < 0.6) {
        // Create two groups
        const group1 = 40 + Math.random() * 40;
        const group2 = 120 + Math.random() * 40;
        randomPositions[0] = group1 + (Math.random() - 0.5) * 20;
        randomPositions[1] = group1 + (Math.random() - 0.5) * 20;
        randomPositions[2] = group2 + (Math.random() - 0.5) * 20;
        randomPositions[3] = group2 + (Math.random() - 0.5) * 20;
      } else {
        // Completely spread out
        randomPositions[0] = 20 + Math.random() * 50;
        randomPositions[1] = 70 + Math.random() * 40;
        randomPositions[2] = 110 + Math.random() * 40;
        randomPositions[3] = 150 + Math.random() * 30;
      }
      
      // Ensure all positions are within bounds and round them
      return randomPositions.map(pos => {
        const clampedPos = Math.max(minTop, Math.min(maxTop, pos));
        return Math.round(clampedPos);
      });
    }
    
    // Store initial positions by data-order with highly randomized tops
    const initialPositions = {};
    const randomTops = generateRandomTopPositions();
    
    
    
    $cards.each(function(index) {
      const $card = $(this);
      const order = $card.attr('data-order');
      const orderIndex = parseInt(order) - 1;
      
      const computedStyle = window.getComputedStyle(this);
      const left = parseFloat(computedStyle.left) || 0;
      const zIndex = parseInt(computedStyle.zIndex) || parseInt(order);
      
      // Assign random top position (no longer sorted)
      const randomTop = randomTops[orderIndex];
      
      initialPositions[order] = { 
        left, 
        top: randomTop, 
        zIndex 
      };
      
      gsap.set(this, { 
        x: 0, 
        y: 0,
        top: randomTop + 'px'
      });
      
      
    });
    
    // Update counter display
    function updateCounter() {
      $counter.text(`${currentSlidePosition}/${totalCards}`);
    }
    
    // Update arrow states based on current position
    function updateArrowStates() {
      // Update left arrow
      if (currentSlidePosition === 1) {
        $prevBtn.addClass('is-disabled');
      } else {
        $prevBtn.removeClass('is-disabled');
      }
      
      // Update right arrow
      if (currentSlidePosition === maxSlidePosition) {
        $nextBtn.addClass('is-disabled');
      } else {
        $nextBtn.removeClass('is-disabled');
      }
    }
    
    function resetCards() {
      if (isAnimating) return;
      isAnimating = true;
    
      
      let completed = 0;
      $cards.each(function() {
        const order = $(this).attr('data-order');
        gsap.to(this, {
          x: 0,
          y: 0,
          zIndex: initialPositions[order].zIndex,
          duration: 0.7,
          ease: "power2.out",
          onComplete: function() {
            completed++;
            if (completed === $cards.length) {
              isAnimating = false;
              currentSlidePosition = 1;
              updateCounter();
              updateArrowStates();
            }
          }
        });
      });
    }
    
    
    // Navigation functions
    function goToPreviousCard() {
      if (isAnimating || $prevBtn.hasClass('is-disabled')) return;
      
      if (currentSlidePosition > 1) {
        currentSlidePosition--;
        pushCardsToPosition();
      }
    }
    
    function goToNextCard() {
      if (isAnimating || $nextBtn.hasClass('is-disabled')) return;
      
      if (currentSlidePosition < maxSlidePosition) {
        currentSlidePosition++;
        pushCardsToPosition();
      }
    }
    
    // New function to handle pushing cards based on current slide position
    function pushCardsToPosition() {
      if (isAnimating) return;
      isAnimating = true;
      
      // Get actual card width dynamically to work with fluid typography
      const cardWidth = $cards.first().outerWidth();
      const revealPercentage = 0.95;
      
      // Get all card orders and sort them
      const cardOrders = [];
      $cards.each(function() {
        cardOrders.push(parseInt($(this).attr('data-order')));
      });
      cardOrders.sort((a, b) => a - b);
      
      // Determine how many cards should be pushed (currentSlidePosition - 1)
      const cardsToPush = currentSlidePosition - 1;
      
      let completed = 0;
      
      $cards.each(function() {
        const currentOrder = parseInt($(this).attr('data-order'));
        const currentOrderIndex = cardOrders.indexOf(currentOrder);
        
        let targetX = 0;
        let targetZIndex = initialPositions[currentOrder.toString()].zIndex;
        
        // If this card should be pushed (it's among the highest order cards to push)
        if (cardsToPush > 0 && currentOrderIndex >= (totalCards - cardsToPush)) {
          // All pushed cards go to the same position to maintain stacking
          targetX = cardWidth * revealPercentage;
        }
        
        // If this is the frontmost visible card, give it highest z-index
        if (cardsToPush === 0 || currentOrderIndex === (totalCards - cardsToPush - 1)) {
          targetZIndex = 100;
        }
        
        gsap.to(this, {
          x: targetX,
          y: 0,
          zIndex: targetZIndex,
          duration: 0.7,
          ease: "power2.out",
          onComplete: function() {
            completed++;
            if (completed === $cards.length) {
              isAnimating = false;
              updateCounter();
              updateArrowStates();
            }
          }
        });
      });
    }
    
    // Card click handlers
    $cards.each(function() {
      const $card = $(this);
      const order = $card.attr('data-order');
      
      $card.on('mousedown.testimonials', function(e) {
        e.stopImmediatePropagation();
        
        if (isAnimating) return;
        
        // Get all card orders and sort them (lowest to highest)
        const cardOrders = [];
        $cards.each(function() {
          cardOrders.push(parseInt($(this).attr('data-order')));
        });
        cardOrders.sort((a, b) => a - b);
        
        const clickedOrder = parseInt(order);
        const clickedOrderIndex = cardOrders.indexOf(clickedOrder);
        
        // Determine which card is currently the frontmost visible card
        const cardsToPush = currentSlidePosition - 1;
        const frontmostVisibleIndex = totalCards - cardsToPush - 1;
        
        // If we're at position 1 and clicked the lowest order card (frontmost), do nothing
        if (currentSlidePosition === 1 && clickedOrderIndex === frontmostVisibleIndex) {
          return;
        }
        
        // If clicked card is currently the frontmost visible card and we're not at position 1, reset to position 1
        if (clickedOrderIndex === frontmostVisibleIndex && currentSlidePosition !== 1) {
          resetCards();
          return;
        }
        
        // If clicked a card that's currently pushed (not visible), bring it to front
        if (clickedOrderIndex > frontmostVisibleIndex) {
          // Calculate how many cards need to be pushed to make this card the frontmost visible
          const newCardsToPush = totalCards - clickedOrderIndex - 1;
          currentSlidePosition = newCardsToPush + 1;
          pushCardsToPosition();
          return;
        }
        
        // If clicked a card that's behind the current frontmost visible card, make it frontmost
        if (clickedOrderIndex < frontmostVisibleIndex) {
          const newCardsToPush = totalCards - clickedOrderIndex - 1;
          currentSlidePosition = newCardsToPush + 1;
          pushCardsToPosition();
        }
      });
      
      $card.on('click.testimonials', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      });
    });
    
    // Control button handlers
    $prevBtn.on('click.testimonials', function(e) {
      e.preventDefault();
      e.stopPropagation();
      goToPreviousCard();
    });
    
    $nextBtn.on('click.testimonials', function(e) {
      e.preventDefault();
      e.stopPropagation();
      goToNextCard();
    });
    
    // Initialize counter and arrow states
    updateCounter();
    updateArrowStates();
  } else {
    // Tablet and below: initialize Swiper on the existing Webflow structure
    // Hide controls (no arrows/counter/pagination on mobile)
    if ($controlsWrapper && $controlsWrapper.length) {
      $controlsWrapper.css('display', 'none');
    }

    // Clear transforms and reset desktop-locked styles (height, left, z-index)
    gsap.set($cards, { clearProps: 'x,y,top,zIndex,transform' });
    $cards.each(function() {
      this.style.left = '0px';
      this.style.height = 'auto';
      this.style.zIndex = 'auto';
    });

    // Determine the container for Swiper: prefer the Webflow list wrapper's parent
    const containerEl = $wrapper.closest('.w-dyn-list').get(0) || $wrapper.get(0);
    const isWrapperContainer = containerEl === $wrapper.get(0);

    if (typeof Swiper === 'undefined') {
      console.warn('Swiper library not found for testimonials.');
      return;
    }

    // If container is not the wrapper itself, add standard Swiper classes
    if (!isWrapperContainer) {
      containerEl.classList.add('swiper');
      $wrapper.addClass('swiper-wrapper');
      $cards.addClass('swiper-slide');
      // Accessibility roles
      $wrapper.attr('role', 'list');
      $cards.attr('role', 'listitem');

      const applyA11yRoles = () => {
        $wrapper.attr('role', 'list');
        $cards.attr('role', 'listitem');
      };

      new Swiper(containerEl, {
        slidesPerView: window.innerWidth <= 768 ? 1.05 : 1.05,
        spaceBetween: 16,
        centeredSlides: false,
        loop: false,
        allowTouchMove: true,
        grabCursor: true,
        watchOverflow: true,
        observeParents: true,
        observer: true,
        resizeObserver: true,
        a11y: { enabled: false },
        on: {
          init: applyA11yRoles,
          update: applyA11yRoles
        }
      });
    } else {
      // If wrapper is also the container, use wrapperClass/slideClass config
      const applyA11yRoles = () => {
        $wrapper.attr('role', 'list');
        $cards.attr('role', 'listitem');
      };

      new Swiper(containerEl, {
        wrapperClass: 'testimonials_list-wrapper',
        slideClass: 'testimonials_item',
        slidesPerView: window.innerWidth <= 768 ? 1.1 : 1.2,
        spaceBetween: 16,
        centeredSlides: false,
        loop: false,
        allowTouchMove: true,
        grabCursor: true,
        watchOverflow: true,
        observeParents: true,
        observer: true,
        resizeObserver: true,
        a11y: { enabled: false },
        on: {
          init: applyA11yRoles,
          update: applyA11yRoles
        }
      });
      // Accessibility roles when wrapper is also container
      $wrapper.attr('role', 'list');
      $cards.attr('role', 'listitem');
    }
  }
  }  // Close initTestimonials function
  
  // Initialize when GSAP is ready using AnimationManager with polling fallback
  (function waitForAnimationManager() {
    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
      window.AnimationManager.onReady(initTestimonials);
    } else {
      let attempts = 0;
      const maxAttempts = 100; // 5s
      const timer = setInterval(function() {
        attempts++;
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
          clearInterval(timer);
          window.AnimationManager.onReady(initTestimonials);
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          console.error('AnimationManager not loaded for testimonials');
        }
      }, 50);
    }
  })();
/*
  function initReelsAnimation() {
      if (!window.gsap || !window.ScrollTrigger) {
        console.warn('GSAP or ScrollTrigger not loaded for reels animation');
        return;
      }
      
      const isMobile = window.innerWidth <= 768;
      const duration = isMobile ? 0.35 : 0.4;
      
      
      gsap.set('[data-section="reels"] [data-left-col], [data-section="reels"] [data-center-col], [data-section="reels"] [data-right-col]', {
        opacity: 0,
        x: 0,
        y: 0
    });
    
    gsap.set('[data-section="reels"] [data-left-col]', { x: -50 });
    gsap.set('[data-section="reels"] [data-right-col]', { x: 50 });
    gsap.set('[data-section="reels"] [data-center-col]', { y: 50 });
    
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '[data-section="reels"]',
            start: 'top 80%',
            once: true
        }
    });
    
    tl.to('[data-section="reels"] [data-left-col]', {
        opacity: 1,
        x: 0,
        duration: duration,
        ease: 'power2.out'
    })
    .to('[data-section="reels"] [data-center-col]', {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: 'power2.out'
    }, '-=0.3')
    .to('[data-section="reels"] [data-right-col]', {
        opacity: 1,
        x: 0,
        duration: duration,
        ease: 'power2.out'
    }, '-=0.3');
    
    gsap.to('[data-section="reels"] [data-left-col]', {
        y: -80,
        scrollTrigger: {
            trigger: '[data-section="reels"]',
            start: 'top 100%',
            end: 'bottom 0%',
            scrub: 0.5
        }
    });
    
    gsap.to('[data-section="reels"] [data-right-col]', {
        y: 80,
        scrollTrigger: {
            trigger: '[data-section="reels"]',
            start: 'top 100%',
            end: 'bottom 0%',
            scrub: 0.5
        }
    })
    }
    
    // Initialize when GSAP is ready using AnimationManager with polling fallback
    (function waitForAnimationManagerReels() {
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            window.AnimationManager.onReady(initReelsAnimation);
        } else {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(initReelsAnimation);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.error('AnimationManager not loaded for reels animation');
                }
            }, 50);
        }
    })();
*/
});