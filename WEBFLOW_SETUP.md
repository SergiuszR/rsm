# Webflow Setup Guide - RSM Script Loader

## How It Works

- **Webflow Page**: `https://robimy-social-media-dev.webflow.io/` (always the same)
- **Script Source**: Changes based on configuration
  - Production: `https://rsm-project.netlify.app/`
  - Development: `https://development--rsm-project.netlify.app/`

## Setup Methods

You have **2 ways** to control which Netlify branch loads:

---

### Method 1: URL Parameter (For Testing)

Add `?rsm-branch=development` to your URL for quick testing:

```
# Load development scripts:
https://robimy-social-media-dev.webflow.io/?rsm-branch=development

# Load production scripts:
https://robimy-social-media-dev.webflow.io/?rsm-branch=main
```

**Pros:**
- ✅ Easy to test
- ✅ No Webflow changes needed
- ✅ Can switch instantly

**Cons:**
- ❌ Need to add parameter every time
- ❌ Not permanent

---

### Method 2: Global Variable (Permanent Setup)

Add this to Webflow **Custom Code** (in Project Settings → Custom Code → Head Code):

#### For Development Testing:
```html
<script>
  window.RSM_BRANCH = 'development';
</script>
```

#### For Production:
```html
<script>
  window.RSM_BRANCH = 'production';
</script>
```

**Pros:**
- ✅ Permanent configuration
- ✅ No URL parameter needed
- ✅ Clean URLs

**Cons:**
- ❌ Need to update Webflow when switching branches
- ❌ Requires Webflow republish

---

### Method 3: Default Behavior (No Configuration)

If you don't set anything:
- Loads from **production** by default
- Safe fallback

```javascript
// No config = loads from production
https://rsm-project.netlify.app/
```

---

## Step-by-Step: Testing Development Branch

### Option A: Quick Test (URL Parameter)

1. Deploy your development branch to Netlify
2. Visit: `https://robimy-social-media-dev.webflow.io/?rsm-branch=development`
3. Open DevTools → Console
4. You should see: `RSM Loader: Loading from DEVELOPMENT branch`
5. Check Network tab → scripts load from `development--rsm-project.netlify.app`

### Option B: Permanent Setup (Global Variable)

1. Go to Webflow → Project Settings
2. Click on **Custom Code** tab
3. In **Head Code**, add:
   ```html
   <script>
     window.RSM_BRANCH = 'development';
   </script>
   ```
4. **Important**: This code must be added **BEFORE** the rsm-loader.js script
5. Publish your Webflow site
6. Visit: `https://robimy-social-media-dev.webflow.io/`
7. Check console → should see: `RSM Loader: Loading from DEVELOPMENT branch`

---

## Webflow Custom Code Placement

### Head Code (BEFORE rsm-loader.js):
```html
<!-- Set which branch to use -->
<script>
  window.RSM_BRANCH = 'development'; // or 'production'
</script>

<!-- Then load the RSM loader -->
<script defer src="https://development--rsm-project.netlify.app/dist/rsm-loader.js"></script>
```

**Note**: The loader script src also needs to change based on which branch you want!

---

## Recommended Workflow

### During Development:

1. **In Webflow Custom Code (Head)**:
   ```html
   <script>
     window.RSM_BRANCH = 'development';
   </script>
   <script defer src="https://development--rsm-project.netlify.app/dist/rsm-loader.js"></script>
   ```

2. Make changes to your scripts in the `development` branch
3. Push to GitHub → Netlify auto-deploys to `development--rsm-project.netlify.app`
4. Refresh Webflow page → loads latest development scripts
5. Test animations, features, etc.

### Before Going Live:

1. **Update Webflow Custom Code (Head)**:
   ```html
   <script>
     window.RSM_BRANCH = 'production';
   </script>
   <script defer src="https://rsm-project.netlify.app/dist/rsm-loader.js"></script>
   ```

2. Merge `development` → `main` in GitHub
3. Netlify auto-deploys to `rsm-project.netlify.app`
4. Publish Webflow site
5. Production site now loads production scripts

---

## Quick Reference

| What You Want | URL to Visit | Custom Code |
|---------------|--------------|-------------|
| **Test Development** | Add `?rsm-branch=development` | OR set `RSM_BRANCH = 'development'` |
| **Use Production** | Normal URL (no param) | OR set `RSM_BRANCH = 'production'` |
| **Default** | Normal URL | No config needed (defaults to production) |

---

## Verifying Which Branch Is Loading

### Check Console Logs:
```
✅ "RSM Loader: Loading from DEVELOPMENT branch"
✅ "RSM Loader: Loading from PRODUCTION branch"
```

### Check Network Tab:
```
✅ Development: https://development--rsm-project.netlify.app/js/...
✅ Production: https://rsm-project.netlify.app/js/...
```

### Check Loaded Scripts:
```javascript
// In browser console:
console.log(window.RSM.baseURL);

// Should show:
// "https://development--rsm-project.netlify.app" (development)
// or
// "https://rsm-project.netlify.app" (production)
```

---

## Common Issues

### Scripts Load from Webflow Domain
**Problem**: Scripts try to load from `robimy-social-media-dev.webflow.io/js/...`

**Solution**: 
- rsm-loader.js not loaded correctly
- Check that rsm-loader.js is in Custom Code and loading from Netlify

### Wrong Branch Loads
**Problem**: Set to development but loads production (or vice versa)

**Solution**:
- Clear browser cache
- Check console log to see which branch it detected
- Verify `window.RSM_BRANCH` is set BEFORE rsm-loader.js loads
- Check that URL parameter is spelled correctly: `?rsm-branch=development`

### Animations Don't Work
**Problem**: Animations still not working

**Solution**:
1. Check console for errors
2. Verify branch deployed to Netlify
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that AnimationManager is loaded: `console.log(window.AnimationManager)`

---

## Example: Complete Webflow Setup

### Webflow Project Settings → Custom Code → Head Code:

```html
<!-- Development Environment Configuration -->
<script>
  // Switch to 'production' when going live
  window.RSM_BRANCH = 'development';
</script>

<!-- Load RSM Script Loader from Netlify -->
<!-- Update URL to match branch: development-- for dev, no prefix for prod -->
<script 
  defer 
  src="https://development--rsm-project.netlify.app/dist/rsm-loader.js">
</script>

<!-- Your other scripts continue below... -->
```

---

## Production Checklist

Before deploying to production:

- [ ] Update `window.RSM_BRANCH = 'production'` in Webflow Custom Code
- [ ] Update loader src to `https://rsm-project.netlify.app/dist/rsm-loader.js`
- [ ] Merge development → main in GitHub
- [ ] Verify Netlify deployed main branch successfully
- [ ] Test on staging first
- [ ] Publish Webflow site
- [ ] Verify console shows "Loading from PRODUCTION branch"
- [ ] Test all animations on live site

---

## Support

If you need to add more branches (e.g., staging):

Edit `rsm-loader.js`:
```javascript
if (branchParam === 'staging' || window.RSM_BRANCH === 'staging') {
    return 'https://staging--rsm-project.netlify.app';
}
```

Then use:
- URL: `?rsm-branch=staging`
- OR Custom Code: `window.RSM_BRANCH = 'staging';`

