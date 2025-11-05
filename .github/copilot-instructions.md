# Copilot project rules – RSM Webflow Script Loader

Purpose: Help AI agents work productively in this repo. Keep edits focused, small, and aligned with how this project is built, tested, and deployed.

## Big picture
- This repo serves JavaScript to a Webflow site from Netlify. Source lives in `js/**` and root loader files; production assets are built to `dist/` by `npm run build` and deployed via `netlify.toml`.
- The global entry is `rsm-loader.js`. It decides the base URL, loads core global scripts (ensuring `js/global/anim-init.js` first), and exposes a small API on `window.RSM`.
- Animations rely on GSAP + ScrollTrigger and a central `AnimationManager` (created in `js/global/anim-init.js`) to coordinate load order and refreshes.

## Runtime loading model (important)
- Base URL priority (first match wins):
  1) `localStorage.env === 'true'` → `http://localhost:5000` (see `dev-helper.js`)
  2) `?rsm-base=…` URL param or `window.RSM_BASE_URL`
  3) `?rsm-branch=development` or `window.RSM_BRANCH='development'` → `https://development--rsm-project.netlify.app`
  4) `?rsm-branch=main|production` or `window.RSM_BRANCH='production'` → `https://rsm-project.netlify.app`
  5) Default → production
- Loader API (see `rsm-loader.js`):
  - `RSM.onReady(cb)` and `window.addEventListener('rsm:ready', …)`
  - `RSM.loadScript('js/path.js')`, `RSM.loadScripts([...])` (prepends `baseURL`, tracks `loaded`)
  - `RSM.appendScriptToPage('homepage')` loads the set in `rsm-loader.js` under `scripts.homepage`.
- Early behavior: rsm-loader neutralizes YouTube iframes in `.video_container iframe` by moving `src` to `data-yt-src`. If you need to re-enable, set `iframe.src = iframe.dataset.ytSrc` when appropriate.

## Authoring code (patterns that work here)
- Put reusable/shared logic in `js/global/**`; page-specific in `js/<page>/**`. Never edit `dist/**`.
- Always gate GSAP work on `AnimationManager.onReady` (created by `js/global/anim-init.js`) and register plugins:
  ```js
  (function(){
    function init(){ if(!window.gsap||!window.ScrollTrigger) return; gsap.registerPlugin(ScrollTrigger); /* … */ }
    if(window.AnimationManager?.onReady) AnimationManager.onReady(init);
    else { let n=0,t=setInterval(()=>{ if(AnimationManager?.onReady){clearInterval(t);AnimationManager.onReady(init)} else if(++n>100){clearInterval(t);console.error('AnimationManager not loaded')}} ,50)}
  })();
  ```
- Check for element existence before animating; prefer `once: true` for reveal effects; call `ScrollTrigger.refresh()` only via `AnimationManager` hooks when possible (it schedules safe refreshes after content/fonts load).
- jQuery is available and used for some modules (e.g., `js/global/loader.js`, `utils.js`). Keep style consistent with nearby files.
- For homepage scripts, add the file under `js/homepage/` and, if it should auto-load, append its path to `scripts.homepage` in `rsm-loader.js`.

## Dev, build, and deploy
- Install: `npm install`
- Local server (serves unminified files to Webflow): `npm run dev` or `npm run dev:localhost`, then in browser console run `RSMDev.enableLocalhost()` to force `http://localhost:5000`.
- Build (minified + sourcemaps to `dist/`): `npm run build` (uses `build.js` with Terser). Netlify runs this automatically per `netlify.toml`.
- Do not commit generated `dist/**` changes unless explicitly required; source of truth is `js/**` and root loaders.

## Automated browser tests (Playwright)
- Run: `npm test` (dev branch), `npm run test:prod`, or `node test-browser.js --url=… --branch=…`.
- Outputs:
  - JSON: `test-results/latest-results.json` (AI-friendly)
  - HTML: `test-results/latest-report.html`
- Typical AI loop: run tests → read the JSON → fix referenced files/lines → re-run. Errors like “GSAP not defined”, “ScrollTrigger … undefined”, or missing DOM elements are common and should be guarded.

## Integration with Webflow (reference)
- In Webflow Custom Code: include `<script src="…/rsm-loader.js" defer></script>`. To control branch, set `window.RSM_BRANCH = 'development'|'production'` before the loader or use `?rsm-branch=…`.
- Homepage-only scripts can be loaded with `<script src="…/homepage-loader.js" defer></script>` or via `RSM.appendScriptToPage('homepage')` after `rsm:ready`.

## Useful file map
- Loaders: `rsm-loader.js`, `homepage-loader.js`, `dev-helper.js`
- Init core: `js/global/anim-init.js` (creates `AnimationManager` and refresh strategy)
- Global modules: `js/global/*.js` (e.g., `lenis.js`, `navbar*.js`, `utils.js`, `loader.js`)
- Homepage modules: `js/homepage/*.js` (e.g., `section-anim.js`, `timeline-anim.js`, `services-anim.js`)
- Build/Deploy: `build.js`, `netlify.toml`, `package.json`
