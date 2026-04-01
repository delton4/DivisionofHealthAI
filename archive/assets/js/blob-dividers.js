/**
 * Blob Divider Animations
 * Creates organic flowing shape animations for section dividers
 *
 * Features:
 * - Morphing blob shapes with gradient fills
 * - Smooth continuous animation
 * - About and Join Us page styling
 * - Theme-aware colors
 * - Reduced motion support
 */

(function() {
  'use strict';

  // Only run on about and join-us pages
  var isAboutPage = window.location.pathname.includes('about');
  var isJoinPage = window.location.pathname.includes('join');

  if (!isAboutPage && !isJoinPage) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ============================================
  // CONFIGURATION
  // ============================================

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  var config = {
    // Blob settings
    blobCount: 3,
    blobPoints: 6,
    blobRadiusMin: 80,
    blobRadiusMax: 150,
    blobVariation: 30,

    // Animation
    morphSpeed: 0.3,
    floatSpeed: 0.5,
    floatAmplitude: 20,

    // Visual
    blurAmount: isMobile ? 20 : 40,
    opacity: 0.15
  };

  // ============================================
  // STATE
  // ============================================

  var blobs = [];
  var time = 0;
  var animationId = null;
  var isVisible = true;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        blob1: ['#00c4d4', '#8b5cf6'],
        blob2: ['#8b5cf6', '#f472b6'],
        blob3: ['#34d399', '#00c4d4']
      };
    } else {
      return {
        blob1: ['#0d5c6e', '#1a8fa8'],
        blob2: ['#612e8a', '#8b5cf6'],
        blob3: ['#34d399', '#0d5c6e']
      };
    }
  }

  // ============================================
  // BLOB CREATION
  // ============================================

  function createBlobSVG(id, colors, position) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'blob-divider blob-' + id);
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    svg.style.cssText = [
      'position: absolute',
      'width: 300px',
      'height: 300px',
      'opacity: ' + config.opacity,
      'filter: blur(' + config.blurAmount + 'px)',
      'pointer-events: none',
      'z-index: 0',
      position
    ].join(';');

    // Create gradient
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'blob-gradient-' + id);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', colors[0]);

    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', colors[1]);

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Create path
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'url(#blob-gradient-' + id + ')');
    path.setAttribute('class', 'blob-path');
    svg.appendChild(path);

    return {
      element: svg,
      path: path,
      baseRadius: config.blobRadiusMin + Math.random() * (config.blobRadiusMax - config.blobRadiusMin),
      phaseOffsets: [],
      centerX: 200,
      centerY: 200,
      floatPhase: Math.random() * Math.PI * 2
    };
  }

  function generateBlobPath(blob, time) {
    var points = [];
    var numPoints = config.blobPoints;

    for (var i = 0; i < numPoints; i++) {
      var angle = (i / numPoints) * Math.PI * 2;
      var phaseOffset = blob.phaseOffsets[i] || (blob.phaseOffsets[i] = Math.random() * Math.PI * 2);

      // Multiple sine waves for organic movement
      var radiusVariation =
        Math.sin(time * config.morphSpeed + phaseOffset) * config.blobVariation * 0.5 +
        Math.sin(time * config.morphSpeed * 1.5 + phaseOffset * 2) * config.blobVariation * 0.3 +
        Math.sin(time * config.morphSpeed * 0.5 + phaseOffset * 0.5) * config.blobVariation * 0.2;

      var radius = blob.baseRadius + radiusVariation;

      var x = blob.centerX + Math.cos(angle) * radius;
      var y = blob.centerY + Math.sin(angle) * radius;

      points.push({ x: x, y: y });
    }

    return pointsToSmoothPath(points);
  }

  function pointsToSmoothPath(points) {
    if (points.length < 3) return '';

    var path = 'M ' + points[0].x + ' ' + points[0].y;

    for (var i = 0; i < points.length; i++) {
      var p0 = points[(i - 1 + points.length) % points.length];
      var p1 = points[i];
      var p2 = points[(i + 1) % points.length];
      var p3 = points[(i + 2) % points.length];

      var cp1x = p1.x + (p2.x - p0.x) / 6;
      var cp1y = p1.y + (p2.y - p0.y) / 6;
      var cp2x = p2.x - (p3.x - p1.x) / 6;
      var cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p2.x + ' ' + p2.y;
    }

    path += ' Z';
    return path;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initBlobs() {
    var colors = getColors();
    var colorKeys = ['blob1', 'blob2', 'blob3'];

    var positions = [
      'top: -100px; left: -100px;',
      'top: 50%; right: -150px; transform: translateY(-50%);',
      'bottom: -100px; left: 30%;'
    ];

    // Find section dividers or create container
    var targetSections = document.querySelectorAll('.about-values, .contact-form-section, .join-grid');

    if (targetSections.length === 0) {
      targetSections = [document.querySelector('main') || document.body];
    }

    // Add blobs to first suitable container
    var container = targetSections[0];
    if (container) {
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      for (var i = 0; i < config.blobCount; i++) {
        var blob = createBlobSVG(i, colors[colorKeys[i % colorKeys.length]], positions[i % positions.length]);
        container.appendChild(blob.element);
        blobs.push(blob);
      }
    }
  }

  // ============================================
  // ANIMATION
  // ============================================

  function updateBlobs() {
    for (var i = 0; i < blobs.length; i++) {
      var blob = blobs[i];

      // Generate morphing path
      var pathData = generateBlobPath(blob, time);
      blob.path.setAttribute('d', pathData);

      // Floating motion
      var floatY = Math.sin(time * config.floatSpeed + blob.floatPhase) * config.floatAmplitude;
      var floatX = Math.cos(time * config.floatSpeed * 0.7 + blob.floatPhase) * config.floatAmplitude * 0.5;

      blob.element.style.transform = 'translate(' + floatX + 'px, ' + floatY + 'px)';
    }
  }

  function animate() {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    time += 0.016;
    updateBlobs();
    animationId = requestAnimationFrame(animate);
  }

  // ============================================
  // VISIBILITY OBSERVER
  // ============================================

  function setupVisibilityObserver() {
    if (!('IntersectionObserver' in window) || blobs.length === 0) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    if (blobs[0] && blobs[0].element.parentElement) {
      observer.observe(blobs[0].element.parentElement);
    }
  }

  // ============================================
  // THEME CHANGE HANDLER
  // ============================================

  function updateBlobColors() {
    var colors = getColors();
    var colorKeys = ['blob1', 'blob2', 'blob3'];

    for (var i = 0; i < blobs.length; i++) {
      var gradientId = 'blob-gradient-' + i;
      var gradient = document.getElementById(gradientId);

      if (gradient) {
        var stops = gradient.querySelectorAll('stop');
        var blobColors = colors[colorKeys[i % colorKeys.length]];

        if (stops[0]) stops[0].setAttribute('stop-color', blobColors[0]);
        if (stops[1]) stops[1].setAttribute('stop-color', blobColors[1]);
      }
    }
  }

  // ============================================
  // INIT
  // ============================================

  function init() {
    initBlobs();
    setupVisibilityObserver();

    // Listen for theme changes
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-theme') {
          updateBlobColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Start animation
    animate();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
