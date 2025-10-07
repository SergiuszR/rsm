$(document).ready(function() {
    const monthMap = {
        'january': 'stycznia', 'jan': 'stycznia',
        'february': 'lutego', 'feb': 'lutego',
        'march': 'marca', 'mar': 'marca',
        'april': 'kwietnia', 'apr': 'kwietnia',
        'may': 'maja',
        'june': 'czerwca', 'jun': 'czerwca',
        'july': 'lipca', 'jul': 'lipca',
        'august': 'sierpnia', 'aug': 'sierpnia',
        'september': 'września', 'sep': 'września', 'sept': 'września',
        'october': 'października', 'oct': 'października',
        'november': 'listopada', 'nov': 'listopada',
        'december': 'grudnia', 'dec': 'grudnia'
    };

    $('[data-date]').each(function() {
        const text = $(this).text().trim().toLowerCase();
        let hasMonth = false;
        let translatedText = text;

        for (const [eng, pol] of Object.entries(monthMap)) {
            if (text.includes(eng)) {
                translatedText = translatedText.replace(new RegExp(eng, 'gi'), pol);
                hasMonth = true;
            }
        }

        if (hasMonth) {
            $(this).text(translatedText);
        }
    });
});

$(document).ready(function() {
    const container = document.querySelector('.podcasts_wrapper');
    if (!container) return;

    let swiper; // Declare swiper variable first

    function updateArrowStates() {
        // Add safety check
        if (!swiper) return;
        
        const prevArrow = document.querySelector('.swiper_control.is-prev');
        const nextArrow = document.querySelector('.swiper_control.is-next');
        
        if (prevArrow) {
            if (swiper.isBeginning) {
                prevArrow.style.opacity = '0';
                prevArrow.style.pointerEvents = 'none';
            } else {
                prevArrow.style.opacity = '1';
                prevArrow.style.pointerEvents = 'auto';
            }
        }
        
        if (nextArrow) {
            if (swiper.isEnd) {
                nextArrow.style.opacity = '0';
                nextArrow.style.pointerEvents = 'none';
            } else {
                nextArrow.style.opacity = '1';
                nextArrow.style.pointerEvents = 'auto';
            }
        }
    }

    // Now initialize swiper
    swiper = new Swiper(container, {
        wrapperClass: 'showcase_grid',
        slideClass: 'showcase_item-outer',

        slidesPerView: 'auto',
        spaceBetween: 24,
        loop: false,
        initialSlide: 0,

        breakpoints: {
            0: { slidesPerView: 1.1 },
            769: { slidesPerView: 'auto' }
        },

        navigation: {
            nextEl: '.swiper_control.is-next',
            prevEl: '.swiper_control.is-prev',
        },

        pagination: { enabled: false },
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,

        on: {
            init: function() {
                updateArrowStates();
            },
            slideChange: function() {
                updateArrowStates();
            },
            reachBeginning: function() {
                updateArrowStates();
            },
            reachEnd: function() {
                updateArrowStates();
            }
        }
    });

    // Prevent anchors from jumping to top
    document.querySelectorAll('.swiper_control.is-prev, .swiper_control.is-next')
        .forEach(a => a.addEventListener('click', e => e.preventDefault()));

    const update = () => {
        if (swiper) {
            swiper.update();
            updateArrowStates();
        }
    };
    
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    window.addEventListener('load', update, { once: true });
    setTimeout(update, 200);
});
