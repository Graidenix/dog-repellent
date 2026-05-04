import clsx from "clsx";

interface LcdDigitProps {
    char: string;
    active: boolean;
    width?: number;
    height?: number;
    className?: string;
}

type Seg = "a" | "b" | "c" | "d" | "e" | "f" | "g";

// viewBox: 0 0 28 50
const SEGS: Record<Seg, { x: number; y: number; w: number; h: number }> = {
    a: { x: 5,  y: 0,  w: 18, h: 4  }, // top
    b: { x: 24, y: 5,  w: 4,  h: 16 }, // top-right
    c: { x: 24, y: 28, w: 4,  h: 16 }, // bottom-right
    d: { x: 5,  y: 46, w: 18, h: 4  }, // bottom
    e: { x: 0,  y: 28, w: 4,  h: 16 }, // bottom-left
    f: { x: 0,  y: 5,  w: 4,  h: 16 }, // top-left
    g: { x: 5,  y: 23, w: 18, h: 4  }, // middle
};

const PATTERNS: Record<string, Set<Seg>> = {
    "0": new Set(["a","b","c","d","e","f"]),
    "1": new Set(["b","c"]),
    "2": new Set(["a","b","d","e","g"]),
    "3": new Set(["a","b","c","d","g"]),
    "4": new Set(["b","c","f","g"]),
    "5": new Set(["a","c","d","f","g"]),
    "6": new Set(["a","c","d","e","f","g"]),
    "7": new Set(["a","b","c"]),
    "8": new Set(["a","b","c","d","e","f","g"]),
    "9": new Set(["a","b","c","d","f","g"]),
};

export function LcdDigit({ char, active, width = 28, height = 50, className }: LcdDigitProps) {
    const pattern = PATTERNS[char];

    return (
        <svg
            viewBox="0 0 28 50"
            width={width}
            height={height}
            aria-hidden="true"
            className={clsx("lcd-digit", active && "lcd-digit--active", className)}
        >
            {(Object.entries(SEGS) as [Seg, (typeof SEGS)[Seg]][]).map(([id, seg]) => {
                const on = pattern?.has(id) ?? false;
                return (
                    <rect
                        key={id}
                        x={seg.x}
                        y={seg.y}
                        width={seg.w}
                        height={seg.h}
                        rx="1.8"
                        className={on ? "lcd-seg-on" : "lcd-seg-off"}
                    />
                );
            })}
        </svg>
    );
}
