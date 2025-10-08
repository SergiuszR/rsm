/**
 * Simple RSM Script Loader
 * One global loader that handles everything
 */

(function() {
    'use strict';
    
    // Auto-detect baseURL based on current domain
    function getBaseURL() {
        const hostname = window.location.hostname;
        
        // Development environment (Netlify branch deploys)
        if (hostname.includes('development--rsm-project.netlify.app')) {
            return 'https://development--rsm-project.netlify.app';
        }
        
        // Staging or other branch deploys (pattern: branchname--rsm-project.netlify.app)
        if (hostname.includes('--rsm-project.netlify.app')) {
            return `https://${hostname}`;
        }
        
        // Production
        if (hostname.includes('rsm-project.netlify.app')) {
            return 'https://rsm-project.netlify.app';
        }
        
        // Local development - load from production as fallback
        // (or you could set up a local server and return the local URL)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.warn('Running on localhost - loading scripts from production');
            return 'https://rsm-project.netlify.app';
        }
        
        // Custom domain or unknown - use current origin
        return window.location.origin;
    }
    
    // Create RSM object immediately
    window.RSM = {
        baseURL: getBaseURL(),
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
                    'js/homepage/testimonials.js',
                    'js/homepage/svg-anim.js',
                    'js/homepage/eye-anim.js',
                    'js/homepage/timeline-anim.js',
                    'js/homepage/services-anim.js',
                    'js/homepage/blog-anim.js',
                    'js/homepage/youtube.js',
                    'js/homepage/section-anim.js',
                    'js/homepage/marquee.js',
                    'js/homepage/video.js'
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
            'js/global/anim-init.js',
            'js/global/footer.js',
            'js/global/lenis.js',
            'js/global/contact-modal.js',
            'js/global/navbar.js',
            'js/global/footer-physics.js',
            'js/global/utils.js',
            'js/global/navbar-anim.js'
        ]);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalScripts);
    } else {
        initGlobalScripts();
    }
    
})();