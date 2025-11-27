/**
 * Animation Initialization Manager
 * Ensures proper initialization order and ScrollTrigger refresh
 */

(function() {
    'use strict';
    
    // Create global animation manager
    window.AnimationManager = {
        initialized: false,
        readyCallbacks: [],
        contentLoadedCallbacks: [],
        scriptsLoaded: 0,
        totalScripts: 0,
        _mobileResizeGuardsConfigured: false,
        
        /**
         * Register a callback to run when GSAP and ScrollTrigger are ready
         */
        onReady: function(callback) {
            if (this.initialized && window.gsap && window.ScrollTrigger) {
                callback();
            } else {
                this.readyCallbacks.push(callback);
            }
        },
        
        /**
         * Register a callback to run after all content is loaded
         */
        onContentLoaded: function(callback) {
            this.contentLoadedCallbacks.push(callback);
        },
        
        /**
         * Initialize the animation system
         */
        init: function() {
            if (this.initialized) return;
            
            // Check if GSAP and ScrollTrigger are available
            const checkGSAP = () => {
                if (window.gsap && window.ScrollTrigger) {
                    this.initialized = true;
                    
                    // Register ScrollTrigger plugin
                    gsap.registerPlugin(ScrollTrigger);

                    // Prevent ScrollTrigger from pausing scroll when mobile UI chrome resizes the viewport
                    this.setupMobileResizeGuards();
                    
                    // Run all ready callbacks
                    this.readyCallbacks.forEach((callback, index) => {
                        try {
                            callback();
                        } catch (e) {
                            console.error(`Animation callback error (callback #${index}):`, e);
                            // Continue with other callbacks even if one fails
                        }
                    });
                    
                    // Clear callbacks
                    this.readyCallbacks = [];
                    
                    // Setup content loaded detection
                    this.setupContentLoadedDetection();
                } else {
                    // Retry after a short delay
                    setTimeout(checkGSAP, 50);
                }
            };
            
            checkGSAP();
        },
        
        /**
         * Setup detection for when all content is loaded
         */
        setupContentLoadedDetection: function() {
            let allContentLoaded = false;
            
            const triggerContentLoaded = () => {
                if (allContentLoaded) return;
                allContentLoaded = true;
                
                // Small delay to ensure everything is settled
                setTimeout(() => {
                    // Refresh ScrollTrigger to recalculate all positions
                    if (window.ScrollTrigger) {
                        try { ScrollTrigger.refresh(); } catch (e) {}
                    }
                    
                    // Run all content loaded callbacks
                    this.contentLoadedCallbacks.forEach(callback => {
                        try {
                            callback();
                        } catch (e) {
                            console.error('Content loaded callback error:', e);
                        }
                    });
                    
                    // Clear callbacks
                    this.contentLoadedCallbacks = [];
                }, 300);

                // Extra safety: schedule a couple of additional refreshes
                if (window.ScrollTrigger) {
                    setTimeout(function() { try { ScrollTrigger.refresh(); } catch (e) {} }, 800);
                    setTimeout(function() { try { ScrollTrigger.refresh(); } catch (e) {} }, 1500);
                }
            };
            
            // Listen for various load events
            if (document.readyState === 'complete') {
                triggerContentLoaded();
            } else {
                window.addEventListener('load', triggerContentLoaded);
            }
            
            // Also trigger after a timeout as fallback
            setTimeout(triggerContentLoaded, 2000);

            // Refresh on critical lifecycle events as additional guardrails
            try {
                // Fonts ready can shift layout; refresh after fonts load
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        if (window.ScrollTrigger) {
                            try { ScrollTrigger.refresh(); } catch (e) {}
                        }
                    });
                }
            } catch (e) {}
            
            // Refresh when tab regains visibility
            try {
                document.addEventListener('visibilitychange', function() {
                    if (document.visibilityState === 'visible' && window.ScrollTrigger) {
                        try { ScrollTrigger.refresh(); } catch (e) {}
                    }
                });
            } catch (e) {}
        },
        
        /**
         * Manually trigger a ScrollTrigger refresh
         */
        refreshScrollTrigger: function() {
            if (window.ScrollTrigger) {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            }
        },
        
        /**
         * Report that a script has loaded (for tracking purposes)
         */
        scriptLoaded: function(scriptName) {
            this.scriptsLoaded++;
            
            // If all expected scripts are loaded, refresh ScrollTrigger
            if (this.totalScripts > 0 && this.scriptsLoaded >= this.totalScripts) {
                this.refreshScrollTrigger();
            }
        },

        /**
         * Avoid ScrollTrigger refresh storms on iOS/Android address-bar resizes
         */
        setupMobileResizeGuards: function() {
            if (this._mobileResizeGuardsConfigured || !window.ScrollTrigger) return;
            this._mobileResizeGuardsConfigured = true;

            try {
                if (typeof ScrollTrigger.config === 'function') {
                    ScrollTrigger.config({ ignoreMobileResize: true });
                }
            } catch (e) {}

            const refreshAfterOrientationChange = () => {
                if (!window.ScrollTrigger) return;
                setTimeout(() => {
                    try { ScrollTrigger.refresh(); } catch (e) {}
                }, 350);
            };

            try {
                window.addEventListener('orientationchange', refreshAfterOrientationChange, { passive: true });
            } catch (e) {}
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AnimationManager.init();
        });
    } else {
        window.AnimationManager.init();
    }
    
})();

