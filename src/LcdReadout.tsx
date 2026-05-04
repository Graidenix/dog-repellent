import React from "react";
import clsx from "clsx";
import { MIN_FREQ, MAX_FREQ } from "./constants";
import { LcdDigit } from "./LcdDigit";

interface Props {
    frequency: number;
    active: boolean;
}

const LcdReadout: React.FC<Props> = (props) => {
    const { frequency, active } = props;

    const pct      = ((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
    const hzDigits = frequency.toString();
    const kHz      = Math.round(frequency / 1000);

    return (
        <section
            className="mx-4 shrink-0 relative overflow-hidden rounded-lg bg-lcd-bg"
            style={{ boxShadow: "inset 0 3px 10px rgba(0,0,0,.95), inset 0 0 0 1px rgba(0,60,0,.4), 0 1px 0 rgba(255,255,255,.04)" }}
            aria-label="Frequency readout"
        >
            <div
                className="absolute inset-0 pointer-events-none z-10 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,.07)_2px,rgba(0,0,0,.07)_3px)]"
                aria-hidden="true"
            />

            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1" aria-hidden="true">
                <span className="text-xs tracking-labels text-lcd-label">FREQUENCY</span>
                <span className="text-xs tracking-units text-lcd-label">OUTPUT</span>
            </div>

            <div className="flex items-end justify-center gap-1.5 px-3.5 pt-1.5 pb-3.5" aria-hidden="true">
                {hzDigits.split("").map((digit, i) => (
                    <LcdDigit key={i} char={digit} active={active} width={42} height={75} />
                ))}
                <span className={clsx(
                    "text-lg tracking-units pb-1.5 ml-1 font-b612",
                    "transition-colors duration-300",
                    active ? "text-lcd-active" : "text-lcd-label",
                )}>Hz</span>
            </div>

            <output className="sr-only" aria-live="off">{kHz} kilohertz</output>

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
    );
};

export default LcdReadout;
