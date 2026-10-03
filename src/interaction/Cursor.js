/**
 * Interactive Glowing Cursor & Mouse Parallax Tracker
 */
export class Cursor {
  constructor() {
    this.dot = document.querySelector('.custom-cursor-dot');
    this.ring = document.querySelector('.custom-cursor-ring');

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (!this.dot || !this.ring) return;

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      document.body.classList.add('cursor-ready');

      // Position the center dot immediately
      this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
      this.ring.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
    });

    // Interactive element hover handlers
    const interactiveElements = 'button, a, .envelope-card, .chapter-item, .clickable';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements) && !e.relatedTarget?.closest?.(interactiveElements)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }
}
