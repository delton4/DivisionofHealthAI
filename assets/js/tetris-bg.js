/**
 * Tetris Block Assembly Animation
 * Creates falling geometric blocks that stack and assemble for Projects page
 *
 * Features:
 * - Tetris-style blocks (squares, L-shapes, T-shapes)
 * - Theme colors (teal/cyan)
 * - Gravity-shift effect: blocks float upward when cursor is nearby
 * - Continuous assembly with settling effects
 * - Reduced motion support
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
    // Block settings
    blockSize: isMobile ? 15 : 20,
    blockCount: isMobile ? 12 : 20,
    fallSpeed: 0.5,
    settleSpeed: 0.1,

    // Grid
    columns: isMobile ? 8 : 12,

    // Gravity-shift interaction
    cursorInfluence: 120,
    maxFloatDistance: 25,
    floatSpeed: 0.15,
    floatFallSpeed: 0.08,

    // Visual
    baseOpacity: 0.4
  };

  // Tetris shapes (relative coordinates)
  var SHAPES = [
    // Square
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    // L-shape
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    // J-shape
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    // T-shape
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    // S-shape
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    // Z-shape
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    // I-shape
    [[0, 0], [0, 1], [0, 2], [0, 3]]
  ];

  // ============================================
  // STATE
  // ============================================

  var canvas, ctx;
  var dimensions = { width: 0, height: 0 };
  var blocks = [];
  var settledBlocks = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var mouseActive = false;
  var animationId = null;
  var isVisible = true;
  var gridHeight;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        blocks: [
          'rgba(0, 196, 212, 0.5)',
          'rgba(0, 180, 200, 0.45)',
          'rgba(77, 212, 255, 0.5)',
          'rgba(139, 92, 246, 0.4)'
        ]
      };
    } else {
      return {
        blocks: [
          'rgba(13, 92, 110, 0.4)',
          'rgba(26, 143, 168, 0.35)',
          'rgba(0, 196, 212, 0.4)',
          'rgba(52, 211, 153, 0.35)'
        ]
      };
    }
  }

  // ============================================
  // CANVAS SETUP
  // ============================================

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'tetris-canvas';
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
    gridHeight = Math.floor(dimensions.height / config.blockSize);

    // Reset blocks on resize
    initBlocks();
  }

  // ============================================
  // BLOCK MANAGEMENT
  // ============================================

  function createBlock() {
    var colors = getColors();
    var shapeIndex = Math.floor(Math.random() * SHAPES.length);
    var shape = SHAPES[shapeIndex];
    var color = colors.blocks[Math.floor(Math.random() * colors.blocks.length)];

    // Calculate shape bounds
    var maxX = Math.max.apply(null, shape.map(function(c) { return c[0]; }));

    // Random starting column
    var startCol = Math.floor(Math.random() * (config.columns - maxX - 1));
    var x = (dimensions.width * 0.7) + (startCol * config.blockSize);

    return {
      shape: shape,
      x: x,
      y: -config.blockSize * 4,
      targetY: null,
      color: color,
      settled: false,
      settleTime: 0,
      rotation: 0,
      opacity: config.baseOpacity + Math.random() * 0.2,
      floatOffset: 0,
      targetFloatOffset: 0
    };
  }

  function initBlocks() {
    blocks = [];
    settledBlocks = [];

    // Create initial blocks at various heights
    for (var i = 0; i < config.blockCount; i++) {
      var block = createBlock();
      block.y = Math.random() * dimensions.height * 0.5 - dimensions.height * 0.3;
      blocks.push(block);
    }
  }

  // ============================================
  // PHYSICS
  // ============================================

  function findSettleY(block) {
    // Find the lowest Y this block can settle to
    var lowestY = dimensions.height - config.blockSize * 2;

    // Check against settled blocks
    settledBlocks.forEach(function(settled) {
      block.shape.forEach(function(offset) {
        var bx = block.x + offset[0] * config.blockSize;

        settled.shape.forEach(function(sOffset) {
          var sx = settled.x + sOffset[0] * config.blockSize;
          var sy = settled.y + sOffset[1] * config.blockSize;

          // If horizontally overlapping
          if (Math.abs(bx - sx) < config.blockSize) {
            var potentialY = sy - config.blockSize * (offset[1] + 1);
            if (potentialY < lowestY) {
              lowestY = potentialY;
            }
          }
        });
      });
    });

    return lowestY;
  }

  function calculateFloatOffset(block) {
    if (!mouseActive) {
      block.targetFloatOffset = 0;
      return;
    }

    // Find minimum distance from cursor to any cell of the block
    var minDist = Infinity;

    block.shape.forEach(function(offset) {
      var bx = block.x + offset[0] * config.blockSize + config.blockSize / 2;
      var by = block.y + offset[1] * config.blockSize + config.blockSize / 2;
      var dist = Math.sqrt(Math.pow(mouseX - bx, 2) + Math.pow(mouseY - by, 2));
      if (dist < minDist) minDist = dist;
    });

    // Calculate target float based on proximity
    if (minDist < config.cursorInfluence) {
      var influence = 1 - (minDist / config.cursorInfluence);
      // Ease the influence for smoother effect
      influence = influence * influence;
      block.targetFloatOffset = config.maxFloatDistance * influence;
    } else {
      block.targetFloatOffset = 0;
    }
  }

  function updateFloatOffset(block) {
    // Smoothly interpolate current float offset toward target
    var diff = block.targetFloatOffset - block.floatOffset;

    if (Math.abs(diff) < 0.1) {
      block.floatOffset = block.targetFloatOffset;
    } else if (diff > 0) {
      // Rising - use faster speed
      block.floatOffset += diff * config.floatSpeed;
    } else {
      // Falling back down - use slower speed for natural gravity feel
      block.floatOffset += diff * config.floatFallSpeed;
    }
  }

  function updateBlocks() {
    blocks.forEach(function(block, index) {
      // Calculate gravity-shift float offset
      calculateFloatOffset(block);
      updateFloatOffset(block);

      if (block.settled) {
        // Settled blocks can shift slightly
        block.settleTime++;
        if (block.settleTime > 300 && Math.random() < 0.002) {
          // Occasionally "unsettle" and fall again
          block.settled = false;
          block.targetY = null;
        }
        return;
      }

      // Calculate target settle position
      if (block.targetY === null) {
        block.targetY = findSettleY(block);
      }

      // Fall
      block.y += config.fallSpeed;

      // Check if reached target
      if (block.y >= block.targetY) {
        block.y = block.targetY;
        block.settled = true;
        block.settleTime = 0;
        settledBlocks.push(block);

        // Remove from active blocks after a while
        setTimeout(function() {
          var idx = settledBlocks.indexOf(block);
          if (idx > -1 && settledBlocks.length > config.blockCount / 2) {
            settledBlocks.splice(idx, 1);
          }
        }, 5000 + Math.random() * 5000);
      }

      // Respawn if fallen off screen
      if (block.y > dimensions.height + config.blockSize * 4) {
        blocks[index] = createBlock();
      }
    });

    // Also update float for settled blocks
    settledBlocks.forEach(function(block) {
      calculateFloatOffset(block);
      updateFloatOffset(block);
    });

    // Ensure we have enough active blocks
    var activeCount = blocks.filter(function(b) { return !b.settled; }).length;
    if (activeCount < config.blockCount / 3) {
      blocks.push(createBlock());
    }

    // Limit total blocks
    if (blocks.length > config.blockCount * 2) {
      blocks = blocks.slice(-config.blockCount);
    }
  }

  // ============================================
  // DRAWING
  // ============================================

  function draw() {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw all blocks
    blocks.concat(settledBlocks).forEach(function(block) {
      drawBlock(block);
    });
  }

  function drawBlock(block) {
    // Draw each cell of the shape with float offset applied
    block.shape.forEach(function(offset) {
      var x = block.x + offset[0] * config.blockSize;
      // Apply float offset (negative because floating UP means smaller Y)
      var y = block.y + offset[1] * config.blockSize - block.floatOffset;

      // Skip if off screen
      if (y < -config.blockSize * 2 || y > dimensions.height + config.blockSize) return;

      ctx.fillStyle = block.color;
      ctx.globalAlpha = block.opacity;

      // Draw block with slight border
      ctx.fillRect(x + 1, y + 1, config.blockSize - 2, config.blockSize - 2);

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x + 2, y + 2, config.blockSize - 6, 2);
      ctx.fillRect(x + 2, y + 2, 2, config.blockSize - 6);
    });

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

    updateBlocks();
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

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
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
