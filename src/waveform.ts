import { CW, CH, MIN_FREQ, MAX_FREQ } from "./constants";

export function drawIdle(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CW, CH);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(90, 50, 0, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 0;
  ctx.moveTo(0, CH / 2);
  ctx.lineTo(CW, CH / 2);
  ctx.stroke();
}

// Draws one animation frame onto ctx. Returns the updated phase value.
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  dataArr: Uint8Array,
  phase: number,
  freq: number,
): number {
  let sum = 0;
  for (let i = 0; i < dataArr.length; i++) {
    const v = (dataArr[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / dataArr.length);
  const amp = rms * (CH / 2) * 0.82;

  const nextPhase = phase + 0.1;
  const freqPct = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
  const cycles = 2 + freqPct * 3; // 2 cycles at 15 kHz → 5 at 25 kHz

  ctx.clearRect(0, 0, CW, CH);

  // Wide glow pass
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,140,0,0.18)";
  ctx.lineWidth = 10;
  ctx.shadowBlur = 0;
  for (let x = 0; x <= CW; x += 2) {
    const y = Math.sin((x / CW) * cycles * 2 * Math.PI + nextPhase) * amp + CH / 2;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Inner glow
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,170,0,0.4)";
  ctx.lineWidth = 4;
  for (let x = 0; x <= CW; x += 2) {
    const y = Math.sin((x / CW) * cycles * 2 * Math.PI + nextPhase) * amp + CH / 2;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Sharp main line
  ctx.beginPath();
  ctx.strokeStyle = "#ffaa00";
  ctx.lineWidth = 1.8;
  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = 8;
  for (let x = 0; x <= CW; x++) {
    const y = Math.sin((x / CW) * cycles * 2 * Math.PI + nextPhase) * amp + CH / 2;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  return nextPhase;
}
