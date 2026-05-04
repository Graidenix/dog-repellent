import React, { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import { DEFAULT_FREQ } from "./constants";
import { drawIdle, renderFrame } from "./waveform";
import useLocalStorage from "./useLocalStorage";
import LcdReadout from "./LcdReadout";
import WaveformDisplay from "./WaveformDisplay";
import FrequencyControl from "./FrequencyControl";
import EmitButton from "./EmitButton";
import EmitDisclaimer from "./EmitDisclaimer";

const DogRepeller: React.FC = () => {
    const [active, setActive] = useState(false);
    const [frequency, setFrequency] = useLocalStorage("dog-repeller-freq", DEFAULT_FREQ);

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
        if (!oscRef.current || !ctxRef.current) return;
        oscRef.current.frequency.setTargetAtTime(frequency, ctxRef.current.currentTime, 0.01);
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

    const stopEmitting = () => {
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
    };

    const startEmitting = () => {
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
    };

    const handleToggle = () => {
        if (active) {
            stopEmitting();
            return;
        }
        startEmitting();
    };

    const handleClearCache = async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
    };

    return (
        <article className={clsx(
            "group device-shell md:mx-auto",
            "relative flex flex-col gap-4 overflow-hidden select-none [-webkit-tap-highlight-color:transparent]",
            "w-full md:w-100 h-dvh md:max-h-200 md:my-10",
            "bg-[linear-gradient(168deg,#252a2e_0%,#1c2024_35%,#1e2228_65%,#242a2e_100%)]",
            "rounded-xl py-4",
            "shadow-[0_32px_64px_rgba(0,0,0,.95),0_0_0_1px_rgba(255,255,255,.05),inset_0_1px_0_rgba(255,255,255,.07),inset_0_-2px_0_rgba(0,0,0,.6)]",
            "font-b612",
            active && "is-active",
        )}>

            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="px-4 shrink-0 flex items-center justify-between">
                <h1 className="text-sm tracking-labels text-text-hi uppercase font-semibold">
                    Dog Repeller
                </h1>
                <span className="text-xs tracking-labels text-text-lo uppercase">Ultrasonic</span>
            </header>

            <LcdReadout frequency={frequency} active={active} />

            <WaveformDisplay canvasRef={canvasRef} />

            <FrequencyControl frequency={frequency} onChange={setFrequency} />

            {/* ── Spacer ───────────────────────────────────────────────── */}
            <div className="flex-1 min-h-4" aria-hidden="true" />

            {/* ── Emit Footer ──────────────────────────────────────────── */}
            <footer className="px-4.5 pt-5 pb-7 flex flex-col items-center gap-6 shrink-0">
                <EmitButton active={active} onToggle={handleToggle} />
                <hr className="border-0 h-px w-full bg-sep" />
                <EmitDisclaimer />
            </footer>

            <button
                className="absolute bottom-6 right-8 text-[10px] text-text-lo/50 font-b612 tracking-ticks cursor-pointer hover:text-text-lo transition-colors duration-150"
                onClick={handleClearCache}
                aria-label="Clear cache"
                title="Click to clear cache"
            >
                v{__APP_VERSION__}
            </button>
        </article>
    );
};

export default DogRepeller;
