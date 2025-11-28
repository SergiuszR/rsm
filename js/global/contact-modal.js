$(document).ready(function() {
    const $body = $('body');
    const $modal = $('[data-element="contact-modal"]');
    const $triggers = $('[data-trigger="contact"]');
    const $closeButtons = $('[data-element="close-modal"]');
    const $overlay = $('.contact_overlay');
    let scrollTop = 0;

    function lockScroll() {
        if ($body.hasClass('js-scroll-locked')) return;
        scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        $body.addClass('js-scroll-locked').css({
            position: 'fixed',
            top: -scrollTop + 'px',
            left: 0,
            right: 0,
            width: '100%',
            overflow: 'hidden',
            'padding-right': scrollbarWidth ? scrollbarWidth + 'px' : ''
        });
    }

    function unlockScroll() {
        if (!$body.hasClass('js-scroll-locked')) return;
        $body.removeClass('js-scroll-locked').css({
            position: '',
            top: '',
            left: '',
            right: '',
            width: '',
            overflow: '',
            'padding-right': ''
        });
        window.scrollTo(0, scrollTop || 0);
    }

    function ensureModalDisplay() {
        // Webflow interactions sometimes leave inline display:none; force flex so CSS can animate
        $modal.each(function() {
            this.style.removeProperty('display');
            if (window.getComputedStyle(this).display === 'none') {
                this.style.display = 'flex';
            }
        });
    }

    function openModal(e) {
        if (e) e.preventDefault();
        if (!$modal.length) return;
        ensureModalDisplay();
        $modal.addClass('show');
        lockScroll();
    }

    function closeModal(e) {
        if (e) e.preventDefault();
        if (!$modal.length) return;
        $modal.removeClass('show');
        unlockScroll();
    }

    $triggers.on('click', openModal);
    $closeButtons.on('click', closeModal);

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    $overlay.on('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});