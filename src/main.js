import * as THREE from 'three';
import { World } from './scene/World.js';
import { Stardust } from './scene/Stardust.js';
import { HeartMesh } from './scene/HeartMesh.js';
import { Gallery3D } from './scene/Gallery3D.js';
import { Scroller } from './interaction/Scroller.js';
import { Cursor } from './interaction/Cursor.js';
import { AudioManager } from './audio/AudioManager.js';
import { content } from './data/content.js';
import { photos } from './data/photos.js';
import {
  GALLERY_PATH,
  TIMELINE,
  OVERLAY_WINDOWS,
  CHAPTER_TARGETS,
  photoProgress,
  clampProgress,
  smoothstep,
  windowAlpha
} from './data/timeline.js';

/**
 * Master Application Controller
 * Coordinates Three.js, virtual scroll, UI DOM, and audio on a single render loop.
 */
class App {
  constructor() {
    this.currentLang = 'th';
    this.activeChapter = 0;
    this.activePhotoIdx = 0;
    this.isLetterOpen = false;
    this.isLightboxOpen = false;
    this.lastProgressPct = -1;
    this.cameraX = 0;
    this.pointer = { x: 0, y: 0 };
    this.parallax = { x: 0, y: 0 };
    this.lastFrameTime = performance.now();
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.init();
  }

  init() {
    this.cursor = new Cursor();
    this.audio = new AudioManager({ onToggle: () => this.updateLanguageTexts() });

    const canvas = document.getElementById('webgl-canvas');
    this.world = new World(canvas);

    this.stardust = new Stardust(this.world);
    this.heartMesh = new HeartMesh(this.world);
    this.gallery3D = new Gallery3D(
      this.world,
      (photoIndex) => this.openLightbox(photoIndex),
      (activeIdx) => this.onActivePhotoChange(activeIdx)
    );

    this.scroller = new Scroller({
      photoCount: photos.length,
      onProgressUpdate: (currProgress) => this.onScrollProgress(currProgress)
    });
    // Scroll → camera runs first in the render loop, before the gallery reads the camera.
    this.world.registerUpdatable(this.scroller, { first: true });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    this.setupUI();
    this.syncComposition = () => {
      this.finale = this.gallery3D.getFinaleCamera(this.world.camera.aspect);
      const finalCenter = document.querySelector('.final-center');
      finalCenter.style.setProperty('--final-top', `${this.finale.textTop}px`);
      finalCenter.style.setProperty('--final-width', `${this.finale.innerWidth}px`);
      finalCenter.style.setProperty('--final-title-size', `${Math.min(40, this.finale.innerWidth / 7.5)}px`);
    };
    window.addEventListener('resize', this.syncComposition);
    this.syncComposition();
    this.updateLanguageTexts();
    document.fonts?.ready.then(() => {
      this.gallery3D.layout();
      this.syncComposition();
    });
  }

  setupUI() {
    this.progressFill = document.querySelector('.progress-fill');
    this.progressPct = document.querySelector('.progress-pct');
    this.progressContainer = document.querySelector('.progress-container');
    this.scrollHint = document.querySelector('.scroll-hint-wrapper');
    this.memoryCaption = document.querySelector('.memory-caption-float');

    this.overlays = [
      { el: document.getElementById('act-hero'), window: OVERLAY_WINDOWS.hero, alpha: -1 },
      { el: document.getElementById('act-gallery'), window: OVERLAY_WINDOWS.gallery, alpha: -1 },
      { el: document.getElementById('act-promise'), window: OVERLAY_WINDOWS.promise, alpha: -1 },
      { el: document.getElementById('act-final'), window: OVERLAY_WINDOWS.final, alpha: -1 }
    ];

    this.onModalKeyDown = (event) => {
      const modal = this.isLightboxOpen
        ? document.querySelector('.photo-lightbox')
        : this.isLetterOpen
          ? document.querySelector('.letter-modal-backdrop')
          : null;

      if (event.key === 'Escape' && modal) {
        event.preventDefault();
        if (this.isLightboxOpen) this.closeLightbox();
        else this.closeLetter();
        return;
      }

      if (event.key !== 'Tab' || !modal) return;
      const focusable = [...modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', this.onModalKeyDown);

    document.querySelector('.lang-toggle-btn')?.addEventListener('click', () => {
      this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
      this.updateLanguageTexts();
    });

    document.querySelectorAll('.chapter-item').forEach((item, index) => {
      item.addEventListener('click', () => this.scroller.goTo(CHAPTER_TARGETS[index], 1.35));
    });

    document.querySelector('.start-journey-btn')?.addEventListener('click', () => this.scroller.goTo(photoProgress(0, photos.length)));
    document.querySelector('.memory-prev-btn')?.addEventListener('click', () => this.scroller.advance(-1));
    document.querySelector('.memory-next-btn')?.addEventListener('click', () => this.scroller.advance(1));

    document.querySelector('.open-memory-btn')?.addEventListener('click', () => {
      this.openLightbox(this.activePhotoIdx);
    });

    document.querySelector('.open-letter-btn')?.addEventListener('click', () => this.openLetter());
    document.querySelector('.letter-close-btn')?.addEventListener('click', () => this.closeLetter());
    const letterBackdrop = document.querySelector('.letter-modal-backdrop');
    letterBackdrop?.addEventListener('click', (e) => {
      if (e.target === letterBackdrop) this.closeLetter();
    });

    document.querySelector('.restart-btn')?.addEventListener('click', () => this.scroller.goTo(0, 3.2));

    const lightbox = document.querySelector('.photo-lightbox');
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close-btn')) this.closeLightbox();
    });
  }

