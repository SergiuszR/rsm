/**
 * Simple Homepage Loader
 * Just loads homepage scripts
 */

(function() {
    'use strict';
    
    function loadHomepage() {
        if (window.RSM) {
            RSM.appendScriptToPage('homepage');
        } else {
            // Fallback: wait for RSM
            setTimeout(loadHomepage, 100);
        }
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHomepage);
    } else {
        loadHomepage();
    }
})();