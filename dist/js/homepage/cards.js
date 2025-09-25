$(document).ready(function() {
    const cards = document.querySelectorAll('.social-update-item-wrapper');
    const container = document.querySelector('.social_update-slider-wrapper');
    
    if (!container || cards.length === 0) return;
    
    const stackGap = 20;
    const topEdge = 150;
    const reverseEffect = true;
    const viewportHeight = window.innerHeight;
    
    // Responsive container height that scales with viewport width
    function getResponsiveMaxHeight() {
        const vw = window.innerWidth;
        
        if (vw >= 1441) {
            // Large desktop - scale up significantly
            return 4000 + (vw - 1441) * 2; // Increases by 2px per viewport pixel above 1441px
        } else if (vw >= 1200) {
            // Desktop - moderate scaling
            return 3200 + (vw - 1200) * 3.32; // Scales from 3200px to 4000px between 1200-1441px
        } else if (vw >= 992) {
            // Tablet landscape - smaller scaling
            return 2800 + (vw - 992) * 1.92; // Scales from 2800px to 3200px between 992-1200px
        } else if (vw >= 768) {
            // Tablet portrait
            return 2400 + (vw - 768) * 1.79; // Scales from 2400px to 2800px between 768-992px
        } else if (vw >= 480) {
            // Mobile landscape
            return 2000 + (vw - 480) * 1.39; // Scales from 2000px to 2400px between 480-768px
        } else {
            // Mobile portrait - minimum height
            return 1800 + (vw - 320) * 1.25; // Scales from 1800px to 2000px between 320-480px
        }
    }
    
    const calculatedHeight = cards.length * viewportHeight;
    const responsiveMaxHeight = getResponsiveMaxHeight();
    const totalHeight = Math.min(calculatedHeight, responsiveMaxHeight);
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
        const newResponsiveMaxHeight = getResponsiveMaxHeight();
        const newTotalHeight = Math.min(calculatedHeight, newResponsiveMaxHeight);
        container.style.height = `${newTotalHeight}px`;
        updateCards();
    });
});
r