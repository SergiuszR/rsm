# RSM Webflow Script Loader

A flexible script loading system for Webflow projects hosted on Netlify.

## Setup Instructions

### 1. Deploy to Netlify

1. Push this repository to GitHub
2. Connect to Netlify
3. Netlify will automatically build and deploy using the `netlify.toml` configuration
4. Note your Netlify URL (e.g., `https://your-site-name.netlify.app`)

### 2. Update Configuration

In `rsm-loader.js`, update the `baseURL` with your Netlify URL:

```javascript
const RSM_CONFIG = {
    baseURL: 'https://your-netlify-url.netlify.app', // Update this!
    // ... rest of config
};
```

### 3. Add to Webflow

#### Global Scripts (All Pages)
Add this to your Webflow project's **Site Settings > Custom Code > Footer Code**:

```html
<script src="https://your-netlify-url.netlify.app/rsm-loader.js"></script>
```

#### Homepage-Specific Scripts
Add this to your **Homepage Page Settings > Footer Code**:

```html
<script>
// Option 1: Use the helper script
</script>
<script src="https://your-netlify-url.netlify.app/homepage-loader.js"></script>

<!-- OR Option 2: Use the API directly -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (window.RSM) {
        RSM.appendScriptToPage('homepage');
    }
});
</script>
```

## Usage

### Loading Page-Specific Scripts

```javascript
// Load homepage scripts
RSM.appendScriptToPage('homepage');

// Load with callback
RSM.appendScriptToPage('homepage', function(error) {
    if (error) {
        console.error('Failed to load:', error);
    } else {
        console.log('Scripts loaded successfully');
    }
});
```

### Loading Custom Scripts

```javascript
// Load a custom script
RSM.loadCustomScript('js/custom/my-script.js');
```

### Configuration

```javascript
// Enable debug mode
RSM.configure({ debug: true });

// Add new page scripts
RSM.configure({
    pageScripts: {
        about: ['js/about/animations.js'],
        contact: ['js/contact/form-handler.js']
    }
});
```

### Checking Script Status

```javascript
// Check if a script is already loaded
if (RSM.isScriptLoaded('js/homepage/cards.js')) {
    console.log('Cards script is already loaded');
}
```

## File Structure

```
/
├── js/
│   ├── global/
│   │   ├── footer.js     # Global footer animations
│   │   └── lenis.js      # Smooth scrolling
│   └── homepage/
│       ├── cards.js      # Homepage card interactions
│       └── testimonials.js # Homepage testimonials
├── rsm-loader.js         # Main loader script
├── homepage-loader.js    # Homepage helper script
├── package.json          # Build configuration
├── netlify.toml          # Netlify deployment config
└── README.md            # This file
```

## Adding New Scripts

1. Add your script files to the appropriate directory structure
2. Update the configuration in `rsm-loader.js`:

```javascript
pageScripts: {
    homepage: [
        'js/homepage/cards.js',
        'js/homepage/testimonials.js'
    ],
    about: [
        'js/about/your-new-script.js'  // Add here
    ]
}
```

3. Deploy to Netlify (automatic if connected to GitHub)
4. Use in Webflow:

```javascript
RSM.appendScriptToPage('about');
```

## Dependencies

Your scripts assume these libraries are loaded in Webflow:
- jQuery
- GSAP
- Lenis (for smooth scrolling)

Make sure these are included in your Webflow project before the RSM loader.

## Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```

## 🧪 Automated Testing

This project includes an automated browser testing tool that can check for console errors, verify animations, and test performance.

### Quick Start

```bash
# Install dependencies (includes Playwright)
npm install

# Run tests on development branch
npm test

# Analyze results
npm run analyze

# View detailed report
open test-results/latest-report.html
```

### Available Test Commands

```bash
# Test development branch (default)
npm run test:dev

# Test production branch
npm run test:prod

# Analyze test results in terminal
npm run analyze
```

### What Gets Tested

- ✅ Console errors and warnings
- ✅ JavaScript exceptions
- ✅ Network request failures
- ✅ GSAP/ScrollTrigger loading
- ✅ AnimationManager initialization
- ✅ Page performance metrics
- ✅ Mobile responsiveness
- ✅ Scroll behavior

### Using with AI Assistant

After running tests, you can ask your AI assistant to analyze and fix issues:

```bash
# 1. Run tests
npm test

# 2. Ask AI to analyze
"Please read test-results/latest-results.json and fix any errors"
```

The AI will:
1. Read the test results
2. Identify all errors with their locations
3. Analyze root causes
4. Fix the issues in your code
5. You can re-run tests to verify

### Test Output Files

- `test-results/latest-report.html` - Beautiful HTML report
- `test-results/latest-results.json` - Structured data for AI/automation
- `test-results/screenshot-*.png` - Visual snapshots

For detailed documentation, see [AUTOMATED_TESTING.md](./AUTOMATED_TESTING.md)
