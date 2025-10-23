/**
 * Development Helper Script
 * Provides utilities for localhost development
 */

(function() {
    'use strict';

    // Development helper object
    window.RSMDev = {
        // Enable localhost mode
        enableLocalhost: function() {
            try {
                localStorage.setItem('env', 'true');
                console.log('✅ Localhost mode enabled. Reload the page to use localhost files.');
                console.log('📡 Files will be served from: http://localhost:5000');
                return true;
            } catch (e) {
                console.error('❌ Failed to enable localhost mode:', e);
                return false;
            }
        },

        // Disable localhost mode
        disableLocalhost: function() {
            try {
                localStorage.removeItem('env');
                console.log('✅ Localhost mode disabled. Reload the page to use production files.');
                return true;
            } catch (e) {
                console.error('❌ Failed to disable localhost mode:', e);
                return false;
            }
        },

        // Check current mode
        getCurrentMode: function() {
            try {
                const isLocal = localStorage.getItem('env') === 'true';
                return isLocal ? 'localhost' : 'production';
            } catch (e) {
                return 'production';
            }
        },

        // Show current status
        status: function() {
            const mode = this.getCurrentMode();
            const baseURL = window.RSM ? window.RSM.baseURL : 'Unknown';
            
            console.log('📊 RSM Development Status:');
            console.log(`   Mode: ${mode}`);
            console.log(`   Base URL: ${baseURL}`);
            console.log(`   Loaded Scripts: ${window.RSM ? window.RSM.loaded.size : 0}`);
            
            if (mode === 'localhost') {
                console.log('💡 To disable localhost mode: RSMDev.disableLocalhost()');
            } else {
                console.log('💡 To enable localhost mode: RSMDev.enableLocalhost()');
            }
        },

        // Reload page
        reload: function() {
            window.location.reload();
        }
    };

    // Auto-show status on load
    if (window.RSM && window.RSM._ready) {
        setTimeout(() => window.RSMDev.status(), 1000);
    } else {
        window.addEventListener('rsm:ready', () => {
            setTimeout(() => window.RSMDev.status(), 1000);
        });
    }

    // Console helpers
    console.log('🛠️  RSM Development Helper loaded!');
    console.log('📖 Available commands:');
    console.log('   RSMDev.enableLocalhost()  - Enable localhost mode');
    console.log('   RSMDev.disableLocalhost() - Disable localhost mode');
    console.log('   RSMDev.status()           - Show current status');
    console.log('   RSMDev.reload()           - Reload the page');

})();
