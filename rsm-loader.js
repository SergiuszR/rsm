/**
 * Simple RSM Script Loader
 * One global loader that handles everything
 */

(function() {
    'use strict';
    
    // Create RSM object immediately
    window.RSM = {
        baseURL: 'https://rsm-project.netlify.app',
        loaded: new Set(),
        
        // Load a single script
        loadScript: function(src, callback) {
            if (this.loaded.has(src)) {
                if (callback) callback();
                return;
            }
            
            const script = document.createElement('script');
            script.src = `${this.baseURL}/${src}`;
            script.defer = true;
            
            script.onload = () => {
                this.loaded.add(src);
                if (callback) callback();
            };
            
            script.onerror = () => {
                if (callback) callback(new Error(`Failed to load ${src}`));
            };
            
            document.head.appendChild(script);
        },
        
        // Load multiple scripts
        loadScripts: function(scripts, callback) {
            if (!scripts || scripts.length === 0) {
                if (callback) callback();
                return;
            }
            
            let loaded = 0;
            let hasError = false;
            
            scripts.forEach(script => {
                this.loadScript(script, (error) => {
                    loaded++;
                    if (error && !hasError) {
                        hasError = true;
                        if (callback) callback(error);
                        return;
                    }
                    if (loaded === scripts.length && !hasError) {
                        if (callback) callback();
                    }
                });
            });
        },
        
        // Load page-specific scripts
        appendScriptToPage: function(pageName, callback) {
            const scripts = {
                homepage: [
                    'js/homepage/cards.js',
                    'js/homepage/testimonials.js'
                ]
            };
            
            const pageScripts = scripts[pageName];
            if (!pageScripts) {
                if (callback) callback(new Error(`No scripts for page: ${pageName}`));
                return;
            }
            
            this.loadScripts(pageScripts, callback);
        }
    };
    
    // Auto-load global scripts when DOM is ready
    function initGlobalScripts() {
        window.RSM.loadScripts([
            'js/global/footer.js',
            'js/global/lenis.js'
        ]);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalScripts);
    } else {
        initGlobalScripts();
    }
    
})();