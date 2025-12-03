(function() {
    const BREAKPOINT_MOBILE = 768;
    
    // Wait for GSAP and ScrollTrigger
    function initTimelineAnimation() {
        // Ensure DOM is ready before accessing elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTimelineAnimation);
            return;
        }
        
        if (window.innerWidth < BREAKPOINT_MOBILE) {
            return;
        }
        
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for timeline-anim');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        
        const $timelineComponent = $('.timeline_component');
        const $progressLine = $('[data-animation="timeline-progress"]');
        const $timelineRows = $('.timeline_row');
        
        if ($timelineComponent.length === 0 || $progressLine.length === 0) {
            console.warn('Timeline elements not found');
            return;
        }
    
    // Set initial states
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
        const circleMiddle = circleTop + (circleHeight / 2); // 50% of circle height
        
        const containerTop = progressContainer.offset().top;
        const containerHeight = progressContainer.outerHeight();
        
        // Calculate what percentage of the container the circle middle represents
        const relativePosition = circleMiddle - containerTop;
        const progressPercent = Math.max(0, Math.min(1, relativePosition / containerHeight));
        
        return progressPercent;
    }
    
    // Animate each card
    $timelineRows.each(function(index) {
        const $row = $(this);
        const $circle = $row.find('.timeline_circle');
        const $circleWrapper = $row.find('.timeline_circle-wrapper');
        
        // Calculate the target progress based on circle wrapper position
        const targetProgress = calculateProgressForCircle($circleWrapper);
        
        ScrollTrigger.create({
            trigger: $row[0],
            start: 'top 75%',
            end: 'top 25%',
            onEnter: () => {
                // Animate card in
                gsap.to($row[0], {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
                
                // Animate circle
                if ($circle.length > 0) {
                    gsap.to($circle[0], {
                        scale: 1,
                        backgroundColor: '#EA559A',
                        duration: 0.3,
                        ease: 'back.out(1.7)'
                    });
                }
                
                // Update progress line to reach 50% of this circle wrapper
                gsap.to(masterTl, {
                    progress: targetProgress,
                    duration: 0.5,
                    ease: 'power2.out',
                });
            },
            onLeaveBack: () => {
                gsap.to($row[0], {
                    opacity: 0,
                    y: 30,
                    duration: 0.3
                });
                
                if ($circle.length > 0) {
                    gsap.to($circle[0], {
                        scale: 0.5,
                        backgroundColor: '#cccccc',
                        duration: 0.3
                    });
                }
                
                // Calculate previous circle's target or 0 if first
                const prevTargetProgress = index > 0 ? 
                    calculateProgressForCircle($timelineRows.eq(index - 1).find('.timeline_circle-wrapper')) : 0;
                
                gsap.to(masterTl, {
                    progress: prevTargetProgress,
                    duration: 0.3,
                });
            }
        });
    });
    
    // Initial positioning
    // Safari needs a refresh after ScrollTriggers are created
    setTimeout(function() {
        if (window.ScrollTrigger) {
            try { ScrollTrigger.refresh(); } catch (e) {}
        }
    }, 100);
    
    // Handle window resize - recalculate positions without fighting mobile URL-bar resizes
    (function setupSafeResizeRefresh() {
        const MOBILE_WIDTH_BREAKPOINT = 1024;
        const WIDTH_EPSILON = 2; // ignore sub-pixel width jitter
        const HEIGHT_JITTER_MAX = 220; // typical mobile chrome/safari toolbar delta
        const TOOLBAR_SETTLE_DELAY = 400;

        let lastViewportWidth = window.innerWidth;
        let lastViewportHeight = window.innerHeight;
        let toolbarResizeTimeout = null;

        $(window).on('resize', function() {
            if (!window.ScrollTrigger) return;

            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            const widthDelta = Math.abs(currentWidth - lastViewportWidth);
            const heightDelta = Math.abs(currentHeight - lastViewportHeight);
            lastViewportWidth = currentWidth;
            lastViewportHeight = currentHeight;

            const isMobileViewport = currentWidth < MOBILE_WIDTH_BREAKPOINT;
            const heightOnlyResize = widthDelta <= WIDTH_EPSILON && heightDelta > 0 && heightDelta <= HEIGHT_JITTER_MAX;

            if (isMobileViewport && heightOnlyResize) {
                clearTimeout(toolbarResizeTimeout);
                toolbarResizeTimeout = setTimeout(function() {
                    try { ScrollTrigger.refresh(); } catch (e) {}
                }, TOOLBAR_SETTLE_DELAY);
                return;
            }

            // Desktop or real resizes refresh immediately
            ScrollTrigger.refresh();
        });
    })();
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
                    console.error('AnimationManager not loaded for timeline-anim');
                }
            }, 50);
        }
    })();
})();
