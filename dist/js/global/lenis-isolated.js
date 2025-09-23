// Isolated Lenis Script - No Webflow interference
(function() {
    'use strict';
    
    console.log('[Isolated Lenis] Starting...');
    
    function initLenis() {
        const isDesktop = window.innerWidth > 991;
        
        if (isDesktop) {
            console.log('[Isolated Lenis] Desktop detected, initializing smooth scroll...');
            
            const lenis = new Lenis({
                duration: 1.05,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
                autoRaf: false,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
            
            console.log('[Isolated Lenis] Smooth scroll initialized');
        } else {
            console.log('[Isolated Lenis] Mobile detected, skipping smooth scroll');
        }
        
        console.log('[Isolated Lenis] Initialization complete');
    }
    
    // Wait for everything to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initLenis, 500);
        });
    } else {
        setTimeout(initLenis, 500);
    }
})();
