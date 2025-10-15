// jQuery snippet — DOM ready, smoother .loader_inner behavior, no cursor, no dots
$(function () {
    'use strict';

    const $loader = $('[data-element="loader"]');
    const $text   = $loader.find('[data-element="loader-text"]'); // holds text
    const $inner  = $loader.find('.loader_inner');

    if (!$loader.length || !$text.length || !$inner.length) return;

    // Keep loader visible while animating
    $loader.addClass('is-active');

    // Config
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phrase1 = 'robimy social media';
    const phrase2 = 'robimy świeżo';

    // Stabilize layout to avoid "odd" jumps in .loader_inner
    // 1) Prevent wrapping during typing
    $text.css({ display: 'inline-block', whiteSpace: 'nowrap' });

    // 2) Promote to its own layer and avoid layout-affecting filters
    $inner.css({ willChange: 'transform', transformOrigin: '50% 50%' });
    $loader.css({ willChange: 'opacity, clip-path' });

    // 3) Measure longest phrase width using current font and lock min-width on .loader_inner
    (function setMinWidthForInner() {
        const longest = [phrase1, phrase2].reduce((a, b) => (a.length >= b.length ? a : b));
        const cs = window.getComputedStyle($text[0]);
        const $measure = $('<span/>')
            .text(longest)
            .css({
                position: 'absolute',
                visibility: 'hidden',
                whiteSpace: 'pre',
                fontFamily: cs.fontFamily,
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                letterSpacing: cs.letterSpacing,
                textTransform: cs.textTransform,
                lineHeight: cs.lineHeight,
                padding: 0,
                margin: 0
            })
            .appendTo(document.body);

        const width = Math.ceil($measure[0].getBoundingClientRect().width);
        $measure.remove();

        // Add a small buffer to avoid sub-pixel wrapping
        $inner.css({ minWidth: (width + 2) + 'px' });
    })();

    // Helpers
    function whenWindowLoaded() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') return resolve();
            $(window).one('load', resolve);
        });
    }

    function typeChars($el, text) {
        return new Promise((resolve) => {
            const base = prefersReduced ? 0.03 : 0.055;   // sec/char
            const jitter = prefersReduced ? 0.004 : 0.018;
            const node = $el.get(0);
            let out = '';

            if (window.gsap) {
                const tl = gsap.timeline({ onComplete: resolve, defaults: { ease: 'none' } });
                for (let i = 0; i < text.length; i++) {
                    const d = base + Math.random() * jitter;
                    tl.add(() => { out += text[i]; node.textContent = out; })
                      .to({}, { duration: d });
                }
            } else {
                let i = 0;
                (function step() {
                    if (i >= text.length) return resolve();
                    out += text[i++];
                    node.textContent = out;
                    const d = (base + Math.random() * jitter) * 1000;
                    setTimeout(step, d);
                })();
            }
        });
    }

    function eraseChars($el) {
        return new Promise((resolve) => {
            const base = prefersReduced ? 0.028 : 0.05;   // sec/char
            const jitter = prefersReduced ? 0.003 : 0.015;
            const node = $el.get(0);
            const current = node.textContent || '';
            if (!current) return resolve();

            if (window.gsap) {
                const tl = gsap.timeline({ onComplete: resolve, defaults: { ease: 'none' } });
                for (let i = current.length; i > 0; i--) {
                    const d = base + Math.random() * jitter;
                    tl.add(() => { node.textContent = current.slice(0, i - 1); })
                      .to({}, { duration: d });
                }
            } else {
                let i = current.length;
                (function step() {
                    if (i <= 0) return resolve();
                    i--;
                    node.textContent = current.slice(0, i);
                    const d = (base + Math.random() * jitter) * 1000;
                    setTimeout(step, d);
                })();
            }
        });
    }

    function pause(sec) {
        return new Promise((resolve) => {
            const s = prefersReduced ? Math.max(0.15, sec * 0.4) : sec;
            if (window.gsap) gsap.delayedCall(s, resolve);
            else setTimeout(resolve, s * 1000);
        });
    }

    function runTextSequence() {
        return Promise.resolve()
            .then(() => typeChars($text, phrase1))
            .then(() => pause(0.9))
            .then(() => eraseChars($text))
            .then(() => typeChars($text, phrase2))
            .then(() => pause(0.45));
    }

    function exitLoader() {
        if (!window.gsap) {
            $loader.removeClass('is-active');
            $text.empty();
            return;
        }

        // Clean, non-janky exit: no blur or inner scaling
        gsap.set($loader, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' });

        gsap.timeline({ defaults: { ease: 'power3.inOut' } })
            .to($loader, { duration: 0.75, clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 })
            .add(() => {
                $loader.removeClass('is-active');
                $text.empty();
            })
            .set($loader[0], { clearProps: 'all' });
    }

    Promise.all([whenWindowLoaded(), runTextSequence()])
        .then(exitLoader)
        .catch(() => { $loader.removeClass('is-active'); });
});