  /**
   * Main progress loop (runs inside the World render loop, progress 0 → 1).
   */
  onScrollProgress(progress) {
    progress = clampProgress(progress);
    const now = performance.now();
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;

    const camera = this.world.camera;
    const range = this.gallery3D.getCorridorCameraRange();
    const finale = this.finale || this.gallery3D.getFinaleCamera(camera.aspect);

    // 1. Camera dolly along Z: hero → corridor → pull back to frame the heart of photos.
    let z;
    let y = 0;
    if (progress < TIMELINE.heroEnd) {
      z = THREE.MathUtils.lerp(GALLERY_PATH.heroCameraZ, range.start, smoothstep(0, TIMELINE.heroEnd, progress));
    } else if (progress < TIMELINE.corridorEnd) {
      const t = (progress - TIMELINE.heroEnd) / (TIMELINE.corridorEnd - TIMELINE.heroEnd);
      z = THREE.MathUtils.lerp(range.start, range.end, t);
    } else {
      const t = smoothstep(TIMELINE.corridorEnd, TIMELINE.formEnd, progress);
      z = THREE.MathUtils.lerp(range.end, finale.z, t);
      y = finale.y * t;
    }

    // Drift toward the current side of the corridor, as in the original fly-through.
    const k = 1 - Math.exp(-dt * 3);
    const galleryWeight = smoothstep(0.06, 0.14, progress)
      * (1 - smoothstep(TIMELINE.corridorEnd, TIMELINE.corridorEnd + 0.06, progress));
    const activeCard = this.gallery3D.cards[this.activePhotoIdx];
    const follow = this.gallery3D.isCompact ? 0.85 : 0.3;
    const targetX = (activeCard?.corridor.pos.x || 0) * follow * galleryWeight;
    this.cameraX += (targetX - this.cameraX) * k;

    // 3. Subtle pointer parallax.
    this.parallax.x += (this.pointer.x - this.parallax.x) * k;
    this.parallax.y += (this.pointer.y - this.parallax.y) * k;

    const motion = this.motionQuery.matches ? 0 : 1 - smoothstep(0.02, 0.08, progress);
    camera.position.set(this.cameraX + this.parallax.x * 0.08 * motion, y - this.parallax.y * 0.06 * motion, z);
    camera.rotation.set(-this.parallax.y * 0.004 * motion, -this.parallax.x * 0.006 * motion, 0);

    this.heartMesh.setProgress(progress);
    this.gallery3D.setProgress(progress);

    // 4. DOM overlays: opacity scrubbed by progress instead of hard class toggles.
    for (const overlay of this.overlays) {
      const alpha = Math.round(windowAlpha(overlay.window, progress) * 1000) / 1000;
      if (alpha === overlay.alpha) continue;
      overlay.alpha = alpha;
      overlay.el.style.setProperty('--a', alpha);
      overlay.el.classList.toggle('is-visible', alpha > 0.001);
      overlay.el.classList.toggle('is-interactive', alpha > 0.6);
      overlay.el.inert = alpha <= 0.6;
    }

    // 5. HUD progress bar.
    const pct = Math.round(progress * 100);
    if (pct !== this.lastProgressPct) {
      if (this.progressFill) this.progressFill.style.transform = `scaleX(${progress})`;
      if (this.progressPct) this.progressPct.innerText = pct + '%';
      this.progressContainer?.setAttribute('aria-valuenow', String(pct));
      this.lastProgressPct = pct;
      this.scrollHint?.classList.toggle('fade-out', progress > 0.03);
    }

    // 6. Active chapter.
    const actIndex = progress < TIMELINE.heroEnd ? 0
      : progress < TIMELINE.corridorEnd + 0.01 ? 1
        : progress < TIMELINE.formEnd - 0.005 ? 2 : 3;

    if (actIndex !== this.activeChapter) {
      this.activeChapter = actIndex;
      this.updateActiveChapterUI(actIndex);
      this.audio.playChime(784);
    }
  }

