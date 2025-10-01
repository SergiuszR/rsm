$(document).ready(function() {
const navbar = document.querySelector('.navbar_component');

// Auto-detect potential sections with more comprehensive selectors
const sectionSelectors = [
  'section'
];

const sections = document.querySelectorAll(sectionSelectors.join(', '));

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
    
    navbar.classList.toggle('is-contrast', isDark);
  } else {
    // Fallback: check body background
    const bodyBg = getEffectiveBackgroundColor(document.body);
    const isDark = isColorDark(bodyBg);
    navbar.classList.toggle('is-contrast', isDark);
  }
}

// Set up ScrollTrigger
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: updateNavbarContrast,
  onRefresh: updateNavbarContrast
});

// Initial setup
    updateNavbarContrast();
});
