# 🚀 Quick Start: Automated Testing

## What This Does

This testing tool launches a real browser, visits your Webflow page, and captures all console errors, warnings, and issues - then saves them to a file that I (the AI) can read and fix!

## Install & Run (2 Commands)

```bash
# 1. Install Puppeteer (headless browser)
npm install

# 2. Run the tests
npm test
```

That's it! The tests will run and save results to `test-results/latest-results.json`

## How to Use with AI

After running tests, just ask me:

> **"Please read test-results/latest-results.json and fix any errors you find"**

I will then:
1. ✅ Read the test results file
2. ✅ Identify all errors with exact file locations
3. ✅ Analyze the root causes
4. ✅ Fix the code automatically
5. ✅ You can re-run tests to verify

## Example Workflow

```bash
# Step 1: Run tests
npm test

# Step 2: Check if there are errors (optional)
npm run analyze

# Step 3: Ask AI to fix (in chat)
# "Read test-results/latest-results.json and fix the errors"

# Step 4: Re-run to verify fixes
npm test
```

## What Gets Tested

- ❌ **Console Errors** (JavaScript errors)
- ⚠️ **Warnings** (Browser warnings)
- 🌐 **Network Errors** (Failed requests, 404s)
- 📚 **Library Loading** (GSAP, ScrollTrigger, etc.)
- ⚡ **Performance** (Page load time)
- 📱 **Mobile View** (Responsive issues)
- 📸 **Screenshots** (Visual snapshots)

## Available Commands

```bash
# Run tests (development branch)
npm test

# Run tests on production
npm run test:prod

# Quick analysis in terminal
npm run analyze

# View beautiful HTML report
open test-results/latest-report.html
```

## Output Files

After running tests, you'll find:

- 📊 `test-results/latest-report.html` - Visual report (open in browser)
- 📄 `test-results/latest-results.json` - Data file (for AI to read)
- 📸 `test-results/screenshot-*.png` - Screenshots

## Testing Different URLs

```bash
# Custom URL
node test-browser.js --url=https://your-site.com

# Different branch
node test-browser.js --branch=production
```

## Common Scenarios

### Scenario 1: Daily Check
```bash
npm test && npm run analyze
```

### Scenario 2: Fix Issues with AI
```bash
npm test
# Then ask: "Read test-results/latest-results.json and fix errors"
npm test  # Verify
```

### Scenario 3: Pre-Deploy Check
```bash
npm run test:dev   # Test development
npm run test:prod  # Test production
# If both pass, deploy!
```

## What Success Looks Like

When you run `npm run analyze` and see:

```
✅ All tests passed! No errors detected.
The page loaded successfully with all libraries functioning.

Status: ✅ PASS
Total Errors: 0
Total Warnings: 0
```

You're good to go! 🎉

## Need Help?

1. **See detailed errors**: `npm run analyze`
2. **Visual report**: `open test-results/latest-report.html`
3. **Ask AI**: "Read test-results/latest-results.json and help me debug"

---

**That's it! You now have automated browser testing that works perfectly with AI assistance.**

For more details:
- [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md) - Full documentation
- [AI_TESTING_EXAMPLE.md](./AI_TESTING_EXAMPLE.md) - Complete workflow example

