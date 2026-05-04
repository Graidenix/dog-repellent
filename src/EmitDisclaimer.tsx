import React from "react";

const EmitDisclaimer: React.FC = () => (
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
);

export default EmitDisclaimer;
