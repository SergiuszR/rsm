$(document).ready(function () {
    // Wait for GSAP and ScrollTrigger to be ready
    
    (function waitForAnimationManager() {
        if (!window.AnimationManager || typeof window.AnimationManager.onReady !== 'function') {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(init);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.error('AnimationManager not loaded for navbar');
                }
            }, 50);
        } else {
            window.AnimationManager.onReady(init);
        }
        
        function init() {
        gsap.registerPlugin(ScrollTrigger);

        const $navbar = $('[data-element="navbar"]');
        const $banner = $('[data-element="banner"]');

        if ($navbar.length > 0) {
        let lastY = 0;
        const threshold = 5;

        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: self => {
                const currentY = self.scroll();
                const scrollDiff = currentY - lastY;
                const isBannerVisible = $banner.length > 0 && $banner.css('display') !== 'none';

                if (Math.abs(scrollDiff) > threshold) {
                    if (scrollDiff > 0 && currentY > 50) {
                        // Scrolling down
                        if (!$navbar.hasClass('is-pinned')) {
                            $navbar.addClass('is-pinned');
                            gsap.to($navbar, { y: -$navbar.outerHeight(), duration: 0.3, ease: "power2.out" });
                        }
                    } else if (scrollDiff < 0) {
                        // Scrolling up
                        if ($navbar.hasClass('is-pinned')) {
                            $navbar.removeClass('is-pinned');
                            gsap.to($navbar, { y: 0, duration: 0.3, ease: "power2.out" });
                        }
                    }

                    lastY = currentY;
                }
            }
        });
        }
        
        }
    })();
});

