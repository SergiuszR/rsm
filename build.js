#!/usr/bin/env node
/**
 * Build script to minify JavaScript files with source maps
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Terser configuration for production-ready minification
const terserOptions = {
    compress: {
        dead_code: true,
        drop_console: false, // Keep console logs for now, set to true to remove
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.debug'], // Remove console.debug calls
    },
    mangle: {
        safari10: true, // Better Safari compatibility
    },
    format: {
        comments: false, // Remove all comments
        preamble: '/* RSM Scripts - Minified */', // Add header comment
    },
    sourceMap: {
        filename: undefined, // Will be set per file
        url: undefined, // Will be set per file
    },
};

/**
 * Recursively get all .js files in a directory
 */
function getJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getJsFiles(filePath, fileList);
        } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Minify a single file
 */
async function minifyFile(inputPath, outputPath) {
    try {
        const code = fs.readFileSync(inputPath, 'utf8');
        const filename = path.basename(outputPath);
        const mapFilename = `${filename}.map`;
        
        const result = await minify(code, {
            ...terserOptions,
            sourceMap: {
                filename: filename,
                url: mapFilename,
            },
        });
        
        if (result.error) {
            throw result.error;
        }
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write minified file
        fs.writeFileSync(outputPath, result.code, 'utf8');
        
        // Write source map
        if (result.map) {
            fs.writeFileSync(`${outputPath}.map`, result.map, 'utf8');
        }
        
        const originalSize = Buffer.byteLength(code, 'utf8');
        const minifiedSize = Buffer.byteLength(result.code, 'utf8');
        const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
        
        console.log(`✓ ${inputPath}`);
        console.log(`  ${originalSize} → ${minifiedSize} bytes (${savings}% smaller)`);
        
        return { success: true, originalSize, minifiedSize };
    } catch (error) {
        console.error(`✗ Failed to minify ${inputPath}:`, error.message);
        return { success: false, error };
    }
}

/**
 * Main build process
 */
async function build() {
    console.log('🚀 Starting build process...\n');
    
    const distDir = path.join(__dirname, 'dist');
    
    // Clean dist directory
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    // Get all JS files to minify
    const jsFiles = getJsFiles(path.join(__dirname, 'js'));
    const rootLoaders = [
        path.join(__dirname, 'rsm-loader.js'),
        path.join(__dirname, 'homepage-loader.js'),
        path.join(__dirname, 'dev-helper.js'),
    ].filter(f => fs.existsSync(f));
    
    const allFiles = [...rootLoaders, ...jsFiles];
    
    console.log(`Found ${allFiles.length} files to minify\n`);
    
    let totalOriginalSize = 0;
    let totalMinifiedSize = 0;
    let successCount = 0;
    let failCount = 0;
    
    // Process all files
    for (const inputPath of allFiles) {
        const relativePath = path.relative(__dirname, inputPath);
        const outputPath = path.join(distDir, relativePath);
        
        const result = await minifyFile(inputPath, outputPath);
        
        if (result.success) {
            successCount++;
            totalOriginalSize += result.originalSize;
            totalMinifiedSize += result.minifiedSize;
        } else {
            failCount++;
        }
        
        console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('═'.repeat(60));
    console.log('📊 Build Summary');
    console.log('═'.repeat(60));
    console.log(`✓ Success: ${successCount} files`);
    if (failCount > 0) {
        console.log(`✗ Failed: ${failCount} files`);
    }
    console.log(`📦 Total size: ${totalOriginalSize} → ${totalMinifiedSize} bytes`);
    console.log(`💾 Savings: ${((1 - totalMinifiedSize / totalOriginalSize) * 100).toFixed(1)}%`);
    console.log('═'.repeat(60));
    
    if (failCount > 0) {
        process.exit(1);
    }
    
    console.log('\n✨ Build completed successfully!');
}

// Run the build
build().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});

