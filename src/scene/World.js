import * as THREE from 'three';

/**
 * Three.js World Controller
 * Manages Scene, Camera, WebGLRenderer, Lighting, and Render Loop
 */
export class World {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07060c, 0.016);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 30);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Lighting
    this.initLights();

    // 5. Updatables collection
    this.updatables = [];

    // 6. Resize handler
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // 7. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    // 8. Clock
    this.clock = new THREE.Timer();
    this.clock.connect(document);

    // Start Loop
    this.render = this.render.bind(this);
    this.render();
  }

  initLights() {
    // Ambient soft lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Key Light (Warm Champagne)
    this.keyLight = new THREE.DirectionalLight(0xffe8d6, 1.4);
    this.keyLight.position.set(15, 20, 25);
    this.scene.add(this.keyLight);

    // Fill Light (Romantic Pink / Magenta)
    this.fillLight = new THREE.DirectionalLight(0xff4d79, 1.2);
    this.fillLight.position.set(-15, -10, 15);
    this.scene.add(this.fillLight);

    // Point Light attached near camera for specular highlights
    this.pointLight = new THREE.PointLight(0xff85a1, 1.5, 80);
    this.pointLight.position.set(0, 2, 25);
    this.scene.add(this.pointLight);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  }

  add(object) {
    this.scene.add(object);
  }

  registerUpdatable(item, { first = false } = {}) {
    if (first) this.updatables.unshift(item);
    else this.updatables.push(item);
  }

  render() {
    requestAnimationFrame(this.render);

    this.clock.update();
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsed();

    // Update all registered modules
    for (let i = 0; i < this.updatables.length; i++) {
      this.updatables[i].update(delta, elapsedTime);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.clock.dispose();
    this.renderer.dispose();
  }
}
