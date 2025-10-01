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

/* Swiper */

$(document).ready(function() {
    const container = document.querySelector('.podcasts_wrapper');
    if (!container) return;

    const swiper = new Swiper(container, {
        wrapperClass: 'showcase_grid',
        slideClass: 'showcase_item-outer',

        slidesPerView: 'auto',
        spaceBetween: 24,
        loop: true,

        navigation: {
            nextEl: '.swiper_control.is-next',
            prevEl: '.swiper_control.is-prev',
        },

        pagination: { enabled: false },
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
    });

    // Prevent anchors from jumping to top
    document.querySelectorAll('.swiper_control.is-prev, .swiper_control.is-next')
        .forEach(a => a.addEventListener('click', e => e.preventDefault()));

    const update = () => swiper.update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    window.addEventListener('load', update, { once: true });
    setTimeout(update, 200);
});