// Webflow-compatible initialization
window.Webflow = window.Webflow || [];
window.Webflow.push(function() {
    console.log('[Cards Script] Webflow ready - Initializing...');
    
    // Wait a bit for Webflow to finish its DOM manipulation
    setTimeout(function() {
        const cards = document.querySelectorAll('.social-update-item-wrapper');
        const container = document.querySelector('.social_update-slider-wrapper');
        
        // Check if required elements exist
        if (!container) {
            console.log('[Cards Script] Container .social_update-slider-wrapper not found. Skipping initialization.');
            return;
        }
        
        if (cards.length === 0) {
            console.log('[Cards Script] No cards found with .social-update-item-wrapper. Skipping initialization.');
            return;
        }
        
        console.log('[Cards Script] Found', cards.length, 'cards and container. Initializing...');
    
    const stackGap = 20;
    const topEdge = 25;
    
    // Toggle variable: false = 0.84 → 1.0, true = 1.0 → 0.84
    const reverseEffect = true;
    
    const viewportHeight = window.innerHeight;
    const totalHeight = (cards.length * viewportHeight);
    container.style.height = `${totalHeight}px`;
    
    const activatedCards = new Set();
    
    cards.forEach((card, index) => {
      card.style.position = 'sticky';
      card.style.top = `${topEdge + (stackGap * index)}px`;
      card.style.height = `calc(100vh - ${topEdge}px)`;
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.zIndex = index + 1;
      card.style.transition = 'transform 0.5s ease';
      card.style.margin = '0px auto';
      
      // Set initial scale based on effect direction
      if (reverseEffect) {
        card.style.transform = 'scale(1)'; // Start at scale 1
      } else {
        card.style.transform = 'scale(0.84)'; // Start at scale 0.84
      }
    });
    
    function updateCards() {
      const scrollPosition = window.scrollY;
      const currentVisibleCard = Math.floor(scrollPosition / viewportHeight);
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardTopInViewport = rect.top;
        const cardBottomInViewport = rect.bottom;
        
        const triggerPosition = viewportHeight * 0.7;
        
        if (reverseEffect) {
          // Reverse effect: 1.0 → 0.84
          if (cardTopInViewport <= triggerPosition && cardBottomInViewport > 0 && !activatedCards.has(index)) {
            activatedCards.add(index);
            card.style.transform = 'scale(0.84)';
          }
          
          if (cardTopInViewport > triggerPosition && activatedCards.has(index)) {
            activatedCards.delete(index);
            card.style.transform = 'scale(1)';
          }
        } else {
          // Normal effect: 0.84 → 1.0
          if (cardTopInViewport <= triggerPosition && cardBottomInViewport > 0 && !activatedCards.has(index)) {
            activatedCards.add(index);
            card.style.transform = 'scale(1)';
          }
          
          if (cardTopInViewport > triggerPosition && activatedCards.has(index)) {
            activatedCards.delete(index);
            card.style.transform = 'scale(0.84)';
          }
        }
      });
    }
    
    updateCards();
    
    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateCards);
    });
    
    window.addEventListener('resize', () => {
      const newViewportHeight = window.innerHeight;
      const newTotalHeight = (cards.length * newViewportHeight);
      container.style.height = `${newTotalHeight}px`;
      
      cards.forEach((card, index) => {
        card.style.top = `${topEdge + (stackGap * index)}px`;
        card.style.height = `calc(100vh - ${topEdge}px)`;
      });
      
      updateCards();
    });
    
        console.log('[Cards Script] Initialization complete');
    }, 100); // Small delay to let Webflow finish
});