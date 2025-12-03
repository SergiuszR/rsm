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
                    
                    // CRITICAL: Refresh ScrollTrigger after all animations are set up
                    // This ensures proper position calculations
                    setTimeout(() => {
                        if (window.ScrollTrigger) {
                            console.log('[AnimationManager] Refreshing ScrollTrigger after callbacks');
                            try { ScrollTrigger.refresh(); } catch(e) {}
                        }
                    }, 100);
                    
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

            const MOBILE_WIDTH_MAX = 1024;
            const WIDTH_EPSILON = 1;
            const HEIGHT_JITTER_MAX = 240;
            const TOOLBAR_SETTLE_DELAY = 450;
            const IS_TOUCH_VIEWPORT = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;

            try {
                if (typeof ScrollTrigger.config === 'function') {
                    // Only set ignoreMobileResize - don't modify autoRefreshEvents
                    // Removing 'resize' from autoRefreshEvents can break initial trigger detection
                    ScrollTrigger.config({ ignoreMobileResize: true });
                }
            } catch (e) { console.warn('[AnimationManager] ScrollTrigger.config error:', e); }

            const guardState = {
                toolbarActive: false,
                timer: null,
                refreshQueued: false,
                lastVVWidth: (window.visualViewport && window.visualViewport.width) || window.innerWidth,
                lastVVHeight: (window.visualViewport && window.visualViewport.height) || window.innerHeight,
                originalRefresh: ScrollTrigger.refresh,
                resizePatched: false,
                normalizer: null
            };

            // DISABLED: normalizeScroll causes scroll interruption on mobile when browser UI appears
            // If you need smooth scroll normalization, use Lenis instead which handles this better
            /*
            if (IS_TOUCH_VIEWPORT && typeof ScrollTrigger.normalizeScroll === 'function') {
                try {
                    guardState.normalizer = ScrollTrigger.normalizeScroll({
                        allowNestedScroll: true,
                        lockAxis: false,
                        momentum: 0.85,
                        speed: 1,
                        type: 'touch,wheel',
                        target: window,
                        disable: () => !isMobileWidth()
                    });
                } catch (e) {}
            }
            */

            function isMobileWidth() {
                return window.innerWidth <= MOBILE_WIDTH_MAX;
            }

            function flushDeferredRefresh() {
                if (!guardState.refreshQueued) return;
                guardState.refreshQueued = false;
                try {
                    guardState.originalRefresh.call(ScrollTrigger);
                } catch (e) {}
            }

            function endToolbarSuspension() {
                guardState.toolbarActive = false;
                flushDeferredRefresh();
            }

            function scheduleToolbarSuspension() {
                if (!isMobileWidth()) return;
                guardState.toolbarActive = true;
                clearTimeout(guardState.timer);
                guardState.timer = setTimeout(endToolbarSuspension, TOOLBAR_SETTLE_DELAY);
            }

            ScrollTrigger.refresh = function() {
                if (guardState.toolbarActive && isMobileWidth()) {
                    guardState.refreshQueued = true;
                    return;
                }
                return guardState.originalRefresh.apply(this, arguments);
            };

            function patchWindowResizeListeners() {
                if (guardState.resizePatched) return;
                guardState.resizePatched = true;

                const nativeAddEventListener = window.addEventListener.bind(window);
                const nativeRemoveEventListener = window.removeEventListener.bind(window);
                const resizeListenerMap = new WeakMap();

                function getCaptureFlag(options) {
                    if (typeof options === 'boolean') return options;
                    if (options && typeof options === 'object') return !!options.capture;
                    return false;
                }

                function shouldSkipResizeCallbacks() {
                    return guardState.toolbarActive && isMobileWidth();
                }

                function shouldBypassGuard(listener, options) {
                    return Boolean((listener && listener.__rsmAllowToolbarResize) || (options && options.__rsmAllowToolbarResize));
                }

                function wrapResizeListener(listener) {
                    if (typeof listener === 'function') {
                        return function wrappedResizeListener(event) {
                            if (shouldSkipResizeCallbacks()) return;
                            return listener.call(this, event);
                        };
                    }
                    if (listener && typeof listener.handleEvent === 'function') {
                        return {
                            handleEvent: function(event) {
                                if (shouldSkipResizeCallbacks()) return;
                                return listener.handleEvent.call(listener, event);
                            }
                        };
                    }
                    return listener;
                }

                window.addEventListener = function(type, listener, options) {
                    if (type === 'resize' && listener && !shouldBypassGuard(listener, options)) {
                        const wrapped = wrapResizeListener(listener);
                        const capture = getCaptureFlag(options);
                        const existing = resizeListenerMap.get(listener) || [];
                        existing.push({ wrapped, capture });
                        resizeListenerMap.set(listener, existing);
                        return nativeAddEventListener(type, wrapped, options);
                    }
                    return nativeAddEventListener(type, listener, options);
                };

                window.removeEventListener = function(type, listener, options) {
                    if (type === 'resize' && listener && !shouldBypassGuard(listener, options) && resizeListenerMap.has(listener)) {
                        const listeners = resizeListenerMap.get(listener);
                        if (!listeners || listeners.length === 0) {
                            return nativeRemoveEventListener(type, listener, options);
                        }

                        const capture = getCaptureFlag(options);
                        const index = listeners.findIndex(item => item.capture === capture);
                        const entry = index >= 0 ? listeners.splice(index, 1)[0] : listeners.pop();

                        if (listeners.length === 0) {
                            resizeListenerMap.delete(listener);
                        } else {
                            resizeListenerMap.set(listener, listeners);
                        }

                        if (entry && entry.wrapped) {
                            return nativeRemoveEventListener(type, entry.wrapped, options);
                        }
                        return nativeRemoveEventListener(type, listener, options);
                    }
                    return nativeRemoveEventListener(type, listener, options);
                };
            }

            function handleViewportResize(width, height) {
                const widthDelta = Math.abs(width - guardState.lastVVWidth);
                const heightDelta = Math.abs(height - guardState.lastVVHeight);
                guardState.lastVVWidth = width;
                guardState.lastVVHeight = height;

                const heightOnlyChange = widthDelta <= WIDTH_EPSILON && heightDelta > 0 && heightDelta <= HEIGHT_JITTER_MAX;
                if (heightOnlyChange) {
                    scheduleToolbarSuspension();
                }
            }

            const nativeAddEventListener = window.addEventListener.bind(window);

            if (window.visualViewport && typeof window.visualViewport.addEventListener === 'function') {
                try {
                    window.visualViewport.addEventListener('resize', function() {
                        handleViewportResize(window.visualViewport.width, window.visualViewport.height);
                    }, { passive: true });
                } catch (e) {}
            } else {
                try {
                    nativeAddEventListener('resize', function() {
                        handleViewportResize(window.innerWidth, window.innerHeight);
                    }, { passive: true });
                } catch (e) {}
            }

            patchWindowResizeListeners();

            const refreshAfterOrientationChange = () => {
                if (!window.ScrollTrigger) return;
                setTimeout(() => {
                    guardState.toolbarActive = false;
                    flushDeferredRefresh();
                    try { guardState.originalRefresh.call(ScrollTrigger); } catch (e) {}
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

