/**
 * Safe Script Loader for Webflow
 * Alternative approach with better error isolation
 */

(function() {
    'use strict';
    
    console.log('[Safe Loader] Initializing...');
    
    // Configuration
    const SAFE_CONFIG = {
        baseURL: 'https://rsm-project.netlify.app',
        scripts: {
            global: [
                'js/global/footer.js',
                'js/global/lenis.js'
            ],
            homepage: [
                'js/homepage/cards.js',
                'js/homepage/testimonials.js'
            ]
        },
        loaded: new Set()
    };

    // Safe script loading with error isolation
    function safeLoadScript(src, callback) {
        if (SAFE_CONFIG.loaded.has(src)) {
            console.log('[Safe Loader] Script already loaded:', src);
            if (callback) callback();
            return;
        }

        const script = document.createElement('script');
        script.src = `${SAFE_CONFIG.baseURL}/${src}`;
        script.defer = true;
        
        // Wrap script execution in try-catch
        const originalOnLoad = script.onload;
        script.onload = function() {
            try {
                SAFE_CONFIG.loaded.add(src);
                console.log('[Safe Loader] Successfully loaded:', src);
                if (callback) callback();
            } catch (e) {
                console.error('[Safe Loader] Error in script:', src, e);
                if (callback) callback(e);
            }
        };
        
        script.onerror = function() {
            console.error('[Safe Loader] Failed to load:', src);
            if (callback) callback(new Error(`Failed to load ${src}`));
        };
        
        document.head.appendChild(script);
        console.log('[Safe Loader] Loading:', src);
    }

    // Load multiple scripts safely
    function safeLoadScripts(scripts, callback) {
        if (!scripts || scripts.length === 0) {
            if (callback) callback();
            return;
        }

        let loaded = 0;
        let hasError = false;

        function onLoad(error) {
            loaded++;
            if (error && !hasError) {
                hasError = true;
                if (callback) callback(error);
                return;
            }
            
            if (loaded === scripts.length && !hasError) {
                console.log('[Safe Loader] All scripts loaded successfully');
                if (callback) callback();
            }
        }

        scripts.forEach(script => {
            safeLoadScript(script, onLoad);
        });
    }

    // Public API
    window.SafeRSM = {
        loadGlobal: function(callback) {
            console.log('[Safe Loader] Loading global scripts...');
            safeLoadScripts(SAFE_CONFIG.scripts.global, callback);
        },
        
        loadHomepage: function(callback) {
            console.log('[Safe Loader] Loading homepage scripts...');
            safeLoadScripts(SAFE_CONFIG.scripts.homepage, callback);
        },
        
        loadCustom: function(src, callback) {
            safeLoadScript(src, callback);
        },
        
        isLoaded: function(src) {
            return SAFE_CONFIG.loaded.has(src);
        }
    };

    // Auto-load global scripts
    window.SafeRSM.loadGlobal(function(error) {
        if (error) {
            console.error('[Safe Loader] Global scripts failed:', error);
        } else {
            console.log('[Safe Loader] Global scripts loaded successfully');
        }
    });

    console.log('[Safe Loader] Initialized');
})();
