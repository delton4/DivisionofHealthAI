/**
 * Neural Network Background Animation
 * Creates an animated network of connected nodes for the hero section
 */

(function() {
  'use strict';

  // Only run on homepage
  var hero = document.querySelector('.hero');
  if (!hero) return;

  // Create canvas
  var canvas = document.createElement('canvas');
  canvas.className = 'neural-canvas';
  hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  var nodes = [];
  var mouseX = 0;
  var mouseY = 0;
  var animationId;

  // Configuration
  var config = {
    nodeCount: 50,
    connectionDistance: 150,
    nodeSpeed: 0.3,
    nodeRadius: 3,
    lineWidth: 1,
    mouseInfluence: 100
  };

  // Get theme colors
  function getColors() {
    var computedStyle = getComputedStyle(document.documentElement);
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    return {
      node: isTheo ? 'rgba(0, 212, 255, 0.6)' : 'rgba(11, 79, 108, 0.4)',
      line: isTheo ? 'rgba(0, 212, 255, 0.2)' : 'rgba(11, 79, 108, 0.15)',
      nodeHover: isTheo ? 'rgba(124, 58, 237, 0.8)' : 'rgba(11, 79, 108, 0.7)'
    };
  }

  // Resize canvas
  function resize() {
    var rect = hero.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Create nodes
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

  // Update node positions
  function updateNodes() {
    nodes.forEach(function(node) {
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      // Keep in bounds
      node.x = Math.max(0, Math.min(canvas.width, node.x));
      node.y = Math.max(0, Math.min(canvas.height, node.y));
    });
  }

  // Calculate distance between two points
  function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  // Draw the network
  function draw() {
    var colors = getColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = config.lineWidth;

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dist = distance(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);

        if (dist < config.connectionDistance) {
          var opacity = 1 - (dist / config.connectionDistance);
          ctx.beginPath();
          ctx.strokeStyle = colors.line.replace('0.2', (0.2 * opacity).toFixed(2)).replace('0.15', (0.15 * opacity).toFixed(2));
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(function(node) {
      var distToMouse = distance(node.x, node.y, mouseX, mouseY);
      var isNearMouse = distToMouse < config.mouseInfluence;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isNearMouse ? colors.nodeHover : colors.node;
      ctx.fill();

      // Draw connection to mouse if near
      if (isNearMouse) {
        var opacity = 1 - (distToMouse / config.mouseInfluence);
        ctx.beginPath();
        ctx.strokeStyle = colors.nodeHover.replace('0.8', (0.4 * opacity).toFixed(2)).replace('0.7', (0.4 * opacity).toFixed(2));
        ctx.lineWidth = 2;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.lineWidth = config.lineWidth;
      }
    });
  }

  // Animation loop
  function animate() {
    updateNodes();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // Handle mouse movement
  function handleMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  // Handle resize
  function handleResize() {
    resize();
    createNodes();
  }

  // Initialize
  function init() {
    resize();
    createNodes();
    animate();

    hero.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Listen for theme changes
    document.addEventListener('themechange', function() {
      // Colors will update on next draw
    });
  }

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  init();

})();
