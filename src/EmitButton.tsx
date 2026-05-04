import React from "react";
import clsx from "clsx";

interface Props {
    active: boolean;
    onToggle: () => void;
}

const EmitButton: React.FC<Props> = (props) => {
    const { active, onToggle } = props;

    return (
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
                onClick={onToggle}
                aria-pressed={active}
                aria-label={active ? "Stop emitting ultrasonic tone" : "Start emitting ultrasonic tone"}
            >
                <div
                    className={clsx(
                        "absolute inset-2 rounded-full border transition-[border-color] duration-300",
                        active ? "border-phosphor/12" : "border-white/5",
                    )}
                    aria-hidden="true"
                />

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
    );
};

export default EmitButton;
