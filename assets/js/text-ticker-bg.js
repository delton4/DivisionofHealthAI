/**
 * Text Line Ticker Animation
 * Creates horizontal scrolling text lines for Publications page
 *
 * Features:
 * - Horizontal lines of varying lengths (representing text)
 * - Scroll left-to-right at moderate pace
 * - Multiple lanes at different depths/opacities
 * - Fading in/out at edges
 * - Theme-aware colors
 */

(function() {
  'use strict';

  // Only run on publications pages
  var container = document.querySelector('.page-header');
  var isPublicationsPage = window.location.pathname.includes('publication');

  if (!container || !isPublicationsPage) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ============================================
  // CONFIGURATION
  // ============================================

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  var config = {
    // Line settings
    lineCount: isMobile ? 15 : 30,
    lineHeightMin: 2,
    lineHeightMax: 4,
    lineWidthMin: 40,
    lineWidthMax: 200,
    lineGap: 8,

    // Speed settings (pixels per frame)
    speedMin: 0.3,
    speedMax: 1.2,

    // Lanes (depth layers)
    laneCount: 4,

    // Fade zones (percentage of width)
    fadeZone: 0.15,

    // Visual
    cornerRadius: 2
  };

  // ============================================
  // STATE
  // ============================================

  var canvas, ctx;
  var dimensions = { width: 0, height: 0 };
  var lines = [];
  var animationId = null;
  var isVisible = true;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        lines: [
          'rgba(0, 196, 212, 0.6)',
          'rgba(0, 196, 212, 0.4)',
          'rgba(139, 92, 246, 0.5)',
          'rgba(139, 92, 246, 0.3)',
          'rgba(77, 212, 255, 0.4)'
        ],
        accent: '#00c4d4'
      };
    } else {
      return {
        lines: [
          'rgba(13, 92, 110, 0.5)',
          'rgba(13, 92, 110, 0.3)',
          'rgba(26, 143, 168, 0.4)',
          'rgba(0, 196, 212, 0.35)',
          'rgba(52, 211, 153, 0.3)'
        ],
        accent: '#0d5c6e'
      };
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
  }

  // ============================================
  // CANVAS SETUP
  // ============================================

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'ticker-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.style.position = 'relative';
    container.insertBefore(canvas, container.firstChild);
    ctx = canvas.getContext('2d');
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr);

    dimensions.width = rect.width;
    dimensions.height = rect.height;

    initLines();
  }

  // ============================================
  // LINE MANAGEMENT
  // ============================================

  function createLine(startOffScreen) {
    var colors = getColors();
    var lane = randomInt(0, config.laneCount - 1);

    // Lane determines y position and base properties
    var laneHeight = dimensions.height / config.laneCount;
    var y = lane * laneHeight + randomRange(10, laneHeight - 10);

    // Depth affects speed and opacity (lower lane = further back = slower)
    var depthFactor = 0.5 + (lane / config.laneCount) * 0.5;

    var width = randomRange(config.lineWidthMin, config.lineWidthMax) * depthFactor;
    var height = randomRange(config.lineHeightMin, config.lineHeightMax);
    var speed = randomRange(config.speedMin, config.speedMax) * depthFactor;

    // Start position
    var x = startOffScreen ? -width - randomRange(0, 100) : randomRange(-width, dimensions.width);

    return {
      x: x,
      y: y,
      width: width,
      height: height,
      speed: speed,
      color: colors.lines[randomInt(0, colors.lines.length - 1)],
      lane: lane,
      depthFactor: depthFactor
    };
  }

  function initLines() {
    lines = [];

    for (var i = 0; i < config.lineCount; i++) {
      lines.push(createLine(false));
    }

    // Sort by lane for proper depth rendering
    lines.sort(function(a, b) { return a.lane - b.lane; });
  }

  // ============================================
  // ANIMATION
  // ============================================

  function updateLines() {
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Move line to the right
      line.x += line.speed;

      // Reset if off screen to the right
      if (line.x > dimensions.width + 50) {
        lines[i] = createLine(true);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw lines
    lines.forEach(function(line) {
      drawLine(line);
    });
  }

  function drawLine(line) {
    // Calculate fade based on x position
    var fadeLeft = 0;
    var fadeRight = 0;
    var fadeZoneWidth = dimensions.width * config.fadeZone;

    // Fade in from left
    if (line.x < fadeZoneWidth) {
      fadeLeft = line.x / fadeZoneWidth;
    } else {
      fadeLeft = 1;
    }

    // Fade out to right
    var rightEdge = line.x + line.width;
    var fadeStart = dimensions.width - fadeZoneWidth;
    if (rightEdge > fadeStart) {
      fadeRight = 1 - (rightEdge - fadeStart) / fadeZoneWidth;
    } else {
      fadeRight = 1;
    }

    var opacity = Math.min(fadeLeft, fadeRight);
    if (opacity <= 0) return;

    ctx.globalAlpha = opacity;
    ctx.fillStyle = line.color;

    // Draw rounded rectangle
    var x = line.x;
    var y = line.y;
    var w = line.width;
    var h = line.height;
    var r = config.cornerRadius;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function animate() {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    updateLines();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleResize() {
    resize();
  }

  // ============================================
  // VISIBILITY OBSERVER
  // ============================================

  function setupVisibilityObserver() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    createCanvas();
    resize();

    window.addEventListener('resize', handleResize);

    setupVisibilityObserver();
    animate();
  }

  // Ensure content is above canvas
  var contentElements = container.querySelectorAll('h1, .lede, .back-link');
  contentElements.forEach(function(el) {
    el.style.position = 'relative';
    el.style.zIndex = '1';
  });

  init();

})();