  updateActiveChapterUI(actIndex) {
    document.querySelectorAll('.chapter-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === actIndex);
      if (idx === actIndex) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  onActivePhotoChange(photoIdx) {
    const changed = photoIdx !== this.activePhotoIdx;
    this.activePhotoIdx = photoIdx;
    const photo = photos[photoIdx];
    if (!photo) return;

    const caption = this.memoryCaption;
    if (caption && changed) {
      caption.classList.remove('swap');
      void caption.offsetWidth; // restart the swap animation
      caption.classList.add('swap');
    }

    const t = content[this.currentLang];
    const number = String(photoIdx + 1).padStart(2, '0');
    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.innerText = value;
    };
    setText('.memory-index', number);
    setText('.memory-num', `${t.act2.counterLabel} ${number} / ${photos.length}`);
    setText('.memory-title', photo.title[this.currentLang]);
    setText('.memory-caption', photo.caption[this.currentLang]);
    setText('.memory-position', `${number} / ${photos.length}`);
    const previous = document.querySelector('.memory-prev-btn');
    const next = document.querySelector('.memory-next-btn');
    previous.disabled = photoIdx === 0;
    previous.setAttribute('aria-label', t.act2.previous);
    next.setAttribute('aria-label', photoIdx === photos.length - 1 ? t.act2.continue : t.act2.next);
    if (this.gallery3D?.isCompact) {
      this.gallery3D.layout();
      this.syncComposition?.();
    }
  }

  openLightbox(photoIndex) {
    const photo = photos[photoIndex];
    if (!photo) return;

    this.isLightboxOpen = true;
    this.lightboxReturnFocus = document.activeElement;
    this.scroller.lock();
    document.getElementById('ui-root').inert = true;

    const lightbox = document.querySelector('.photo-lightbox');
    const img = lightbox.querySelector('.lightbox-img');
    img.src = photo.url;
    img.alt = photo.title[this.currentLang];
    lightbox.querySelector('.lightbox-title').innerText = photo.title[this.currentLang];
    lightbox.querySelector('.lightbox-desc').innerText = photo.caption[this.currentLang];

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.querySelector('.lightbox-close-btn')?.focus();
    this.audio.playChime(880);
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.scroller.unlock();
    document.getElementById('ui-root').inert = false;
    const lightbox = document.querySelector('.photo-lightbox');
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (this.lightboxReturnFocus?.isConnected) {
      this.lightboxReturnFocus.focus?.({ preventScroll: true });
    }
    this.lightboxReturnFocus = null;
  }

  openLetter() {
    this.isLetterOpen = true;
    this.letterReturnFocus = document.activeElement;
    this.scroller.lock();
    document.getElementById('ui-root').inert = true;

    const modal = document.querySelector('.letter-modal-backdrop');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.letter-close-btn')?.focus();
    this.audio.playChime(659.25);
  }

  closeLetter() {
    this.isLetterOpen = false;
    this.scroller.unlock();
    document.getElementById('ui-root').inert = false;

    const modal = document.querySelector('.letter-modal-backdrop');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (this.letterReturnFocus?.isConnected) {
      this.letterReturnFocus.focus?.({ preventScroll: true });
    }
    this.letterReturnFocus = null;
  }

  updateLanguageTexts() {
    const t = content[this.currentLang];
    document.documentElement.lang = this.currentLang;
    document.title = t.meta.siteTitle;

    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.innerText = value;
    };

    // Brand & nav
    setText('.brand-title', t.meta.couple);
    setText('.brand-subtitle', t.act1.tag);
    setText('.lang-btn-text', t.nav.langToggle);
    document.querySelector('.lang-toggle-btn')
      ?.setAttribute('aria-label', this.currentLang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย');
    setText('.sound-btn-text', this.audio.isMuted ? t.nav.soundOn : t.nav.soundOff);

    const chapterLabels = document.querySelectorAll('.chapter-label');
    t.nav.chapters.forEach((name, i) => {
      if (chapterLabels[i]) chapterLabels[i].innerText = name;
    });

    // Act 1
    setText('.act-1-badge', t.act1.tag);
    setText('.act-for-whom', t.act1.forWhom);
    setText('.couple-names', t.meta.couple);
    setText('.scroll-hint-text', t.act1.scrollHint);
    setText('.start-journey-btn', `${t.act1.startBtn} ↓`);

    // Act 2
    this.onActivePhotoChange(this.activePhotoIdx);
    setText('.open-memory-btn', t.act2.openBtn);
    document.querySelector('.memory-controls')?.setAttribute('aria-label', t.act2.controlsLabel);

    // Act 3
    setText('.romantic-quote', t.act3.quote);
    setText('.quote-author', t.act3.author);
    setText('.promise-p1', t.act3.p1);

    // Act 4
    setText('.final-eyebrow', t.act4.finalEyebrow);
    const [nameA, nameB] = t.act4.finalTitle.split(' ♥ ');
    const amp = Object.assign(document.createElement('span'), { className: 'final-amp', textContent: '♥' });
    document.querySelector('.final-title')?.replaceChildren(`${nameA} `, amp, ` ${nameB}`);
    setText('.final-subtitle', t.act4.finalSubtitle);
    setText('.open-letter-btn-text', t.act4.openLetterBtn);
    setText('.restart-btn-text', t.act4.restartBtn);

    // Letter
    setText('.letter-greeting', t.act4.letterGreeting);
    const letterBody = document.querySelector('.letter-paragraphs');
    if (letterBody) {
      letterBody.replaceChildren(...t.act4.letterBody.map((text) => Object.assign(document.createElement('p'), { textContent: text })));
    }
    setText('.letter-sign-text', t.act4.letterSign);
    setText('.letter-sender', t.act4.letterSender);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  if (import.meta.env.DEV) window.__app = app;
});
