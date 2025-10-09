(function () {
    if (window.__socialUpdateStickySwiperInit) return;
    window.__socialUpdateStickySwiperInit = true;

    const container = document.querySelector('.social_update-slider-wrapper');
    const slider = document.querySelector('.social-update-slider');
    const cards = document.querySelectorAll('.social-update-item-wrapper');
    if (!container || !slider || cards.length === 0) return;

    const DESKTOP_MQ = window.matchMedia('(min-width: 992px)');

    const stackGap = 20;
    const topEdge = 30;
    const reverseEffect = true;
    let desktopActive = false;
    let scrollHandler = null;
    const activated = new Set();

    let swiper = null;

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
        const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const cardHeight = 45 * remInPx;
        const numCards = cards.length;

        const scrollSpacePerCard = cardHeight * 1.208;
        const totalScrollForCards = numCards * scrollSpacePerCard;

        const initialBuffer = topEdge;
        const endBuffer = topEdge;

        return totalScrollForCards + initialBuffer + endBuffer;
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

    function initDesktop() {
        if (desktopActive) return;
        killHeightInline();

        cards.forEach((card, index) => {
            card.style.position = 'sticky';
            card.style.top = `${topEdge}px`;
            // card.style.height = '45em';
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
        return;
    }

    function addSwiperClasses() {
        container.classList.add('swiper');
        slider.classList.add('swiper-wrapper');
        cards.forEach(c => c.classList.add('swiper-slide'));
        slider.setAttribute('role', 'list');
        cards.forEach(c => c.setAttribute('role', 'listitem'));
    }
    function removeSwiperClasses() {
        container.classList.remove('swiper');
        slider.classList.remove('swiper-wrapper');
        cards.forEach(c => c.classList.remove('swiper-slide'));
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

        const applyA11yRoles = () => {
            slider.setAttribute('role', 'list');
            cards.forEach(c => c.setAttribute('role', 'listitem'));
        };

        swiper = new Swiper(container, {
            slidesPerView: 1.2,
            spaceBetween: 16,
            centeredSlides: false,
            loop: false,
            allowTouchMove: true,
            grabCursor: true,
            roundLengths: true,
            observeParents: true,
            observer: true,
            resizeObserver: true,
            a11y: { enabled: false },
            on: {
                init: applyA11yRoles,
                update: applyA11yRoles
            }
        });

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

    function applyMode(mq) {
        if (mq.matches) {
            destroySwiper();
            initDesktop();
        } else {
            destroyDesktop();
            killHeightInline();
            initSwiper();
        }
    }

    applyMode(DESKTOP_MQ);
    if (DESKTOP_MQ.addEventListener) DESKTOP_MQ.addEventListener('change', applyMode);
    else DESKTOP_MQ.addListener(applyMode);

    window.addEventListener('resize', () => {
        if (!DESKTOP_MQ.matches && swiper && swiper.update) swiper.update();
    });

    window.addEventListener('load', () => applyMode(DESKTOP_MQ));
})();