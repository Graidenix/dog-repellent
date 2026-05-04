import React from "react";
import clsx from "clsx";

interface Props {
    className?: string;
}

const CornerBolt: React.FC<Props> = (props) => {
    const { className } = props;
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
};

export default CornerBolt;
