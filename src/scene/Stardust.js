import * as THREE from 'three';

/**
 * 3D Stardust & Nebula Particle System
 * A quiet layer of stars behind the memories.
 */
export class Stardust {
  constructor(world) {
    this.world = world;
    this.count = window.matchMedia('(pointer: coarse)').matches ? 1200 : 2600;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.init();
    this.world.registerUpdatable(this);
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    // Color palette: Starlight white, champagne gold, romantic rose pink
    const colorWhite = new THREE.Color(0xf8f9fa);
    const colorGold = new THREE.Color(0xe6c280);
    const colorPink = new THREE.Color(0xff758f);
    const colorMagenta = new THREE.Color(0xd81b60);

    const tempColor = new THREE.Color();

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Distribute in a cylinder/tunnel surrounding the camera's Z path (0 to -500)
      const radius = 8 + Math.random() * 65;
      const angle = Math.random() * Math.PI * 2;
      const z = 40 - Math.random() * 540;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = z;

      // Random color selection
      const rand = Math.random();
      if (rand < 0.45) {
        tempColor.copy(colorWhite);
      } else if (rand < 0.75) {
        tempColor.copy(colorPink);
      } else if (rand < 0.9) {
        tempColor.copy(colorGold);
      } else {
        tempColor.copy(colorMagenta);
      }

      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circle particle texture generated dynamically with 2D canvas
    const particleTexture = this.createParticleTexture();

    const material = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, material);
    this.world.add(this.points);
  }

  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 200, 220, 0.8)');
    gradient.addColorStop(0.55, 'rgba(255, 77, 121, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  update(delta, elapsedTime) {
    if (!this.points) return;
    // Gentle cosmic rotation
    this.points.rotation.z = this.motionQuery.matches ? 0 : elapsedTime * 0.0015;
    this.points.rotation.y = this.motionQuery.matches ? 0 : Math.sin(elapsedTime * 0.025) * 0.012;
  }
}
