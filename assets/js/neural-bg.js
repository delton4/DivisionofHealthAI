/**
 * Neural Network Background Animation (Enhanced)
 * Creates an animated network of connected nodes with mouse-reactive particles
 *
 * Features:
 * - Floating nodes with connection lines
 * - Mouse-reactive particles that connect to cursor
 * - Click to create particle burst effect
 * - Theme-aware colors (light/theo modes)
 * - Performance optimized with visibility observer
 * - Reduced motion support
 */

(function() {
  'use strict';

  // Only run on homepage (where .hero exists)
  var hero = document.querySelector('.hero');
  if (!hero) return;

  // Check for reduced motion preference
  if (typeof AnimationCore !== 'undefined' && AnimationCore.prefersReducedMotion) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ============================================
  // FEATURE DETECTION (fallback if AnimationCore not loaded)
  // ============================================

  var isMobile = typeof AnimationCore !== 'undefined'
    ? AnimationCore.isMobile
    : (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);

  // ============================================
  // CONFIGURATION
  // ============================================

  var config = {
    // Node settings
    nodeCount: isMobile ? 40 : 70,
    nodeSpeed: 0.3,
    nodeRadiusMin: 2,
    nodeRadiusMax: 5,

    // Connection settings
    connectionDistance: isMobile ? 120 : 180,
    connectionOpacityMax: 0.2,

    // Mouse interaction
    mouseInfluence: 180,
    mouseConnectionOpacity: 0.5,
    mouseNodeGrow: 3,

    // Glow effects
    glowEnabled: !isMobile,
    glowRadius: 15,
    glowRadiusHover: 25,

    // Particle burst on click
    burstEnabled: true,
    burstParticleCount: 8,
    burstSpeed: 3,
    burstLife: 60
  };

  // ============================================
  // STATE
  // ============================================

  var canvas = document.createElement('canvas');
  canvas.className = 'neural-canvas';
  hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  var nodes = [];
  var burstParticles = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var mouseActive = false;
  var animationId = null;
  var isVisible = true;
  var dimensions = { width: 0, height: 0 };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        node: 'rgba(0, 196, 212, 0.6)',
        nodeGlow: '#00c4d4',
        line: 'rgba(0, 196, 212, 0.12)',
        nodeHover: 'rgba(139, 92, 246, 0.9)',
        nodeHoverGlow: '#8b5cf6',
        burst: '#8b5cf6'
      };
    } else {
      return {
        node: 'rgba(13, 92, 110, 0.4)',
        nodeGlow: '#1a8fa8',
        line: 'rgba(13, 92, 110, 0.1)',
        nodeHover: 'rgba(52, 211, 153, 0.8)',
        nodeHoverGlow: '#34d399',
        burst: '#00c4d4'
      };
    }
  }

  // ============================================
  // CANVAS SETUP
  // ============================================

  function resize() {
    var rect = hero.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr);

    dimensions.width = rect.width;
    dimensions.height = rect.height;
  }

  // ============================================
  // NODE MANAGEMENT
  // ============================================

  function createNodes() {
    nodes = [];
    for (var i = 0; i < config.nodeCount; i++) {
      nodes.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * config.nodeSpeed,
        vy: (Math.random() - 0.5) * config.nodeSpeed,
        radius: randomRange(config.nodeRadiusMin, config.nodeRadiusMax),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function updateNodes() {
    var time = performance.now() / 1000;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      // Apply velocity
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges with slight randomization
      if (node.x < 0 || node.x > dimensions.width) {
        node.vx *= -1;
        node.vx += (Math.random() - 0.5) * 0.1;
      }
      if (node.y < 0 || node.y > dimensions.height) {
        node.vy *= -1;
        node.vy += (Math.random() - 0.5) * 0.1;
      }

      // Keep in bounds
      node.x = clamp(node.x, 0, dimensions.width);
      node.y = clamp(node.y, 0, dimensions.height);

      // Subtle pulsing effect
      node.pulseRadius = node.radius + Math.sin(time * 2 + node.phase) * 0.5;
    }
  }

  // ============================================
  // BURST PARTICLES
  // ============================================

  function createBurst(x, y) {
    if (!config.burstEnabled) return;

    var colors = getColors();
    for (var i = 0; i < config.burstParticleCount; i++) {
      var angle = (Math.PI * 2 / config.burstParticleCount) * i + Math.random() * 0.5;
      var speed = config.burstSpeed * (0.5 + Math.random() * 0.5);
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 2,
        life: config.burstLife,
        maxLife: config.burstLife,
        color: colors.burst
      });
    }
  }

  function updateBurstParticles() {
    for (var i = burstParticles.length - 1; i >= 0; i--) {
      var p = burstParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life--;

      if (p.life <= 0) {
        burstParticles.splice(i, 1);
      }
    }
  }

  // ============================================
  // DRAWING
  // ============================================

  function draw() {
    var colors = getColors();
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    // Clear with device pixel ratio in mind
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw connections between nearby nodes
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dist = distance(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);

        if (dist < config.connectionDistance) {
          var opacity = (1 - dist / config.connectionDistance) * config.connectionOpacityMax;

          ctx.beginPath();
          ctx.strokeStyle = isTheo
            ? 'rgba(0, 196, 212, ' + opacity.toFixed(3) + ')'
            : 'rgba(13, 92, 110, ' + opacity.toFixed(3) + ')';
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw connections to mouse
    if (mouseActive) {
      for (var m = 0; m < nodes.length; m++) {
        var node = nodes[m];
        var distToMouse = distance(node.x, node.y, mouseX, mouseY);

        if (distToMouse < config.mouseInfluence) {
          var lineOpacity = (1 - distToMouse / config.mouseInfluence) * config.mouseConnectionOpacity;

          if (config.glowEnabled) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = colors.nodeHoverGlow;
          }

          ctx.beginPath();
          ctx.strokeStyle = colors.nodeHover;
          ctx.globalAlpha = lineOpacity;
          ctx.lineWidth = 2;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw nodes
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var dToMouse = mouseActive ? distance(n.x, n.y, mouseX, mouseY) : Infinity;
      var isNearMouse = dToMouse < config.mouseInfluence;

      var size = (n.pulseRadius || n.radius) + (isNearMouse ? config.mouseNodeGrow : 0);

      if (config.glowEnabled) {
        ctx.shadowBlur = isNearMouse ? config.glowRadiusHover : config.glowRadius;
        ctx.shadowColor = isNearMouse ? colors.nodeHoverGlow : colors.nodeGlow;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fillStyle = isNearMouse ? colors.nodeHover : colors.node;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw burst particles
    for (var p = 0; p < burstParticles.length; p++) {
      var particle = burstParticles[p];
      var alpha = particle.life / particle.maxLife;

      if (config.glowEnabled) {
        ctx.shadowBlur = 10 * alpha;
        ctx.shadowColor = particle.color;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = 0;
  }

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function animate() {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    updateNodes();
    updateBurstParticles();
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

  function handleClick(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    createBurst(x, y);
  }

  function handleResize() {
    resize();
    createNodes();
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

    observer.observe(hero);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    resize();
    createNodes();

    // Event listeners
    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    hero.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // Setup visibility observer for performance
    setupVisibilityObserver();

    // Start animation
    animate();
  }

  init();

})();
