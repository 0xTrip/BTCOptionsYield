import { useEffect, useState } from "react";
import { Hourglass, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DAY_MS } from "@/config";
import type { Withdrawal } from "@/data/mock";
import { fmtDate, fmtUsd } from "@/lib/format";
import { useVault } from "@/store/useVault";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function PendingWithdrawals({ items }: { items: Withdrawal[] }) {
  const claim = useVault((s) => s.claim);
  const fastForward = useVault((s) => s.fastForward);
  const now = useNow();

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Hourglass className="size-4 text-muted" /> Pending withdrawals
        </h2>
        <Badge>{items.length}</Badge>
      </div>
      <ul className="space-y-3">
        {items.map((w) => {
          const total = w.unlockAt - w.requestedAt;
          const progress = Math.min(1, Math.max(0, (now - w.requestedAt) / total));
          const ready = now >= w.unlockAt;
          const daysLeft = Math.ceil((w.unlockAt - now) / DAY_MS);
          return (
            <li key={w.id} className="rounded-xl border border-border bg-bg/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="num text-lg font-semibold">{fmtUsd(w.net)}</div>
                  <div className="text-xs text-muted">
                    Requested {fmtDate(w.requestedAt)} · {ready ? "Ready to claim" : `Claimable ${fmtDate(w.unlockAt)}`}
                  </div>
                </div>
                {ready ? (
                  <Button size="sm" onClick={() => claim(w.id)}>Claim USDC</Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge tone="accent">{daysLeft} {daysLeft === 1 ? "day" : "days"} left</Badge>
                    <button
                      type="button"
                      onClick={() => fastForward(w.id)}
                      title="Demo: skip the notice period"
                      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-faint transition hover:bg-white/5 hover:text-muted"
                    >
                      <FastForward className="size-3" /> Skip
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-strong">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
