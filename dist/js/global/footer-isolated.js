// Isolated Footer Script - No Webflow interference
(function() {
    'use strict';
    
    console.log('[Isolated Footer] Starting...');
    
    function initFooter() {
        const footerWrapper = document.querySelector('.footer_text-wrapper');
        const footerTexts = document.querySelectorAll('.footer-text-name');
        
        if (!footerWrapper) {
            console.log('[Isolated Footer] Footer wrapper not found, skipping');
            return;
        }
        
        if (footerTexts.length === 0) {
            console.log('[Isolated Footer] Footer texts not found, skipping');
            return;
        }
        
        console.log('[Isolated Footer] Found', footerTexts.length, 'footer texts, initializing...');
        
        // Clone texts
        footerTexts.forEach(function(text) {
            const clone = text.cloneNode(true);
            footerWrapper.appendChild(clone);
        });
        
        const allTexts = document.querySelectorAll('.footer-text-name');
        const textWidth = allTexts[0].offsetWidth;
        
        // Create animation timeline
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(allTexts, {
            x: -textWidth,
            duration: 40,
            ease: 'none',
            onComplete: function() {
                gsap.set(allTexts, { x: 0 });
            }
        });
        
        // Hover effects
        footerWrapper.addEventListener('mouseenter', function() {
            gsap.to(tl, {
                timeScale: -0.5,
                duration: 0.5,
                ease: 'power1.inOut'
            });
        });
        
        footerWrapper.addEventListener('mouseleave', function() {
            gsap.to(tl, {
                timeScale: 1,
                duration: 0.5,
                ease: 'power1.inOut'
            });
        });
        
        console.log('[Isolated Footer] Initialization complete');
    }
    
    // Wait for everything to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initFooter, 500);
        });
    } else {
        setTimeout(initFooter, 500);
    }
})();
