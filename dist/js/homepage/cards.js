(function () {
    if (window.__socialUpdateStickySwiperInit) return;
    window.__socialUpdateStickySwiperInit = true;

    const container = document.querySelector('.social_update-slider-wrapper');
    const slider = document.querySelector('.social-update-slider');
    const cards = document.querySelectorAll('.social-update-item-wrapper');
    if (!container || !slider || cards.length === 0) return;

    const DESKTOP_MQ = window.matchMedia('(min-width: 992px)');

    // ----- Desktop sticky settings
    const stackGap = 20;
    const topEdge = 30;
    const reverseEffect = true;
    let desktopActive = false;
    let scrollHandler = null;
    const activated = new Set();

    // ----- Swiper (tablet/mobile)
    let swiper = null;

    // Utilities
    function killHeightInline() {
        container.style.removeProperty('height');
        if (container.getAttribute('style') && container.getAttribute('style').trim() === '') {
            container.removeAttribute('style');
        }
    }
    function resetCardsInline() {
        cards.forEach(c => c.removeAttribute('style'));
        activated.clear();
    }
    function calcDynamicHeight() {
        const vw = window.innerWidth;
        let remInPx;
        if (vw >= 1441) {
            remInPx = 16 + (0.17 * vw / 100);
        } else if (vw >= 992) {
            remInPx = (0.39866369710467703 * 16) + (0.6681514476614699 * vw / 100);
        } else if (vw >= 768) {
            remInPx = (0.1704799107142858 * 16) + (1.3392857142857142 * vw / 100);
        } else if (vw >= 480) {
            remInPx = (0.6671006944444444 * 16) + (0.6944444444444444 * vw / 100);
        } else {
            remInPx = (0.8747384937238494 * 16) + (0.41841004184100417 * vw / 100);
        }
        const cardHeight = 40 * remInPx;
        const n = cards.length;
        const vh = window.innerHeight;
        const scrollSpacePerCard = cardHeight * 1.2;
        const totalScrollSpace = n * scrollSpacePerCard;
        const initialBuffer = Math.max(vh * 0.4, cardHeight * 0.6);
        const endBuffer = Math.max(vh * 0.4, cardHeight * 0.8);
        return totalScrollSpace + initialBuffer + endBuffer;
    }
    function updateCards() {
        const viewportHeight = window.innerHeight;
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const shouldActivate = rect.top <= viewportHeight * 0.7 && rect.bottom > 0;
            const stackOffset = stackGap * index;

            if (reverseEffect) {
                if (shouldActivate && !activated.has(index)) {
                    activated.add(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(0.84)`;
                } else if (!shouldActivate && activated.has(index)) {
                    activated.delete(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(1)`;
                }
            } else {
                if (shouldActivate && !activated.has(index)) {
                    activated.add(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(1)`;
                } else if (!shouldActivate && activated.has(index)) {
                    activated.delete(index);
                    card.style.transform = `translateY(${stackOffset}px) scale(0.84)`;
                }
            }
        });
    }

    // Desktop lifecycle
    function initDesktop() {
        if (desktopActive) return;
        container.style.height = `${calcDynamicHeight()}px`;

        cards.forEach((card, index) => {
            card.style.position = 'sticky';
            card.style.top = `${topEdge}px`;
            card.style.height = '45em';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.zIndex = String(index + 1);
            card.style.transition = 'transform 0.5s ease';
            card.style.margin = '0px auto';

            const initialOffset = stackGap * index;
            card.style.transform = reverseEffect
                ? `translateY(${initialOffset}px) scale(1)`
                : `translateY(${initialOffset}px) scale(0.84)`;
        });

        updateCards();
        scrollHandler = () => requestAnimationFrame(updateCards);
        window.addEventListener('scroll', scrollHandler);
        desktopActive = true;
    }
    function destroyDesktop() {
        if (!desktopActive) return;
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }
        resetCardsInline();
        killHeightInline();
        desktopActive = false;
    }
    function updateDesktopHeight() {
        if (!desktopActive) return;
        container.style.height = `${calcDynamicHeight()}px`;
    }

    // Swiper lifecycle (tablet/mobile)
    function addSwiperClasses() {
        container.classList.add('swiper');
        slider.classList.add('swiper-wrapper');
        cards.forEach(c => c.classList.add('swiper-slide'));
        // Accessibility: mark wrapper as list and slides as list items
        slider.setAttribute('role', 'list');
        cards.forEach(c => c.setAttribute('role', 'listitem'));
    }
    function removeSwiperClasses() {
        container.classList.remove('swiper');
        slider.classList.remove('swiper-wrapper');
        cards.forEach(c => c.classList.remove('swiper-slide'));
        // Remove accessibility roles when disabling Swiper mode
        slider.removeAttribute('role');
        cards.forEach(c => c.removeAttribute('role'));
    }
    function initSwiper() {
        if (swiper) return;
        destroyDesktop();
        killHeightInline();
        addSwiperClasses();

        if (typeof Swiper === 'undefined') {
            console.warn('Swiper library not found.');
            return;
        }

        swiper = new Swiper(container, {
            slidesPerView: 1.2,
            spaceBetween: 16,          // 1rem gap
            centeredSlides: false,
            loop: false,
            allowTouchMove: true,
            grabCursor: true,
            roundLengths: true,        // avoid subpixel cutoffs
            observeParents: true,
            observer: true,
            resizeObserver: true
        });

        // Ensure last slide has no trailing gap (prevents right-side cut)
        const fixLastGap = () => {
            const last = container.querySelector('.swiper-slide:last-child');
            if (last) last.style.marginRight = '0';
        };
        fixLastGap();
        swiper.on('resize', fixLastGap);
        swiper.on('update', fixLastGap);
    }
    function destroySwiper() {
        if (!swiper) {
            removeSwiperClasses();
            return;
        }
        swiper.destroy(true, true);
        swiper = null;
        removeSwiperClasses();
    }

    // Mode switch
    function applyMode(mq) {
        if (mq.matches) {
            // Desktop
            destroySwiper();
            initDesktop();
        } else {
            // Tablet/Mobile
            destroyDesktop();
            killHeightInline();
            initSwiper();
        }
    }

    // Init and listeners
    applyMode(DESKTOP_MQ);
    if (DESKTOP_MQ.addEventListener) DESKTOP_MQ.addEventListener('change', applyMode);
    else DESKTOP_MQ.addListener(applyMode);

    window.addEventListener('resize', () => {
        if (DESKTOP_MQ.matches && desktopActive) updateDesktopHeight();
        else if (!DESKTOP_MQ.matches && swiper && swiper.update) swiper.update();
    });

    window.addEventListener('load', () => applyMode(DESKTOP_MQ));
})();
