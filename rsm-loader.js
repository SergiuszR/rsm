/**
 * Simple RSM Script Loader
 * One global loader that handles everything
 */

(function() {
    'use strict';
    
    // Determine which Netlify branch to load scripts from
    function getBaseURL() {
        // Check for URL parameter to override (for testing)
        // Usage: ?rsm-branch=development or ?rsm-branch=main
        const urlParams = new URLSearchParams(window.location.search);
        const branchParam = urlParams.get('rsm-branch');
        
        if (branchParam === 'development') {
            console.log('RSM Loader: Loading from DEVELOPMENT branch (via URL parameter)');
            return 'https://development--rsm-project.netlify.app';
        }
        
        if (branchParam === 'main' || branchParam === 'production') {
            console.log('RSM Loader: Loading from PRODUCTION branch (via URL parameter)');
            return 'https://rsm-project.netlify.app';
        }
        
        // Check for global config variable (can be set in Webflow custom code)
        // Add to Webflow: <script>window.RSM_BRANCH = 'development';</script>
        if (window.RSM_BRANCH === 'development') {
            console.log('RSM Loader: Loading from DEVELOPMENT branch (via RSM_BRANCH config)');
            return 'https://development--rsm-project.netlify.app';
        }
        
        if (window.RSM_BRANCH === 'main' || window.RSM_BRANCH === 'production') {
            console.log('RSM Loader: Loading from PRODUCTION branch (via RSM_BRANCH config)');
            return 'https://rsm-project.netlify.app';
        }
        
        // Default to production
        console.log('RSM Loader: Loading from PRODUCTION branch (default)');
        return 'https://rsm-project.netlify.app';
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
        // Load anim-init.js FIRST, then load everything else
        // This ensures AnimationManager is available before other scripts check for it
        window.RSM.loadScript('js/global/anim-init.js', function(error) {
            if (error) {
                console.error('Failed to load anim-init.js:', error);
                return;
            }
            
            // Now load the rest of the global scripts (these can load in parallel)
            window.RSM.loadScripts([
                'js/global/footer.js',
                'js/global/lenis.js',
                'js/global/contact-modal.js',
                'js/global/navbar.js',
                'js/global/footer-physics.js',
                'js/global/utils.js',
                'js/global/navbar-anim.js'
            ]);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalScripts);
    } else {
        initGlobalScripts();
    }
    
})();