// Isolated Testimonials Script - No Webflow interference
(function() {
    'use strict';
    
    console.log('[Isolated Testimonials] Starting...');
    
    // Wait for DOM and ensure Webflow is done
    function initTestimonials() {
        if (typeof $ === 'undefined' || typeof gsap === 'undefined') {
            console.error('[Isolated Testimonials] Required libraries not found');
            return;
        }
        
        const $wrapper = $('.testimonials_list-wrapper');
        const $cards = $wrapper.find('.testimonials_item');
        const $controlsWrapper = $('.slider_controls-wrapper');
        const $prevBtn = $('[data-slider-previous]');
        const $nextBtn = $('[data-slider-next]');
        const $counter = $controlsWrapper.find('.text-weight-bold');
        
        if ($wrapper.length === 0) {
            console.log('[Isolated Testimonials] No wrapper found, skipping');
            return;
        }
        
        if ($cards.length === 0) {
            console.log('[Isolated Testimonials] No cards found, skipping');
            return;
        }
        
        if ($controlsWrapper.length === 0) {
            console.log('[Isolated Testimonials] No controls found, skipping');
            return;
        }
        
        console.log('[Isolated Testimonials] Found', $cards.length, 'cards, initializing...');
        
        let isAnimating = false;
        let activeCardOrder = "4";
        const totalCards = $cards.length;
        
        // Generate random top positions
        function generateRandomTopPositions() {
            const minTop = 20;
            const maxTop = 180;
            const positions = [];
            
            const randomPositions = [
                minTop + Math.random() * (maxTop - minTop),
                minTop + Math.random() * (maxTop - minTop),
                minTop + Math.random() * (maxTop - minTop),
                minTop + Math.random() * (maxTop - minTop)
            ];
            
            const randomFactor = Math.random();
            
            if (randomFactor < 0.3) {
                const basePosition = 60 + Math.random() * 80;
                randomPositions[0] = basePosition + (Math.random() - 0.5) * 40;
                randomPositions[1] = basePosition + (Math.random() - 0.5) * 40;
                randomPositions[2] = basePosition + 50 + Math.random() * 60;
                randomPositions[3] = basePosition + 50 + Math.random() * 60;
            } else if (randomFactor < 0.6) {
                const group1 = 40 + Math.random() * 40;
                const group2 = 120 + Math.random() * 40;
                randomPositions[0] = group1 + (Math.random() - 0.5) * 20;
                randomPositions[1] = group1 + (Math.random() - 0.5) * 20;
                randomPositions[2] = group2 + (Math.random() - 0.5) * 20;
                randomPositions[3] = group2 + (Math.random() - 0.5) * 20;
            } else {
                randomPositions[0] = 20 + Math.random() * 50;
                randomPositions[1] = 70 + Math.random() * 40;
                randomPositions[2] = 110 + Math.random() * 40;
                randomPositions[3] = 150 + Math.random() * 30;
            }
            
            return randomPositions.map(pos => {
                const clampedPos = Math.max(minTop, Math.min(maxTop, pos));
                return Math.round(clampedPos);
            });
        }
        
        // Store initial positions
        const initialPositions = {};
        const randomTops = generateRandomTopPositions();
        
        $cards.each(function(index) {
            const $card = $(this);
            const order = $card.attr('data-order');
            const orderIndex = parseInt(order) - 1;
            
            const computedStyle = window.getComputedStyle(this);
            const left = parseFloat(computedStyle.left) || 0;
            const zIndex = parseInt(computedStyle.zIndex) || parseInt(order);
            
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
            const currentPosition = parseInt(activeCardOrder);
            $counter.text(`${currentPosition}/${totalCards}`);
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
                            activeCardOrder = "4";
                            updateCounter();
                        }
                    }
                });
            });
        }
        
        function activateCard(targetOrder) {
            if (isAnimating || targetOrder === activeCardOrder) return;
            isAnimating = true;
            
            const cardWidth = 672;
            const revealPercentage = 0.95;
            const targetOrderNum = parseInt(targetOrder);
            
            let firstCardToMove = null;
            let minOrderToMove = Infinity;
            
            $cards.each(function() {
                const currentOrderNum = parseInt($(this).attr('data-order'));
                if (currentOrderNum > targetOrderNum && currentOrderNum < minOrderToMove) {
                    minOrderToMove = currentOrderNum;
                    firstCardToMove = $(this);
                }
            });
            
            let moveAmount = 0;
            if (firstCardToMove) {
                const targetCardLeft = initialPositions[targetOrder].left;
                const firstCardToMoveLeft = initialPositions[minOrderToMove.toString()].left;
                
                const neededPosition = targetCardLeft + (cardWidth * revealPercentage);
                moveAmount = neededPosition - firstCardToMoveLeft;
            }
            
            let completed = 0;
            
            $cards.each(function() {
                const currentOrder = $(this).attr('data-order');
                const currentOrderNum = parseInt(currentOrder);
                
                let targetX = 0;
                
                if (currentOrderNum > targetOrderNum) {
                    targetX = moveAmount;
                }
                
                gsap.to(this, {
                    x: targetX,
                    y: 0,
                    zIndex: currentOrder === targetOrder ? 100 : initialPositions[currentOrder].zIndex,
                    duration: 0.7,
                    ease: "power2.out",
                    onComplete: function() {
                        completed++;
                        if (completed === $cards.length) {
                            isAnimating = false;
                            activeCardOrder = targetOrder;
                            updateCounter();
                        }
                    }
                });
            });
        }
        
        // Navigation functions
        function goToPreviousCard() {
            if (isAnimating) return;
            
            const currentOrderNum = parseInt(activeCardOrder);
            const previousOrderNum = currentOrderNum - 1;
            
            if (previousOrderNum >= 1) {
                activateCard(previousOrderNum.toString());
            }
        }
        
        function goToNextCard() {
            if (isAnimating) return;
            
            const currentOrderNum = parseInt(activeCardOrder);
            const nextOrderNum = currentOrderNum + 1;
            
            if (nextOrderNum <= totalCards) {
                activateCard(nextOrderNum.toString());
            }
        }
        
        // Card click handlers
        $cards.each(function() {
            const $card = $(this);
            const order = $card.attr('data-order');
            
            $card.on('mousedown.testimonials', function(e) {
                e.stopImmediatePropagation();
                
                if (isAnimating) return;
                
                if (order === "4" && activeCardOrder === "4") {
                    return;
                }
                
                if (order === activeCardOrder && activeCardOrder !== "4") {
                    resetCards();
                } else {
                    activateCard(order);
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
        
        // Initialize counter
        updateCounter();
        
        console.log('[Isolated Testimonials] Initialization complete');
    }
    
    // Wait for everything to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initTestimonials, 500);
        });
    } else {
        setTimeout(initTestimonials, 500);
    }
})();
