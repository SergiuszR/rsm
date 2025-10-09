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
        const hideThreshold = 5; // Amount to scroll down before hiding
        const showVelocity = 3; // Velocity threshold for dynamic upward scroll/swipe
        const minScrollPos = 100; // Minimum scroll position before hiding navbar

        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: self => {
                const currentY = self.scroll();
                const scrollDiff = currentY - lastY;
                const velocity = self.getVelocity(); // Get scroll velocity
                const isBannerVisible = $banner.length > 0 && $banner.css('display') !== 'none';

                // Scrolling DOWN - hide navbar with threshold
                if (scrollDiff > hideThreshold && currentY > minScrollPos) {
                    if (!$navbar.hasClass('is-pinned')) {
                        $navbar.addClass('is-pinned');
                        gsap.to($navbar, { y: -$navbar.outerHeight(), duration: 0.3, ease: "power2.out" });
                    }
                } 
                // Dynamic UPWARD scroll/swipe - detect velocity
                else if (velocity < -showVelocity) {
                    if ($navbar.hasClass('is-pinned')) {
                        $navbar.removeClass('is-pinned');
                        gsap.to($navbar, { y: 0, duration: 0.3, ease: "power2.out" });
                    }
                }

                lastY = currentY;
            }
        });
        }
        
        }
    })();
});

