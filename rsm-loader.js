/**
 * RSM Script Loader for Webflow + Netlify
 * Main loader script to be included globally in Webflow
 */

(function() {
    'use strict';
    
    // Configuration
    const RSM_CONFIG = {
        baseURL: 'https://rsm-project.netlify.app', // Update this with your actual Netlify URL
        globalScripts: [
            'js/global/footer.js',
            'js/global/lenis.js'
        ],
        pageScripts: {
            homepage: [
                'js/homepage/cards.js',
                'js/homepage/testimonials.js'
            ]
        },
        loadedScripts: new Set(),
        debug: false // Set to true for console logging
    };

    // Utility functions
    function log(...args) {
        if (RSM_CONFIG.debug) {
            console.log('[RSM Loader]', ...args);
        }
    }

    function error(...args) {
        console.error('[RSM Loader]', ...args);
    }

    // Script loading function
    function loadScript(src, callback) {
        if (RSM_CONFIG.loadedScripts.has(src)) {
            log(`Script already loaded: ${src}`);
            if (callback) callback();
            return;
        }

        const script = document.createElement('script');
        script.src = `${RSM_CONFIG.baseURL}/${src}`;
        script.defer = true;
        
        script.onload = function() {
            RSM_CONFIG.loadedScripts.add(src);
            log(`Successfully loaded: ${src}`);
            if (callback) callback();
        };
        
        script.onerror = function() {
            error(`Failed to load: ${src}`);
            if (callback) callback(new Error(`Failed to load ${src}`));
        };
        
        document.head.appendChild(script);
        log(`Loading script: ${src}`);
    }

    // Load multiple scripts with callback when all are done
    function loadScripts(scriptPaths, callback) {
        if (!scriptPaths || scriptPaths.length === 0) {
            if (callback) callback();
            return;
        }

        let loadedCount = 0;
        let hasError = false;
        const totalScripts = scriptPaths.length;

        function onScriptLoad(error) {
            loadedCount++;
            if (error && !hasError) {
                hasError = true;
                if (callback) callback(error);
                return;
            }
            
            if (loadedCount === totalScripts && !hasError) {
                log(`All scripts loaded successfully (${totalScripts} scripts)`);
                if (callback) callback();
            }
        }

        scriptPaths.forEach(scriptPath => {
            loadScript(scriptPath, onScriptLoad);
        });
    }

    // Main initialization function
    function initRSM() {
        log('Initializing RSM Script Loader');
        
        // Load global scripts first
        loadScripts(RSM_CONFIG.globalScripts, function(error) {
            if (error) {
                error('Failed to load global scripts:', error);
                return;
            }
            log('Global scripts loaded successfully');
        });
    }

    // Public API
    window.RSM = {
        // Load page-specific scripts
        appendScriptToPage: function(pageName, callback) {
            if (!pageName) {
                error('Page name is required');
                if (callback) callback(new Error('Page name is required'));
                return;
            }

            const scripts = RSM_CONFIG.pageScripts[pageName];
            if (!scripts) {
                error(`No scripts found for page: ${pageName}`);
                if (callback) callback(new Error(`No scripts found for page: ${pageName}`));
                return;
            }

            log(`Loading scripts for page: ${pageName}`);
            loadScripts(scripts, function(error) {
                if (error) {
                    error(`Failed to load scripts for page ${pageName}:`, error);
                } else {
                    log(`Successfully loaded all scripts for page: ${pageName}`);
                }
                if (callback) callback(error);
            });
        },

        // Load custom script
        loadCustomScript: function(scriptPath, callback) {
            loadScript(scriptPath, callback);
        },

        // Configure the loader
        configure: function(options) {
            if (options.baseURL) RSM_CONFIG.baseURL = options.baseURL;
            if (options.debug !== undefined) RSM_CONFIG.debug = options.debug;
            if (options.pageScripts) {
                Object.assign(RSM_CONFIG.pageScripts, options.pageScripts);
            }
            log('Configuration updated:', options);
        },

        // Get current configuration
        getConfig: function() {
            return { ...RSM_CONFIG };
        },

        // Check if script is loaded
        isScriptLoaded: function(scriptPath) {
            return RSM_CONFIG.loadedScripts.has(scriptPath);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRSM);
    } else {
        initRSM();
    }

    log('RSM Script Loader initialized');
})();
