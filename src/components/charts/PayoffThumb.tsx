import type { Strategy } from "@/data/mock";

const PATHS: Record<Strategy["payoff"], string> = {
  "short-put": "M4 44 L38 14 L76 14",
  "put-spread": "M4 34 L22 34 L42 14 L76 14",
  "long-call": "M4 30 L40 30 L76 4",
  "long-put": "M4 4 L36 30 L76 30",
  flat: "M4 22 L76 22",
};

/** Tiny payoff-at-expiry sketch: x = BTC price, y = P&L, dashed line = break-even */
export function PayoffThumb({ kind, color }: { kind: Strategy["payoff"]; color: string }) {
  return (
    <svg viewBox="0 0 80 48" className="h-12 w-20" aria-hidden>
      <line x1="2" y1="22" x2="78" y2="22" stroke="#2a3447" strokeDasharray="2 3" />
      <path d={PATHS[kind]} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
