$(document).ready(function() {
    const accordionHeaders = $('.accordion_header');
    const servicesList = $('[data-item="services-list"]');
    
    if (accordionHeaders.length === 0 || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    accordionHeaders.each(function(index) {
        const header = $(this);
        const serviceItem = header.closest('[data-item="service-item"]');
        const headerHeight = header.outerHeight();
        const isLastHeader = index === accordionHeaders.length - 1;
        
        ScrollTrigger.create({
            trigger: isLastHeader ? servicesList[0] : serviceItem[0],
            start: isLastHeader 
                ? `top ${index * headerHeight}px`
                : `top ${index * headerHeight}px`,
            end: isLastHeader 
                ? `bottom ${index * headerHeight}px`
                : () => {
                    const serviceItemTop = serviceItem.offset().top;
                    const servicesListBottom = servicesList.offset().top + servicesList.outerHeight();
                    const distanceToEnd = servicesListBottom - serviceItemTop;
                    return `+=${distanceToEnd}px`;
                },
            pin: header[0],
            pinSpacing: false,
            onToggle: (self) => {
                header.toggleClass('sticky-active', self.isActive);
            }
        });
    });

    // Handle resize
    let resizeTimeout;
    $(window).on('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250);
    });
});
