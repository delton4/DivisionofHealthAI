/**
 * Section Divider Animations
 * Enhances section dividers with animated effects
 *
 * Features:
 * - Particle flow dividers
 * - Scroll-based parallax
 * - Dynamic SVG wave animation
 * - Theme-aware colors
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  // ============================================
  // THEME COLORS
  // ============================================

  function getColors() {
    var isTheo = document.documentElement.getAttribute('data-theme') === 'theo';

    if (isTheo) {
      return {
        primary: 'rgba(0, 196, 212, 0.6)',
        accent: 'rgba(139, 92, 246, 0.6)',
        glow: '#00c4d4'
      };
    } else {
      return {
        primary: 'rgba(13, 92, 110, 0.5)',
        accent: 'rgba(0, 196, 212, 0.5)',
        glow: '#0d5c6e'
      };
    }
  }

  // ============================================
  // PARTICLE DIVIDER
  // ============================================

  function initParticleDivider(container) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var animationId = null;
    var isVisible = true;

    var config = {
      particleCount: isMobile ? 20 : 40,
      particleSize: 2,
      speed: 1,
      connectionDistance: 80
    };

    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    container.appendChild(canvas);

    function resize() {
      var rect = container.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    }

    function initParticles(width, height) {
      particles = [];
      for (var i = 0; i < config.particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed * 0.3,
          size: config.particleSize * (0.5 + Math.random() * 0.5)
        });
      }
    }

    function update() {
      var rect = container.getBoundingClientRect();
      var width = rect.width;
      var height = rect.height;

      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });
    }

    function draw() {
      var colors = getColors();
      var rect = container.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw connections
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 0.5;

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.connectionDistance) {
            var opacity = (1 - dist / config.connectionDistance) * 0.3;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      ctx.globalAlpha = 1;
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.fill();
      });
    }

    function animate() {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      update();
      draw();
      animationId = requestAnimationFrame(animate);
    }

    // Visibility observer
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      observer.observe(container);
    }

    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  // ============================================
  // SCROLL PARALLAX FOR DIVIDERS
  // ============================================

  function initScrollParallax() {
    var dividers = document.querySelectorAll('.section-divider--wave, .section-divider--blob');

    if (dividers.length === 0 || isMobile) return;

    var ticking = false;

    function updateParallax() {
      dividers.forEach(function(divider) {
        var rect = divider.getBoundingClientRect();
        var viewportHeight = window.innerHeight;

        // Only animate when in viewport
        if (rect.top < viewportHeight && rect.bottom > 0) {
          var scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          var offset = (scrollProgress - 0.5) * 20;

          var svg = divider.querySelector('svg');
          if (svg) {
            svg.style.transform = 'translateY(' + offset + 'px)';
          }
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // DYNAMIC SVG INJECTION
  // ============================================

  function createWaveSVG() {
    return `
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.1" />
            <stop offset="50%" style="stop-color:var(--color-accent);stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:var(--color-primary);stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <path d="M0,64 C320,100 480,20 720,64 C960,108 1120,28 1440,64 L1440,120 L0,120 Z" fill="url(#wave-gradient)"/>
      </svg>
    `;
  }

  function createBlobSVG() {
    return `
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.15" />
            <stop offset="30%" style="stop-color:var(--color-accent);stop-opacity:0.2" />
            <stop offset="70%" style="stop-color:var(--color-accent);stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:var(--color-primary);stop-opacity:0.15" />
          </linearGradient>
        </defs>
        <path d="M0,80 Q180,120 360,80 T720,80 T1080,80 T1440,80 L1440,120 L0,120 Z" fill="url(#blob-gradient)"/>
      </svg>
    `;
  }

  function injectDividerSVGs() {
    // Inject SVG into wave dividers that don't have content
    document.querySelectorAll('.section-divider--wave:empty').forEach(function(divider) {
      divider.innerHTML = createWaveSVG();
    });

    document.querySelectorAll('.section-divider--blob:empty').forEach(function(divider) {
      divider.innerHTML = createBlobSVG();
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Inject SVGs where needed
    injectDividerSVGs();

    // Initialize particle dividers
    document.querySelectorAll('.section-divider--particles').forEach(initParticleDivider);

    // Initialize scroll parallax
    initScrollParallax();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
