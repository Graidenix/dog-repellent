import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import clsx from "clsx";
import { MIN_FREQ, MAX_FREQ, DEFAULT_FREQ, CW, CH } from "./constants";
import { drawIdle, renderFrame } from "./waveform";
import { LcdDigit } from "./LcdDigit";

function CornerBolt({ className }: { className?: string }) {
    return (
        <svg
            width="14" height="14" viewBox="0 0 14 14"
            aria-hidden="true"
            className={clsx("shrink-0 text-bolt", className)}
        >
            <circle cx="7" cy="7" r="6" fill="#17201c" stroke="currentColor" strokeWidth="1" />
            <circle cx="7" cy="7" r="2.2" fill="#101a14" stroke="#2a3832" strokeWidth="0.6" />
            <line x1="4.2" y1="7" x2="9.8" y2="7" stroke="#2a3832" strokeWidth="1" />
            <line x1="7" y1="4.2" x2="7" y2="9.8" stroke="#2a3832" strokeWidth="1" />
        </svg>
    );
}

export function DogRepeller() {
    const [active, setActive] = useState(false);
    const [frequency, setFrequency] = useState(DEFAULT_FREQ);

    const ctxRef      = useRef<AudioContext | null>(null);
    const oscRef      = useRef<OscillatorNode | null>(null);
    const gainRef     = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef   = useRef<HTMLCanvasElement | null>(null);
    const animRef     = useRef<number>(0);
    const phaseRef    = useRef<number>(0);
    const freqRef     = useRef<number>(frequency);

    useEffect(() => { freqRef.current = frequency; }, [frequency]);

    useEffect(() => {
        if (oscRef.current && ctxRef.current) {
            oscRef.current.frequency.setTargetAtTime(frequency, ctxRef.current.currentTime, 0.01);
        }
    }, [frequency]);

    const startDrawLoop = useCallback(() => {
        const dataArr = new Uint8Array(128);
        const frame = () => {
            const analyser = analyserRef.current;
            const canvas   = canvasRef.current;
            if (!analyser || !canvas) return;
            analyser.getByteTimeDomainData(dataArr);
            const ctx = canvas.getContext("2d")!;
            phaseRef.current = renderFrame(ctx, dataArr, phaseRef.current, freqRef.current);
            animRef.current = requestAnimationFrame(frame);
        };
        frame();
    }, []);

    useEffect(() => {
        if (canvasRef.current) drawIdle(canvasRef.current);
        return () => {
            cancelAnimationFrame(animRef.current);
            oscRef.current?.stop();
            ctxRef.current?.close();
        };
    }, []);

    const toggle = () => {
        if (active) {
            cancelAnimationFrame(animRef.current);
            const gain = gainRef.current;
            const ctx  = ctxRef.current;
            if (gain && ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.025);
            setTimeout(() => {
                oscRef.current?.stop();
                ctx?.close();
                oscRef.current      = null;
                gainRef.current     = null;
                ctxRef.current      = null;
                analyserRef.current = null;
                if (canvasRef.current) drawIdle(canvasRef.current);
            }, 130);
            setActive(false);
        } else {
            const audioCtx = new AudioContext();
            const osc      = audioCtx.createOscillator();
            const analyser = audioCtx.createAnalyser();
            const gain     = audioCtx.createGain();

            analyser.fftSize    = 256;
            osc.type            = "sine";
            osc.frequency.value = frequency;
            gain.gain.value     = 1;

            osc.connect(analyser);
            analyser.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();

            ctxRef.current      = audioCtx;
            oscRef.current      = osc;
            gainRef.current     = gain;
            analyserRef.current = analyser;

            setActive(true);
            startDrawLoop();
        }
    };

    const pct      = ((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
    const hzDigits = frequency.toString(); // "15000" – "25000", always 5 chars
    const kHz      = Math.round(frequency / 1000);

    return (
        <article className={clsx(
            "group device-shell",
            "flex flex-col overflow-hidden select-none [-webkit-tap-highlight-color:transparent]",
            "w-97.5 h-[min(844px,100dvh)]",
            "bg-[linear-gradient(168deg,#252a2e_0%,#1c2024_35%,#1e2228_65%,#242a2e_100%)]",
            "rounded-xl",
            "shadow-[0_32px_64px_rgba(0,0,0,.95),0_0_0_1px_rgba(255,255,255,.05),inset_0_1px_0_rgba(255,255,255,.07),inset_0_-2px_0_rgba(0,0,0,.6)]",
            "font-b612",
            active && "is-active",
        )}>

            {/* ── LCD Readout ──────────────────────────────────────────── */}
            <section
                className="mx-4 mt-3.5 shrink-0 relative overflow-hidden rounded-lg bg-lcd-bg"
                style={{ boxShadow: "inset 0 3px 10px rgba(0,0,0,.95), inset 0 0 0 1px rgba(0,60,0,.4), 0 1px 0 rgba(255,255,255,.04)" }}
                aria-label="Frequency readout"
            >
                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 pointer-events-none z-10 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,.07)_2px,rgba(0,0,0,.07)_3px)]"
                    aria-hidden="true"
                />

                {/* Panel label row */}
                <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1" aria-hidden="true">
                    <span className="text-xs tracking-labels text-lcd-label">FREQUENCY</span>
                    <span className="text-xs tracking-units text-lcd-label">OUTPUT</span>
                </div>

                {/* 7-segment digit display */}
                <div className="flex items-end justify-center gap-1.5 px-3.5 pt-1.5 pb-3.5" aria-hidden="true">
                    {hzDigits.split("").map((d, i) => (
                        <LcdDigit key={i} char={d} active={active} width={42} height={75} />
                    ))}
                    <span className={clsx(
                        "text-lg tracking-units pb-1.5 ml-1 font-b612",
                        "transition-colors duration-300",
                        active ? "text-lcd-active" : "text-lcd-label",
                    )}>Hz</span>
                </div>

                {/* Screen-reader frequency output */}
                <output className="sr-only" aria-live="off">{kHz} kilohertz</output>

                {/* Frequency progress bar */}
                <div className="px-3.5 pb-2.5">
                    <div
                        className="h-0.75 rounded-full overflow-hidden bg-bar-track"
                        role="presentation"
                        aria-hidden="true"
                    >
                        <div
                            className={clsx(
                                "h-full rounded-full [transition:width_0.05s_linear,background_0.3s,box-shadow_0.3s]",
                                active ? "shadow-[0_0_6px_rgba(126,245,66,.5)]" : "",
                            )}
                            style={{
                                width: `${pct}%`,
                                background: active
                                    ? "linear-gradient(90deg, var(--color-bar-on-lo), var(--color-phosphor))"
                                    : "linear-gradient(90deg, var(--color-bar-idle-lo), var(--color-bar-idle-hi))",
                            }}
                        />
                    </div>
                    <div
                        className="flex justify-between mt-1.25 text-xs text-lcd-label tracking-ticks"
                        aria-hidden="true"
                    >
                        <span>15 kHz</span>
                        <span>25 kHz</span>
                    </div>
                </div>
            </section>

            {/* ── Frequency Control — directly under the display it updates ── */}
            <section className="px-4.5 pt-4 pb-3.5 shrink-0" aria-label="Frequency adjustment">
                <label
                    htmlFor="freq-slider"
                    className="block text-xs tracking-labels text-text-hi uppercase mb-3.5"
                >
                    Frequency Control
                </label>

                <input
                    id="freq-slider"
                    type="range"
                    className="freq-slider"
                    min={MIN_FREQ}
                    max={MAX_FREQ}
                    step={1000}
                    value={frequency}
                    onChange={e => setFrequency(Number(e.target.value))}
                    style={{ "--freq-pct": `${pct}%` } as CSSProperties}
                    aria-valuetext={`${kHz} kilohertz`}
                />

                {/* Tick marks */}
                <div className="flex justify-between mt-2 px-px" aria-hidden="true">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className={clsx(
                            "w-px rounded-full",
                            i === 0 || i === 5 || i === 10
                                ? "h-1.75 bg-tick-hi"
                                : "h-1 bg-tick-lo",
                        )} />
                    ))}
                </div>

                <div
                    className="flex justify-between mt-1 text-xs text-text-lo tracking-ticks"
                    aria-hidden="true"
                >
                    <span>15</span>
                    <span>20</span>
                    <span>25 kHz</span>
                </div>
            </section>

            {/* ── Waveform — feedback panel between controls and action ── */}
            <section
                className="mx-4 shrink-0 relative overflow-hidden rounded-lg bg-wave-bg"
                style={{ boxShadow: "inset 0 3px 10px rgba(0,0,0,.9), inset 0 0 0 1px rgba(0,50,0,.4)" }}
                aria-label="Waveform visualizer"
            >
                <div
                    className="absolute inset-0 pointer-events-none z-1 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,.07)_2px,rgba(0,0,0,.07)_3px)]"
                    aria-hidden="true"
                />
                <span
                    className="absolute top-2 left-3 z-2 text-xs tracking-status text-lcd-label"
                    aria-hidden="true"
                >
                    WAVEFORM
                </span>
                <canvas
                    ref={canvasRef}
                    className="block w-full h-22.5"
                    width={CW}
                    height={CH}
                    aria-hidden="true"
                />
            </section>

            {/* ── Spacer ───────────────────────────────────────────────── */}
            <div className="flex-1 min-h-4" aria-hidden="true" />

            <hr className="border-0 h-px mx-4.5 bg-sep" />

            {/* ── Emit Footer ──────────────────────────────────────────── */}
            <footer className="px-4.5 pt-5 pb-7 flex flex-col items-center gap-3.5 shrink-0">

                {/* Pulse rings when active */}
                <div className="relative w-full flex items-center justify-center">
                    {active && (
                        <>
                            <div
                                className="absolute pointer-events-none size-28.5 rounded-full border border-led-on/20 animate-[pulse-ring_1.5s_cubic-bezier(0.15,0.5,0.5,1)_0s_infinite]"
                                aria-hidden="true"
                            />
                            <div
                                className="absolute pointer-events-none size-28.5 rounded-full border border-led-on/20 animate-[pulse-ring_1.5s_cubic-bezier(0.15,0.5,0.5,1)_0.5s_infinite]"
                                aria-hidden="true"
                            />
                            <div
                                className="absolute pointer-events-none size-28.5 rounded-full border border-led-on/20 animate-[pulse-ring_1.5s_cubic-bezier(0.15,0.5,0.5,1)_1s_infinite]"
                                aria-hidden="true"
                            />
                        </>
                    )}

                    <button
                        className={clsx(
                            "relative z-1 size-28.5 rounded-full",
                            "border-none cursor-pointer touch-manipulation",
                            "flex flex-col items-center justify-center gap-1.5",
                            "[transition:transform_0.12s_cubic-bezier(0.2,0,0.3,1),box-shadow_0.2s,background_0.2s]",
                            "active:scale-[0.96] active:translate-y-0.5",
                            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor",
                            !active && [
                                "bg-[radial-gradient(circle_at_40%_35%,#2e3638_0%,#1e2428_55%,#161c1e_100%)]",
                                "shadow-[0_8px_28px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.05),inset_0_1px_0_rgba(255,255,255,.08),inset_0_-3px_8px_rgba(0,0,0,.5)]",
                            ],
                            active && [
                                "bg-[radial-gradient(circle_at_40%_35%,#1e4a22_0%,#122e14_55%,#0a1e0c_100%)]",
                                "shadow-[0_0_40px_rgba(57,255,20,.18),0_8px_28px_rgba(0,0,0,.85),0_0_0_1px_rgba(57,255,20,.12),inset_0_1px_0_rgba(126,245,66,.08),inset_0_-3px_8px_rgba(0,0,0,.5)]",
                            ],
                        )}
                        onClick={toggle}
                        aria-pressed={active}
                        aria-label={active ? "Stop emitting ultrasonic tone" : "Start emitting ultrasonic tone"}
                    >
                        {/* Outer ring engraving */}
                        <div
                            className={clsx(
                                "absolute inset-2 rounded-full border transition-[border-color] duration-300",
                                active ? "border-phosphor/12" : "border-white/5",
                            )}
                            aria-hidden="true"
                        />

                        {/* Button LED dot */}
                        <div className={clsx(
                            "size-2.25 rounded-full border",
                            "transition-[background,box-shadow,border-color] duration-200",
                            active
                                ? "bg-led-on border-btn-led-border shadow-[0_0_8px_rgba(57,255,20,.9)]"
                                : "bg-btn-led-off border-tick-lo",
                        )} aria-hidden="true" />

                        <span className={clsx(
                            "text-2xs tracking-labels font-semibold font-b612",
                            "transition-colors duration-200",
                            active ? "text-phosphor" : "text-text-lo",
                        )}>
                            {active ? "STOP" : "EMIT"}
                        </span>
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 px-1 mt-3">
                    <svg
                        width="14" height="14" viewBox="0 0 14 14"
                        aria-hidden="true"
                        className="shrink-0 mt-px text-text-lo"
                    >
                        <path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                        <line x1="7" y1="5.5" x2="7" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="7" cy="11" r="0.7" fill="currentColor" />
                    </svg>
                    <p className="text-xs leading-normal text-text-lo font-b612">
                        Results may vary. Effectiveness is not guaranteed for all dog breeds or individual animals.
                    </p>
                </div>
            </footer>
        </article>
    );
}
