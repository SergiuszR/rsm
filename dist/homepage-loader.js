/**
 * Simple Homepage Loader
 * Just loads homepage scripts
 */

(function() {
    'use strict';
    
    function loadHomepage() {
        // Wait for BOTH RSM and AnimationManager to be available
        function checkReady() {
            if (window.RSM && window.AnimationManager) {
                RSM.appendScriptToPage('homepage');
                return true;
            }
            return false;
        }
        
        // Try immediately
        if (checkReady()) {
            return;
        }
        
        // Wait for both RSM and AnimationManager with timeout
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (checkReady()) {
                clearInterval(checkInterval);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('RSM or AnimationManager not found after 5 seconds');
                console.error('RSM exists:', !!window.RSM);
                console.error('AnimationManager exists:', !!window.AnimationManager);
            }
        }, 100);
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHomepage);
    } else {
        loadHomepage();
    }
})();