/**
 * Click Pulse Animation
 * Adds a ripple/pulse effect when clicking interactive elements
 *
 * Features:
 * - Ripple animation on click
 * - Works on buttons, cards, and interactive elements
 * - Theme-aware colors
 * - Respects reduced motion preference
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  var config = {
    // Selectors for elements that get the pulse effect
    selectors: [
      '.btn',
      '.btn-primary',
      '.btn-secondary',
      '.cta-button',
      '.card',
      '.featured-card',
      '.list-item',
      '.join-card',
      '.theme-toggle',
      '.linkedin-link',
      '.linkedin-link-small'
    ],
    // Animation duration in ms
    duration: 600,
    // Maximum ripple size (relative to element)
    maxScale: 2.5
  };

  // ============================================
  // STYLES
  // ============================================

  var styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .pulse-ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: pulseRipple ${config.duration}ms ease-out forwards;
      pointer-events: none;
      z-index: 1000;
    }

    @keyframes pulseRipple {
      0% {
        transform: scale(0);
        opacity: 0.5;
      }
      100% {
        transform: scale(${config.maxScale});
        opacity: 0;
      }
    }

    /* Ensure parent can contain the ripple */
    .btn, .btn-primary, .btn-secondary, .cta-button,
    .card, .featured-card, .list-item, .join-card,
    .theme-toggle, .linkedin-link, .linkedin-link-small {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(styleSheet);

  // ============================================
  // COLOR DETECTION
  // ============================================

  function getRippleColor() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return 'rgba(139, 92, 246, 0.4)'; // Purple accent
    } else {
      return 'rgba(0, 196, 212, 0.4)'; // Cyan accent
    }
  }

  // ============================================
  // RIPPLE CREATION
  // ============================================

  function createRipple(event) {
    var element = event.currentTarget;

    // Get element dimensions and click position
    var rect = element.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Calculate ripple size (use the larger dimension)
    var size = Math.max(rect.width, rect.height) * 2;

    // Create ripple element
    var ripple = document.createElement('span');
    ripple.className = 'pulse-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    ripple.style.backgroundColor = getRippleColor();

    // Add to element
    element.appendChild(ripple);

    // Remove after animation completes
    setTimeout(function() {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, config.duration);
  }

  // ============================================
  // EVENT BINDING
  // ============================================

  function bindRippleEvents() {
    var selector = config.selectors.join(', ');
    var elements = document.querySelectorAll(selector);

    elements.forEach(function(element) {
      // Avoid double-binding
      if (element.dataset.rippleBound) return;
      element.dataset.rippleBound = 'true';

      element.addEventListener('click', createRipple);
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Initial binding
    bindRippleEvents();

    // Re-bind on DOM changes (for dynamically added elements)
    var observer = new MutationObserver(function(mutations) {
      var shouldRebind = mutations.some(function(mutation) {
        return mutation.addedNodes.length > 0;
      });

      if (shouldRebind) {
        bindRippleEvents();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
