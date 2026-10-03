import { gsap } from 'gsap';
import { TIMELINE, photoProgress } from '../data/timeline.js';

/** Continuous scroll progress, damped on the same frame clock as the camera. */
export class Scroller {
  constructor(options = {}) {
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.damping = options.damping || 4.5;
    this.sensitivity = options.sensitivity || 0.00012;
    this.onProgressUpdate = options.onProgressUpdate || (() => {});
    this.isLocked = false;
    this.navigationTween = null;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const count = options.photoCount || 16;
    this.stops = [0, ...Array.from({ length: count }, (_, i) => photoProgress(i, count)),
      (TIMELINE.corridorEnd + TIMELINE.formEnd) / 2, 1];
    this.initEvents();
  }

  initEvents() {
    this.onWheel = (event) => {
      // Keep browser zoom and native scrolling inside the letter available.
      if (this.isLocked || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = event.deltaY * unit;
      this.addDelta(gsap.utils.clamp(-0.025, 0.025, delta * this.sensitivity));
    };
    window.addEventListener('wheel', this.onWheel, { passive: false });

    this.onKeyDown = (event) => {
      if (this.isLocked || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target.closest?.('button, a, input, textarea, select, [contenteditable="true"]')) return;
      const directions = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, ' ': event.shiftKey ? -1 : 1 };
      if (event.key in directions) {
        event.preventDefault();
        this.addDelta(directions[event.key] * 0.025);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        this.goTo(event.key === 'Home' ? 0 : 1);
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    this.onTouchStart = (event) => {
      this.touchStart = !this.isLocked && event.touches.length === 1
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    this.onTouchMove = (event) => {
      if (this.isLocked || !this.touchStart || event.touches.length !== 1) return;
      const dy = this.touchStart.y - event.touches[0].clientY;
      const dx = this.touchStart.x - event.touches[0].clientX;
      if (Math.abs(dx) > Math.abs(dy)) return;
      event.preventDefault();
      this.addDelta(dy * this.sensitivity * 1.5);
      this.touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    this.onTouchEnd = () => { this.touchStart = null; };
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
  }

  advance(direction) {
    const current = this.stops.reduce((best, stop, i) =>
      Math.abs(stop - this.targetProgress) < Math.abs(this.stops[best] - this.targetProgress) ? i : best, 0);
    const next = Math.max(0, Math.min(this.stops.length - 1, current + direction));
    this.goTo(this.stops[next]);
  }

  addDelta(delta) {
    if (!Number.isFinite(delta) || Math.abs(delta) < 0.00001) return;
    if (this.navigationTween) {
      this.navigationTween.kill();
      this.navigationTween = null;
      this.targetProgress = this.currentProgress;
    }
    // Limit queued movement so a strong trackpad fling does not keep flying onward.
    const low = Math.max(0, this.currentProgress - 0.04);
    const high = Math.min(1, this.currentProgress + 0.04);
    this.targetProgress = gsap.utils.clamp(low, high, this.targetProgress + delta);
  }

  update(delta) {
    if (!this.isLocked && !this.navigationTween) {
      const blend = this.motionQuery.matches ? 1 : 1 - Math.exp(-this.damping * Math.min(Math.max(delta, 0), 0.05));
      const diff = this.targetProgress - this.currentProgress;
      this.currentProgress = Math.abs(diff) < 0.00005 ? this.targetProgress : this.currentProgress + diff * blend;
    }
    this.onProgressUpdate(this.currentProgress, this.targetProgress);
  }

  goTo(target, duration = 0.85) {
    if (this.isLocked) return;
    const clamped = Math.max(0, Math.min(1, target));
    this.navigationTween?.kill();
    this.targetProgress = clamped;
    this.navigationTween = gsap.to(this, {
      currentProgress: clamped,
      duration: this.motionQuery.matches ? 0.18 : duration,
      ease: 'power2.inOut',
      onComplete: () => { this.navigationTween = null; }
    });
  }

  lock() {
    this.isLocked = true;
    this.navigationTween?.kill();
    this.navigationTween = null;
    this.targetProgress = this.currentProgress;
    this.touchStart = null;
  }

  unlock() { this.isLocked = false; }

  destroy() {
    this.navigationTween?.kill();
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
  }
}
