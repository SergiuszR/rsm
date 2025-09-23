/**
 * Homepage Script Loader
 * Simple script to load homepage-specific functionality
 * Include this in your Webflow homepage footer or use RSM.appendScriptToPage('homepage')
 */

(function() {
    'use strict';
    
    // Function to load homepage scripts
    function loadHomepageScripts() {
        console.log('[Homepage Loader] Attempting to load scripts...');
        
        if (typeof window.RSM === 'undefined') {
            console.error('[Homepage Loader] RSM Loader not found. Please include rsm-loader.js first.');
            return;
        }

        console.log('[Homepage Loader] RSM found, loading scripts...');
        
        // Load homepage scripts
        window.RSM.appendScriptToPage('homepage', function(error) {
            if (error) {
                console.error('[Homepage Loader] Failed to load homepage scripts:', error);
            } else {
                console.log('[Homepage Loader] Homepage scripts loaded successfully');
            }
        });
    }

    // Try to load immediately if RSM is available
    if (typeof window.RSM !== 'undefined') {
        loadHomepageScripts();
    } else {
        // Wait for RSM to load with multiple fallback attempts
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds total wait time
        
        const checkRSM = setInterval(function() {
            attempts++;
            console.log(`[Homepage Loader] Checking for RSM... attempt ${attempts}/${maxAttempts}`);
            
            if (typeof window.RSM !== 'undefined') {
                clearInterval(checkRSM);
                loadHomepageScripts();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkRSM);
                console.error('[Homepage Loader] Timeout: RSM Loader not found after 2 seconds. Please check that rsm-loader.js is loading correctly.');
            }
        }, 100); // Check every 100ms
    }
})();
