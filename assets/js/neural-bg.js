/**
 * Neural Network Background Animation
 * Creates an animated network of connected nodes for the hero section
 *
 * CONFIGURATION:
 * - nodeCount: Number of floating nodes (70 for good density)
 * - connectionDistance: Max distance for line connections (180px)
 * - glowEnabled: Toggle canvas glow effects
 *
 * CUSTOMIZATION:
 * - Colors are theme-aware (light/Theo modes)
 * - Adjust config values below to change behavior
 * - Glow colors defined in getColors() function
 */

(function() {
  'use strict';

  // Only run on homepage (where .hero exists)
  var hero = document.querySelector('.hero');
  if (!hero) return;

  // Create canvas element
  var canvas = document.createElement('canvas');
  canvas.className = 'neural-canvas';
  hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  var nodes = [];
  var mouseX = 0;
  var mouseY = 0;
  var animationId;

  // ============================================
  // CONFIGURATION - Adjust these values to customize
  // ============================================
  var config = {
    nodeCount: 70,              // Number of nodes in the network
    connectionDistance: 180,    // Max distance (px) for drawing connections
    nodeSpeed: 0.25,            // Movement speed (lower = slower, more elegant)
    nodeRadius: 3,              // Base radius of nodes
    lineWidth: 1,               // Width of connection lines
    mouseInfluence: 150,        // Distance (px) for mouse interaction
    glowEnabled: true           // Enable glow effects (set false for performance)
  };

  // ============================================
  // THEME COLORS - Updates based on light/Theo mode
  // ============================================
  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        node: 'rgba(0, 196, 212, 0.6)',           // Cyan nodes
        nodeGlow: '#00c4d4',                       // Cyan glow
        line: 'rgba(0, 196, 212, 0.12)',          // Faint cyan lines
        nodeHover: 'rgba(139, 92, 246, 0.9)',     // Purple when near mouse
        nodeHoverGlow: '#8b5cf6'                   // Purple glow
      };
    } else {
      return {
        node: 'rgba(13, 92, 110, 0.4)',           // Teal nodes
        nodeGlow: '#1a8fa8',                       // Lighter teal glow
        line: 'rgba(13, 92, 110, 0.1)',           // Faint teal lines
        nodeHover: 'rgba(52, 211, 153, 0.8)',     // Green when near mouse
        nodeHoverGlow: '#34d399'                   // Green glow
      };
    }
  }

  // ============================================
  // CANVAS SETUP
  // ============================================
  function resize() {
    var rect = hero.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // ============================================
  // NODE CREATION
  // ============================================
  function createNodes() {
    nodes = [];
    for (var i = 0; i < config.nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.nodeSpeed,
        vy: (Math.random() - 0.5) * config.nodeSpeed,
        radius: config.nodeRadius + Math.random() * 2
      });
    }
  }

  // ============================================
  // PHYSICS UPDATE
  // ============================================
  function updateNodes() {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      // Apply velocity
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      // Keep in bounds
      node.x = Math.max(0, Math.min(canvas.width, node.x));
      node.y = Math.max(0, Math.min(canvas.height, node.y));
    }
  }

  // ============================================
  // UTILITY: Calculate distance between two points
  // ============================================
  function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ============================================
  // RENDER LOOP
  // ============================================
  function draw() {
    var colors = getColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset shadow for connection lines (no glow on lines)
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw connections between nearby nodes
    ctx.lineWidth = config.lineWidth;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dist = distance(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);

        if (dist < config.connectionDistance) {
          // Opacity fades as distance increases
          var opacity = (1 - (dist / config.connectionDistance)) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(13, 92, 110, ' + opacity.toFixed(3) + ')';

          // Use theme-appropriate base color
          var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';
          if (isTheo) {
            ctx.strokeStyle = 'rgba(0, 196, 212, ' + opacity.toFixed(3) + ')';
          }

          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes with glow effect
    for (var k = 0; k < nodes.length; k++) {
      var node = nodes[k];
      var distToMouse = distance(node.x, node.y, mouseX, mouseY);
      var isNearMouse = distToMouse < config.mouseInfluence;

      // Apply glow effect
      if (config.glowEnabled) {
        ctx.shadowBlur = isNearMouse ? 20 : 10;
        ctx.shadowColor = isNearMouse ? colors.nodeHoverGlow : colors.nodeGlow;
      }

      // Draw the node (slightly larger when near mouse)
      var nodeSize = node.radius + (isNearMouse ? 2 : 0);
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = isNearMouse ? colors.nodeHover : colors.node;
      ctx.fill();

      // Draw connection line to mouse cursor when near
      if (isNearMouse) {
        var lineOpacity = (1 - (distToMouse / config.mouseInfluence)) * 0.4;

        // Reset shadow for this line
        ctx.shadowBlur = config.glowEnabled ? 8 : 0;
        ctx.shadowColor = colors.nodeHoverGlow;

        ctx.beginPath();
        ctx.strokeStyle = isNearMouse ? colors.nodeHover : colors.node;
        ctx.globalAlpha = lineOpacity;
        ctx.lineWidth = 2;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        // Reset
        ctx.globalAlpha = 1;
        ctx.lineWidth = config.lineWidth;
      }
    }

    // Reset shadow after drawing
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  // ============================================
  // ANIMATION LOOP
  // ============================================
  function animate() {
    updateNodes();
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
  }

  function handleResize() {
    resize();
    createNodes();
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    resize();
    createNodes();
    animate();

    // Track mouse movement over hero section
    hero.addEventListener('mousemove', handleMouseMove);

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Listen for theme changes (colors update automatically on next frame)
    document.addEventListener('themechange', function() {
      // Colors will update on next draw() call
    });
  }

  // Respect user's reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  init();

})();
