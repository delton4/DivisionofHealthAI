/**
 * DNA Helix Background Animation
 * Creates animated double helix strands for the researchers page
 *
 * Features:
 * - Two intertwining DNA strands
 * - Floating nucleotide-like particles
 * - Subtle rotation and movement
 * - Mouse reactivity
 * - Theme-aware colors
 */

(function() {
  'use strict';

  // Only run on researchers pages
  var container = document.querySelector('.page-header');
  var isResearchersPage = window.location.pathname.includes('researcher');

  if (!container || !isResearchersPage) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ============================================
  // CONFIGURATION
  // ============================================

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  var config = {
    // Helix settings
    helixCount: 2,
    pointsPerHelix: isMobile ? 20 : 35,
    helixRadius: isMobile ? 30 : 50,
    helixSpacing: 150,
    rotationSpeed: 0.3,
    waveAmplitude: 20,
    waveFrequency: 0.02,

    // Nucleotide particles
    nucleotideCount: isMobile ? 15 : 30,
    nucleotideSpeed: 0.5,
    nucleotideSize: 4,

    // Connection rungs
    rungFrequency: 4,
    rungOpacity: 0.15,

    // Mouse interaction
    mouseInfluence: 100,
    mouseRepel: 0.3,

    // Visual
    glowEnabled: !isMobile,
    glowRadius: 12
  };

  // ============================================
  // STATE
  // ============================================

  var canvas, ctx;
  var dimensions = { width: 0, height: 0 };
  var time = 0;
  var helixPoints = [];
  var nucleotides = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var mouseActive = false;
  var animationId = null;
  var isVisible = true;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        strand1: 'rgba(0, 196, 212, 0.6)',
        strand2: 'rgba(139, 92, 246, 0.6)',
        strand1Glow: '#00c4d4',
        strand2Glow: '#8b5cf6',
        rung: 'rgba(0, 196, 212, 0.2)',
        nucleotideColors: ['#00c4d4', '#8b5cf6', '#34d399', '#f472b6']
      };
    } else {
      return {
        strand1: 'rgba(13, 92, 110, 0.5)',
        strand2: 'rgba(97, 46, 138, 0.5)',
        strand1Glow: '#1a8fa8',
        strand2Glow: '#612e8a',
        rung: 'rgba(13, 92, 110, 0.15)',
        nucleotideColors: ['#0d5c6e', '#612e8a', '#34d399', '#00c4d4']
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

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ============================================
  // CANVAS SETUP
  // ============================================

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'dna-canvas';
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

    initializeHelixPoints();
    initializeNucleotides();
  }

  // ============================================
  // HELIX INITIALIZATION
  // ============================================

  function initializeHelixPoints() {
    helixPoints = [];

    var centerX = dimensions.width * 0.85;
    var startY = -50;
    var endY = dimensions.height + 50;
    var segmentHeight = (endY - startY) / config.pointsPerHelix;

    for (var strand = 0; strand < config.helixCount; strand++) {
      var strandPoints = [];
      var phaseOffset = strand * Math.PI;

      for (var i = 0; i < config.pointsPerHelix; i++) {
        var y = startY + i * segmentHeight;
        var basePhase = i * 0.3 + phaseOffset;

        strandPoints.push({
          baseX: centerX,
          baseY: y,
          phase: basePhase,
          radius: config.helixRadius
        });
      }

      helixPoints.push(strandPoints);
    }
  }

  // ============================================
  // NUCLEOTIDE PARTICLES
  // ============================================

  function initializeNucleotides() {
    nucleotides = [];
    var colors = getColors();

    for (var i = 0; i < config.nucleotideCount; i++) {
      nucleotides.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * config.nucleotideSpeed,
        vy: (Math.random() - 0.5) * config.nucleotideSpeed,
        size: config.nucleotideSize * (0.5 + Math.random() * 0.5),
        color: colors.nucleotideColors[Math.floor(Math.random() * colors.nucleotideColors.length)],
        alpha: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================

  function updateNucleotides() {
    for (var i = 0; i < nucleotides.length; i++) {
      var n = nucleotides[i];

      // Apply velocity
      n.x += n.vx;
      n.y += n.vy;

      // Mouse repulsion
      if (mouseActive) {
        var dist = distance(n.x, n.y, mouseX, mouseY);
        if (dist < config.mouseInfluence && dist > 0) {
          var force = (config.mouseInfluence - dist) / config.mouseInfluence * config.mouseRepel;
          var dx = n.x - mouseX;
          var dy = n.y - mouseY;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }

      // Apply friction
      n.vx *= 0.99;
      n.vy *= 0.99;

      // Wrap around edges
      if (n.x < -20) n.x = dimensions.width + 20;
      if (n.x > dimensions.width + 20) n.x = -20;
      if (n.y < -20) n.y = dimensions.height + 20;
      if (n.y > dimensions.height + 20) n.y = -20;

      // Gentle drift
      n.vx += (Math.random() - 0.5) * 0.02;
      n.vy += (Math.random() - 0.5) * 0.02;
    }
  }

  // ============================================
  // DRAWING FUNCTIONS
  // ============================================

  function draw() {
    var colors = getColors();

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw nucleotide particles (behind helix)
    drawNucleotides(colors);

    // Draw helix
    drawHelix(colors);
  }

  function drawHelix(colors) {
    var strandColors = [colors.strand1, colors.strand2];
    var glowColors = [colors.strand1Glow, colors.strand2Glow];

    // Calculate current positions
    var positions = [];
    for (var s = 0; s < helixPoints.length; s++) {
      var strandPositions = [];
      for (var i = 0; i < helixPoints[s].length; i++) {
        var point = helixPoints[s][i];
        var phase = point.phase + time * config.rotationSpeed;
        var x = point.baseX + Math.cos(phase) * point.radius;
        var waveOffset = Math.sin(point.baseY * config.waveFrequency + time * 0.5) * config.waveAmplitude;
        x += waveOffset;

        strandPositions.push({ x: x, y: point.baseY });
      }
      positions.push(strandPositions);
    }

    // Draw connecting rungs
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.rung;

    for (var r = 0; r < positions[0].length; r += config.rungFrequency) {
      if (positions[1] && positions[1][r]) {
        var p1 = positions[0][r];
        var p2 = positions[1][r];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw base pair dots
        var midX = (p1.x + p2.x) / 2;
        var midY = (p1.y + p2.y) / 2;

        if (config.glowEnabled) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = colors.strand1Glow;
        }

        ctx.beginPath();
        ctx.arc(midX, midY, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.strand1;
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }

    // Draw strands
    for (var strand = 0; strand < positions.length; strand++) {
      var pts = positions[strand];

      if (config.glowEnabled) {
        ctx.shadowBlur = config.glowRadius;
        ctx.shadowColor = glowColors[strand];
      }

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (var j = 1; j < pts.length - 1; j++) {
        var xc = (pts[j].x + pts[j + 1].x) / 2;
        var yc = (pts[j].y + pts[j + 1].y) / 2;
        ctx.quadraticCurveTo(pts[j].x, pts[j].y, xc, yc);
      }

      ctx.strokeStyle = strandColors[strand];
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw nodes at each point
      for (var k = 0; k < pts.length; k += 2) {
        ctx.beginPath();
        ctx.arc(pts[k].x, pts[k].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strandColors[strand];
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }

  function drawNucleotides(colors) {
    for (var i = 0; i < nucleotides.length; i++) {
      var n = nucleotides[i];

      if (config.glowEnabled) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = n.color;
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = n.alpha;
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

    time += 0.016;
    updateNucleotides();
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
