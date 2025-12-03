(function() {
    const BREAKPOINT_MOBILE = 768;
    const VISIBILITY_OFFSET = 40;

    function createFullVisibilityObserver(options = {}) {
        if (window.RSMVisibility?.createFullVisibilityObserver) {
            return window.RSMVisibility.createFullVisibilityObserver(options);
        }
        return createFallbackVisibilityObserver(options);
    }

    function createFallbackVisibilityObserver(options = {}) {
        if (typeof IntersectionObserver === 'undefined') {
            return {
                observe(element) {
                    if (element && typeof options.onEnter === 'function') {
                        options.onEnter(element, { fallback: true });
                    }
                },
                unobserve() {},
                disconnect() {}
            };
        }

        const {
            offset = VISIBILITY_OFFSET,
            once = false,
            onEnter,
            onLeave
        } = options;

        const state = new WeakMap();
        const pendingChecks = new WeakMap();
        const thresholds = [0, 0.25, 0.5, 0.75, 1];
        let observer;

        function cancelPending(target) {
            const rafId = pendingChecks.get(target);
            if (rafId) {
                cancelAnimationFrame(rafId);
                pendingChecks.delete(target);
            }
        }

        function scheduleCheck(target, meta) {
            if (!target || !document.body.contains(target)) return;

            const evaluate = () => {
                const rect = target.getBoundingClientRect();
                const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
                const fitsViewport = rect.height + offset * 2 <= viewportHeight;
                const fullyVisible = viewportHeight ?
                    (fitsViewport ? (rect.top >= offset && rect.bottom <= viewportHeight - offset) : rect.top >= offset)
                    : false;

                if (fullyVisible) {
                    cancelPending(target);
                    if (state.get(target) === true) return;
                    state.set(target, true);
                    if (typeof onEnter === 'function') {
                        onEnter(target, { entry: meta?.entry, rect, viewportHeight });
                    }
                    if (once && observer) {
                        observer.unobserve(target);
                        state.delete(target);
                    }
                } else if (document.body.contains(target)) {
                    const rafId = requestAnimationFrame(evaluate);
                    pendingChecks.set(target, rafId);
                }
            };

            cancelPending(target);
            const rafId = requestAnimationFrame(evaluate);
            pendingChecks.set(target, rafId);
        }

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const target = entry.target;
                const wasVisible = state.get(target) === true;

                if (entry.isIntersecting) {
                    if (!wasVisible && !pendingChecks.has(target)) {
                        scheduleCheck(target, { entry });
                    }
                } else {
                    cancelPending(target);
                    if (wasVisible) {
                        state.set(target, false);
                        if (!once && typeof onLeave === 'function') {
                            onLeave(target, { entry });
                        }
                    }
                }
            });
        }, { threshold: thresholds });

        return {
            observe(element) {
                if (element) observer.observe(element);
            },
            unobserve(element) {
                if (element) {
                    cancelPending(element);
                    observer.unobserve(element);
                }
            },
            disconnect() {
                observer.disconnect();
            }
        };
    }
    
    // Wait for GSAP
    function initTimelineAnimation() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTimelineAnimation);
            return;
        }
        
        if (window.innerWidth < BREAKPOINT_MOBILE) return;
        if (!window.gsap) return;
        
        if (typeof window.$ === 'undefined' && typeof window.jQuery === 'undefined') return;
        
        const $timelineComponent = $('.timeline_component');
        const $progressLine = $('[data-animation="timeline-progress"]');
        const $timelineRows = $('.timeline_row');
        
        if ($timelineComponent.length === 0 || $progressLine.length === 0) return;
    
    // Set initial states
    // Set initial states immediately
    gsap.set($progressLine[0], { height: '0%' });
    gsap.set($timelineRows, { opacity: 0, y: 30 });
    
    // Get the progress container for calculations
    const progressContainer = $progressLine.parent();
    
    // Create master timeline for progress line
    const masterTl = gsap.timeline({ paused: true });
    masterTl.to($progressLine[0], {
        height: '100%',
        ease: 'none',
        duration: 1
    });
    
    // Calculate target progress for each circle wrapper
    function calculateProgressForCircle($circleWrapper) {
        const circleTop = $circleWrapper.offset().top;
        const circleHeight = $circleWrapper.outerHeight();
        const circleMiddle = circleTop + (circleHeight / 2);
        
        const containerTop = progressContainer.offset().top;
        const containerHeight = progressContainer.outerHeight();
        
        const relativePosition = circleMiddle - containerTop;
        const progressPercent = Math.max(0, Math.min(1, relativePosition / containerHeight));
        
        return progressPercent;
    }
    
    const rowMeta = new WeakMap();
    const progressTargets = [];
    let rowObserver = null;
    let scrollDirection = 'down';

    (function trackScrollDirection() {
        if (typeof window === 'undefined') return;
        let lastY = window.scrollY || window.pageYOffset || 0;
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY || window.pageYOffset || 0;
            scrollDirection = currentY < lastY ? 'up' : 'down';
            lastY = currentY;
        }, { passive: true });
    })();

    function handleRowEnter(target) {
        const meta = rowMeta.get(target);
        if (!meta || meta.active) return;
        meta.active = true;
        gsap.to(target, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        });

        if (meta.circle) {
            gsap.to(meta.circle, {
                scale: 1,
                backgroundColor: '#EA559A',
                duration: 0.3,
                ease: 'back.out(1.7)'
            });
        }

        gsap.to(masterTl, {
            progress: meta.targetProgress,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    function handleRowLeave(target) {
        if (scrollDirection !== 'up') return;
        const meta = rowMeta.get(target);
        if (!meta || !meta.active) return;
        meta.active = false;

        gsap.to(target, {
            opacity: 0,
            y: 30,
            duration: 0.3
        });

        if (meta.circle) {
            gsap.to(meta.circle, {
                scale: 0.5,
                backgroundColor: '#cccccc',
                duration: 0.3
            });
        }

        gsap.to(masterTl, {
            progress: meta.prevProgress,
            duration: 0.3
        });
    }

    // Wait for page to settle before creating triggers
    function createTriggers() {
        rowObserver = createFullVisibilityObserver({
            offset: VISIBILITY_OFFSET,
            onEnter: handleRowEnter,
            onLeave: handleRowLeave
        });

        $timelineRows.each(function(index) {
            const $row = $(this);
            const $circle = $row.find('.timeline_circle');
            const $circleWrapper = $row.find('.timeline_circle-wrapper');
            
            const targetProgress = calculateProgressForCircle($circleWrapper);
            const prevProgress = index > 0 ? progressTargets[index - 1] : 0;
            progressTargets[index] = targetProgress;
            const meta = {
                index,
                circle: $circle.length > 0 ? $circle[0] : null,
                targetProgress,
                prevProgress,
                active: false
            };

            rowMeta.set($row[0], meta);

            if (rowObserver) {
                rowObserver.observe($row[0]);
            } else {
                handleRowEnter($row[0]);
            }
        });
    }
    
    // Wait for window load + extra time for layout to settle
    if (document.readyState === 'complete') {
        setTimeout(createTriggers, 500);
    } else {
        window.addEventListener('load', () => setTimeout(createTriggers, 500));
    }
    
    }
    
    // Initialize when GSAP is ready using AnimationManager with polling fallback
    (function waitForAnimationManager() {
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            window.AnimationManager.onReady(initTimelineAnimation);
        } else {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(initTimelineAnimation);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    /* AnimationManager not available */
                }
            }, 50);
        }
    })();
})();
