import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { BOOST_POOL, BOOST_TIERS, DRAW_INTERVAL_BLOCKS, blockHeight, nextDraw } from "@/data/mock";
import { DAY_MS } from "@/config";
import { InfoTip } from "@/components/ui/tooltip";
import { fmtUsd0 } from "@/lib/format";
import { luckyTickets } from "@/lib/vault-math";

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function LuckyBoostCard({ balance, firstDepositAt }: { balance: number | null; firstDepositAt: number | null }) {
  const now = useNow();
  const draw = nextDraw(now);
  const height = blockHeight(now);
  const blocksLeft = draw.block - height;
  const progress = 1 - blocksLeft / DRAW_INTERVAL_BLOCKS;
  const diff = Math.max(0, draw.ts - now);
  const parts = [
    [Math.floor(diff / DAY_MS), "D"],
    [Math.floor((diff / 3_600_000) % 24), "H"],
    [Math.floor((diff / 60_000) % 60), "M"],
    [Math.floor((diff / 1000) % 60), "S"],
  ] as const;

  const daysHeld = firstDepositAt ? Math.max(1, Math.floor((now - firstDepositAt) / DAY_MS)) : 0;
  const tickets = balance ? luckyTickets(balance, daysHeld) : 0;
  const winners = BOOST_TIERS.reduce((n, t) => n + t.winners, 0);
  const chance = Math.min(0.99, (tickets / BOOST_POOL.totalTickets) * winners);

  return (
    <section className="card overflow-hidden">
      <header className="flex min-h-12 items-center justify-between border-b border-border bg-accent px-5 py-2.5 text-accent-fg">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">Lucky Boost</h2>
        <InfoTip
          content={`Every ${DRAW_INTERVAL_BLOCKS.toLocaleString("en-US")} blocks (≈ 30 days), ${winners} depositors win a yield boost for the next period. Tickets = balance × days held ÷ 1,000. Winners are picked from the draw block's hash. Funded by a ${fmtUsd0(BOOST_POOL.monthlyBudget)}/month budget from protocol fees.`}
        />
      </header>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Next draw</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-accent">
            <Hash className="size-3" /> Block {draw.block.toLocaleString("en-US")}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-px overflow-hidden rounded-md border border-border bg-border">
          {parts.map(([v, u]) => (
            <div key={u} className="bg-bg py-2 text-center">
              <div className="display text-2xl">{String(v).padStart(2, "0")}</div>
              <div className="font-mono text-[9px] tracking-widest text-faint">{u}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-border-strong">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
            <span>#{height.toLocaleString("en-US")}</span>
            <span>{blocksLeft.toLocaleString("en-US")} blocks to go</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
          <div className="bg-surface p-3">
            <div className="eyebrow text-[10px]">Your tickets</div>
            <div className="display mt-1.5 text-xl">{balance === null ? "—" : tickets.toLocaleString("en-US")}</div>
          </div>
          <div className="bg-surface p-3">
            <div className="eyebrow text-[10px]">Win chance</div>
            <div className="display mt-1.5 text-xl text-accent">{balance === null ? "—" : `${(chance * 100).toFixed(2)}%`}</div>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border">
          {BOOST_TIERS.map((t) => (
            <li key={t.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="flex items-center gap-3">
                <span className="display w-10 text-accent">{t.multiplier}</span>
                <span className="text-muted">{t.label}</span>
              </span>
              <span className="font-mono text-[11px] text-faint">
                {t.winners} {t.winners === 1 ? "winner" : "winners"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
