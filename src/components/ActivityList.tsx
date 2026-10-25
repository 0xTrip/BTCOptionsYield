import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Coins, Layers, Power, PowerOff, Inbox, Sparkles, TrendingUp, Undo2 } from "lucide-react";
import { TICKER } from "@/config";
import type { Activity } from "@/data/mock";
import { fmtNum, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const amt = (n: number, ticker: string, digits = 2) => `${fmtNum(n, digits)} ${ticker}`;

function meta(a: Activity) {
  switch (a.type) {
    case "deposit":
      return { icon: ArrowDownLeft, label: `Deposited ${TICKER.collateral}`, tone: "text-accent bg-accent/10", amount: `+${amt(a.amount, TICKER.collateral)}` };
    case "withdraw":
      return { icon: ArrowUpRight, label: `Withdrew ${TICKER.collateral}`, tone: "text-muted bg-white/5", amount: `−${amt(a.amount, TICKER.collateral)}` };
    case "mint":
      return { icon: Coins, label: `Minted ${TICKER.stable}`, tone: "text-accent bg-accent/10", amount: `+${amt(a.amount, TICKER.stable)}` };
    case "repay":
      return { icon: Undo2, label: "Repaid debt", tone: "text-muted bg-white/5", amount: `−${amt(a.amount, TICKER.stable)}` };
    case "earn":
      return { icon: TrendingUp, label: "Premium repaid debt", tone: "text-up bg-up/10", amount: `−${amt(a.amount, TICKER.stable)}` };
    case "called":
      return { icon: Sparkles, label: "Calls settled in the money", tone: "text-fg bg-white/10", amount: `−${amt(a.amount, TICKER.collateral)}` };
    case "earn_on":
      return { icon: Power, label: "Earn mode on", tone: "text-accent bg-accent/10", amount: "" };
    case "earn_off":
      return { icon: PowerOff, label: "Earn mode off", tone: "text-muted bg-white/5", amount: "" };
    case "stake":
      return { icon: Layers, label: `Staked ${TICKER.stable}`, tone: "text-accent bg-accent/10", amount: amt(a.amount, TICKER.stable) };
    case "unstake":
      return { icon: Layers, label: `Unstaked ${TICKER.staked}`, tone: "text-muted bg-white/5", amount: `+${amt(a.amount, TICKER.stable)}` };
    case "swap":
      return { icon: ArrowLeftRight, label: "Swapped", tone: "text-muted bg-white/5", amount: fmtNum(a.amount) };
  }
}

export function ActivityList({ items }: { items: Activity[] }) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center py-10 text-center text-sm text-muted">
        <Inbox className="mb-3 size-6 text-faint" />
        No activity yet
      </div>
    );

  return (
    <ul className="-my-2 divide-y divide-border/70">
      {items.map((a) => {
        const m = meta(a);
        return (
          <li key={a.id} className="flex items-center gap-3 py-3">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", m.tone)}>
              <m.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.label}</div>
              <div className="truncate font-mono text-[11px] text-muted">{a.note ?? fmtRelative(a.ts)}</div>
            </div>
            <div className="text-right">
              <div className={cn("num font-mono text-[13px] font-medium", a.type === "earn" && "text-up")}>{m.amount}</div>
              {a.note && <div className="font-mono text-[11px] text-faint">{fmtRelative(a.ts)}</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
