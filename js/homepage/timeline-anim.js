$(document).ready(function() {
    const BREAKPOINT_TABLET = 991;
    if (window.innerWidth <= BREAKPOINT_TABLET) {
        return;
    }
    
    // Wait for GSAP and ScrollTrigger
    function initTimelineAnimation() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for timeline-anim');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        
        const $timelineComponent = $('.timeline_component');
        const $progressLine = $('[data-animation="timeline-progress"]');
        const $timelineRows = $('.timeline_row');
        const $timelineDot = $('.timeline_dot');
        const $circleWrappers = $('.timeline_circle-wrapper');
        
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
    
    // Function to position dot at the end of progress line
    function updateDotPosition() {
        const progressLineHeight = $progressLine.height();
        const containerHeight = progressContainer.height();
        const progressPercent = (progressLineHeight / containerHeight) * 100;
        
        gsap.set($timelineDot[0], { 
            top: `${progressPercent}%`,
            y: '-50%'
        });
    }
    
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
                    onUpdate: updateDotPosition,
                    onComplete: updateDotPosition
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
                    onUpdate: updateDotPosition,
                    onComplete: updateDotPosition
                });
            }
        });
    });
    
    // Initial positioning
    updateDotPosition();
    
    // Handle window resize - recalculate positions
    $(window).on('resize', function() {
        updateDotPosition();
        
        // Update ScrollTrigger positions
        ScrollTrigger.refresh();
    });
    }
    
    // Initialize with delay to ensure GSAP is loaded
    setTimeout(initTimelineAnimation, 100);
});
