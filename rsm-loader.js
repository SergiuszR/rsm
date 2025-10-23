/**
 * Simple RSM Script Loader
 * One global loader that handles everything
 */

(function () {
    'use strict';

    // If the page used a tiny inline stub before this loader (recommended when using defer/async),
    // keep references so we can flush any queued calls and callbacks once RSM becomes available.
    // Supported stubs:
    // - window.RSM with { _q: [{ method, args }], _readyCallbacks: [fn] }
    // - window.RSMQueue as an array of functions: fn(RSM)
    var __preRSM = window.RSM;
    var __preQueue = window.RSMQueue;

    // Early: neutralize YouTube iframes before they can load and set cookies
    (function neutralizeYouTubeIframesEarly() {
        function sanitizeIframe(iframe) {
            try {
                if (!iframe || iframe.dataset.ytSanitized) return;
                var src = iframe.getAttribute('src') || '';
                if (!/youtube\.com\//i.test(src) && !/youtu\.be\//i.test(src)) return;
                iframe.setAttribute('data-yt-src', src);
                iframe.removeAttribute('src');
                iframe.setAttribute('data-yt-sanitized', '');
            } catch (e) { }
        }

        function scan(root) {
            try {
                var nodes = (root || document).querySelectorAll('.video_container iframe');
                for (var i = 0; i < nodes.length; i++) sanitizeIframe(nodes[i]);
            } catch (e) { }
        }

        // Run immediately for already parsed content
        scan(document);

        // Observe future additions during parsing
        try {
            var mo = new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var m = muts[i];
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        var node = m.addedNodes[j];
                        if (node && node.nodeType === 1) scan(node);
                    }
                }
            });
            mo.observe(document.documentElement || document, { subtree: true, childList: true });
        } catch (e) { }
    })();

    // Determine which Netlify npm (or custom base) to load scripts from
    function getBaseURL() {
        // Highest priority: localStorage env flag for localhost development
        try {
            const isLocalEnv = localStorage.getItem('env') === 'true';
            if (isLocalEnv) {
                // console.log('RSM Loader: Loading from LOCALHOST (via localStorage env=true)');
                return 'http://localhost:5000';
            }
        } catch (e) { }

        // Second priority: explicit base override
        // URL param: ?rsm-base=https://my-host.example.com
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const baseOverride = urlParams.get('rsm-base');
            if (baseOverride) {
                // console.log('RSM Loader: Using explicit base override from URL:', baseOverride);
                return baseOverride.replace(/\/$/, '');
            }
        } catch (e) { }
        if (window.RSM_BASE_URL && typeof window.RSM_BASE_URL === 'string') {
            // console.log('RSM Loader: Using explicit base override from window.RSM_BASE_URL:', window.RSM_BASE_URL);
            return window.RSM_BASE_URL.replace(/\/$/, '');
        }
        // Check for URL parameter to override (for testing)
        // Usage: ?rsm-branch=development or ?rsm-branch=main
        const urlParams = new URLSearchParams(window.location.search);
        const branchParam = urlParams.get('rsm-branch');

        if (branchParam === 'development') {
            // console.log('RSM Loader: Loading from DEVELOPMENT branch (via URL parameter)');
            return 'https://development--rsm-project.netlify.app';
        }

        if (branchParam === 'main' || branchParam === 'production') {
            // console.log('RSM Loader: Loading from PRODUCTION branch (via URL parameter)');
            return 'https://rsm-project.netlify.app';
        }

        // Check for global config variable (can be set in Webflow custom code)
        // Add to Webflow: <script>window.RSM_BRANCH = 'development';</script>
        if (window.RSM_BRANCH === 'development') {
            // console.log('RSM Loader: Loading from DEVELOPMENT branch (via RSM_BRANCH config)');
            return 'https://development--rsm-project.netlify.app';
        }

        if (window.RSM_BRANCH === 'main' || window.RSM_BRANCH === 'production') {
            // console.log('RSM Loader: Loading from PRODUCTION branch (via RSM_BRANCH config)');
            return 'https://rsm-project.netlify.app';
        }

        // Default to production
        // console.log('RSM Loader: Loading from PRODUCTION branch (default)');
        return 'https://rsm-project.netlify.app';
    }

    // Optionally enable LiveReload/BrowserSync client for hot-reload during local dev
    function maybeEnableLiveReload() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const liveUrl = urlParams.get('rsm-livereload') || window.RSM_LIVE_RELOAD_URL;
            if (!liveUrl) return;
            const script = document.createElement('script');
            script.src = liveUrl;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
            console.log('RSM Loader: Live reload client enabled:', liveUrl);
        } catch (e) { }
    }

    // Create RSM object immediately
    window.RSM = {
        baseURL: getBaseURL(),
        loaded: new Set(),
        _ready: false,
        _readyCallbacks: [],

        // Allow consumers to wait for RSM even if this script is loaded with defer/async
        onReady: function (callback) {
            if (!callback) return;
            if (this._ready) {
                try { callback(); } catch (e) { }
                return;
            }
            this._readyCallbacks.push(callback);
        },

        // Internal: mark ready and notify listeners
        _emitReady: function () {
            if (this._ready) return;
            this._ready = true;
            // Fire DOM event for non-stub usage
            try {
                var evt = (typeof Event === 'function') ? new Event('rsm:ready') : (function () {
                    var ev = document.createEvent('Event');
                    ev.initEvent('rsm:ready', true, true);
                    return ev;
                })();
                window.dispatchEvent(evt);
            } catch (e) { }
            // Drain callbacks registered via onReady
            var cbs = this._readyCallbacks.slice();
            this._readyCallbacks.length = 0;
            for (var i = 0; i < cbs.length; i++) {
                try { cbs[i](); } catch (e) { }
            }
        },

        // Load a single script
        loadScript: function (src, callback) {
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
        loadScripts: function (scripts, callback) {
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
        appendScriptToPage: function (pageName, callback) {
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
                    'js/homepage/reels.js',
                    'js/homepage/reels-vimeo.js'
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

    // Flush any calls queued by an early stub and advertise readiness
    (function flushEarlyAndSignalReady() {
        try {
            // 1) Support stubs that queued method calls: { method, args }
            var q = __preRSM && (__preRSM._q || __preRSM._queue || __preRSM.queue);
            if (q && q.length) {
                for (var i = 0; i < q.length; i++) {
                    var item = q[i] || {};
                    var name = item.method || item.fn || item[0];
                    var args = item.args || item[1] || [];
                    try {
                        if (name && typeof window.RSM[name] === 'function') {
                            window.RSM[name].apply(window.RSM, Array.isArray(args) ? args : [args]);
                        }
                    } catch (e) { }
                }
            }
            // 2) Support stubs that queued callbacks as functions: fn(RSM)
            if (Array.isArray(__preQueue) && __preQueue.length) {
                for (var j = 0; j < __preQueue.length; j++) {
                    try { __preQueue[j](window.RSM); } catch (e) { }
                }
                __preQueue.length = 0;
            }
            // 3) Drain any ready callbacks put on the stub
            var rc = __preRSM && (__preRSM._readyCallbacks || __preRSM._rc);
            if (rc && rc.length) {
                for (var k = 0; k < rc.length; k++) {
                    try { rc[k](); } catch (e) { }
                }
            }
        } catch (e) { }
        // Finally, broadcast readiness so consumers using addEventListener('rsm:ready') are notified
        window.RSM._emitReady();
    })();

    // Auto-load global scripts when DOM is ready
    function initGlobalScripts() {
        maybeEnableLiveReload();
        // Load anim-init.js FIRST, then load everything else
        // This ensures AnimationManager is available before other scripts check for it
        window.RSM.loadScript('js/global/anim-init.js', function (error) {
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
                'js/global/navbar-anim.js',
                'js/global/loader.js',
                'js/global/faq.js'
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