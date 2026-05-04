import React from "react";
import clsx from "clsx";
import { MIN_FREQ, MAX_FREQ } from "./constants";

type SliderStyle = React.CSSProperties & { "--freq-pct": string };

interface Props {
    frequency: number;
    onChange: (value: number) => void;
}

const FrequencyControl: React.FC<Props> = (props) => {
    const { frequency, onChange } = props;

    const pct         = ((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
    const kHz         = Math.round(frequency / 1000);
    const sliderStyle: SliderStyle = { "--freq-pct": `${pct}%` };

    return (
        <section className="px-4.5 shrink-0" aria-label="Frequency adjustment">
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
                onChange={(ev) => onChange(Number(ev.target.value))}
                style={sliderStyle}
                aria-valuetext={`${kHz} kilohertz`}
            />

            <div className="flex justify-between mt-2" aria-hidden="true">
                {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className={clsx(
                        "w-px rounded-full",
                        i === 0 || i === 5 || i === 10
                            ? "h-1.75 bg-tick-hi"
                            : "h-1 bg-tick-lo",
                    )} />
                ))}
            </div>

            <div className="relative mt-1 h-3.5 text-xs text-text-lo tracking-ticks" aria-hidden="true">
                <span className="absolute left-0">15</span>
                <span className="absolute left-1/2 -translate-x-1/2">20</span>
                <span className="absolute right-0">25</span>
            </div>
        </section>
    );
};

export default FrequencyControl;
