/**
 * Circuit Board Background Animation
 * Creates PCB-style traces with data pulse animations for the projects page
 *
 * Features:
 * - Circuit trace patterns
 * - Data pulse animations along traces
 * - Tech/digital aesthetic
 * - Mouse interaction (pulses toward cursor)
 * - Theme-aware colors
 */

(function() {
  'use strict';

  // Only run on projects pages
  var container = document.querySelector('.page-header');
  var isProjectsPage = window.location.pathname.includes('project');

  if (!container || !isProjectsPage) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ============================================
  // CONFIGURATION
  // ============================================

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  var config = {
    // Grid settings
    gridSize: isMobile ? 40 : 30,
    traceCount: isMobile ? 8 : 15,

    // Trace settings
    traceSegmentMin: 3,
    traceSegmentMax: 8,
    traceWidth: 2,
    nodeRadius: 4,

    // Pulse settings
    pulseCount: isMobile ? 5 : 10,
    pulseSpeed: 2,
    pulseLength: 30,
    pulseInterval: 2000,

    // Visual
    glowEnabled: !isMobile,
    glowRadius: 10,

    // Mouse
    mouseInfluence: 150
  };

  // ============================================
  // STATE
  // ============================================

  var canvas, ctx;
  var dimensions = { width: 0, height: 0 };
  var traces = [];
  var pulses = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var mouseActive = false;
  var animationId = null;
  var isVisible = true;
  var lastPulseTime = 0;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        trace: 'rgba(0, 196, 212, 0.2)',
        traceHighlight: 'rgba(0, 196, 212, 0.4)',
        node: 'rgba(0, 196, 212, 0.5)',
        nodeGlow: '#00c4d4',
        pulse: '#00c4d4',
        pulseGlow: '#00c4d4',
        pulseAlt: '#8b5cf6'
      };
    } else {
      return {
        trace: 'rgba(13, 92, 110, 0.15)',
        traceHighlight: 'rgba(13, 92, 110, 0.3)',
        node: 'rgba(13, 92, 110, 0.4)',
        nodeGlow: '#0d5c6e',
        pulse: '#00c4d4',
        pulseGlow: '#00c4d4',
        pulseAlt: '#612e8a'
      };
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ============================================
  // CANVAS SETUP
  // ============================================

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'circuit-canvas';
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

    generateTraces();
  }

  // ============================================
  // TRACE GENERATION
  // ============================================

  function generateTraces() {
    traces = [];

    var gridW = Math.ceil(dimensions.width / config.gridSize);
    var gridH = Math.ceil(dimensions.height / config.gridSize);

    for (var i = 0; i < config.traceCount; i++) {
      var trace = generateSingleTrace(gridW, gridH);
      if (trace.points.length > 2) {
        traces.push(trace);
      }
    }
  }

  function generateSingleTrace(gridW, gridH) {
    var points = [];
    var segmentCount = randomInt(config.traceSegmentMin, config.traceSegmentMax);

    // Start from edge
    var edge = randomInt(0, 3);
    var startX, startY;

    switch (edge) {
      case 0: // Top
        startX = randomInt(0, gridW) * config.gridSize;
        startY = 0;
        break;
      case 1: // Right
        startX = dimensions.width;
        startY = randomInt(0, gridH) * config.gridSize;
        break;
      case 2: // Bottom
        startX = randomInt(0, gridW) * config.gridSize;
        startY = dimensions.height;
        break;
      case 3: // Left
        startX = 0;
        startY = randomInt(0, gridH) * config.gridSize;
        break;
    }

    points.push({ x: startX, y: startY });

    var currentX = startX;
    var currentY = startY;
    var lastDirection = -1;

    for (var s = 0; s < segmentCount; s++) {
      var direction = randomInt(0, 3);
      while (direction === lastDirection || direction === (lastDirection + 2) % 4) {
        direction = randomInt(0, 3);
      }

      var length = randomInt(2, 5) * config.gridSize;

      switch (direction) {
        case 0: currentY -= length; break; // Up
        case 1: currentX += length; break; // Right
        case 2: currentY += length; break; // Down
        case 3: currentX -= length; break; // Left
      }

      // Clamp to bounds
      currentX = Math.max(0, Math.min(dimensions.width, currentX));
      currentY = Math.max(0, Math.min(dimensions.height, currentY));

      points.push({ x: currentX, y: currentY });
      lastDirection = direction;
    }

    // Calculate total length for pulse animation
    var totalLength = 0;
    for (var p = 1; p < points.length; p++) {
      totalLength += distance(points[p - 1].x, points[p - 1].y, points[p].x, points[p].y);
    }

    return {
      points: points,
      totalLength: totalLength,
      hasNode: Math.random() > 0.5
    };
  }

  // ============================================
  // PULSE MANAGEMENT
  // ============================================

  function createPulse() {
    if (traces.length === 0) return;

    var traceIndex = randomInt(0, traces.length - 1);
    var trace = traces[traceIndex];
    var colors = getColors();

    pulses.push({
      traceIndex: traceIndex,
      progress: 0,
      speed: config.pulseSpeed * (0.5 + Math.random() * 0.5),
      color: Math.random() > 0.5 ? colors.pulse : colors.pulseAlt,
      length: config.pulseLength
    });
  }

  function updatePulses() {
    var now = performance.now();

    // Create new pulses periodically
    if (now - lastPulseTime > config.pulseInterval) {
      createPulse();
      lastPulseTime = now;
    }

    // Update existing pulses
    for (var i = pulses.length - 1; i >= 0; i--) {
      var pulse = pulses[i];
      var trace = traces[pulse.traceIndex];

      pulse.progress += pulse.speed;

      // Remove completed pulses
      if (pulse.progress > trace.totalLength + pulse.length) {
        pulses.splice(i, 1);
      }
    }
  }

  // ============================================
  // DRAWING
  // ============================================

  function draw() {
    var colors = getColors();

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw traces
    drawTraces(colors);

    // Draw pulses
    drawPulses(colors);

    // Draw nodes
    drawNodes(colors);
  }

  function drawTraces(colors) {
    ctx.lineWidth = config.traceWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var t = 0; t < traces.length; t++) {
      var trace = traces[t];
      var points = trace.points;

      // Check mouse proximity for highlight
      var isNearMouse = false;
      if (mouseActive) {
        for (var p = 0; p < points.length; p++) {
          if (distance(points[p].x, points[p].y, mouseX, mouseY) < config.mouseInfluence) {
            isNearMouse = true;
            break;
          }
        }
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.strokeStyle = isNearMouse ? colors.traceHighlight : colors.trace;
      ctx.stroke();
    }
  }

  function drawPulses(colors) {
    for (var i = 0; i < pulses.length; i++) {
      var pulse = pulses[i];
      var trace = traces[pulse.traceIndex];
      var points = trace.points;

      // Find position along trace
      var pulseStart = Math.max(0, pulse.progress - pulse.length);
      var pulseEnd = pulse.progress;

      var startPos = getPositionOnTrace(points, pulseStart);
      var endPos = getPositionOnTrace(points, pulseEnd);

      if (!startPos || !endPos) continue;

      // Draw pulse gradient
      var gradient = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, pulse.color);
      gradient.addColorStop(1, 'transparent');

      if (config.glowEnabled) {
        ctx.shadowBlur = config.glowRadius;
        ctx.shadowColor = pulse.color;
      }

      // Draw pulse segments
      ctx.beginPath();
      ctx.lineWidth = 3;

      var segmentStart = pulseStart;
      var accumulated = 0;

      for (var s = 1; s < points.length; s++) {
        var segLength = distance(points[s - 1].x, points[s - 1].y, points[s].x, points[s].y);
        var segEnd = accumulated + segLength;

        if (segEnd > pulseStart && accumulated < pulseEnd) {
          var drawStart = Math.max(accumulated, pulseStart);
          var drawEnd = Math.min(segEnd, pulseEnd);

          var t1 = (drawStart - accumulated) / segLength;
          var t2 = (drawEnd - accumulated) / segLength;

          var x1 = points[s - 1].x + (points[s].x - points[s - 1].x) * t1;
          var y1 = points[s - 1].y + (points[s].y - points[s - 1].y) * t1;
          var x2 = points[s - 1].x + (points[s].x - points[s - 1].x) * t2;
          var y2 = points[s - 1].y + (points[s].y - points[s - 1].y) * t2;

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }

        accumulated += segLength;
      }

      ctx.strokeStyle = pulse.color;
      ctx.stroke();

      // Draw pulse head
      if (endPos) {
        ctx.beginPath();
        ctx.arc(endPos.x, endPos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }

    ctx.lineWidth = config.traceWidth;
  }

  function drawNodes(colors) {
    if (config.glowEnabled) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.nodeGlow;
    }

    for (var t = 0; t < traces.length; t++) {
      var trace = traces[t];
      if (!trace.hasNode) continue;

      var points = trace.points;
      var lastPoint = points[points.length - 1];

      // Draw node at end of trace
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, config.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.node;
      ctx.fill();

      // Draw inner circle
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, config.nodeRadius - 2, 0, Math.PI * 2);
      ctx.strokeStyle = colors.nodeGlow;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  function getPositionOnTrace(points, distance) {
    var accumulated = 0;

    for (var i = 1; i < points.length; i++) {
      var segLength = Math.sqrt(
        Math.pow(points[i].x - points[i - 1].x, 2) +
        Math.pow(points[i].y - points[i - 1].y, 2)
      );

      if (accumulated + segLength >= distance) {
        var t = (distance - accumulated) / segLength;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t
        };
      }

      accumulated += segLength;
    }

    return points[points.length - 1];
  }

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function animate() {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    updatePulses();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  }

  function handleMouseLeave() {
    mouseActive = false;
  }

  function handleResize() {
    resize();
    pulses = [];
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

    // Event listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Visibility observer
    setupVisibilityObserver();

    // Initial pulses
    for (var i = 0; i < 3; i++) {
      createPulse();
    }

    // Start animation
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
