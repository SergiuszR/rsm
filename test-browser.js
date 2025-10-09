#!/usr/bin/env node

/**
 * RSM Browser Testing Tool
 * 
 * This tool launches a headless browser, visits your Webflow page,
 * captures console errors/warnings, and saves results to a file
 * that can be analyzed by AI or developers.
 * 
 * Uses Playwright for modern, reliable browser automation
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // URL to test - can be overridden with --url flag
  url: process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] || 
       'https://robimy-social-media-dev.webflow.io/?rsm-branch=development',
  
  // Branch to test - can be overridden with --branch flag
  branch: process.argv.find(arg => arg.startsWith('--branch='))?.split('=')[1] || 'development',
  
  // Timeout in milliseconds
  timeout: 30000,
  
  // Wait for animations to complete
  waitAfterLoad: 5000,
  
  // Output directory
  outputDir: './test-results',
  
  // Viewport settings
  viewport: {
    width: 1920,
    height: 1080
  }
};

class BrowserTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      url: CONFIG.url,
      branch: CONFIG.branch,
      console: [],
      errors: [],
      warnings: [],
      networkErrors: [],
      pageErrors: [],
      performance: {},
      screenshots: [],
      summary: {}
    };
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting browser testing...');
    console.log(`📍 URL: ${CONFIG.url}`);
    console.log(`🌿 Branch: ${CONFIG.branch}`);
    
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Launch browser with Playwright
    this.browser = await chromium.launch({
      headless: true
    });

    this.page = await this.browser.newPage({
      viewport: CONFIG.viewport
    });

    // Set up listeners
    this.setupListeners();
  }

  setupListeners() {
    // Console messages
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      const logEntry = {
        type,
        text,
        timestamp: new Date().toISOString(),
        location: msg.location()
      };

      this.results.console.push(logEntry);

      if (type === 'error') {
        this.results.errors.push(logEntry);
        console.log(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        this.results.warnings.push(logEntry);
        console.log(`⚠️  Console Warning: ${text}`);
      } else if (type === 'log') {
        console.log(`📝 Console Log: ${text}`);
      }
    });

    // Page errors (uncaught exceptions)
    this.page.on('pageerror', error => {
      const errorEntry = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      
      this.results.pageErrors.push(errorEntry);
      console.log(`💥 Page Error: ${error.message}`);
    });

    // Network request failures
    this.page.on('requestfailed', request => {
      const errorEntry = {
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText || 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      this.results.networkErrors.push(errorEntry);
      console.log(`🌐 Network Error: ${request.url()} - ${errorEntry.errorText}`);
    });
  }

  async navigate() {
    console.log('\n🔗 Navigating to page...');
    
    const startTime = Date.now();
    
    try {
      await this.page.goto(CONFIG.url, {
        waitUntil: 'networkidle',
        timeout: CONFIG.timeout
      });
      
      const loadTime = Date.now() - startTime;
      this.results.performance.pageLoadTime = loadTime;
      console.log(`✅ Page loaded in ${loadTime}ms`);
      
    } catch (error) {
      console.error(`❌ Navigation failed: ${error.message}`);
      this.results.errors.push({
        type: 'navigation',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async waitForAnimations() {
    console.log(`\n⏱️  Waiting ${CONFIG.waitAfterLoad}ms for animations...`);
    await this.page.waitForTimeout(CONFIG.waitAfterLoad);
  }

  async captureScreenshots() {
    console.log('\n📸 Capturing screenshots...');
    
    // Full page screenshot
    const fullPagePath = path.join(CONFIG.outputDir, `screenshot-full-${Date.now()}.png`);
    await this.page.screenshot({
      path: fullPagePath,
      fullPage: true
    });
    this.results.screenshots.push({ type: 'full-page', path: fullPagePath });
    console.log(`  ✓ Full page: ${fullPagePath}`);

    // Viewport screenshot
    const viewportPath = path.join(CONFIG.outputDir, `screenshot-viewport-${Date.now()}.png`);
    await this.page.screenshot({
      path: viewportPath,
      fullPage: false
    });
    this.results.screenshots.push({ type: 'viewport', path: viewportPath });
    console.log(`  ✓ Viewport: ${viewportPath}`);
  }

  async checkForCommonIssues() {
    console.log('\n🔍 Checking for common issues...');

    // Check if GSAP is loaded
    const gsapLoaded = await this.page.evaluate(() => {
      return typeof window.gsap !== 'undefined';
    });
    console.log(`  ${gsapLoaded ? '✓' : '✗'} GSAP loaded: ${gsapLoaded}`);

    // Check if ScrollTrigger is loaded
    const scrollTriggerLoaded = await this.page.evaluate(() => {
      return typeof window.ScrollTrigger !== 'undefined';
    });
    console.log(`  ${scrollTriggerLoaded ? '✓' : '✗'} ScrollTrigger loaded: ${scrollTriggerLoaded}`);

    // Check if AnimationManager is loaded
    const animationManagerLoaded = await this.page.evaluate(() => {
      return typeof window.AnimationManager !== 'undefined';
    });
    console.log(`  ${animationManagerLoaded ? '✓' : '✗'} AnimationManager loaded: ${animationManagerLoaded}`);

    // Check RSM loader configuration
    const rsmConfig = await this.page.evaluate(() => {
      return window.RSM ? {
        baseURL: window.RSM.baseURL,
        branch: window.RSM_BRANCH
      } : null;
    });
    console.log(`  ${rsmConfig ? '✓' : '✗'} RSM Loader: ${JSON.stringify(rsmConfig)}`);

    // Store in results
    this.results.libraryChecks = {
      gsapLoaded,
      scrollTriggerLoaded,
      animationManagerLoaded,
      rsmConfig
    };
  }

  async testScroll() {
    console.log('\n📜 Testing scroll behavior...');
    
    // Get page height
    const pageHeight = await this.page.evaluate(() => document.body.scrollHeight);
    console.log(`  Page height: ${pageHeight}px`);

    // Scroll to bottom slowly to trigger scroll animations
    const scrollSteps = 10;
    const scrollDelay = 500;
    
    for (let i = 1; i <= scrollSteps; i++) {
      const scrollTo = (pageHeight / scrollSteps) * i;
      await this.page.evaluate(y => window.scrollTo(0, y), scrollTo);
      await this.page.waitForTimeout(scrollDelay);
      console.log(`  Scrolled to ${Math.round((i / scrollSteps) * 100)}%`);
    }

    // Wait a bit after scrolling
    await this.page.waitForTimeout(2000);

    // Scroll back to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(1000);
  }

  async testMobileView() {
    console.log('\n📱 Testing mobile view...');
    
    await this.page.setViewportSize({
      width: 375,
      height: 812
    });

    await this.page.waitForTimeout(2000);

    // Mobile screenshot
    const mobilePath = path.join(CONFIG.outputDir, `screenshot-mobile-${Date.now()}.png`);
    await this.page.screenshot({
      path: mobilePath,
      fullPage: true
    });
    this.results.screenshots.push({ type: 'mobile', path: mobilePath });
    console.log(`  ✓ Mobile screenshot: ${mobilePath}`);

    // Reset to desktop view
    await this.page.setViewportSize(CONFIG.viewport);
  }

  async getPerformanceMetrics() {
    console.log('\n⚡ Gathering performance metrics...');
    
    const performanceTiming = await this.page.evaluate(() => {
      const timing = window.performance.timing;
      const nav = window.performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        firstPaint: nav?.fetchStart || 0,
        responseTime: timing.responseEnd - timing.requestStart
      };
    });

    this.results.performance = {
      ...this.results.performance,
      ...performanceTiming
    };

    console.log(`  DOM Content Loaded: ${performanceTiming.domContentLoaded}ms`);
    console.log(`  Load Complete: ${performanceTiming.loadComplete}ms`);
    console.log(`  DOM Interactive: ${performanceTiming.domInteractive}ms`);
  }

  generateSummary() {
    this.results.summary = {
      totalErrors: this.results.errors.length + this.results.pageErrors.length,
      totalWarnings: this.results.warnings.length,
      totalNetworkErrors: this.results.networkErrors.length,
      consoleMessages: this.results.console.length,
      screenshotsTaken: this.results.screenshots.length,
      status: (this.results.errors.length + this.results.pageErrors.length) === 0 ? 'PASS' : 'FAIL'
    };
  }

  async saveResults() {
    console.log('\n💾 Saving results...');
    
    this.generateSummary();

    // Save JSON results
    const jsonPath = path.join(CONFIG.outputDir, `test-results-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`  ✓ JSON results: ${jsonPath}`);

    // Save latest results (for AI to read)
    const latestPath = path.join(CONFIG.outputDir, 'latest-results.json');
    await fs.writeFile(latestPath, JSON.stringify(this.results, null, 2));
    console.log(`  ✓ Latest results: ${latestPath}`);

    // Generate HTML report
    await this.generateHTMLReport();
    
    return jsonPath;
  }

  async generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSM Browser Test Results - ${this.results.timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 { color: #333; margin-bottom: 10px; }
    .status { 
      display: inline-block;
      padding: 5px 15px;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status.pass { background: #d4edda; color: #155724; }
    .status.fail { background: #f8d7da; color: #721c24; }
    .info { color: #666; margin-top: 10px; }
    .section {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 { 
      color: #333; 
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }
    .error-item, .warning-item, .log-item {
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 4px solid;
    }
    .error-item { 
      background: #fff5f5; 
      border-left-color: #e53e3e;
    }
    .warning-item { 
      background: #fffaf0; 
      border-left-color: #dd6b20;
    }
    .log-item { 
      background: #f7fafc; 
      border-left-color: #4299e1;
    }
    .item-type {
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
      font-size: 0.75em;
    }
    .item-text {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.9em;
      color: #2d3748;
      word-break: break-all;
    }
    .item-location {
      font-size: 0.8em;
      color: #718096;
      margin-top: 5px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat {
      background: #f7fafc;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #2d3748;
    }
    .stat-label {
      color: #718096;
      font-size: 0.9em;
      margin-top: 5px;
    }
    .screenshot {
      max-width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin: 10px 0;
    }
    .library-check {
      display: flex;
      align-items: center;
      padding: 8px 0;
    }
    .library-check .icon {
      margin-right: 10px;
      font-size: 1.2em;
    }
    .network-error {
      background: #fffaf0;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 4px solid #f6ad55;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #a0aec0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 RSM Browser Test Results</h1>
      <div class="status ${this.results.summary.status.toLowerCase()}">${this.results.summary.status}</div>
      <div class="info">
        <div>📍 URL: ${this.results.url}</div>
        <div>🌿 Branch: ${this.results.branch}</div>
        <div>🕐 Timestamp: ${this.results.timestamp}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 Summary</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${this.results.summary.totalErrors}</div>
          <div class="stat-label">Errors</div>
        </div>
        <div class="stat">
          <div class="stat-value">${this.results.summary.totalWarnings}</div>
          <div class="stat-label">Warnings</div>
        </div>
        <div class="stat">
          <div class="stat-value">${this.results.summary.totalNetworkErrors}</div>
          <div class="stat-label">Network Errors</div>
        </div>
        <div class="stat">
          <div class="stat-value">${this.results.summary.consoleMessages}</div>
          <div class="stat-label">Console Messages</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📚 Library Checks</h2>
      ${this.results.libraryChecks ? `
        <div class="library-check">
          <span class="icon">${this.results.libraryChecks.gsapLoaded ? '✅' : '❌'}</span>
          <span>GSAP Loaded</span>
        </div>
        <div class="library-check">
          <span class="icon">${this.results.libraryChecks.scrollTriggerLoaded ? '✅' : '❌'}</span>
          <span>ScrollTrigger Loaded</span>
        </div>
        <div class="library-check">
          <span class="icon">${this.results.libraryChecks.animationManagerLoaded ? '✅' : '❌'}</span>
          <span>AnimationManager Loaded</span>
        </div>
        <div class="library-check">
          <span class="icon">${this.results.libraryChecks.rsmConfig ? '✅' : '❌'}</span>
          <span>RSM Loader: ${this.results.libraryChecks.rsmConfig ? JSON.stringify(this.results.libraryChecks.rsmConfig) : 'Not configured'}</span>
        </div>
      ` : '<div class="empty-state">No library checks performed</div>'}
    </div>

    ${this.results.errors.length > 0 ? `
    <div class="section">
      <h2>❌ Console Errors (${this.results.errors.length})</h2>
      ${this.results.errors.map(err => `
        <div class="error-item">
          <div class="item-type">${err.type}</div>
          <div class="item-text">${err.text || err.message}</div>
          ${err.location ? `<div class="item-location">📍 ${err.location.url}:${err.location.lineNumber}:${err.location.columnNumber}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${this.results.pageErrors.length > 0 ? `
    <div class="section">
      <h2>💥 Page Errors (${this.results.pageErrors.length})</h2>
      ${this.results.pageErrors.map(err => `
        <div class="error-item">
          <div class="item-text">${err.message}</div>
          ${err.stack ? `<pre style="margin-top: 10px; font-size: 0.85em; color: #718096;">${err.stack}</pre>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${this.results.warnings.length > 0 ? `
    <div class="section">
      <h2>⚠️ Warnings (${this.results.warnings.length})</h2>
      ${this.results.warnings.map(warn => `
        <div class="warning-item">
          <div class="item-type">${warn.type}</div>
          <div class="item-text">${warn.text}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${this.results.networkErrors.length > 0 ? `
    <div class="section">
      <h2>🌐 Network Errors (${this.results.networkErrors.length})</h2>
      ${this.results.networkErrors.map(err => `
        <div class="network-error">
          <div><strong>${err.method}</strong> ${err.url}</div>
          <div style="color: #c53030; margin-top: 5px;">${err.errorText}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <h2>⚡ Performance Metrics</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${Math.round(this.results.performance.pageLoadTime || 0)}</div>
          <div class="stat-label">Page Load Time (ms)</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round(this.results.performance.domContentLoaded || 0)}</div>
          <div class="stat-label">DOM Content Loaded (ms)</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round(this.results.performance.domInteractive || 0)}</div>
          <div class="stat-label">DOM Interactive (ms)</div>
        </div>
      </div>
    </div>

    ${this.results.summary.totalErrors === 0 && this.results.summary.totalWarnings === 0 ? `
    <div class="section">
      <div class="empty-state">
        <h2>🎉 All Clear!</h2>
        <p>No errors or warnings detected.</p>
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    const htmlPath = path.join(CONFIG.outputDir, 'latest-report.html');
    await fs.writeFile(htmlPath, html);
    console.log(`  ✓ HTML report: ${htmlPath}`);
  }

  async run() {
    try {
      await this.init();
      await this.navigate();
      await this.waitForAnimations();
      await this.checkForCommonIssues();
      await this.testScroll();
      await this.testMobileView();
      await this.captureScreenshots();
      await this.getPerformanceMetrics();
      
      const resultsPath = await this.saveResults();
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Testing complete!');
      console.log('='.repeat(60));
      console.log(`\n📊 Results Summary:`);
      console.log(`   Status: ${this.results.summary.status}`);
      console.log(`   Errors: ${this.results.summary.totalErrors}`);
      console.log(`   Warnings: ${this.results.summary.totalWarnings}`);
      console.log(`   Network Errors: ${this.results.summary.totalNetworkErrors}`);
      console.log(`\n📁 Files saved:`);
      console.log(`   JSON: ${resultsPath}`);
      console.log(`   Latest: test-results/latest-results.json`);
      console.log(`   Report: test-results/latest-report.html`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Open test-results/latest-report.html in your browser`);
      console.log(`   2. Share test-results/latest-results.json with AI for analysis`);
      console.log(`   3. Or ask AI to read the results file to fix issues\n`);

    } catch (error) {
      console.error('\n❌ Test failed:', error);
      this.results.errors.push({
        type: 'test-failure',
        message: error.message,
        stack: error.stack
      });
      await this.saveResults();
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the tests
const tester = new BrowserTester();
tester.run();

