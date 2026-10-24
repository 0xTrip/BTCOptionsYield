import { useEffect, useState } from "react";
import { Sparkles, Ticket } from "lucide-react";
import { BOOST_POOL, BOOST_TIERS, nextDrawDate } from "@/data/mock";
import { DAY_MS } from "@/config";
import { InfoTip } from "@/components/ui/tooltip";
import { fmtUsd0 } from "@/lib/format";
import { luckyTickets } from "@/lib/vault-math";

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / DAY_MS),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function LuckyBoostCard({ balance, firstDepositAt }: { balance: number | null; firstDepositAt: number | null }) {
  const draw = nextDrawDate();
  const { d, h, m, s } = useCountdown(draw);
  const daysHeld = firstDepositAt ? Math.max(1, Math.floor((Date.now() - firstDepositAt) / DAY_MS)) : 0;
  const tickets = balance ? luckyTickets(balance, daysHeld) : 0;
  const odds = tickets / BOOST_POOL.totalTickets;
  const winners = BOOST_TIERS.reduce((n, t) => n + t.winners, 0);

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-gold" /> Lucky Boost
          </h2>
          <InfoTip content={`Every month, ${winners} long-term depositors win a yield boost for the following month. Tickets = balance × days held ÷ 1,000, so the longer you stay, the better your odds. Funded by a ${fmtUsd0(BOOST_POOL.monthlyBudget)}/month budget from protocol fees.`} />
        </div>

        <div className="mt-4 text-xs text-muted">Next draw in</div>
        <div className="num mt-1 flex gap-2">
          {[
            [d, "d"],
            [h, "h"],
            [m, "m"],
            [s, "s"],
          ].map(([v, u]) => (
            <div key={u} className="flex min-w-12 flex-col items-center rounded-lg border border-gold/20 bg-gold/5 px-2 py-1.5">
              <span className="text-lg font-semibold text-gold">{String(v).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase text-muted">{u}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-bg/40 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Ticket className="size-3.5" /> Your tickets
            </div>
            <div className="num mt-1 text-lg font-semibold">{balance === null ? "—" : tickets.toLocaleString("en-US")}</div>
          </div>
          <div className="rounded-xl border border-border bg-bg/40 p-3">
            <div className="text-xs text-muted">Win chance</div>
            <div className="num mt-1 text-lg font-semibold">
              {balance === null ? "—" : `${Math.min(99, odds * winners * 100).toFixed(2)}%`}
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {BOOST_TIERS.map((t) => (
            <li key={t.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="num rounded-md bg-gold/10 px-1.5 py-0.5 text-xs font-semibold text-gold">{t.multiplier}</span>
                <span className="text-muted">{t.label}</span>
              </span>
              <span className="num text-xs text-faint">{t.winners} {t.winners === 1 ? "winner" : "winners"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
