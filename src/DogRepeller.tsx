import {useState, useRef, useEffect, useCallback, type CSSProperties} from "react";
import clsx from "clsx";
import {MIN_FREQ, MAX_FREQ, DEFAULT_FREQ, CW, CH} from "./constants";
import {drawIdle, renderFrame} from "./waveform";

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

    const pct = ((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
    const kHz = Math.round(frequency / 1000).toString();

    return (
        <article className={clsx(
            // "group" enables group-[.is-active]: child variants
            // "device-shell" is the CSS media-query target for mobile
            "group device-shell",
            "flex flex-col overflow-hidden select-none [-webkit-tap-highlight-color:transparent]",
            "w-[390px] h-[min(844px,100dvh)]",
            "bg-[linear-gradient(155deg,#2e2e30_0%,#1c1c1e_45%,#242426_100%)]",
            "rounded-[28px]",
            "shadow-[0_40px_80px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.07),inset_0_1px_0_rgba(255,255,255,.12),inset_0_-1px_0_rgba(0,0,0,.5)]",
            "font-device",
            active && "is-active",
        )}>

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="px-[22px] pt-[18px] pb-[14px] border-b border-white/[0.04] flex items-center justify-between shrink-0">

                <div className="flex gap-[5px]" role="presentation" aria-hidden="true">
                    {Array.from({length: 9}).map((_, i) => (
                        <div key={i} className={clsx(
                            "grille-dot w-[4px] h-[4px] rounded-full",
                            "bg-[#3a3a3a] transition-[background,box-shadow] duration-300",
                            "group-[.is-active]:bg-[#e07000] group-[.is-active]:shadow-[0_0_5px_#e07000]",
                            "group-[.is-active]:animate-[dot-wave_1.1s_ease-in-out_infinite]",
                        )}/>
                    ))}
                </div>

                <span className="text-[8px] tracking-[3px] text-[#666]">ULTRAPEL-7</span>

                <div
                    className={clsx(
                        "w-[7px] h-[7px] rounded-full border",
                        "bg-[#2a2a2a] border-[#333]",
                        "transition-[background,box-shadow,border-color] duration-300",
                        "group-[.is-active]:bg-[#ff4400] group-[.is-active]:border-[#ff4400]",
                        "group-[.is-active]:shadow-[0_0_9px_#ff4400,0_0_3px_#ff4400]",
                        "group-[.is-active]:animate-[led-blink_0.9s_ease-in-out_infinite]",
                    )}
                    aria-hidden="true"
                />
            </header>

            {/* ── LCD readout ─────────────────────────────────────────── */}
            <section
                className="mx-[22px] mt-[16px] shrink-0 relative overflow-hidden rounded-[10px] px-[18px] py-[14px] bg-[#0b0f0b] border border-[#111] shadow-[inset_0_3px_10px_rgba(0,0,0,.9),inset_0_0_0_1px_rgba(0,0,0,.5)]"
                aria-label="Frequency readout"
            >
                <div
                    className="absolute inset-0 pointer-events-none [background:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,.08)_3px,rgba(0,0,0,.08)_4px)]"
                    aria-hidden="true"
                />

                <div className={clsx(
                    "text-[8px] tracking-[2.5px] mb-[6px] transition-colors duration-300",
                    "text-[#6a5c28] group-[.is-active]:text-[#9a5800]",
                )}>FREQ OUTPUT</div>

                <div className="flex items-baseline gap-[6px]">
                    <output className={clsx(
                        "font-doto text-[60px] font-normal leading-none tracking-[2px]",
                        "transition-[color,text-shadow] duration-300",
                        "text-[#9a6800]",
                        "group-[.is-active]:text-[#ffaa00]",
                        "group-[.is-active]:[text-shadow:0_0_28px_rgba(255,170,0,.5),0_0_10px_rgba(255,170,0,.3)]",
                    )}>{kHz}</output>
                    <span className={clsx(
                        "font-doto text-[17px] tracking-[2px] mb-[8px]",
                        "transition-colors duration-300",
                        "text-[#7a6230] group-[.is-active]:text-[#a86800]",
                    )}>kHz</span>
                </div>

                <div className="mt-[10px] h-[3px] bg-[#111] rounded-[2px] overflow-hidden" role="presentation" aria-hidden="true">
                    <div
                        className={clsx(
                            "h-full [transition:width_0.05s,background_0.3s,box-shadow_0.3s]",
                            "[background:linear-gradient(90deg,#3a2200,#5a3500)]",
                            "group-[.is-active]:[background:linear-gradient(90deg,#c05000,#ffaa00)]",
                            "group-[.is-active]:shadow-[0_0_8px_rgba(255,170,0,.5)]",
                        )}
                        style={{width: `${pct}%`}}
                    />
                </div>
                <div className="flex justify-between mt-[5px] text-[8px] text-[#5a5830] tracking-[1px]" aria-hidden="true">
                    <span>15 kHz</span><span>25 kHz</span>
                </div>
            </section>

            {/* ── Waveform ────────────────────────────────────────────── */}
            <section
                className="mx-[22px] mt-[10px] shrink-0 relative overflow-hidden rounded-[10px] bg-[#0b0f0b] border border-[#111]"
                aria-label="Waveform visualizer"
            >
                <div
                    className="absolute inset-0 pointer-events-none z-[1] [background:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,.07)_3px,rgba(0,0,0,.07)_4px)]"
                    aria-hidden="true"
                />
                <span className="absolute top-[7px] left-[10px] z-[2] text-[7px] tracking-[2.5px] text-[#504820]" aria-hidden="true">
                    WAVEFORM
                </span>
                <canvas ref={canvasRef} className="block w-full h-[90px]" width={CW} height={CH}/>
            </section>

            <div className="flex-1 min-h-3" aria-hidden="true"/>

            {/* ── Tone control ────────────────────────────────────────── */}
            <section className="px-[22px] pb-[18px] shrink-0" aria-label="Frequency adjustment">
                <label
                    className="flex justify-between items-center mb-[16px] text-[9px] tracking-[3px] text-[#777] uppercase cursor-default"
                    htmlFor="freq-slider"
                >
                    <span>Tone</span>
                    <span>Adjust</span>
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
                    style={{"--freq-pct": `${pct}%`} as CSSProperties}
                    aria-valuetext={`${kHz} kHz`}
                />
                <div className="flex justify-between mt-[10px] text-[8px] text-[#555] tracking-[1px]" aria-hidden="true">
                    <span>ULTRASONIC</span><span>HIGH BAND</span>
                </div>
            </section>

            <hr className="h-px border-0 bg-white/[0.03] mx-[22px]"/>

            {/* ── Emit button ─────────────────────────────────────────── */}
            <footer className="px-[22px] pt-[24px] pb-[30px] flex flex-col items-center gap-[16px] shrink-0">

                <div className="relative flex items-center justify-center">
                    {active && (
                        <>
                            <div className="absolute w-[118px] h-[118px] rounded-full border-[1.5px] border-[rgba(255,80,0,.32)] pointer-events-none animate-[pulse-ring_1.4s_cubic-bezier(0.15,0.5,0.5,1)_0s_infinite]"    aria-hidden="true"/>
                            <div className="absolute w-[118px] h-[118px] rounded-full border-[1.5px] border-[rgba(255,80,0,.32)] pointer-events-none animate-[pulse-ring_1.4s_cubic-bezier(0.15,0.5,0.5,1)_0.45s_infinite]" aria-hidden="true"/>
                            <div className="absolute w-[118px] h-[118px] rounded-full border-[1.5px] border-[rgba(255,80,0,.32)] pointer-events-none animate-[pulse-ring_1.4s_cubic-bezier(0.15,0.5,0.5,1)_0.9s_infinite]"  aria-hidden="true"/>
                        </>
                    )}

                    <button
                        className={clsx(
                            "relative z-[1] w-[118px] h-[118px] rounded-full",
                            "border-none outline-none cursor-pointer [touch-action:manipulation]",
                            "flex items-center justify-center",
                            "[transition:transform_0.12s_cubic-bezier(0.2,0,0.3,1),box-shadow_0.2s]",
                            "active:translate-y-[3px] active:scale-95",
                            // idle appearance
                            "bg-[radial-gradient(circle_at_38%_32%,#3c3c40_0%,#252528_55%,#18181a_100%)]",
                            "shadow-[0_8px_30px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.04),inset_0_1px_0_rgba(255,255,255,.1),inset_0_-2px_6px_rgba(0,0,0,.4)]",
                            // active appearance
                            "group-[.is-active]:bg-[radial-gradient(circle_at_38%_32%,#ff8c3a_0%,#cc3300_55%,#8a1000_100%)]",
                            "group-[.is-active]:shadow-[0_0_42px_rgba(255,60,0,.6),0_0_14px_rgba(255,60,0,.3),0_8px_30px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,150,80,.25),inset_0_-2px_6px_rgba(0,0,0,.4)]",
                        )}
                        onClick={toggle}
                        aria-pressed={active}
                        aria-label={active ? "Stop emitting ultrasonic tone" : "Start emitting ultrasonic tone"}
                    >
                        <div
                            className={clsx(
                                "absolute inset-[9px] rounded-full border",
                                "border-white/[0.06] group-[.is-active]:border-[rgba(255,150,80,.2)]",
                            )}
                            aria-hidden="true"
                        />
                        <span className={clsx(
                            "relative text-[11px] tracking-[3px] uppercase",
                            "transition-colors duration-200",
                            "text-white/50 group-[.is-active]:text-white/[0.95]",
                        )}>
                            {active ? "STOP" : "START"}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-[8px]" role="status" aria-live="polite">
                    <div
                        className={clsx(
                            "w-[5px] h-[5px] rounded-full",
                            "bg-[#252525] transition-[background,box-shadow] duration-300",
                            "group-[.is-active]:bg-[#ff4400] group-[.is-active]:shadow-[0_0_8px_#ff4400]",
                            "group-[.is-active]:animate-[led-blink_0.9s_ease-in-out_infinite]",
                        )}
                        aria-hidden="true"
                    />
                    <span className={clsx(
                        "text-[9px] tracking-[3px] transition-colors duration-300",
                        "text-[#555] group-[.is-active]:text-[#888]",
                    )}>
                        {active ? "EMITTING" : "STANDBY"}
                    </span>
                </div>

            </footer>
        </article>
    );
}
