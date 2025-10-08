$(document).ready(function () {
    // Wait for GSAP and ScrollTrigger to be ready
    if (!window.AnimationManager) {
        console.error('AnimationManager not loaded for navbar');
        return;
    }
    
    window.AnimationManager.onReady(function() {
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
    });
});

