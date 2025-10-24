// Services Scroll Animation - BACKUP VERSION
// Creates a scroll-triggered animation where left side scrolls normally
// and right side reveals videos progressively with mask effect

$(document).ready(function() {
    // Only run on desktop (>= 992px)
    if (!window.matchMedia('(min-width: 992px)').matches) {
        return;
    }
    
    // Wait for GSAP and ScrollTrigger
    function initServicesAnimation() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for services animation');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);

        // Setup elements
        const servicesItems = document.querySelectorAll('.services_list-item');
        const videoContainers = document.querySelectorAll('.service_item-image');
        const videoWrappers = document.querySelectorAll('.service_item-image-wrapper');
        const servicesContainer = document.querySelector('.collection_services-items');
        const imagesContainer = document.querySelector('.collection_services-images');
        
        console.log('Services animation initializing...');
        console.log('Services items found:', servicesItems.length);
        console.log('Video containers found:', videoContainers.length);
        console.log('Video wrappers found:', videoWrappers.length);
        console.log('Services container:', servicesContainer);
        console.log('Images container:', imagesContainer);

        // Check if we have the required elements
        if (servicesItems.length === 0 || videoContainers.length === 0) {
            console.warn('Required elements not found for services animation');
            return;
        }

        // Create a sticky container for each video
        const imagesWrapper = document.querySelector('.collection_services_images-wrapper');
        
        // Set up each video container to be sticky in its own position
        videoContainers.forEach((container, index) => {
            // Make each video container sticky and positioned
            gsap.set(container, {
                position: 'sticky',
                top: '0px', // All videos stick at the same position
                height: '100vh',
                opacity: 0,
                scale: 0.8,
                transformOrigin: 'center center',
                zIndex: 10 - index // Higher z-index for earlier videos
            });

            // Set initial state for video wrappers (mask effect)
            const wrapper = container.querySelector('.service_item-image-wrapper');
            if (wrapper) {
                gsap.set(wrapper, {
                    clipPath: 'inset(100% 0% 0% 0%)',
                    transformOrigin: 'center center'
                });
            }
        });

        // Show first video initially
        if (videoContainers.length > 0) {
            gsap.set(videoContainers[0], { 
                opacity: 1, 
                scale: 1,
                zIndex: 20
            });
            const firstWrapper = videoContainers[0].querySelector('.service_item-image-wrapper');
            if (firstWrapper) {
                gsap.set(firstWrapper, { clipPath: 'inset(0% 0% 0% 0%)' });
            }
            console.log('First video set to visible');
        }

        // Create scroll animation for each service item
        servicesItems.forEach((item, index) => {
            if (index >= videoContainers.length) return;

            const videoContainer = videoContainers[index];
            const videoWrapper = videoContainer.querySelector('.service_item-image-wrapper');
            
            // Create scroll trigger for each service item
            ScrollTrigger.create({
                trigger: item,
                start: 'top center',
                end: 'bottom center',
                scrub: 1,
                onUpdate: function(self) {
                    const progress = self.progress;
                    
                    // Animate current video
                    gsap.to(videoContainer, {
                        opacity: 1,
                        scale: 1,
                        zIndex: 20, // Bring current video to front
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    if (videoWrapper) {
                        gsap.to(videoWrapper, {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }

                    // Hide previous videos (they stay in their sticky positions)
                    for (let i = 0; i < index; i++) {
                        gsap.to(videoContainers[i], {
                            opacity: 0,
                            scale: 0.8,
                            zIndex: 10 - i, // Reset z-index
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                        
                        const prevWrapper = videoContainers[i].querySelector('.service_item-image-wrapper');
                        if (prevWrapper) {
                            gsap.to(prevWrapper, {
                                clipPath: 'inset(100% 0% 0% 0%)',
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        }
                    }

                    // Hide next videos (they stay in their sticky positions)
                    for (let i = index + 1; i < videoContainers.length; i++) {
                        gsap.to(videoContainers[i], {
                            opacity: 0,
                            scale: 0.8,
                            zIndex: 10 - i, // Reset z-index
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                        
                        const nextWrapper = videoContainers[i].querySelector('.service_item-image-wrapper');
                        if (nextWrapper) {
                            gsap.to(nextWrapper, {
                                clipPath: 'inset(100% 0% 0% 0%)',
                                duration: 0.3,
                                ease: 'power2.out'
                            });
                        }
                    }
                }
            });

            // Add subtle animation to service items on the left
            ScrollTrigger.create({
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1,
                onUpdate: function(self) {
                    const progress = self.progress;
                    const serviceItem = item.querySelector('.service_item');
                    
                    if (serviceItem) {
                        gsap.to(serviceItem, {
                            scale: 1 + (progress * 0.05),
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                }
            });
        });

        // Add parallax effect to the images container
        ScrollTrigger.create({
            trigger: servicesContainer,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            onUpdate: function(self) {
                const progress = self.progress;
                gsap.to(imagesContainer, {
                    y: progress * 50,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }
    
    // Initialize when GSAP is ready using AnimationManager with polling fallback
    (function waitForAnimationManager() {
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            window.AnimationManager.onReady(initServicesAnimation);
        } else {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const interval = setInterval(function() {
                attempts++;
                if (window.gsap && window.ScrollTrigger) {
                    clearInterval(interval);
                    initServicesAnimation();
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.warn('GSAP/ScrollTrigger not available after 5s, skipping services animation');
                }
            }, 50);
        }
    })();
});
