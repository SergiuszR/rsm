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
        
        // Webflow desktop breakpoint
        const DESKTOP_BREAKPOINT = 992;
        
        function isDesktop() {
            return window.innerWidth >= DESKTOP_BREAKPOINT;
        }

        if ($navbar.length > 0) {
        let lastY = 0;
        let scrollTriggerInstance = null;
        const hideThreshold = 5; // Amount to scroll down before hiding
        const showVelocity = 3; // Velocity threshold for dynamic upward scroll/swipe
        const minScrollPos = 100; // Minimum scroll position before hiding navbar

        function setupScrollTrigger() {
            // Kill existing instance if any
            if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
                scrollTriggerInstance = null;
            }
            
            // Reset navbar state on mobile/tablet
            if (!isDesktop()) {
                $navbar.removeClass('is-pinned');
                gsap.set($navbar, { y: 0 });
                return;
            }
            
            // Only create ScrollTrigger on desktop
            scrollTriggerInstance = ScrollTrigger.create({
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
        
        // Initial setup
        setupScrollTrigger();
        
        // Handle resize to toggle between desktop and mobile behavior
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                setupScrollTrigger();
            }, 150);
        }, { passive: true });
        }
        
        }
    })();
});

