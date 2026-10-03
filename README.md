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

The active artwork was generated with the built-in `image_gen` tool. All three assets share a rose and ruby heart-ribbon emblem with champagne-gold details.

- `public/brand/logo-ai.png`: 512 × 512 transparent logo.
- `public/brand/logo-ai-header.webp`: optimized transparent header logo.
- `public/brand/icon-ai-32.png`, `icon-ai-192.png`, `icon-ai-512.png`: browser and home-screen icons.
- `public/brand/favicon-ai.ico` and `public/favicon.ico`: 16, 32, 48, and 64 pixel browser icons.
- `public/brand/apple-touch-icon-ai.png`: 180 × 180 iOS icon.
- `public/brand/og-ai.jpg`: 1200 × 630 AI-generated social preview.
- `design/brand-ai/`: original AI output images and the exact generation prompts in `generation-prompts.json`.

Before publishing, copy `.env.example` to `.env.local` and set `VITE_SITE_URL` to the actual public origin (for example, `https://your-domain.com`). Vite then writes absolute OG image URLs, the canonical URL, and `og:url` directly into the HTML so link crawlers can read them without JavaScript. The site runs locally without this setting.

The production assets are included and do not need regenerating for normal builds. `scripts/export-ai-brand.mjs` only resizes and exports the AI artwork using the optional `sharp` renderer; run it in an environment with `sharp` installed, or pass the directory containing the bundled renderer as its first argument. The earlier vector artwork is retained but is not used by the current page.
