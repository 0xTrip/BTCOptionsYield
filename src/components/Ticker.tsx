import { useEffect, useState } from "react";
import { MARKET, NEXT_EXPIRY, VAULT, blockHeight } from "@/data/mock";
import { fmtCompact, fmtExpiry, fmtPct, fmtSignedPct, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";

function useBlockHeight() {
  const [h, setH] = useState(blockHeight());
  useEffect(() => {
    const t = setInterval(() => setH(blockHeight()), 15_000);
    return () => clearInterval(t);
  }, []);
  return h;
}

export function Ticker() {
  const height = useBlockHeight();
  const items: { k: string; v: string; tone?: "up" | "accent" }[] = [
    { k: "BTC/USD", v: fmtUsd0(VAULT.btcSpot) },
    { k: "24H", v: fmtSignedPct(MARKET.btcChange24h, 2), tone: "up" },
    { k: "Block", v: `#${height.toLocaleString("en-US")}` },
    { k: "BTC Yield 30D", v: fmtPct(VAULT.apy30d), tone: "accent" },
    { k: "Premium 30D", v: fmtUsd0(VAULT.premium30d) },
    { k: "Vault TVL", v: fmtCompact(VAULT.tvl) },
    { k: "BTC IV 30D", v: fmtPct(MARKET.iv30d) },
    { k: "Next expiry", v: fmtExpiry(NEXT_EXPIRY) },
  ];

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((i) => (
        <span key={i.k} className="flex items-center gap-2 px-5 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-faint">{i.k}</span>
          <span className={cn("num", i.tone === "up" ? "text-up" : i.tone === "accent" ? "text-accent" : "text-fg")}>{i.v}</span>
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
