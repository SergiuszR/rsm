// Services Scroll Animation
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
    

        // Check if we have the required elements
        if (servicesItems.length === 0 || videoContainers.length === 0) {
            console.warn('Required elements not found for services animation');
            return;
        }

        // Set content-based heights with proper spacing
        servicesItems.forEach((item, index) => {
            const content = item.querySelector('.service_item');
            if (content) {
                const contentHeight = content.scrollHeight;
                const minHeight = Math.max(contentHeight + 200, window.innerHeight * 0.9); // At least 90% of viewport
                
                // Set last item to specific height to reduce bottom space
                const isLastItem = index === servicesItems.length - 1;
                const finalHeight = isLastItem ? '40rem' : `${minHeight}px`;
                
                gsap.set(item, {
                    height: finalHeight, // Content-based height or 330px for last item
                    // marginBottom: '4rem', // Add gap between service items
                    // paddingBottom: '2rem' // Additional spacing at bottom
                });
            }
        });

        // Create elegant scroll-triggered video reveal animation
        const imagesWrapper = document.querySelector('.collection_services_images-wrapper');
        
        // Set up each video container with smooth reveal animation
        videoContainers.forEach((container, index) => {
            // Position videos in a vertical stack with sticky behavior
            gsap.set(container, {
                position: 'sticky',
                top: '0px',
                height: '70vh', // Reduced to match content better
                opacity: 0,
                scale: 0.9,
                transformOrigin: 'center center',
                zIndex: 10 - index,
                filter: 'blur(2px) brightness(0.8)', // Subtle blur effect
                alignSelf: 'flex-end' // Align to bottom when not sticky
            });

            // Set up video wrappers for smooth mask reveal
            const wrapper = container.querySelector('.service_item-image-wrapper');
            if (wrapper) {
                gsap.set(wrapper, {
                    clipPath: 'inset(100% 0% 0% 0%)',
                    transformOrigin: 'center center',
                    borderRadius: '1.25rem' // Match the CSS border radius
                });
            }
        });

        // Show first video initially with smooth reveal
        if (videoContainers.length > 0) {
            gsap.set(videoContainers[0], { 
                opacity: 1, 
                scale: 1,
                zIndex: 20,
                filter: 'blur(0px) brightness(1)' // Clear and bright
            });
            const firstWrapper = videoContainers[0].querySelector('.service_item-image-wrapper');
            if (firstWrapper) {
                gsap.set(firstWrapper, { 
                    clipPath: 'inset(0% 0% 0% 0%)',
                    borderRadius: '1.25rem'
                });
            }

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
                    
                    // Animate current video with smooth reveal
                    gsap.to(videoContainer, {
                        opacity: 1,
                        scale: 1,
                        zIndex: 20,
                        filter: 'blur(0px) brightness(1)',
                        duration: 0.6,
                        ease: 'power2.out'
                    });
                    
                    if (videoWrapper) {
                        gsap.to(videoWrapper, {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            duration: 0.6,
                            ease: 'power2.out'
                        });
                    }

                    // Hide previous videos with smooth transition
                    for (let i = 0; i < index; i++) {
                        gsap.to(videoContainers[i], {
                            opacity: 0,
                            scale: 0.9,
                            zIndex: 10 - i,
                            filter: 'blur(2px) brightness(0.8)',
                            duration: 0.6,
                            ease: 'power2.out'
                        });
                        
                        const prevWrapper = videoContainers[i].querySelector('.service_item-image-wrapper');
                        if (prevWrapper) {
                            gsap.to(prevWrapper, {
                                clipPath: 'inset(100% 0% 0% 0%)',
                                duration: 0.6,
                                ease: 'power2.out'
                            });
                        }
                    }

                    // Hide next videos with smooth transition
                    for (let i = index + 1; i < videoContainers.length; i++) {
                        gsap.to(videoContainers[i], {
                            opacity: 0,
                            scale: 0.9,
                            zIndex: 10 - i,
                            filter: 'blur(2px) brightness(0.8)',
                            duration: 0.6,
                            ease: 'power2.out'
                        });
                        
                        const nextWrapper = videoContainers[i].querySelector('.service_item-image-wrapper');
                        if (nextWrapper) {
                            gsap.to(nextWrapper, {
                                clipPath: 'inset(100% 0% 0% 0%)',
                                duration: 0.6,
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
                            scale: 1 + (progress * 0.03), // Subtle scale
                            y: progress * -10, // Subtle upward movement
                            duration: 0.4,
                            ease: 'power2.out'
                        });
                    }
                }
            });
        });

        // Remove parallax effect to prevent last video from being cut off

        // Remove end-stage alignment to prevent shifting
        // Videos will stay sticky at top: 0px throughout the entire scroll
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