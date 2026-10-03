import * as THREE from 'three';
import { photos } from '../data/photos.js';
import { GALLERY_PATH, TIMELINE, smoothstep } from '../data/timeline.js';

const PHOTO_W = 3.6;
const PHOTO_H = 4.8;
const TEXTURE_MAX = 900;

const heartCurve = (t) => [
  16 * Math.pow(Math.sin(t), 3),
  13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
];

/** `count` points evenly spaced by arc length along the heart, none on the top cusp. */
function sampleHeart(count) {
  const steps = 720;
  const pts = [];
  const lengths = [0];
  for (let i = 0; i <= steps; i++) {
    pts.push(heartCurve((i / steps) * Math.PI * 2));
    if (i > 0) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
    }
  }
  const total = lengths[steps];
  // Keep clear of the sharp top notch; the rest is evenly spaced (symmetric around the tip).
  const notchGap = (total / count) * 0.8;
  const span = total - notchGap * 2;
  const result = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = notchGap + (k / (count - 1)) * span;
    while (lengths[j + 1] < target) j++;
    const f = (target - lengths[j]) / (lengths[j + 1] - lengths[j]);
    result.push([
      pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f,
      pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f
    ]);
  }

  // The two cards nearest the lower tip sit too close together for portrait frames.
  // Spread them along the same lower arc so their frames keep a visible gap.
  const bottomPair = result
    .filter(([, y]) => y < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);
  if (bottomPair.length === 2 && bottomPair[0][0] * bottomPair[1][0] < 0) {
    for (const point of bottomPair) point[0] = Math.sign(point[0]) * 2.6;
  }

  return result;
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * 3D photo corridor that folds into a heart.
 * - Gallery: a continuous corridor of polaroids alternating left and right.
 * - Finale: every card flies (in an outward arc, never through the camera) onto a heart outline.
 */
export class Gallery3D {
  constructor(world, onPhotoSelect, onPhotoActiveChange) {
    this.world = world;
    this.onPhotoSelect = onPhotoSelect;
    this.onPhotoActiveChange = onPhotoActiveChange;

    this.group = new THREE.Group();
    this.cards = [];
    this.interactiveMeshes = [];
    this.activePhotoIndex = -1;
    this.hoveredIndex = -1;
    this.progress = 0;
    this.isCompact = window.innerWidth <= 800 && window.innerWidth / window.innerHeight <= 1.25;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.positionScratch = new THREE.Vector3();
    this.corridorScratch = new THREE.Vector3();

    this.lastCardZ = GALLERY_PATH.firstCardZ - (photos.length - 1) * GALLERY_PATH.spacing;
    this.heartZ = this.lastCardZ - GALLERY_PATH.heartGap;

    this.buildCards();
    this.buildGlow();
    this.layout();
    this.loadTextures();

    this.world.add(this.group);
    this.world.registerUpdatable(this);
    this.setupInteractivity();
  }

  buildCards() {
    const photoGeo = new THREE.PlaneGeometry(PHOTO_W, PHOTO_H);
    // Polaroid frame: wider bottom margin.
    const frameGeo = new THREE.PlaneGeometry(PHOTO_W + 0.36, PHOTO_H + 0.9);
    frameGeo.translate(0, -0.27, 0);
    const shadowGeo = new THREE.PlaneGeometry(PHOTO_W + 1.6, PHOTO_H + 2.2);
    shadowGeo.translate(0, -0.35, 0);
    const shadowTex = this.createGlowTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)');

    photos.forEach((photo, index) => {
      const group = new THREE.Group();

      const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({
        map: shadowTex, transparent: true, depthWrite: false, toneMapped: false, fog: false
      }));
      shadow.position.z = -0.12;
      shadow.renderOrder = index * 3;

      const frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({
        color: 0xf4ece2, toneMapped: false, side: THREE.DoubleSide, transparent: true, fog: false
      }));
      frame.position.z = -0.04;
      frame.renderOrder = index * 3 + 1;

