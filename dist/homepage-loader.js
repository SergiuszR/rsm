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
            // Wait for RSM with timeout
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds
            
            const checkRSM = setInterval(function() {
                attempts++;
                
                if (window.RSM) {
                    clearInterval(checkRSM);
                    RSM.appendScriptToPage('homepage');
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkRSM);
                    console.error('RSM Loader not found after 5 seconds');
                }
            }, 100);
        }
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHomepage);
    } else {
        loadHomepage();
    }
})();