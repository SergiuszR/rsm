console.log('[Lenis Script] Initializing...');

const isDesktop = window.innerWidth > 991;

if (isDesktop) {
    console.log('[Lenis Script] Desktop detected, initializing smooth scroll...');
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
    
    console.log('[Lenis Script] Smooth scroll initialized');
} else {
    console.log('[Lenis Script] Mobile detected, skipping smooth scroll');
}

console.log('[Lenis Script] Initialization complete');