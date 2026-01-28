(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    document.body.classList.add("reduce-effects");
  }

  // Custom cursor
  const cursor = document.getElementById("cursor");
  const dot = cursor?.querySelector(".cursor-dot");
  const ring = cursor?.querySelector(".cursor-ring");
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (coarsePointer && cursor) {
    cursor.style.display = "none";
  }

  if (cursor && dot && ring && !prefersReduced && !coarsePointer) {
    window.addEventListener("mousemove", (event) => {
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    });

    document.querySelectorAll("a, button, .research-card").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.style.setProperty("--cursor-scale", "1.4");
      });
      el.addEventListener("mouseleave", () => {
        cursor.style.setProperty("--cursor-scale", "1");
      });
    });
  }

  // Magnetic nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("mousemove", (event) => {
      const rect = link.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const offsetY = (event.clientY - rect.top - rect.height / 2) / rect.height;
      link.style.transform = `translate(${offsetX * 6}px, ${offsetY * 6}px)`;
    });
    link.addEventListener("mouseleave", () => {
      link.style.transform = "translate(0px, 0px)";
    });
  });

  // Nav blur based on scroll velocity
  const nav = document.querySelector(".nav");
  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  window.addEventListener("scroll", () => {
    if (!nav) return;
    const now = performance.now();
    const delta = Math.abs(window.scrollY - lastScrollY);
    const speed = delta / Math.max(now - lastTime, 1);
    nav.classList.toggle("nav--fast", speed > 0.5);
    lastScrollY = window.scrollY;
    lastTime = now;
  });

  // Active nav based on scroll
  const sections = Array.from(document.querySelectorAll("main section"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const miniDots = Array.from(document.querySelectorAll(".mini-dot"));

  const activateSection = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === id);
    });
    miniDots.forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.target === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateSection(entry.target.id);
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));

  miniDots.forEach((dot) => {
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");
    dot.addEventListener("click", () => {
      const target = document.getElementById(dot.dataset.target || "");
      target?.scrollIntoView({ behavior: "smooth" });
    });
    dot.addEventListener("keypress", (event) => {
      if (event.key === "Enter") dot.click();
    });
  });

  // Typed text effect
  const typedEl = document.getElementById("typed-text");
  if (typedEl) {
    const words = typedEl.dataset.words?.split(",") || [];
    let index = 0;
    let char = 0;
    let deleting = false;

    const tick = () => {
      const word = words[index % words.length] || "";
      if (!deleting) {
        char += 1;
        typedEl.textContent = word.slice(0, char);
        if (char >= word.length) {
          deleting = true;
          setTimeout(tick, 1200);
          return;
        }
      } else {
        char -= 1;
        typedEl.textContent = word.slice(0, char);
        if (char <= 0) {
          deleting = false;
          index += 1;
        }
      }
      setTimeout(tick, deleting ? 40 : 90);
    };
    tick();
  }

  // Particle background
  const canvas = document.getElementById("particle-canvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    const particles = [];
    const count = window.innerWidth < 700 ? 40 : 120;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 255, 229, 0.6)";
      ctx.strokeStyle = "rgba(0, 255, 229, 0.1)";
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.globalAlpha = 1 - dist / 120;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  // Sparkline charts
  document.querySelectorAll(".sparkline").forEach((el) => {
    const data = el.dataset.spark?.split(",").map(Number) || [];
    const canvasEl = document.createElement("canvas");
    canvasEl.width = el.clientWidth || 120;
    canvasEl.height = 40;
    el.appendChild(canvasEl);
    const ctx = canvasEl.getContext("2d");
    const max = Math.max(...data);
    const min = Math.min(...data);
    ctx.strokeStyle = "rgba(0, 255, 229, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((value, idx) => {
      const x = (idx / (data.length - 1)) * canvasEl.width;
      const y = canvasEl.height - ((value - min) / (max - min || 1)) * canvasEl.height;
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  });

  // Research card tilt
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * 10;
      const rotateY = ((x / rect.width) - 0.5) * -10;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    });
  });

  // Count up metrics
  const impactObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const value = entry.target;
          const target = parseFloat(value.dataset.count);
          const suffix = value.dataset.suffix || "";
          const prefix = value.dataset.prefix || "";
          const duration = 1400;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const current = Math.floor(progress * target).toLocaleString();
            value.textContent = `${prefix}${current}${suffix}`;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          impactObserver.unobserve(value);
        }
      });
    },
    { threshold: 0.6 }
  );

  document.querySelectorAll(".impact-value").forEach((el) => impactObserver.observe(el));

  // Simple sound design toggle
  const soundToggle = document.getElementById("sound-toggle");
  let audioEnabled = false;
  let audioContext;
  const playTone = () => {
    if (!audioEnabled) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.value = 480;
    osc.type = "sine";
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.08);
  };

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      soundToggle.setAttribute("aria-pressed", String(audioEnabled));
      soundToggle.textContent = `Sound: ${audioEnabled ? "On" : "Off"}`;
    });
  }

  document.querySelectorAll("button, a").forEach((el) => {
    el.addEventListener("mouseenter", playTone);
  });

  // GSAP ScrollTrigger if available
  if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray(".section").forEach((section) => {
      window.gsap.from(section, {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      });
    });
  }
})();
