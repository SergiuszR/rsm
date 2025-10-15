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
    // Accessibility roles on wrapper and slides
    try {
        const wrapperEl = container.querySelector('.showcase_grid');
        if (wrapperEl) wrapperEl.setAttribute('role', 'list');
        const slideEls = container.querySelectorAll('.showcase_item-outer');
        slideEls.forEach(el => el.setAttribute('role', 'listitem'));
    } catch (e) {}

    const applyA11yRoles = () => {
        const wrapperEl = container.querySelector('.showcase_grid');
        if (wrapperEl) wrapperEl.setAttribute('role', 'list');
        const slideEls = container.querySelectorAll('.showcase_item-outer');
        slideEls.forEach(el => el.setAttribute('role', 'listitem'));
    };

    swiper = new Swiper(container, {
        wrapperClass: 'showcase_grid',
        slideClass: 'showcase_item-outer',

        slidesPerView: 'auto',
        spaceBetween: 24,
        loop: false,
        initialSlide: 0,
        slidesPerView: window.innerWidth >= 768 ? 3 : 1.1,
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
                applyA11yRoles();
            },
            slideChange: function() {
                updateArrowStates();
            },
            reachBeginning: function() {
                updateArrowStates();
            },
            reachEnd: function() {
                updateArrowStates();
            },
            update: function() {
                applyA11yRoles();
            }
        },
        a11y: { enabled: false }
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


// Storage Video

$(document).ready(function() {
    const targets = document.querySelectorAll('[data-video-1]');
    if (targets.length === 0) return;
  
    fetch('/storage')
      .then(response => response.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const video = doc.getElementById('video-1');
        
        if (video) {
          targets.forEach(target => {
            const clone = video.cloneNode(true);
            target.appendChild(clone);
          });
        }
      })
      .catch(err => console.error('Error:', err));
  });
  

//   Section decor animation


// Ensure GSAP/ScrollTrigger are ready before initializing
(function waitForAnimationManagerDecor() {
    function initDecorAnimations() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for section decor animations');
            return;
        }

        gsap.from("[data-decor='timeline']", {
            x: 200,
            duration: 0.8,
            ease: "back.out(2.4)",
            scrollTrigger: {
                trigger: "[data-decor='timeline']",
                start: 'top 85%',
                once: true
            }
        });

        gsap.from("[data-decor='portfolio']", {
            x: -200,
            y: -100,
            duration: 0.8,
            ease: "back.out(2.4)",
            scrollTrigger: {
                trigger: "[data-decor='portfolio']",
                start: 'bottom 30%',
                once: true
            }
        });

        // Safety: refresh after a short delay to ensure positions are correct
        if (window.ScrollTrigger) {
            setTimeout(function() { try { ScrollTrigger.refresh(); } catch (e) {} }, 200);
        }
    }

    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
        window.AnimationManager.onReady(initDecorAnimations);
    } else {
        let attempts = 0;
        const maxAttempts = 100; // 5s
        const timer = setInterval(function() {
            attempts++;
            if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                clearInterval(timer);
                window.AnimationManager.onReady(initDecorAnimations);
            } else if (attempts >= maxAttempts) {
                clearInterval(timer);
                console.error('AnimationManager not loaded for section decor animations');
            }
        }, 50);
    }
})();

// Remove rdundant attr from video elements

$(document).ready(function() {
  $('video').each(function() {
    var autoplayAttr = $(this).attr('autoplay');
    
    if (autoplayAttr === '' || autoplayAttr === undefined) {
      $(this).removeAttr('autoplay');
    }
  });
});


// Modal logic

$(document).ready(function() {

  $('[data-video-container]').click(function(e) {
    e.stopPropagation()
    $('.video_overlay').addClass('show');
  });
  

  $('[data-video-close]').click(function(e) {
  	e.stopPropagation();
  	e.preventDefault();
    $('.video_overlay').removeClass('show');
  });
  

  $(document).click(function(e) {
    if ($('.video_overlay').hasClass('show') && 
        !$(e.target).closest('.video_overlay').length &&
        !$(e.target).closest('[data-video-container]').length) {
      $('.video_overlay').removeClass('show');
    }
  });
  

  $('.video_overlay').click(function(e) {
    e.stopPropagation();
  });
  

  $(document).keydown(function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      $('.video_overlay').removeClass('show');
    }
  });
});

// Form button mirro

$('#submit').on('click', function(e) {
  $('#submit-original').trigger('click');
});

// Marquee animation, swing effect

$('.banner_photo-wrapper').each(function(index) {
    $(this).css({
      'animation': `swing ${2 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
      'transform-origin': 'top center'
    });
  });
  