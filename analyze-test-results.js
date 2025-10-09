#!/usr/bin/env node

/**
 * Test Results Analyzer
 * 
 * Reads the latest test results and provides a human-readable summary
 * Perfect for AI assistants to quickly understand what needs to be fixed
 */

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(__dirname, 'test-results', 'latest-results.json');

function analyzeResults() {
  console.log('🔍 Analyzing test results...\n');

  // Check if results file exists
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('❌ No test results found!');
    console.log('💡 Run "npm test" first to generate results.\n');
    process.exit(1);
  }

  // Read results
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

  // Print header
  console.log('═'.repeat(70));
  console.log(`  RSM TEST RESULTS ANALYSIS`);
  console.log('═'.repeat(70));
  console.log(`  Tested: ${results.url}`);
  console.log(`  Branch: ${results.branch}`);
  console.log(`  Time: ${results.timestamp}`);
  console.log(`  Status: ${results.summary.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═'.repeat(70));

  // Summary
  console.log('\n📊 SUMMARY\n');
  console.log(`  Total Errors:        ${results.summary.totalErrors}`);
  console.log(`  Total Warnings:      ${results.summary.totalWarnings}`);
  console.log(`  Network Errors:      ${results.summary.totalNetworkErrors}`);
  console.log(`  Console Messages:    ${results.summary.consoleMessages}`);

  // Library checks
  console.log('\n📚 LIBRARY STATUS\n');
  if (results.libraryChecks) {
    console.log(`  GSAP:                ${results.libraryChecks.gsapLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
    console.log(`  ScrollTrigger:       ${results.libraryChecks.scrollTriggerLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
    console.log(`  AnimationManager:    ${results.libraryChecks.animationManagerLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
    if (results.libraryChecks.rsmConfig) {
      console.log(`  RSM Base URL:        ${results.libraryChecks.rsmConfig.baseURL}`);
    }
  }

  // Performance
  console.log('\n⚡ PERFORMANCE\n');
  console.log(`  Page Load Time:      ${Math.round(results.performance.pageLoadTime || 0)}ms`);
  console.log(`  DOM Content Loaded:  ${Math.round(results.performance.domContentLoaded || 0)}ms`);
  console.log(`  DOM Interactive:     ${Math.round(results.performance.domInteractive || 0)}ms`);

  // Console Errors (detailed)
  if (results.errors && results.errors.length > 0) {
    console.log('\n❌ CONSOLE ERRORS\n');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.text}`);
      if (error.location) {
        console.log(`     📍 ${error.location.url}`);
        console.log(`     📍 Line ${error.location.lineNumber}:${error.location.columnNumber}`);
      }
      console.log('');
    });
  }

  // Page Errors (detailed)
  if (results.pageErrors && results.pageErrors.length > 0) {
    console.log('\n💥 PAGE ERRORS (Uncaught Exceptions)\n');
    results.pageErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.message}`);
      if (error.stack) {
        const stackLines = error.stack.split('\n').slice(0, 3);
        stackLines.forEach(line => console.log(`     ${line.trim()}`));
      }
      console.log('');
    });
  }

  // Network Errors
  if (results.networkErrors && results.networkErrors.length > 0) {
    console.log('\n🌐 NETWORK ERRORS\n');
    results.networkErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.method} ${error.url}`);
      console.log(`     ❌ ${error.errorText}`);
      console.log('');
    });
  }

  // Warnings
  if (results.warnings && results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS\n');
    results.warnings.slice(0, 5).forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning.text}`);
    });
    if (results.warnings.length > 5) {
      console.log(`  ... and ${results.warnings.length - 5} more warnings`);
    }
    console.log('');
  }

  // AI-Friendly Summary
  console.log('\n🤖 AI ASSISTANT SUMMARY\n');
  
  if (results.summary.status === 'PASS') {
    console.log('  ✅ All tests passed! No errors detected.');
    console.log('  The page loaded successfully with all libraries functioning.');
  } else {
    console.log('  ❌ Tests failed. Issues found:\n');
    
    const issues = [];
    
    if (results.errors && results.errors.length > 0) {
      issues.push(`${results.errors.length} console error(s)`);
    }
    
    if (results.pageErrors && results.pageErrors.length > 0) {
      issues.push(`${results.pageErrors.length} page error(s)`);
    }
    
    if (results.networkErrors && results.networkErrors.length > 0) {
      issues.push(`${results.networkErrors.length} network error(s)`);
    }

    if (!results.libraryChecks?.gsapLoaded) {
      issues.push('GSAP not loaded');
    }

    if (!results.libraryChecks?.scrollTriggerLoaded) {
      issues.push('ScrollTrigger not loaded');
    }

    if (!results.libraryChecks?.animationManagerLoaded) {
      issues.push('AnimationManager not loaded');
    }

    console.log('  Issues to fix:');
    issues.forEach(issue => console.log(`    • ${issue}`));
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS\n');
  
  const recommendations = [];

  if (results.errors && results.errors.length > 0) {
    recommendations.push('Fix console errors first - they often cause other issues');
  }

  if (!results.libraryChecks?.gsapLoaded) {
    recommendations.push('Ensure GSAP library is loaded before animations initialize');
  }

  if (!results.libraryChecks?.scrollTriggerLoaded) {
    recommendations.push('Register ScrollTrigger plugin after GSAP loads');
  }

  if (results.networkErrors && results.networkErrors.length > 0) {
    recommendations.push('Check network errors - missing resources can break functionality');
  }

  if (results.performance.pageLoadTime > 5000) {
    recommendations.push('Page load time is slow (>5s) - consider optimization');
  }

  if (recommendations.length === 0) {
    console.log('  ✅ No recommendations - everything looks good!');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  console.log('  📁 Full results: test-results/latest-results.json');
  console.log('  🌐 HTML report: test-results/latest-report.html');
  console.log('═'.repeat(70) + '\n');

  // Exit with error code if tests failed
  process.exit(results.summary.status === 'PASS' ? 0 : 1);
}

// Run analysis
try {
  analyzeResults();
} catch (error) {
  console.error('❌ Error analyzing results:', error.message);
  process.exit(1);
}

