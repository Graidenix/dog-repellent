# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # dev server with HMR at http://localhost:3000
bun start        # production server (NODE_ENV=production)
bun run build    # production build → dist/ (minified, sourcemaps linked)
bun test         # run tests
```

The build script (`build.ts`) accepts CLI flags that map to `Bun.build()` options, e.g.:
```bash
bun run build.ts --outdir=out --minify --sourcemap=inline --external=react,react-dom
```

## Architecture

This is a Bun + React 19 + Tailwind CSS v4 SPA with a built-in API server.

**Request flow:**
- `src/index.ts` — `Bun.serve()` entry point. Registers explicit `/api/*` routes and catches everything else with `"/*": index` (the HTML import), making this a SPA.
- `src/index.html` — loaded by Bun as a native HTML import. It references `frontend.tsx` via `<script type="module">`, which Bun auto-transpiles and bundles.
- `src/frontend.tsx` — React entry: mounts `<App>` into `#root`.
- `src/App.tsx` — root component. Add new routes/pages here or wire in a router.
- `src/APITester.tsx` — dev utility component that lets you test `/api/*` endpoints interactively in the browser.

**Styling:** Tailwind v4 via `bun-plugin-tailwind`. Import CSS directly in TSX files (`import './index.css'`). No config file needed for v4.

**Adding API routes:** Add them in `src/index.ts` before the `"/*"` catch-all, following the existing `/api/hello` pattern.

**Production build:** `build.ts` globs all `*.html` files under `src/`, passes them as entrypoints to `Bun.build()` with `bun-plugin-tailwind`, and outputs to `dist/`.

## Bun conventions

- `Bun.serve()` — don't use `express`
- `bun:sqlite` — don't use `better-sqlite3`
- `Bun.file` — prefer over `node:fs` readFile/writeFile
- `Bun.$\`cmd\`` — instead of `execa`
- `.env` is loaded automatically — don't use `dotenv`