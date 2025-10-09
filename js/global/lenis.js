const isDesktop = window.innerWidth > 991;

if (isDesktop) {
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

    // Stop lenis initially
    lenis.stop();

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrate Lenis with ScrollTrigger
    // This ensures ScrollTrigger updates when Lenis scrolls
    lenis.on('scroll', () => {
        if (window.ScrollTrigger) {
            ScrollTrigger.update();
        }
    });

    // Start lenis after document is fully loaded
    window.addEventListener('load', function() {
        lenis.start();
    });
}
