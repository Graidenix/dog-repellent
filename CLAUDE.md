# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # dev server with HMR at http://localhost:8107
bun run build    # production build → dist/ (type-check + Vite)
bun preview      # preview production build locally
```

## Architecture

This is a Vite + React 19 + Tailwind CSS v4 SPA deployed to Vercel. The single page is the `DogRepeller` component — a browser-based ultrasonic tone emitter.

**Project structure:**
- `index.html` — root HTML entry point (Vite standard). References `src/main.tsx` via `<script type="module">`.
- `vite.config.ts` — Vite config: `@vitejs/plugin-react`, `@tailwindcss/vite`, path alias `@/` → `src/`.
- `vercel.json` — SPA routing: rewrites all paths to `/index.html`.
- `src/main.tsx` — React entry: mounts `<App>` into `#root`.
- `src/App.tsx` — root component. Imports `index.css` and renders `<DogRepeller>`.
- `src/DogRepeller.tsx` — shell component: owns audio-engine state/refs, orchestrates subcomponents.
- `src/LcdReadout.tsx` — green LCD display: Hz digits, unit label, frequency progress bar.
- `src/WaveformDisplay.tsx` — canvas waveform section with scanline overlay.
- `src/FrequencyControl.tsx` — range slider, tick marks, and kHz labels.
- `src/EmitButton.tsx` — pulse rings + circular EMIT/STOP button.
- `src/EmitDisclaimer.tsx` — warning icon + disclaimer text.
- `src/LcdDigit.tsx` — single 7-segment LCD digit renderer.
- `src/CornerBolt.tsx` — decorative corner bolt SVG.
- `src/constants.ts` — shared numeric constants (`MIN_FREQ`, `MAX_FREQ`, `DEFAULT_FREQ`, canvas dimensions).
- `src/waveform.ts` — pure canvas draw utilities: `drawIdle()` and `renderFrame()`.
- `src/useLocalStorage.ts` — typed hook for persisting state in `localStorage`.
- `src/index.css` — Tailwind v4 import + custom CSS (keyframes, nth-child stagger delays, slider pseudo-elements, mobile breakpoint).
- `src/vite-env.d.ts` — Vite client type reference.
- `public/` — static assets served at `/`: favicons, `site.webmanifest`, `sw.js`.

**Styling:** Tailwind v4 via `@tailwindcss/vite` (registered in `vite.config.ts`). No Tailwind config file needed for v4.

**Active state pattern:** The root `<article>` carries `group` (Tailwind group marker) and `is-active` (toggled by React state). Child elements use `group-[.is-active]:` variants to switch colors, shadows, and animations without JavaScript.

**Deployment:** Vercel auto-detects Vite (build command: `vite build`, output: `dist/`). `vercel.json` rewrites all non-asset routes to `/index.html` for client-side routing.
