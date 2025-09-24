$(document).ready(function() {
    gsap.registerPlugin(ScrollTrigger);
    
    const $navbar = $('[data-element="navbar"]');
    const $banner = $('[data-element="banner"]');
    
    if ($navbar.length > 0 && $banner.length > 0) {
        let lastY = 0;
        
        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: self => {
                // Check banner visibility on every scroll update
                if ($banner.css('display') === 'none') {
                    // Banner is hidden, remove pinned class and exit
                    if ($navbar.hasClass('is-pinned')) {
                        $navbar.removeClass('is-pinned');
                    }
                    return;
                }
                
                const currentY = self.scroll();
                
                if (currentY > lastY && currentY > 50) {
                    // Scrolling down
                    if (!$navbar.hasClass('is-pinned')) {
                        $navbar.addClass('is-pinned');
                    }
                } else if (currentY < lastY) {
                    // Scrolling up
                    if ($navbar.hasClass('is-pinned')) {
                        $navbar.removeClass('is-pinned');
                    }
                }
                
                lastY = currentY;
            }
        });
    }
});