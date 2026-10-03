# Valentine Parallax

A single-page Valentine experience built with Three.js and GSAP.

## Requirements

- Node.js 20.19+ or 22.12+

## Run locally

```sh
npm install
npm run dev
```

## Build for production

```sh
npm run build
npm run preview
```

The app starts at `/`. Its source, photos, interactions, and styles are in `src/`.

## Viewing the memories

- Scroll or swipe continuously to fly through the photo corridor; movement eases to a stop when you release.
- Use the gallery arrows to move back and forward, or open the full photo.
- Arrow keys, Page Up/Down, and Space move through the journey; Home/End jump to the beginning/end.
- The chapter buttons jump between the introduction, gallery, promise, and final heart.
- On phones, photos sit above their captions. The final heart reserves space for the header and letter buttons.
- The experience respects the system's reduced motion preference.

## Brand assets and link previews

- `public/brand/logo.svg`: editable transparent heart and orbit logo, used in the header.
- `public/brand/logo.png`: 512 × 512 transparent logo.
- `public/brand/icon.svg`, `icon-192.png`, `icon-512.png`: browser and home-screen icons.
- `public/favicon.ico`: 16, 32, 48, and 64 pixel browser icons.
- `public/brand/apple-touch-icon.png`: 180 × 180 iOS icon.
- `public/brand/og.png`: 1200 × 630 social preview; its editable source is `og.svg`.

Before publishing, copy `.env.example` to `.env.local` and set `VITE_SITE_URL` to the actual public origin (for example, `https://your-domain.com`). Vite then writes absolute OG image URLs, the canonical URL, and `og:url` directly into the HTML so link crawlers can read them without JavaScript. The site runs locally without this setting.

The raster assets are already included and do not need regenerating for normal builds. To re-export after editing the vectors, `scripts/export-brand.mjs` uses the optional `sharp` renderer; run it in an environment with `sharp` installed, or pass the directory containing the bundled renderer as its first argument.
