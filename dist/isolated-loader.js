/**
 * Isolated Script Loader for Webflow
 * Completely separate from Webflow's execution context
 */

(function() {
    'use strict';
    
    console.log('[Isolated Loader] Starting isolated initialization...');
    
    // Configuration
    const ISOLATED_CONFIG = {
        baseURL: 'https://rsm-project.netlify.app',
        scripts: {
            global: [
                'js/global/footer-isolated.js',
                'js/global/lenis-isolated.js'
            ],
            homepage: [
                'js/homepage/cards-isolated.js',
                'js/homepage/testimonials-isolated.js'
            ]
        },
        loaded: new Set(),
        initialized: false
    };

    // Completely isolated script loading
    function isolatedLoadScript(src, callback) {
        if (ISOLATED_CONFIG.loaded.has(src)) {
            console.log('[Isolated Loader] Script already loaded:', src);
            if (callback) callback();
            return;
        }

        // Create script element with isolation
        const script = document.createElement('script');
        script.src = `${ISOLATED_CONFIG.baseURL}/${src}`;
        script.defer = true;
        script.async = false; // Load synchronously to avoid timing issues
        
        // Wrap in isolated execution context
        script.onload = function() {
            try {
                ISOLATED_CONFIG.loaded.add(src);
                console.log('[Isolated Loader] Successfully loaded:', src);
                
                // Small delay to ensure script is fully executed
                setTimeout(function() {
                    if (callback) callback();
                }, 50);
                
            } catch (e) {
                console.error('[Isolated Loader] Error in script:', src, e);
                if (callback) callback(e);
            }
        };
        
        script.onerror = function() {
            console.error('[Isolated Loader] Failed to load:', src);
            if (callback) callback(new Error(`Failed to load ${src}`));
        };
        
        // Add to head
        document.head.appendChild(script);
        console.log('[Isolated Loader] Loading:', src);
    }

    // Load scripts in sequence to avoid conflicts
    function isolatedLoadScripts(scripts, callback) {
        if (!scripts || scripts.length === 0) {
            if (callback) callback();
            return;
        }

        let currentIndex = 0;
        
        function loadNext() {
            if (currentIndex >= scripts.length) {
                console.log('[Isolated Loader] All scripts loaded successfully');
                if (callback) callback();
                return;
            }
            
            const script = scripts[currentIndex];
            console.log('[Isolated Loader] Loading script', currentIndex + 1, 'of', scripts.length, ':', script);
            
            isolatedLoadScript(script, function(error) {
                if (error) {
                    console.error('[Isolated Loader] Script failed:', script, error);
                    if (callback) callback(error);
                    return;
                }
                
                currentIndex++;
                // Small delay between scripts
                setTimeout(loadNext, 100);
            });
        }
        
        loadNext();
    }

    // Wait for Webflow to be completely ready
    function waitForWebflowReady(callback) {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total
        
        function checkWebflow() {
            attempts++;
            
            // Check if Webflow is ready and DOM is stable
            if (window.Webflow && 
                document.readyState === 'complete' && 
                !document.querySelector('[data-wf-page]') || 
                document.querySelector('[data-wf-page]').getAttribute('data-wf-status') === 'loaded') {
                
                console.log('[Isolated Loader] Webflow ready after', attempts, 'attempts');
                callback();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.log('[Isolated Loader] Webflow timeout, proceeding anyway');
                callback();
                return;
            }
            
            setTimeout(checkWebflow, 100);
        }
        
        checkWebflow();
    }

    // Public API
    window.IsolatedRSM = {
        loadGlobal: function(callback) {
            console.log('[Isolated Loader] Loading global scripts...');
            isolatedLoadScripts(ISOLATED_CONFIG.scripts.global, callback);
        },
        
        loadHomepage: function(callback) {
            console.log('[Isolated Loader] Loading homepage scripts...');
            isolatedLoadScripts(ISOLATED_CONFIG.scripts.homepage, callback);
        },
        
        loadCustom: function(src, callback) {
            isolatedLoadScript(src, callback);
        },
        
        isLoaded: function(src) {
            return ISOLATED_CONFIG.loaded.has(src);
        },
        
        isReady: function() {
            return ISOLATED_CONFIG.initialized;
        }
    };

    // Initialize when everything is ready
    function initializeIsolatedLoader() {
        if (ISOLATED_CONFIG.initialized) {
            console.log('[Isolated Loader] Already initialized');
            return;
        }
        
        ISOLATED_CONFIG.initialized = true;
        console.log('[Isolated Loader] Initializing...');
        
        // Load global scripts
        IsolatedRSM.loadGlobal(function(error) {
            if (error) {
                console.error('[Isolated Loader] Global scripts failed:', error);
            } else {
                console.log('[Isolated Loader] Global scripts loaded successfully');
            }
        });
    }

    // Wait for Webflow to be ready, then initialize
    waitForWebflowReady(function() {
        // Additional delay to ensure Webflow is completely done
        setTimeout(initializeIsolatedLoader, 200);
    });

    console.log('[Isolated Loader] Setup complete');
})();
