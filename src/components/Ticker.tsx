import type { ReactNode } from "react";
import { Tk } from "@/components/TokenIcon";
import { TICKER } from "@/config";
import { BOOK_STATS, HYPE, NEXT_SETTLEMENT, PROTOCOL } from "@/data/mock";
import { fmtCompact, fmtCompactNum, fmtExpiry, fmtPct, fmtPrice, fmtRatio, fmtSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Item = { k: ReactNode; v: string; tone?: "up" | "down" | "accent" };

export function Ticker() {
  const items: Item[] = [
    { k: TICKER.collateral, v: fmtPrice(HYPE.spot) },
    { k: "24H", v: fmtSignedPct(HYPE.change24h, 1), tone: HYPE.change24h >= 0 ? "up" : "down" },
    { k: "Earn mode yield", v: fmtPct(PROTOCOL.earnYield), tone: "accent" },
    { k: <><Tk asset="staked" /> APY</>, v: fmtPct(PROTOCOL.apy30d), tone: "accent" },
    { k: `${TICKER.collateral} locked`, v: fmtCompactNum(PROTOCOL.hypeLocked) },
    { k: `${TICKER.stable} supply`, v: fmtCompact(PROTOCOL.supply) },
    { k: "Collateral ratio", v: fmtRatio(PROTOCOL.systemRatio) },
    { k: "Strike", v: fmtPrice(BOOK_STATS.strike, 0) },
    { k: "Calls settle", v: fmtExpiry(NEXT_SETTLEMENT) },
  ];

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((i, n) => (
        <span key={n} className="flex items-center gap-2 px-5 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-faint">{i.k}</span>
          <span className={cn("num", i.tone === "up" || i.tone === "accent" ? "text-accent" : i.tone === "down" ? "text-down" : "text-fg")}>{i.v}</span>
          <span className="ml-5 text-border-strong">/</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative flex h-8 overflow-hidden border-b border-border bg-surface [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
