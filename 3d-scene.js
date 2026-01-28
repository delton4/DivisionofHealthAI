(() => {
  const container = document.getElementById("three-container");
  if (!container) return;

  const canUseWebGL = () => {
    try {
      const canvas = document.createElement("canvas");
      return !!window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (err) {
      return false;
    }
  };

  if (!canUseWebGL() || !window.THREE) {
    document.body.classList.add("no-webgl");
    return;
  }

  document.body.classList.add("webgl-ready");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.6, 1);
  const wireframe = new THREE.MeshBasicMaterial({
    color: 0x00ffe5,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const brain = new THREE.Mesh(geometry, wireframe);
  scene.add(brain);

  const glowGeometry = new THREE.SphereGeometry(1.65, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xb94fff,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glow);

  const pointsGeometry = new THREE.BufferGeometry();
  const pointsCount = 240;
  const positions = new Float32Array(pointsCount * 3);
  for (let i = 0; i < pointsCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.2 + Math.random() * 0.4;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x00ff94,
    size: 0.04,
    transparent: true,
    opacity: 0.8,
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);

  const light = new THREE.PointLight(0x00ffe5, 1.2, 10);
  light.position.set(4, 4, 6);
  scene.add(light);

  const mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    brain.rotation.y = scrollY * 0.001;
    brain.rotation.x = scrollY * 0.0006;
  });

  const resize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener("resize", resize);

  const animate = () => {
    brain.rotation.y += 0.002;
    brain.rotation.x += 0.0015;
    glow.rotation.y -= 0.001;
    points.rotation.y += 0.001;

    brain.rotation.y += mouse.x * 0.002;
    brain.rotation.x += mouse.y * 0.002;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  if (prefersReduced) {
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
