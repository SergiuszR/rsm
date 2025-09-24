$(document).ready(function() {
    const cards = document.querySelectorAll('.social-update-item-wrapper');
    const container = document.querySelector('.social_update-slider-wrapper');
    
    if (!container || cards.length === 0) return;
    
    const stackGap = 20;
    const topEdge = 150;
    const reverseEffect = true;
    const viewportHeight = window.innerHeight;
    
    // Container height capped at 4000px
    const calculatedHeight = cards.length * viewportHeight;
    const totalHeight = Math.min(calculatedHeight, 4000);
    container.style.height = `${totalHeight}px`;
    
    const activatedCards = new Set();
    
    cards.forEach((card, index) => {
        card.style.position = 'sticky';
        card.style.top = `${topEdge}px`; 
        card.style.height = `40rem`;
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'center';
        card.style.zIndex = index + 1; 
        card.style.transition = 'transform 0.5s ease';
        card.style.margin = '0px auto';
        
        // Initial positioning with transform
        const initialOffset = stackGap * index;
        if (reverseEffect) {
            card.style.transform = `translateY(${initialOffset}px) scale(1)`;
        } else {
            card.style.transform = `translateY(${initialOffset}px) scale(0.84)`;
        }
    });
    
    function updateCards() {
        const scrollPosition = window.scrollY;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const cardTopInViewport = rect.top;
            const cardBottomInViewport = rect.bottom;
            const triggerPosition = viewportHeight * 0.7;
            
            // Calculate the offset for stacking
            const stackOffset = stackGap * index;
            
            // Determine if card should be activated
            const shouldActivate = cardTopInViewport <= triggerPosition && cardBottomInViewport > 0;
            
            if (reverseEffect) {
                if (shouldActivate && !activatedCards.has(index)) {
                    activatedCards.add(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(0.84)`;
                } else if (!shouldActivate && activatedCards.has(index)) {
                    activatedCards.delete(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(1)`;
                }
            } else {
                if (shouldActivate && !activatedCards.has(index)) {
                    activatedCards.add(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(1)`;
                } else if (!shouldActivate && activatedCards.has(index)) {
                    activatedCards.delete(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(0.84)`;
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
        const calculatedHeight = cards.length * newViewportHeight;
        const newTotalHeight = Math.min(calculatedHeight, 4000);
        container.style.height = `${newTotalHeight}px`;
        updateCards();
    });
});
r