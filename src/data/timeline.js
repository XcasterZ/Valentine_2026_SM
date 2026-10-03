/**
 * Master scroll timeline (progress 0 → 1).
 *
 *  0.00 ─ hero ─ 0.10 ─ continuous photo corridor ─ 0.72
 *  0.72 ─ photos gather into a heart + promise text ─ 0.88
 *  0.88 ─ finale (heart of memories + actions) ─ 1.00
 */
export const TIMELINE = Object.freeze({
  heroEnd: 0.10,
  corridorEnd: 0.72,
  formEnd: 0.88,
  finalEnd: 1
});

// World-space layout of the gallery.
export const GALLERY_PATH = Object.freeze({
  heroCameraZ: 30,
  firstCardZ: -8,
  spacing: 8,
  heartGap: 30 // distance from the last card to the heart formation
});

// Opacity windows for DOM overlays: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
export const OVERLAY_WINDOWS = Object.freeze({
  hero: [-1, -1, 0.03, 0.08],
  gallery: [0.07, 0.095, 0.725, 0.745],
  promise: [0.73, 0.77, 0.84, 0.87],
  final: [0.89, 0.94, 2, 2]
});

export const CHAPTER_TARGETS = Object.freeze([0, TIMELINE.heroEnd, 0.8, 1]);

export function photoProgress(index, count) {
  return TIMELINE.heroEnd + (index / Math.max(1, count - 1)) * (TIMELINE.corridorEnd - TIMELINE.heroEnd);
}

export function clampProgress(value) {
  return Math.max(0, Math.min(TIMELINE.finalEnd, value));
}

export function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function windowAlpha([inStart, inEnd, outStart, outEnd], p) {
  const fadeIn = inEnd <= inStart ? 1 : smoothstep(inStart, inEnd, p);
  const fadeOut = 1 - smoothstep(outStart, outEnd, p);
  return Math.min(fadeIn, fadeOut);
}
