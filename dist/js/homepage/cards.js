$(document).ready(function() {
    const cards = document.querySelectorAll('.social-update-item-wrapper');
    const container = document.querySelector('.social_update-slider-wrapper');
    
    if (!container || cards.length === 0) return;
    
    const stackGap = 20;
    const topEdge = 30;
    const reverseEffect = true;
    const viewportHeight = window.innerHeight;
    
    // Dynamic container height calculation
    function calculateDynamicHeight() {
        // Calculate actual rem value based on fluid typography
        function getFluidRemValue() {
            const vw = window.innerWidth;
            let remInPx;
            
            if (vw >= 1441) {
                // html { font-size: calc(1rem + 0.25vw); }
                remInPx = 16 + (0.17 * vw / 100);
            } else if (vw >= 992) {
                // html { font-size: calc(0.39866369710467703rem + 0.6681514476614699vw); }
                remInPx = (0.39866369710467703 * 16) + (0.6681514476614699 * vw / 100);
            } else if (vw >= 768) {
                // html { font-size: calc(0.1704799107142858rem + 1.3392857142857142vw); }
                remInPx = (0.1704799107142858 * 16) + (1.3392857142857142 * vw / 100);
            } else if (vw >= 480) {
                // html { font-size: calc(0.6671006944444444rem + 0.6944444444444444vw); }
                remInPx = (0.6671006944444444 * 16) + (0.6944444444444444 * vw / 100);
            } else {
                // html { font-size: calc(0.8747384937238494rem + 0.41841004184100417vw); }
                remInPx = (0.8747384937238494 * 16) + (0.41841004184100417 * vw / 100);
            }
            
            return remInPx;
        }
        
        const remValue = getFluidRemValue();
        const cardHeight = 40 * remValue; // 40rem in actual pixels
        const numberOfCards = cards.length;
        const vh = window.innerHeight;
        
        // Responsive calculation that scales with actual card size
        // Need more space per card to prevent overlap
        const scrollSpacePerCard = cardHeight * 1.2; // Increased from 0.8 to 1.2
        const totalScrollSpace = numberOfCards * scrollSpacePerCard;
        
        // Increased buffers to ensure proper spacing
        const initialBuffer = Math.max(vh * 0.4, cardHeight * 0.6);
        const endBuffer = Math.max(vh * 0.4, cardHeight * 0.8); // Larger end buffer
        
        return totalScrollSpace + initialBuffer + endBuffer;
    }
    
    const dynamicHeight = calculateDynamicHeight();
    container.style.height = `${dynamicHeight}px`;
    
    const activatedCards = new Set();
    
    cards.forEach((card, index) => {
        card.style.position = 'sticky';
        card.style.top = `${topEdge}px`; 
        card.style.height = `45em`;
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
        const newDynamicHeight = calculateDynamicHeight();
        container.style.height = `${newDynamicHeight}px`;
        updateCards();
    });
});
