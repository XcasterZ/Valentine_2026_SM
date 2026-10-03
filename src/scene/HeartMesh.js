import * as THREE from 'three';
import { TIMELINE } from '../data/timeline.js';

/**
 * 3D Crystal / Glass Heart Centerpiece
 * Appears in Act 1 with heartbeat pulse and crystal light refraction
 */
export class HeartMesh {
  constructor(world) {
    this.world = world;
    this.group = new THREE.Group();
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.init();
    this.world.add(this.group);
    this.world.registerUpdatable(this);
  }

  init() {
    // 1. Draw 2D parametric Heart Shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;

    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.35, y, x - 0.35, y + 0.35, x - 0.35, y + 0.35);
    heartShape.bezierCurveTo(x - 0.35, y + 0.55, x - 0.15, y + 0.77, x + 0.25, y + 0.95);
    heartShape.bezierCurveTo(x + 0.65, y + 0.77, x + 0.85, y + 0.55, x + 0.85, y + 0.35);
    heartShape.bezierCurveTo(x + 0.85, y + 0.35, x + 0.85, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    // 2. Extrude into 3D with bevels
    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 4,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      curveSegments: 36
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    // 3. Luxurious Rose Crystal Glass Material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff7197,
      emissive: 0xff336d,
      emissiveIntensity: 0.45,
      roughness: 0.32,
      metalness: 0.03,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.68,
      // Fading glass must not occlude the gallery in the depth buffer.
      depthWrite: false,
      fog: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    // Blend over the photo layers rather than leaving a dark cutout in them.
    this.mesh.renderOrder = 1000;
    // Scale up
    this.baseScale = 3.7;
    this.mesh.scale.set(this.baseScale, -this.baseScale, this.baseScale); // inverted Y because shape is upside down
    this.mesh.position.set(0, 0.6, -4);

    this.group.add(this.mesh);

    // Add an inner glowing core light
    this.innerLight = new THREE.PointLight(0xff6699, 2.5, 15);
    this.innerLight.position.set(0, 0.6, -4);
    this.group.add(this.innerLight);

    // Outer orbiting halo ring
    const ringGeo = new THREE.TorusGeometry(3.8, 0.03, 12, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe6c280,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      fog: false
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.renderOrder = 1001;
    this.ring.rotation.x = Math.PI / 2.3;
    this.ring.position.set(0, 0.6, -4);
    this.group.add(this.ring);
  }

  update(delta, elapsedTime) {
    if (!this.mesh) return;

    const motion = this.motionQuery.matches ? 0 : 1;
    const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.012 * motion;

    this.mesh.scale.set(
      this.baseScale * pulse,
      -this.baseScale * pulse,
      this.baseScale * pulse
    );

    // Gentle floating rotation
    this.mesh.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1 * motion;
    this.mesh.rotation.x = Math.sin(elapsedTime * 0.15) * 0.035 * motion;

    // Halo ring rotation
    if (this.ring) {
      this.ring.rotation.z = elapsedTime * 0.04 * motion;
      this.ring.rotation.y = Math.sin(elapsedTime * 0.15) * 0.08 * motion;
    }
  }

  /**
   * Called by Scroller:
   * Fade the centerpiece away as the story moves from the hero into the gallery.
   */
  setProgress(progress) {
    const fadeStart = 0.02;
    const fadeEnd = TIMELINE.heroEnd * 0.6;
    const t = Math.max(0, Math.min(1, (progress - fadeStart) / (fadeEnd - fadeStart)));
    const eased = t * t * (3 - 2 * t);
    const opacity = 0.68 * (1 - eased);

    this.mesh.material.opacity = opacity;
    this.ring.material.opacity = 0.12 * (1 - eased);
    this.group.visible = opacity > 0.005;
    this.innerLight.intensity = 2.5 * (1 - eased);
  }
}
