# Localhost Development Setup

This project now supports localhost development mode for easier testing and development.

## How to Use Localhost Mode

### Method 1: Using the Development Helper (Recommended)

1. **Start the localhost server:**
   ```bash
   npm run dev:localhost
   ```
   *Note: This command automatically kills any existing processes on port 5000 before starting the server.*

2. **Open your browser and navigate to your Webflow site**

3. **Open browser console and run:**
   ```javascript
   RSMDev.enableLocalhost()
   ```

4. **Reload the page** - scripts will now be loaded from `http://localhost:5000`

5. **To disable localhost mode:**
   ```javascript
   RSMDev.disableLocalhost()
   ```

### Method 2: Manual localStorage

1. **Start the localhost server:**
   ```bash
   npm run dev:localhost
   ```
   *Note: This command automatically kills any existing processes on port 5000 before starting the server.*

2. **Open browser console and set:**
   ```javascript
   localStorage.setItem('env', 'true')
   ```

3. **Reload the page**

4. **To disable:**
   ```javascript
   localStorage.removeItem('env')
   ```

## Development Helper Commands

When `dev-helper.js` is loaded, you have access to these console commands:

- `RSMDev.enableLocalhost()` - Enable localhost mode
- `RSMDev.disableLocalhost()` - Disable localhost mode  
- `RSMDev.status()` - Show current development status
- `RSMDev.reload()` - Reload the page

## Priority Order

The loader checks for the environment in this order:

1. **localStorage 'env' = 'true'** → `http://localhost:5000`
2. **URL parameter `?rsm-base=...`** → Custom URL
3. **window.RSM_BASE_URL** → Custom URL
4. **URL parameter `?rsm-branch=development`** → Development Netlify
5. **window.RSM_BRANCH = 'development'** → Development Netlify
6. **Default** → Production Netlify

## Multiple Swiper Instances

The swiper initialization has been updated to support multiple instances on the same page. Each `.podcasts_wrapper` container will get its own swiper instance with proper arrow state management.

## File Structure

```
dist/
├── js/
│   ├── global/
│   │   ├── utils.js (updated for multiple swipers)
│   │   └── ...
│   └── homepage/
│       └── ...
├── rsm-loader.js (updated with localhost support)
├── homepage-loader.js
└── dev-helper.js (development utilities)
```

## Troubleshooting

- **Scripts not loading from localhost:** Check that `localStorage.getItem('env') === 'true'`
- **Port 5000 in use:** 
  - The `npm run dev:localhost` command now automatically kills existing processes on port 5000
  - If you still have issues, manually check: `lsof -ti:5000`
  - Use alternative port: `python3 -m http.server 5001` and update loader URL
- **CORS issues:** Make sure your localhost server is running on the correct port
- **Multiple swipers not working:** Ensure each swiper has unique navigation elements within its container

## Alternative Ports

If port 5000 is busy, you can use any available port:

1. **Start server on different port:**
   ```bash
   python3 -m http.server 5001
   ```

2. **Update loader to use new port:**
   Edit `rsm-loader.js` line 62: `return 'http://localhost:5001';`
