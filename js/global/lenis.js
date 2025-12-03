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

    window.RSMLenis = lenis; // debugging helper

    const scrollerElement = document.documentElement;
    let currentScroll = window.scrollY || 0;
    let scrollProxyConfigured = false;

    lenis.stop();
    let lenisStarted = false;

    function startLenisIfNeeded() {
        if (lenisStarted) return;
        lenisStarted = true;
        lenis.start();
        setupScrollTriggerProxy();
    }

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on('scroll', ({ scroll }) => {
        currentScroll = scroll;
        if (window.ScrollTrigger) {
            ScrollTrigger.update();
        }
    });

    function setupScrollTriggerProxy() {
        if (!window.ScrollTrigger || scrollProxyConfigured) return;

        ScrollTrigger.scrollerProxy(scrollerElement, {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                } else {
                    return currentScroll;
                }
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },
            pinType: scrollerElement.style.transform ? 'transform' : 'fixed'
        });

        try {
            ScrollTrigger.defaults({ scroller: scrollerElement });
        } catch (e) {}

        ScrollTrigger.addEventListener('refresh', () => lenis.update && lenis.update());
        ScrollTrigger.refresh();
        scrollProxyConfigured = true;
    }

    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
        window.AnimationManager.onReady(setupScrollTriggerProxy);
    } else {
        const waitForST = setInterval(() => {
            if (window.ScrollTrigger) {
                clearInterval(waitForST);
                setupScrollTriggerProxy();
            }
        }, 50);
    }

    if (document.readyState === 'complete') {
        startLenisIfNeeded();
    } else {
        window.addEventListener('load', startLenisIfNeeded);
    }
}
