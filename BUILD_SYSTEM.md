# Build System Documentation

## Overview

This project uses **Terser** for production-ready JavaScript minification with source maps. The build system reduces file sizes by ~59% on average, improving load times without any browser performance penalty.

## Quick Start

```bash
# Production build (minified + source maps)
npm run build

# Development build (unminified, for local testing)
npm run build:dev

# Dev server with hot reload
npm run dev
```

## What Gets Minified?

- ✅ All files in `js/` directory (recursive)
- ✅ Root loader files (`rsm-loader.js`, `homepage-loader.js`)
- ✅ Output goes to `dist/` with same directory structure
- ✅ Source maps (`.js.map`) generated for all files

## Build Results

Example from a typical build:

```
📊 Build Summary
✓ Success: 22 files
📦 Total size: 112,705 → 46,603 bytes
💾 Savings: 58.7%
```

### Individual File Savings

| File | Original | Minified | Savings |
|------|----------|----------|---------|
| rsm-loader.js | 11.2 KB | 3.9 KB | 64.7% |
| cards.js | 6.7 KB | 2.6 KB | 61.5% |
| testimonials.js | 16.7 KB | 6.2 KB | 63.0% |
| svg-anim.js | 2.1 KB | 66 bytes | 96.9% |

## Terser Configuration

The build uses optimized Terser settings:

- **Compression**: 2-pass with dead code elimination
- **Mangling**: Enabled with Safari 10+ compatibility
- **Console logs**: Preserved (change in `build.js` if needed)
- **Debugger statements**: Removed
- **Comments**: Removed (except header comment)
- **Source maps**: Always generated

## Source Maps for Debugging

Source maps allow you to debug minified production code:

1. **Chrome DevTools**: Automatically loads source maps
2. **Firefox DevTools**: Enable in settings (usually auto)
3. **Safari DevTools**: Enable "Show source maps" in preferences

When debugging, you'll see the original unminified code with proper line numbers!

## File Structure

```
rsm/
├── js/                  # Source files (edit these)
│   ├── global/
│   └── homepage/
├── dist/                # Built files (generated, don't edit)
│   ├── js/
│   ├── rsm-loader.js
│   └── *.js.map        # Source maps
├── build.js            # Build script
└── package.json
```

## Development Workflow

### For Local Development
```bash
npm run dev
# Uses unminified files for easier debugging
# Serves on http://localhost:5000
```

### For Production Deployment
```bash
npm run build
# Creates minified files in dist/
# Netlify automatically runs this via netlify.toml
```

## Netlify Integration

The build command is configured in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify will:
1. Run `npm install` (installs Terser)
2. Run `npm run build` (minifies everything)
3. Deploy the `dist/` folder

## Performance Impact

### Why Minification is Good:

✅ **Smaller files** → faster downloads (main benefit)
✅ **Same parse speed** → no browser performance penalty
✅ **Lower bandwidth** → reduced hosting costs
✅ **Better user experience** → faster page loads

### Common Myth Debunked:

❌ **"Minified code is harder for browsers to parse"**
- This is FALSE! Modern JS engines parse minified code just as fast (or faster)
- The parser ignores whitespace and doesn't care about variable name length
- Less bytes to read = slight advantage

## Troubleshooting

### Build fails with syntax error
- Check your source JS for syntax errors
- Look for unclosed brackets, quotes, etc.

### Source maps not loading in DevTools
- Ensure `.map` files exist in `dist/`
- Check browser DevTools settings for source map support
- Verify the `//# sourceMappingURL=` comment at end of minified files

### Want to remove console.logs in production?
In `build.js`, change:
```js
drop_console: false,  // Change to true
```

## Advanced Customization

Edit `build.js` to customize Terser options:

```js
const terserOptions = {
    compress: {
        drop_console: true,  // Remove ALL console logs
        passes: 3,           // More aggressive optimization
    },
    mangle: {
        toplevel: true,      // Even more aggressive mangling
    },
};
```

## Questions?

- Terser docs: https://terser.org/docs/api-reference
- Source maps spec: https://sourcemaps.info/

