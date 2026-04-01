/**
 * Animation Core - Shared Utilities for Page Animations
 * Provides common functionality for canvas-based animations
 */

var AnimationCore = (function() {
  'use strict';

  // ============================================
  // FEATURE DETECTION
  // ============================================

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  // ============================================
  // THEME DETECTION
  // ============================================

  function isTheoMode() {
    return document.documentElement.getAttribute('data-theme') === 'theo';
  }

  // ============================================
  // NORTHWELL BRAND COLORS
  // ============================================

  var colors = {
    // Northwell brand
    northwellPurple: '#612e8a',
    northwellPurpleLight: '#8b5cf6',

    // Site colors - light mode
    light: {
      primary: '#0d5c6e',
      primaryLight: '#1a8fa8',
      accent: '#00c4d4',
      secondary: '#34d399',
      text: '#0b1b2a',
      textMuted: '#30475e',
      bg: '#f8fafc'
    },

    // Site colors - dark/theo mode
    theo: {
      primary: '#00c4d4',
      primaryLight: '#4dd4ff',
      accent: '#8b5cf6',
      secondary: '#34d399',
      text: '#e8eef7',
      textMuted: '#9ca3af',
      bg: '#0b1b2a'
    }
  };

  function getThemeColors() {
    return isTheoMode() ? colors.theo : colors.light;
  }

  // ============================================
  // CANVAS UTILITIES
  // ============================================

  function createCanvas(container, className) {
    var canvas = document.createElement('canvas');
    canvas.className = className || 'animation-canvas';
    container.insertBefore(canvas, container.firstChild);
    return canvas;
  }

  function resizeCanvas(canvas, container) {
    var rect = container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    return { width: rect.width, height: rect.height, dpr: dpr };
  }

  // ============================================
  // MOUSE TRACKING
  // ============================================

  function createMouseTracker(element) {
    var mouse = { x: -1000, y: -1000, active: false };

    function handleMove(e) {
      var rect = element.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function handleLeave() {
      mouse.active = false;
    }

    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);

    return {
      mouse: mouse,
      destroy: function() {
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
      }
    };
  }

  // ============================================
  // ANIMATION LOOP MANAGER
  // ============================================

  function createAnimationLoop(updateFn, drawFn) {
    var animationId = null;
    var isRunning = false;
    var lastTime = 0;
    var targetFPS = isMobile ? 30 : 60;
    var frameInterval = 1000 / targetFPS;

    function loop(currentTime) {
      if (!isRunning) return;

      animationId = requestAnimationFrame(loop);

      var deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);

        if (updateFn) updateFn(deltaTime / 1000);
        if (drawFn) drawFn();
      }
    }

    return {
      start: function() {
        if (prefersReducedMotion) return;
        if (isRunning) return;
        isRunning = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(loop);
      },
      stop: function() {
        isRunning = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      },
      isRunning: function() {
        return isRunning;
      }
    };
  }

  // ============================================
  // MATH UTILITIES
  // ============================================

  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
  }

  // ============================================
  // EASING FUNCTIONS
  // ============================================

  var easing = {
    linear: function(t) { return t; },
    easeInQuad: function(t) { return t * t; },
    easeOutQuad: function(t) { return t * (2 - t); },
    easeInOutQuad: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    easeInCubic: function(t) { return t * t * t; },
    easeOutCubic: function(t) { return (--t) * t * t + 1; },
    easeInOutCubic: function(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    easeInSine: function(t) { return 1 - Math.cos(t * Math.PI / 2); },
    easeOutSine: function(t) { return Math.sin(t * Math.PI / 2); },
    easeInOutSine: function(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  };

  // ============================================
  // PARTICLE SYSTEM BASE
  // ============================================

  function createParticle(options) {
    var defaults = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 3,
      color: '#00c4d4',
      alpha: 1,
      life: Infinity,
      maxLife: Infinity
    };

    return Object.assign({}, defaults, options);
  }

  function updateParticle(particle, bounds, bounce) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.life !== Infinity) {
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
    }

    if (bounce) {
      if (particle.x < 0 || particle.x > bounds.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > bounds.height) particle.vy *= -1;
      particle.x = clamp(particle.x, 0, bounds.width);
      particle.y = clamp(particle.y, 0, bounds.height);
    }

    return particle.life > 0;
  }

  // ============================================
  // DRAWING UTILITIES
  // ============================================

  function drawCircle(ctx, x, y, radius, color, alpha) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLine(ctx, x1, y1, x2, y2, color, width, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawGlowCircle(ctx, x, y, radius, color, glowRadius) {
    ctx.shadowBlur = glowRadius || 15;
    ctx.shadowColor = color;
    drawCircle(ctx, x, y, radius, color, 1);
    ctx.shadowBlur = 0;
  }

  // ============================================
  // VISIBILITY OBSERVER
  // ============================================

  function createVisibilityObserver(element, onVisible, onHidden) {
    if (!('IntersectionObserver' in window)) {
      onVisible();
      return { disconnect: function() {} };
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          onVisible();
        } else {
          onHidden();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(element);
    return observer;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Feature detection
    prefersReducedMotion: prefersReducedMotion,
    isMobile: isMobile,

    // Theme
    isTheoMode: isTheoMode,
    colors: colors,
    getThemeColors: getThemeColors,

    // Canvas
    createCanvas: createCanvas,
    resizeCanvas: resizeCanvas,

    // Mouse
    createMouseTracker: createMouseTracker,

    // Animation
    createAnimationLoop: createAnimationLoop,

    // Math
    distance: distance,
    lerp: lerp,
    clamp: clamp,
    mapRange: mapRange,
    randomRange: randomRange,
    randomInt: randomInt,

    // Easing
    easing: easing,

    // Particles
    createParticle: createParticle,
    updateParticle: updateParticle,

    // Drawing
    drawCircle: drawCircle,
    drawLine: drawLine,
    drawGlowCircle: drawGlowCircle,

    // Visibility
    createVisibilityObserver: createVisibilityObserver
  };

})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationCore;
}
