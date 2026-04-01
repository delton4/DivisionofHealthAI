/**
 * Card Interactions
 * Enhanced card hover effects and click handling
 *
 * Features:
 * - Cursor-following radial gradient highlight (15-25% opacity)
 * - Brief ripple animation on click before navigation
 * - Full card clickability
 * - Theme-aware colors
 * - Keyboard accessibility
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  var config = {
    // Selectors for interactive cards
    cardSelectors: [
      '.card',
      '.featured-card',
      '.list-item',
      '.join-card'
    ],

    // Highlight settings
    highlightSize: 300,
    highlightOpacity: 0.2,

    // Click animation
    rippleDuration: 300,
    navigationDelay: 200
  };

  // ============================================
  // STYLES
  // ============================================

  var styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* Cursor-following highlight */
    .card-interactive {
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .card-interactive::before {
      content: '';
      position: absolute;
      top: var(--mouse-y, -1000px);
      left: var(--mouse-x, -1000px);
      width: ${config.highlightSize}px;
      height: ${config.highlightSize}px;
      background: radial-gradient(circle, var(--highlight-color, rgba(0, 196, 212, 0.2)) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1;
    }

    .card-interactive:hover::before {
      opacity: 1;
    }

    /* Ensure content is above highlight */
    .card-interactive > * {
      position: relative;
      z-index: 2;
    }

    /* Click ripple */
    .card-ripple {
      position: absolute;
      border-radius: 50%;
      background: var(--ripple-color, rgba(0, 196, 212, 0.4));
      transform: scale(0);
      animation: cardRipple ${config.rippleDuration}ms ease-out forwards;
      pointer-events: none;
      z-index: 10;
    }

    @keyframes cardRipple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(2.5);
        opacity: 0;
      }
    }

    /* Remove default link styling from card links */
    .card-link-wrapper {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .card-link-wrapper:hover {
      text-decoration: none;
      color: inherit;
    }

    /* Keyboard focus state */
    .card-interactive:focus-visible {
      outline: 2px solid var(--color-accent, #00c4d4);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(styleSheet);

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        highlight: 'rgba(139, 92, 246, ' + config.highlightOpacity + ')',
        ripple: 'rgba(139, 92, 246, 0.4)'
      };
    } else {
      return {
        highlight: 'rgba(0, 196, 212, ' + config.highlightOpacity + ')',
        ripple: 'rgba(0, 196, 212, 0.4)'
      };
    }
  }

  // ============================================
  // CURSOR TRACKING
  // ============================================

  function handleMouseMove(e) {
    var card = e.currentTarget;
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');
  }

  function handleMouseLeave(e) {
    var card = e.currentTarget;
    card.style.setProperty('--mouse-x', '-1000px');
    card.style.setProperty('--mouse-y', '-1000px');
  }

  // ============================================
  // CLICK HANDLING
  // ============================================

  function findCardLink(card) {
    // Look for data attribute first
    if (card.dataset.href) {
      return card.dataset.href;
    }

    // Look for anchor tag inside
    var link = card.querySelector('a[href]');
    if (link) {
      return link.getAttribute('href');
    }

    // Check if card itself is wrapped in anchor
    if (card.parentElement && card.parentElement.tagName === 'A') {
      return card.parentElement.getAttribute('href');
    }

    return null;
  }

  function createRipple(card, x, y) {
    var colors = getColors();
    var ripple = document.createElement('span');
    ripple.className = 'card-ripple';

    var size = Math.max(card.offsetWidth, card.offsetHeight);
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    ripple.style.setProperty('--ripple-color', colors.ripple);

    card.appendChild(ripple);

    setTimeout(function() {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, config.rippleDuration);
  }

  function handleClick(e) {
    var card = e.currentTarget;

    // Don't handle if clicking an actual link/button inside
    var target = e.target;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' ||
        target.closest('a') || target.closest('button')) {
      // Let the native click happen
      return;
    }

    var href = findCardLink(card);
    if (!href) return;

    // Prevent default if needed
    e.preventDefault();

    // Create ripple at click position
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    createRipple(card, x, y);

    // Navigate after brief delay
    setTimeout(function() {
      window.location.href = href;
    }, config.navigationDelay);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var card = e.currentTarget;
      var href = findCardLink(card);

      if (href) {
        e.preventDefault();

        // Create ripple at center
        var x = card.offsetWidth / 2;
        var y = card.offsetHeight / 2;
        createRipple(card, x, y);

        setTimeout(function() {
          window.location.href = href;
        }, config.navigationDelay);
      }
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initCard(card) {
    // Skip if already initialized
    if (card.dataset.cardInteractive) return;
    card.dataset.cardInteractive = 'true';

    // Add interactive class
    card.classList.add('card-interactive');

    // Set highlight color
    var colors = getColors();
    card.style.setProperty('--highlight-color', colors.highlight);

    // Make focusable if not already
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }

    // Add ARIA role if there's a link
    var href = findCardLink(card);
    if (href) {
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', card.textContent.trim().substring(0, 100));
    }

    // Bind events
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', handleKeydown);
  }

  function initAllCards() {
    var selector = config.cardSelectors.join(', ');
    var cards = document.querySelectorAll(selector);

    cards.forEach(initCard);
  }

  function updateColors() {
    var colors = getColors();
    var selector = config.cardSelectors.join(', ');
    var cards = document.querySelectorAll(selector);

    cards.forEach(function(card) {
      card.style.setProperty('--highlight-color', colors.highlight);
    });
  }

  // ============================================
  // THEME CHANGE LISTENER
  // ============================================

  function setupThemeListener() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-theme') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  // ============================================
  // MUTATION OBSERVER FOR DYNAMIC CONTENT
  // ============================================

  function setupMutationObserver() {
    if (!('MutationObserver' in window)) return;

    var observer = new MutationObserver(function(mutations) {
      var shouldInit = false;

      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldInit = true;
        }
      });

      if (shouldInit) {
        setTimeout(initAllCards, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================
  // MAIN INIT
  // ============================================

  function init() {
    initAllCards();
    setupThemeListener();
    setupMutationObserver();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
