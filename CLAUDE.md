# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # dev server with HMR at http://localhost:8107
bun start        # production server (NODE_ENV=production)
bun run build    # production build → dist/ (minified, sourcemaps linked)
```

The build script (`build.ts`) accepts CLI flags that map to `Bun.build()` options, e.g.:
```bash
bun run build.ts --outdir=out --minify --sourcemap=inline --external=react,react-dom
```

## Architecture

This is a Bun + React 19 + Tailwind CSS v4 SPA. The single page is the `DogRepeller` component — a browser-based ultrasonic tone emitter.

**Request flow:**
- `src/index.ts` — `Bun.serve()` entry point. Registers `/api/*` routes and catches everything else with `"/*": index` (the HTML import), making this a SPA.
- `src/index.html` — loaded by Bun as a native HTML import. References `frontend.tsx` via `<script type="module">`, which Bun auto-transpiles and bundles.
- `src/frontend.tsx` — React entry: mounts `<App>` into `#root`.
- `src/App.tsx` — root component. Imports `index.css` and renders `<DogRepeller>`.
- `src/DogRepeller.tsx` — the main UI component. Uses Tailwind utility classes with `clsx`, semantic HTML, and the `group` + `is-active` pattern for active-state styles.
- `src/constants.ts` — shared numeric constants (`MIN_FREQ`, `MAX_FREQ`, `DEFAULT_FREQ`, canvas dimensions).
- `src/waveform.ts` — pure canvas draw utilities: `drawIdle()` and `renderFrame()`.

**Styling:** Tailwind v4 via `bun-plugin-tailwind` (registered in `bunfig.toml`). `src/index.css` holds the Tailwind import plus non-Tailwind-able CSS: keyframe animations, `nth-child` stagger delays, slider pseudo-element styles, and the `max-width: 479px` mobile breakpoint. No Tailwind config file needed for v4.

**Active state pattern:** The root `<article>` carries `group` (Tailwind group marker) and `is-active` (toggled by React state). Child elements use `group-[.is-active]:` variants to switch colors, shadows, and animations without JavaScript.

**Adding API routes:** Add them in `src/index.ts` before the `"/*"` catch-all, following the existing `/api/hello` pattern.

**Production build:** `build.ts` globs all `*.html` files under `src/`, passes them as entrypoints to `Bun.build()` with `bun-plugin-tailwind`, and outputs to `dist/`.

## Bun conventions

- `Bun.serve()` — don't use `express`
- `bun:sqlite` — don't use `better-sqlite3`
- `Bun.file` — prefer over `node:fs` readFile/writeFile
- `Bun.$\`cmd\`` — instead of `execa`
- `.env` is loaded automatically — don't use `dotenv`
