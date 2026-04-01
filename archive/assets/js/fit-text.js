/**
 * FitText - Dynamic Font Sizing
 * Automatically scales text to fit within container width
 *
 * Features:
 * - Measures text width using canvas
 * - Scales font-size to fit container
 * - ENFORCES single-line display (no wrapping, no hyphens)
 * - No minimum size (always fits)
 * - Targets titles and subtitles in cards
 * - Recalculates on resize
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  var config = {
    // Selectors for elements to fit
    selectors: [
      '.card-title',
      '.card h2',
      '.card h3',
      '.featured-card h3',
      '.featured-card .subtle',
      '.featured-card-journal',
      '.list-item h2',
      '.join-card h2',
      '.subtle'
    ],

    // Padding to account for (percentage of container)
    paddingPercent: 0.08,

    // Debounce delay for resize (ms)
    resizeDelay: 100,

    // Minimum scale factor (0 = no minimum, will shrink as much as needed)
    minScale: 0,

    // Maximum scale factor (1 = original size)
    maxScale: 1,

    // Minimum readable font size in pixels (absolute floor)
    minFontSize: 10
  };

  // ============================================
  // STATE
  // ============================================

  var measureCanvas = null;
  var measureCtx = null;
  var resizeTimeout = null;
  var observer = null;

  // ============================================
  // TEXT MEASUREMENT
  // ============================================

  function getMeasureContext() {
    if (!measureCanvas) {
      measureCanvas = document.createElement('canvas');
      measureCtx = measureCanvas.getContext('2d');
    }
    return measureCtx;
  }

  function measureTextWidth(text, font) {
    var ctx = getMeasureContext();
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  function getComputedFont(element, fontSize) {
    var style = window.getComputedStyle(element);
    var fontWeight = style.fontWeight || 'normal';
    var fontFamily = style.fontFamily || 'sans-serif';
    return fontWeight + ' ' + fontSize + 'px ' + fontFamily;
  }

  function getOriginalFontSize(element) {
    // Check for stored original size
    if (element.dataset.originalFontSize) {
      return parseFloat(element.dataset.originalFontSize);
    }

    // Temporarily remove any inline font-size to get CSS-defined size
    var inlineSize = element.style.fontSize;
    element.style.fontSize = '';

    var style = window.getComputedStyle(element);
    var size = parseFloat(style.fontSize);

    // Restore inline size if there was one
    if (inlineSize) {
      element.style.fontSize = inlineSize;
    }

    // Store original size
    element.dataset.originalFontSize = size;
    return size;
  }

  // ============================================
  // FIT TEXT LOGIC
  // ============================================

  function fitElement(element) {
    // Skip if element is hidden or empty
    if (!element.offsetParent || !element.textContent.trim()) {
      return;
    }

    // IMMEDIATELY enforce single-line display to prevent any wrapping
    element.style.whiteSpace = 'nowrap';
    element.style.wordBreak = 'normal';
    element.style.overflowWrap = 'normal';
    element.style.hyphens = 'none';
    element.style.WebkitHyphens = 'none';
    element.style.MozHyphens = 'none';
    element.style.msHyphens = 'none';

    // Get the text content (full text, no truncation)
    var text = element.textContent.trim();

    // Get container width
    var container = element.parentElement;
    var containerWidth = container.clientWidth;

    // If container has no width, try element's own offsetWidth context
    if (containerWidth <= 0) {
      containerWidth = element.offsetWidth || 200;
    }

    // Account for padding/margin on the element
    var style = window.getComputedStyle(element);
    var paddingLeft = parseFloat(style.paddingLeft) || 0;
    var paddingRight = parseFloat(style.paddingRight) || 0;
    var marginLeft = parseFloat(style.marginLeft) || 0;
    var marginRight = parseFloat(style.marginRight) || 0;

    // Also account for container padding
    var containerStyle = window.getComputedStyle(container);
    var containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    var containerPaddingRight = parseFloat(containerStyle.paddingRight) || 0;

    var availableWidth = containerWidth - containerPaddingLeft - containerPaddingRight - paddingLeft - paddingRight - marginLeft - marginRight;
    availableWidth *= (1 - config.paddingPercent);

    // Safety check
    if (availableWidth <= 0) {
      availableWidth = 100;
    }

    // Get original font size
    var originalSize = getOriginalFontSize(element);

    // Measure text at original size
    var font = getComputedFont(element, originalSize);
    var textWidth = measureTextWidth(text, font);

    // Calculate scale factor needed to fit
    var scale = availableWidth / textWidth;

    // Clamp scale
    if (config.minScale > 0) {
      scale = Math.max(scale, config.minScale);
    }
    scale = Math.min(scale, config.maxScale);

    // Calculate new font size
    var newSize = originalSize * scale;

    // Apply minimum font size floor
    if (newSize < config.minFontSize) {
      newSize = config.minFontSize;
    }

    // Apply the calculated font size
    if (scale < 1) {
      element.style.fontSize = newSize + 'px';
      element.dataset.fitTextApplied = 'true';

      // Set overflow handling (ellipsis as last resort)
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';
    } else {
      // Text fits at original size
      element.style.fontSize = '';
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';
      element.dataset.fitTextApplied = 'false';
    }
  }

  function fitAllElements() {
    var selector = config.selectors.join(', ');
    var elements = document.querySelectorAll(selector);

    elements.forEach(function(element) {
      fitElement(element);
    });
  }

  // ============================================
  // RESIZE HANDLING
  // ============================================

  function handleResize() {
    // Debounce resize
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(function() {
      // Reset all elements first to recalculate
      var selector = config.selectors.join(', ');
      var elements = document.querySelectorAll(selector);

      elements.forEach(function(element) {
        // Clear the stored original size to force recalculation
        delete element.dataset.originalFontSize;
        element.style.fontSize = '';
      });

      // Then refit
      fitAllElements();
    }, config.resizeDelay);
  }

  // ============================================
  // MUTATION OBSERVER
  // ============================================

  function setupMutationObserver() {
    if (!('MutationObserver' in window)) return;

    observer = new MutationObserver(function(mutations) {
      var shouldRefit = false;

      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRefit = true;
        }
      });

      if (shouldRefit) {
        // Delay to allow DOM to settle
        setTimeout(fitAllElements, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================
  // PUBLIC API
  // ============================================

  window.FitText = {
    fit: fitElement,
    fitAll: fitAllElements,
    refresh: function() {
      // Clear cached original sizes
      var selector = config.selectors.join(', ');
      var elements = document.querySelectorAll(selector);

      elements.forEach(function(element) {
        delete element.dataset.originalFontSize;
        element.style.fontSize = '';
        element.style.whiteSpace = '';
      });

      fitAllElements();
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Initial fit
    fitAllElements();

    // Handle resize
    window.addEventListener('resize', handleResize);

    // Watch for DOM changes
    setupMutationObserver();

    // Refit after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAllElements);
    }

    // Also refit after a short delay to catch any late-loading content
    setTimeout(fitAllElements, 500);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
