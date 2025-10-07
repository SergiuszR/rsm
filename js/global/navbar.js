$(document).ready(function () {
    gsap.registerPlugin(ScrollTrigger);

    const $navbar = $('[data-element="navbar"]');
    const $banner = $('[data-element="banner"]');

    if ($navbar.length > 0) {
        let lastY = 0;

        ScrollTrigger.create({
            start: "top top",
            end: "max",
            onUpdate: self => {
                const currentY = self.scroll();
                const isBannerVisible = $banner.length > 0 && $banner.css('display') !== 'none';

                if (currentY > lastY && currentY > 50) {
                    if (!$navbar.hasClass('is-pinned')) {
                        $navbar.addClass('is-pinned');
                        gsap.to($navbar, { y: -$navbar.outerHeight(), duration: 0.3, ease: "power2.out" });
                    }
                } else if (currentY < lastY) {
                    if ($navbar.hasClass('is-pinned')) {
                        $navbar.removeClass('is-pinned');
                        gsap.to($navbar, { y: 0, duration: 0.3, ease: "power2.out" });
                    }
                }

                lastY = currentY;
            }
        });
    }
});

document.addEventListener('click', e => { if (e.target.closest('.w-nav-button')) setTimeout(() => { const isOpen = document.querySelector('.w--open'); document.documentElement.style.overflow = isOpen ? 'hidden' : ''; document.body.style.overflow = isOpen ? 'hidden' : ''; }, 50); });

