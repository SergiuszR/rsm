$(document).ready(function() {
    $('svg:not(#nav-logo)').each(function() {
        var $svg = $(this);
        var paths = $svg.find('path');
        
        paths.each(function() {
            var $path = $(this);
            var originalFill = $path.attr('fill');
            var originalOpacity = $path.attr('opacity') || 1;
            
            gsap.set(this, {
                scale: 0,
                rotation: 180,
                transformOrigin: "center",
                opacity: 0,
                filter: "blur(10px) brightness(0.3)",
                fill: "#000000"
            });
            
            $path.data('originalFill', originalFill);
            $path.data('originalOpacity', originalOpacity);
        });
        
        var tl = gsap.timeline({ paused: true });
        
        for (var i = paths.length - 1; i >= 0; i--) {
            var $currentPath = $(paths[i]);
            
            tl.to(paths[i], {
                scale: 1.2,
                rotation: 0,
                opacity: 1,
                filter: "blur(0px) brightness(1)",
                duration: 0.6,
                ease: "back.out(2)"
            }, i === paths.length - 1 ? 0 : "-=0.4")
            .to(paths[i], {
                fill: $currentPath.data('originalFill'),
                duration: 0.3,
                ease: "power2.inOut"
            }, "-=0.3")
            .to(paths[i], {
                scale: 1,
                opacity: $currentPath.data('originalOpacity'),
                duration: 0.2,
                ease: "power2.out"
            }, "-=0.1");
        }
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    tl.play();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe($svg[0]);
    });
});
