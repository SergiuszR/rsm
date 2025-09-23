/**
 * Homepage Script Loader
 * Simple script to load homepage-specific functionality
 * Include this in your Webflow homepage footer or use RSM.appendScriptToPage('homepage')
 */

(function() {
    'use strict';
    
    // Check if RSM loader is available
    if (typeof window.RSM === 'undefined') {
        console.error('RSM Loader not found. Please include rsm-loader.js first.');
        return;
    }

    // Load homepage scripts
    window.RSM.appendScriptToPage('homepage', function(error) {
        if (error) {
            console.error('Failed to load homepage scripts:', error);
        } else {
            console.log('Homepage scripts loaded successfully');
        }
    });
})();
