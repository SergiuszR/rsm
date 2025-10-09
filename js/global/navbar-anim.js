$(document).ready(function() {
    // Wait for GSAP and ScrollTrigger to be ready
    if (!window.AnimationManager) {
        console.error('AnimationManager not loaded for navbar-anim');
        return;
    }
    
    (function waitForAnimationManager() {
        if (!window.AnimationManager || typeof window.AnimationManager.onReady !== 'function') {
            let attempts = 0;
            const maxAttempts = 100; // 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(init);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.error('AnimationManager not loaded for navbar-anim');
                }
            }, 50);
        } else {
            window.AnimationManager.onReady(init);
        }

        function init() {
        const navbar = document.querySelector('.navbar_component');
        if (!navbar) {
            console.error('[navbar-anim] Navbar not found with selector .navbar_component');
            return;
        }
        console.log('[navbar-anim] Navbar found:', navbar);

// Auto-detect potential sections with more comprehensive selectors
const sectionSelectors = [
  'section'
];

const sections = document.querySelectorAll(sectionSelectors.join(', '));
console.log('[navbar-anim] Found', sections.length, 'sections');

// Enhanced color detection with better parsing
function isColorDark(color) {
  if (!color || color === 'transparent') return false;
  
  let r, g, b, a = 1;
  
  // Parse rgba/rgb
  if (color.startsWith('rgb')) {
    const matches = color.match(/rgba?\(([^)]+)\)/);
    if (matches) {
      const values = matches[1].split(',').map(v => parseFloat(v.trim()));
      [r, g, b] = values;
      a = values[3] !== undefined ? values[3] : 1;
    }
  }
  // Parse hex colors
  else if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }
  }
  // Handle named colors (basic ones)
  else {
    const namedColors = {
      'black': [0, 0, 0],
      'navy': [0, 0, 128],
      'darkblue': [0, 0, 139],
      'darkgreen': [0, 100, 0],
      'darkcyan': [0, 139, 139],
      'darkred': [139, 0, 0],
      'purple': [128, 0, 128]
    };
    
    if (namedColors[color.toLowerCase()]) {
      [r, g, b] = namedColors[color.toLowerCase()];
    } else {
      return false; // Unknown color, assume light
    }
  }
  
  if (r === undefined || g === undefined || b === undefined) return false;
  
  // If alpha is very low, consider it transparent (light)
  if (a < 0.1) return false;
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function getEffectiveBackgroundColor(element) {
  let currentElement = element;
  
  while (currentElement && currentElement !== document.documentElement) {
    const computedStyle = getComputedStyle(currentElement);
    const bgColor = computedStyle.backgroundColor;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor;
    }
    
    // Also check for background images with dark overlays
    const bgImage = computedStyle.backgroundImage;
    if (bgImage && bgImage !== 'none') {
      // If there's a background image, we might want to assume it could be dark
      // This is a heuristic - you might want to adjust based on your use case
      return 'rgb(50, 50, 50)'; // Assume dark for background images
    }
    
    currentElement = currentElement.parentElement;
  }
  
  return 'rgb(255, 255, 255)'; // Default to white
}

function updateNavbarContrast() {
  const navbarRect = navbar.getBoundingClientRect();
  const navbarCenter = navbarRect.top + (navbarRect.height / 2);
  
  console.log('[navbar-anim] Navbar center Y:', navbarCenter);
  
  // Find the section at the navbar's center point
  let targetSection = null;
  
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= navbarCenter && rect.bottom >= navbarCenter) {
      targetSection = section;
    }
  });
  
  if (targetSection) {
    const bgColor = getEffectiveBackgroundColor(targetSection);
    const isDark = isColorDark(bgColor);
    
    console.log('[navbar-anim] Target section:', targetSection, 'bgColor:', bgColor, 'isDark:', isDark);
    navbar.classList.toggle('is-contrast', isDark);
  } else {
    // Fallback: check body background
    const bodyBg = getEffectiveBackgroundColor(document.body);
    const isDark = isColorDark(bodyBg);
    console.log('[navbar-anim] No section found, using body bg:', bodyBg, 'isDark:', isDark);
    navbar.classList.toggle('is-contrast', isDark);
  }
}

// Set up ScrollTrigger
// For mobile: add invalidateOnRefresh to handle mobile scroll issues
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    console.log('[navbar-anim] ScrollTrigger onUpdate fired, scroll:', self.scroll());
    updateNavbarContrast();
  },
  onRefresh: (self) => {
    console.log('[navbar-anim] ScrollTrigger onRefresh fired');
    updateNavbarContrast();
  },
  invalidateOnRefresh: true,
  // Mobile-specific: force refresh on scroll for better compatibility
  scrub: 0
});

        // Initial setup
        console.log('[navbar-anim] Running initial updateNavbarContrast');
        updateNavbarContrast();
        
        // Additional mobile fix: listen to native scroll events as fallback
        let scrollTimeout;
        window.addEventListener('scroll', function() {
          console.log('[navbar-anim] Native scroll event fired, scrollY:', window.scrollY);
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(updateNavbarContrast, 50);
        }, { passive: true });
        }
    })();
});
