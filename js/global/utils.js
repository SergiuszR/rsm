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
    // Initialize all swiper instances on the page
    const containers = document.querySelectorAll('.podcasts_wrapper');
    if (containers.length === 0) return;

    const swiperInstances = new Map(); // Store swiper instances by container

    function updateArrowStates(container, swiper) {
        // Add safety check
        if (!swiper) return;
        
        // Find the parent wrapper that contains both podcasts_wrapper and slider_controls-wrapper
        const parentWrapper = container.closest('.podcasts_outer-wrapper');
        if (!parentWrapper) return;
        
        // Find arrows within the parent wrapper (sibling structure)
        const prevArrow = parentWrapper.querySelector('.swiper_control.is-prev');
        const nextArrow = parentWrapper.querySelector('.swiper_control.is-next');
        
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

    function applyA11yRoles(container) {
        const wrapperEl = container.querySelector('.showcase_grid');
        if (wrapperEl) wrapperEl.setAttribute('role', 'list');
        const slideEls = container.querySelectorAll('.showcase_item-outer');
        slideEls.forEach(el => el.setAttribute('role', 'listitem'));
    }

    // Initialize each swiper instance
    containers.forEach((container, index) => {
        // Accessibility roles on wrapper and slides
        try {
            applyA11yRoles(container);
        } catch (e) {}

        // Find the parent wrapper for navigation controls
        const parentWrapper = container.closest('.podcasts_outer-wrapper');
        if (!parentWrapper) {
            console.warn('No parent wrapper found for swiper container');
            return;
        }

        const swiper = new Swiper(container, {
            wrapperClass: 'showcase_grid',
            slideClass: 'showcase_item-outer',

            slidesPerView: 'auto',
            spaceBetween: 24,
            loop: false,
            initialSlide: 0,
            slidesPerView: window.innerWidth >= 768 ? 3 : 1.1,
            navigation: {
                nextEl: parentWrapper.querySelector('.swiper_control.is-next'),
                prevEl: parentWrapper.querySelector('.swiper_control.is-prev'),
            },

            pagination: { enabled: false },
            grabCursor: true,
            watchOverflow: true,
            observer: true,
            observeParents: true,

            on: {
                init: function() {
                    updateArrowStates(container, this);
                    applyA11yRoles(container);
                },
                slideChange: function() {
                    updateArrowStates(container, this);
                },
                reachBeginning: function() {
                    updateArrowStates(container, this);
                },
                reachEnd: function() {
                    updateArrowStates(container, this);
                },
                update: function() {
                    applyA11yRoles(container);
                }
            },
            a11y: { enabled: false }
        });

        // Store the swiper instance
        swiperInstances.set(container, swiper);

        // Prevent anchors from jumping to top for this container's controls
        const controls = parentWrapper.querySelectorAll('.swiper_control.is-prev, .swiper_control.is-next');
        controls.forEach(a => a.addEventListener('click', e => e.preventDefault()));
    });

    // Update function for all instances
    const update = () => {
        swiperInstances.forEach((swiper, container) => {
            if (swiper) {
                swiper.update();
                updateArrowStates(container, swiper);
            }
        });
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
  
  $('[data-video-container]').keydown(function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
      $('.video_overlay').addClass('show');
    }
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

// Typing Animation Utility
// Usage: Add data-typing-effect to any element with text content
// Optional: data-typing-speed="slow|normal|fast" (default: normal)
// Optional: data-typing-cursor="true|false" (default: true)
// Optional: data-typing-trigger="load|scroll|hover" (default: load)

function initTypingEffect() {
    const typingElements = document.querySelectorAll('[data-typing-effect]');
    
    typingElements.forEach(element => {
        const originalText = element.textContent.trim();
        if (!originalText) return;
        
        // Get configuration from data attributes
        const speed = element.dataset.typingSpeed || 'normal';
        const showCursor = element.dataset.typingCursor !== 'false';
        const trigger = element.dataset.typingTrigger || 'load';
        
        // Speed configurations (seconds per character)
        const speedConfigs = {
            slow: { base: 0.08, jitter: 0.02 },
            normal: { base: 0.05, jitter: 0.015 },
            fast: { base: 0.03, jitter: 0.01 }
        };
        
        const config = speedConfigs[speed] || speedConfigs.normal;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Adjust for reduced motion
        if (prefersReduced) {
            config.base *= 0.5;
            config.jitter *= 0.5;
        }
        
        // Create cursor element if needed
        let cursor = null;
        if (showCursor) {
            cursor = document.createElement('span');
            cursor.style.cssText = 'border-right: 2px solid currentColor; padding-right: 2px; animation: typing-blink 0.7s infinite;';
            
            // Add blink animation if not exists
            if (!document.querySelector('#typing-blink-style')) {
                const style = document.createElement('style');
                style.id = 'typing-blink-style';
                style.textContent = '@keyframes typing-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }';
                document.head.appendChild(style);
            }
        }
        
        function playTypingAnimation() {
            // Clear the element and start animation
            element.textContent = '';
            if (cursor) element.appendChild(cursor);
            
            let currentIndex = 0;
            
            function typeNextCharacter() {
                if (currentIndex < originalText.length) {
                    element.textContent = originalText.substring(0, currentIndex + 1);
                    if (cursor) element.appendChild(cursor);
                    
                    currentIndex++;
                    const delay = (config.base + Math.random() * config.jitter) * 1000;
                    setTimeout(typeNextCharacter, delay);
                } else {
                    // Animation complete - remove cursor after a delay
                    if (cursor) {
                        setTimeout(() => {
                            if (cursor && cursor.parentNode) {
                                cursor.remove();
                            }
                        }, 1000);
                    }
                }
            }
            
            typeNextCharacter();
        }
        
        // Set up trigger
        switch (trigger) {
            case 'scroll':
                if (window.ScrollTrigger) {
                    ScrollTrigger.create({
                        trigger: element,
                        start: 'top 80%',
                        once: true,
                        onEnter: playTypingAnimation
                    });
                } else {
                    // Fallback to intersection observer
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                playTypingAnimation();
                                observer.unobserve(element);
                            }
                        });
                    }, { threshold: 0.1 });
                    observer.observe(element);
                }
                break;
                
            case 'hover':
                element.addEventListener('mouseenter', playTypingAnimation, { once: true });
                break;
                
            case 'load':
            default:
                // Small delay to ensure DOM is ready
                setTimeout(playTypingAnimation, 100);
                break;
        }
    });
}

