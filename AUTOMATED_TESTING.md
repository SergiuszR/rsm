# 🧪 Automated Browser Testing for RSM

This testing tool allows you (or AI) to automatically test your Webflow site, capture console errors, and generate detailed reports.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install Playwright, a modern browser automation tool that includes Chromium.

### 2. Run Tests

```bash
# Test development branch (default)
npm test

# Or explicitly test development
npm run test:dev

# Test production branch
npm run test:prod

# Test custom URL
node test-browser.js --url=https://your-site.com/?rsm-branch=development
```

### 3. View Results

After running tests, check:
- **HTML Report**: Open `test-results/latest-report.html` in your browser
- **JSON Data**: `test-results/latest-results.json` (for AI or programmatic analysis)
- **Screenshots**: PNG files in `test-results/` directory

## 📊 What It Tests

The tool automatically:

### ✅ Console Monitoring
- ❌ **Errors**: JavaScript errors, failed loads, exceptions
- ⚠️ **Warnings**: Browser warnings, deprecation notices
- 📝 **Logs**: All console.log messages

### ✅ Library Checks
- GSAP loaded and available
- ScrollTrigger plugin loaded
- AnimationManager initialized
- RSM Loader configuration

### ✅ Network Monitoring
- Failed resource loads
- 404 errors
- CORS issues
- Timeout errors

### ✅ Performance Metrics
- Page load time
- DOM content loaded time
- DOM interactive time
- Resource loading times

### ✅ Visual Testing
- Full page screenshots
- Viewport screenshots
- Mobile view screenshots

### ✅ Interaction Testing
- Scroll behavior (triggers animations)
- Mobile viewport testing
- Animation initialization

## 📁 Output Files

After each test run, you'll get:

### 1. `latest-report.html`
Beautiful HTML report with:
- Error summary with counts
- Detailed error messages with locations
- Library check results
- Performance metrics
- Visual status indicators

### 2. `latest-results.json`
Structured JSON data containing:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "url": "https://...",
  "branch": "development",
  "console": [...],      // All console messages
  "errors": [...],       // Console errors
  "warnings": [...],     // Warnings
  "networkErrors": [...],// Failed requests
  "pageErrors": [...],   // Uncaught exceptions
  "libraryChecks": {...},// GSAP, ScrollTrigger, etc.
  "performance": {...},  // Timing metrics
  "screenshots": [...],  // Screenshot paths
  "summary": {...}       // Overall summary
}
```

### 3. Screenshots
- `screenshot-full-{timestamp}.png` - Full page screenshot
- `screenshot-viewport-{timestamp}.png` - Above-fold screenshot
- `screenshot-mobile-{timestamp}.png` - Mobile view

## 🤖 Using with AI

### Step 1: Run Tests
```bash
npm test
```

### Step 2: Ask AI to Analyze
Simply tell your AI assistant:

> "Please read the file test-results/latest-results.json and tell me what errors need to be fixed"

Or:

> "Check the latest test results and fix any console errors you find"

### Step 3: AI Reads and Fixes
The AI will:
1. Read the JSON file
2. Identify all errors with their locations
3. Analyze the root causes
4. Fix the issues in your code
5. Optionally run tests again to verify

## 🔧 Configuration

Edit `test-browser.js` to customize:

```javascript
const CONFIG = {
  // Default URL to test
  url: 'https://robimy-social-media-dev.webflow.io/?rsm-branch=development',
  
  // Which branch to test
  branch: 'development',
  
  // Page load timeout
  timeout: 30000,
  
  // Wait time for animations
  waitAfterLoad: 5000,
  
  // Output directory
  outputDir: './test-results',
  
  // Browser viewport
  viewport: {
    width: 1920,
    height: 1080
  }
};
```

## 📋 Common Test Scenarios

### Test Specific Animation
```bash
# Run test and check for specific animation errors
npm test
# Then check test-results/latest-report.html for animation-related errors
```

### Test After Code Changes
```bash
# 1. Make your code changes
# 2. Push to GitHub (triggers Netlify deploy)
# 3. Wait for Netlify deploy
# 4. Run tests
npm run test:dev
```

### Compare Development vs Production
```bash
# Test development
npm run test:dev

# Test production
npm run test:prod

# Compare the two reports
```

### CI/CD Integration
Add to your deployment workflow:
```bash
# In .github/workflows or netlify.toml
npm install
npm test
# Fail build if errors found
```

## 🐛 Troubleshooting

### "Cannot find module '@playwright/test'"
```bash
npm install
```

### "Navigation timeout"
Increase timeout in `test-browser.js`:
```javascript
timeout: 60000, // 60 seconds
```

### "No such file or directory: test-results"
The directory is created automatically. If it fails:
```bash
mkdir -p test-results
```

### Browser won't launch (Linux)
Install system dependencies:
```bash
# Install Playwright browsers
npx playwright install chromium

# Or install system dependencies
npx playwright install-deps
```

## 🎯 Example Workflow

### Typical AI-Assisted Debugging Session:

1. **User runs test:**
   ```bash
   npm test
   ```

2. **User asks AI:**
   > "Read test-results/latest-results.json and fix any errors"

3. **AI responds:**
   - Reads the JSON file
   - Identifies: "Found 3 console errors:
     - GSAP not defined at line 45 in services-anim.js
     - ScrollTrigger.create failed in timeline-anim.js
     - TypeError: Cannot read property 'offsetHeight' of null"
   
4. **AI fixes the issues:**
   - Adds proper GSAP loading checks
   - Ensures ScrollTrigger is registered
   - Adds null checks for DOM elements

5. **User verifies:**
   ```bash
   npm test
   # Check results again
   ```

6. **Repeat until clean! ✅**

## 📈 Understanding Results

### ✅ PASS Status
- Zero console errors
- Zero page errors
- All libraries loaded
- No network failures

### ❌ FAIL Status
- One or more console errors
- Page exceptions/errors
- Failed resource loads
- Library loading issues

### Performance Benchmarks
- **Good**: < 3000ms page load
- **Acceptable**: 3000-5000ms
- **Needs optimization**: > 5000ms

## 🔄 Continuous Testing

Set up automated testing:

### Option 1: GitHub Actions
```yaml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

### Option 2: Cron Job
```bash
# Run tests every hour and save results
0 * * * * cd /path/to/rsm && npm test >> test.log 2>&1
```

### Option 3: Pre-deploy Hook
```bash
# In netlify.toml
[build]
  command = "npm run build && npm test"
```

## 🆘 Getting Help

### Check Test Results
1. Open `test-results/latest-report.html`
2. Look for red error sections
3. Note the file and line numbers
4. Check the error messages

### Share with AI
```bash
# Just share the results file
cat test-results/latest-results.json
```

### Debug Manually
1. Check browser console on live site
2. Compare with test results
3. Look for timing issues
4. Check network tab for failed loads

## 🎉 Success Indicators

Your site is healthy when tests show:
- ✅ 0 errors
- ✅ 0 warnings (or only minor ones)
- ✅ All libraries loaded
- ✅ Fast load times (< 3s)
- ✅ No failed network requests

---

**Happy Testing! 🚀**

For issues or questions, check the test results or ask your AI assistant to analyze them.

