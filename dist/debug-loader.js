/**
 * Debug Script for RSM Loader
 * Use this to troubleshoot loading issues
 * Add this script AFTER your RSM loader to check status
 */

(function() {
    'use strict';
    
    console.log('=== RSM DEBUG SCRIPT ===');
    console.log('Document ready state:', document.readyState);
    console.log('RSM defined:', typeof window.RSM !== 'undefined');
    
    if (typeof window.RSM !== 'undefined') {
        console.log('RSM configuration:', window.RSM.getConfig());
        console.log('RSM ready:', window.RSM.isReady());
        
        // Test loading a script
        console.log('Testing script loading...');
        window.RSM.appendScriptToPage('homepage', function(error) {
            if (error) {
                console.error('Test failed:', error);
            } else {
                console.log('Test successful: Homepage scripts loaded');
            }
        });
    } else {
        console.error('RSM not found! Check your script loading order.');
        
        // Wait and check again
        setTimeout(function() {
            console.log('=== DELAYED CHECK ===');
            console.log('RSM defined (after delay):', typeof window.RSM !== 'undefined');
            
            if (typeof window.RSM !== 'undefined') {
                console.log('RSM found after delay!');
                console.log('RSM configuration:', window.RSM.getConfig());
            } else {
                console.error('RSM still not found. Check:');
                console.error('1. Script src URL is correct');
                console.error('2. Netlify deployment is working');
                console.error('3. No JavaScript errors preventing execution');
                console.error('4. Script loading order');
            }
        }, 2000);
    }
})();
