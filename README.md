# Dog Repeller

A browser-based ultrasonic tone emitter built with Bun, React 19, and Tailwind CSS v4. Generates sine waves between 15–25 kHz using the Web Audio API and visualises the waveform in real time via a Canvas analyser.

## Stack

- **Runtime / bundler:** [Bun](https://bun.sh) v1.3+
- **UI:** React 19 + [clsx](https://github.com/lukeed/clsx)
- **Styling:** Tailwind CSS v4 via [bun-plugin-tailwind](https://github.com/nicholasgasior/bun-plugin-tailwind)
- **Audio:** Web Audio API (OscillatorNode → AnalyserNode → GainNode)

## Getting started

```bash
bun install
bun dev        # http://localhost:8107
```

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Dev server with HMR |
| `bun start` | Production server |
| `bun run build` | Production build → `dist/` |

## Project structure

```
src/
├── index.ts          # Bun.serve() entry — API routes + SPA catch-all
├── index.html        # HTML entrypoint
├── index.css         # Tailwind import + keyframes + slider styles
├── frontend.tsx      # React root (mounts <App>)
├── App.tsx           # Imports CSS, renders <DogRepeller>
├── DogRepeller.tsx   # Main component — UI + Web Audio logic
├── constants.ts      # Frequency bounds + canvas dimensions
└── waveform.ts       # Pure canvas draw utilities
```

## License

[MIT](./LICENSE) © 2026 Grigore Odajiu