      const photoMesh = new THREE.Mesh(photoGeo, new THREE.MeshBasicMaterial({
        color: 0x2a2233, toneMapped: false, transparent: true, fog: false
      }));
      photoMesh.position.z = 0.04;
      photoMesh.renderOrder = index * 3 + 2;
      photoMesh.userData.photoIndex = index;

      group.add(shadow, frame, photoMesh);
      this.group.add(group);

      this.cards.push({
        index,
        group,
        frame,
        photoMesh,
        shadow,
        corridor: { pos: new THREE.Vector3(), rot: new THREE.Euler(), scale: 1 },
        heart: { pos: new THREE.Vector3(), rot: new THREE.Euler(), scale: 1 },
        hover: 0,
        seed: (Math.sin(index * 12.9898) * 43758.5453) % 1
      });
      this.interactiveMeshes.push(photoMesh);
    });
  }

  buildGlow() {
    this.glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: this.createGlowTexture('rgba(255,90,130,0.55)', 'rgba(255,90,130,0)'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        opacity: 0
      })
    );
    this.glow.position.set(0, 0, this.heartZ - 2);
    this.glow.scale.setScalar(34);
    this.glow.renderOrder = -2;
    this.group.add(this.glow);
  }

  createGlowTexture(inner, outer) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /** Compute corridor + heart poses for the current viewport. */
  layout() {
    const compact = this.isCompact;
    const corridorScale = compact ? 0.9 : 1;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.world.camera.fov / 2));
    const aspect = this.world.camera.aspect;
    const short = window.innerHeight < 600;
    const height = window.innerHeight;
    const caption = document.querySelector('.memory-caption-float');
    const captionHeight = caption?.offsetHeight || 210;
    const captionBottom = caption ? parseFloat(getComputedStyle(caption).bottom) || 82 : 82;
    const galleryTop = short ? 78 : 90;
    const photoArea = Math.max(90, height - galleryTop - captionBottom - captionHeight - 24);
    const heightFraction = compact ? Math.min(0.43, photoArea / height) : 0.62;
    const widthFraction = compact ? 0.65 : 0.35;
    this.focusDistance = Math.max(
      (PHOTO_H + 0.9) * corridorScale / (2 * tanHalf * heightFraction),
      (PHOTO_W + 0.36) * corridorScale / (2 * tanHalf * aspect * widthFraction)
    );
    const corridorX = compact ? 1.05 : 3.7;
    const centerY = galleryTop + photoArea / 2;
    const corridorY = this.focusDistance * tanHalf * (compact ? 1 - 2 * centerY / height : 0.04);
    this.heartScale = compact ? 0.4 : 0.56;
    const cardScale = compact ? 0.4 : 0.54;

    const count = this.cards.length;
    const heartPoints = sampleHeart(count);
    this.cards.forEach((card, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      card.side = side;
      card.corridor.pos.set(
        side * corridorX,
        corridorY + ((i % 3) - 1) * (compact ? 0.2 : 0.4),
        GALLERY_PATH.firstCardZ - i * GALLERY_PATH.spacing
      );
      card.corridor.rot.set(0, -side * (compact ? 0.12 : 0.3), side * 0.025);
      card.corridor.scale = corridorScale;

      const [hx, hy] = heartPoints[i];
      card.heart.pos.set(hx * this.heartScale, (hy + 2.5) * this.heartScale, this.heartZ);
      card.heart.rot.set(0, 0, Math.sin(i * 2.4) * 0.075);
      card.heart.scale = cardScale;
    });

    const halfW = (PHOTO_W + 0.8) * cardScale / 2;
    const halfH = (PHOTO_H + 1.2) * cardScale / 2;
    const minY = Math.min(...this.cards.map(card => card.heart.pos.y)) - halfH;
    const maxY = Math.max(...this.cards.map(card => card.heart.pos.y)) + halfH;
    this.heartSize = { w: 32 * this.heartScale + halfW * 2, h: maxY - minY, centerY: (minY + maxY) / 2 };
  }

  /** Camera position that frames the finished heart (leaves room for the buttons below). */
  getFinaleCamera(aspect) {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.world.camera.fov / 2));
    const height = window.innerHeight;
    const width = window.innerWidth;
    // Reserve real screen space for the header, letter action, and chapter bar.
    const top = height < 500 ? 66 : this.isCompact ? 90 : 100;
    const bottom = height < 500 ? 116 : this.isCompact ? 155 : 165;
    const availableHeight = Math.max(100, height - top - bottom);
    const availableWidth = Math.max(160, width - (this.isCompact ? 32 : 100));
    const fitH = this.heartSize.h * height / (2 * tanHalf * availableHeight);
    const fitW = this.heartSize.w * width / (2 * tanHalf * aspect * availableWidth);
    const distance = Math.max(fitH, fitW) * 1.04;
    const centerNdc = 1 - 2 * (top + availableHeight / 2) / height;
    const y = this.heartSize.centerY - centerNdc * distance * tanHalf;
    const textY = this.heartScale * 1.5;
    const textTop = height * (0.5 - (textY - y) / (2 * distance * tanHalf));
    const innerWidth = 11 * this.heartScale * width / (2 * distance * tanHalf * aspect);
    return { z: this.heartZ + distance, y, textTop, innerWidth };
  }

  getCorridorCameraRange() {
    return {
      start: GALLERY_PATH.firstCardZ + this.focusDistance,
      end: this.lastCardZ + this.focusDistance
    };
  }

  loadTextures() {
    // Nearest photos first so the corridor is ready immediately.
    photos.forEach((photo, index) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const ratio = Math.min(1, TEXTURE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * ratio);
        canvas.height = Math.round(img.naturalHeight * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, this.world.renderer.capabilities.getMaxAnisotropy());
        this.fitCover(texture, canvas.width / canvas.height);

        const material = this.cards[index].photoMesh.material;
        material.map = texture;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
      };
      img.onerror = (error) => console.warn(`Could not load photo ${photo.id}:`, error);
      img.src = photo.url;
    });
  }

  /** object-fit: cover for a texture on a PHOTO_W × PHOTO_H plane. */
  fitCover(texture, imageAspect) {
    const planeAspect = PHOTO_W / PHOTO_H;
    if (imageAspect > planeAspect) {
      texture.repeat.set(planeAspect / imageAspect, 1);
    } else {
      texture.repeat.set(1, imageAspect / planeAspect);
    }
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
  }

  setupInteractivity() {
    this.mouse = new THREE.Vector2(-999, -999);
    this.pointerDirty = false;

    this.onPointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      this.updateMouse(event);
      this.pointerDirty = true;
    };
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });

    this.onResize = () => {
      this.isCompact = window.innerWidth <= 800 && window.innerWidth / window.innerHeight <= 1.25;
      this.layout();
    };
    window.addEventListener('resize', this.onResize);

    this.onClick = (event) => {
      if (event.target.closest('button, a, .letter-modal-backdrop, .photo-lightbox')) return;
      this.updateMouse(event);
      const idx = this.pick();
      if (idx >= 0) this.onPhotoSelect?.(idx);
    };
    window.addEventListener('click', this.onClick);
  }

  updateMouse(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  pick() {
    if (this.progress < TIMELINE.heroEnd || document.getElementById('ui-root').inert) return -1;
    this.world.raycaster.setFromCamera(this.mouse, this.world.camera);
    const hit = this.world.raycaster.intersectObjects(this.interactiveMeshes, false)
      .find(hit => hit.object.parent.visible && hit.object.material.opacity > 0.45);
    return hit ? hit.object.userData.photoIndex : -1;
  }

  setProgress(progress) {
    this.progress = progress;
  }

  update(delta, elapsed) {
    const p = this.progress;
    const formT = smoothstep(TIMELINE.corridorEnd, TIMELINE.formEnd - 0.02, p);
    const blend = 1 - Math.exp(-Math.min(delta, 0.05) * 12);
    const count = this.cards.length;
    // Photos grow out of the dark once the hero starts to leave.
    const appear = smoothstep(0.015, 0.09, p);

    const raw = THREE.MathUtils.clamp((p - TIMELINE.heroEnd) / (TIMELINE.corridorEnd - TIMELINE.heroEnd), 0, 1) * (count - 1);
    const pos = this.positionScratch;
    for (const card of this.cards) {
      // Cards nearest the camera leave first; cards behind the camera stream past last.
      const order = (count - 1 - card.index) / (count - 1);
      const local = this.motionQuery.matches ? formT : THREE.MathUtils.clamp((formT - order * 0.45) / 0.55, 0, 1);
      const e = easeInOutCubic(local);
      const arc = this.motionQuery.matches ? 0 : Math.sin(Math.PI * e);

      // Keep the corridor in world space so photos pass naturally beside the camera.
      this.corridorScratch.copy(card.corridor.pos);
      if (formT > 0) {
        this.corridorScratch.z = Math.min(this.corridorScratch.z, this.world.camera.position.z - this.focusDistance);
      }
      pos.lerpVectors(this.corridorScratch, card.heart.pos, e);
      pos.x += card.side * arc * (this.isCompact ? 5 : 8);
      pos.y += arc * 1.2;

      card.group.position.copy(pos);
      card.group.rotation.set(
        THREE.MathUtils.lerp(card.corridor.rot.x, card.heart.rot.x, e),
        THREE.MathUtils.lerp(card.corridor.rot.y, card.heart.rot.y, e) + arc * card.side * 0.6,
        THREE.MathUtils.lerp(card.corridor.rot.z, card.heart.rot.z, e)
      );

      card.hover += ((card.index === this.hoveredIndex ? 1 : 0) - card.hover) * blend;
      const scale = THREE.MathUtils.lerp(card.corridor.scale, card.heart.scale, e) * Math.max(appear, 0.0001);
      card.group.scale.setScalar(scale);
      card.frame.material.color.setRGB(0.957, 0.925 - card.hover * 0.08, 0.886 - card.hover * 0.06);
      // Cards already passed by the camera fade back in as the heart forms.
      const formationOpacity = card.index === count - 1 ? 1 : smoothstep(0.02, 0.28, e);
      const opacity = appear * (formT > 0 ? formationOpacity : 1);
      card.photoMesh.material.opacity = opacity;
      card.frame.material.opacity = opacity;
      card.shadow.material.opacity = opacity * 0.6;
      card.group.visible = opacity > 0.002;
    }

    const glowOpacity = smoothstep(0.35, 1, formT) * 0.58;
    this.glow.material.opacity = glowOpacity;
    this.glow.visible = glowOpacity > 0.001;

    // Hover picking only when the pointer or scene actually moved.
    if (this.pointerDirty || Math.abs(this.lastPickProgress - p) > 0.0005 || this.lastPickProgress === undefined) {
      this.pointerDirty = false;
      this.lastPickProgress = p;
      const found = this.pick();
      if (found !== this.hoveredIndex) {
        this.hoveredIndex = found;
        document.body.classList.toggle('photo-hover', found >= 0);
      }
    }

    // Active photo = the card currently in focus ahead of the camera.
    const active = THREE.MathUtils.clamp(Math.round(raw), 0, count - 1);
    if (active !== this.activePhotoIndex) {
      this.activePhotoIndex = active;
      this.onPhotoActiveChange?.(active);
    }
  }

  destroy() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('click', this.onClick);
    document.body.classList.remove('photo-hover');
  }
}
