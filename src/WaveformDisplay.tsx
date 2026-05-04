import React from "react";
import { CW, CH } from "./constants";

interface Props {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const WaveformDisplay: React.FC<Props> = (props) => {
    const { canvasRef } = props;

    return (
        <section
            className="mx-4 shrink-0 relative overflow-hidden rounded-lg bg-wave-bg [@media(max-height:700px)]:hidden"
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
    );
};

export default WaveformDisplay;