// Initialize typing effects when GSAP is ready
(function waitForAnimationManager() {
    if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
        window.AnimationManager.onReady(initTypingEffect);
    } else {
        let attempts = 0;
        const maxAttempts = 100;
        const timer = setInterval(function() {
            attempts++;
            if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                clearInterval(timer);
                window.AnimationManager.onReady(initTypingEffect);
            } else if (attempts >= maxAttempts) {
                clearInterval(timer);
                // Fallback - initialize immediately
                initTypingEffect();
            }
        }, 50);
    }
})();

// Marquee animation, swing effect

$('.banner_photo-wrapper').each(function(index) {
    $(this).css({
      'animation': `swing ${2 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
      'transform-origin': 'top center'
    });
  });
  
$(document).ready(function() {
  const wrapper = document.querySelector('.slide_items-wrapper');
  const slides = Array.from(wrapper.querySelectorAll('.slide_items-item'));
  
  const cloneCount = 8; 
  for (let i = 0; i < cloneCount; i++) {
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      wrapper.appendChild(clone);
    });
  }
  
  
  let totalWidth = 0;
  slides.forEach(slide => {
    totalWidth += slide.offsetWidth + 20;
  });
  
 
  wrapper.style.setProperty('--marquee-distance', `-${totalWidth}px`);
  wrapper.classList.add('marquee-animate');
});

