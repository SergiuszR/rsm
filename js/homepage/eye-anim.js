$(document).ready(function() {
    let isTracking = false;
    
    $('[data-eye-detect]').on('mouseenter', function() {
        isTracking = true;
    }).on('mouseleave', function() {
        isTracking = false;
        $('#eye-inner, #eye-inner_2').css({
            'transform': 'translate(0px, 0px)',
            'transition': 'transform 0.8s ease-out'
        });
    });
    
    $(document).on('mousemove', function(e) {
        if (!isTracking) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        $('#eye-inner, #eye-inner_2').each(function() {
            const eye = $(this);
            eye.css('transition', 'none');
            
            const eyeRect = this.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;
            
            const deltaX = mouseX - eyeCenterX;
            const deltaY = mouseY - eyeCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            const maxDistance = 15;
            const moveX = (deltaX / distance) * Math.min(distance, maxDistance);
            const moveY = (deltaY / distance) * Math.min(distance, maxDistance);
            
            eye.css('transform', `translate(${moveX}px, ${moveY}px)`);
        });
    });
});
