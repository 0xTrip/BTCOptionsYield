import { ArrowDownLeft, ArrowUpRight, CircleCheck, Sparkles, TrendingDown, TrendingUp, Inbox } from "lucide-react";
import type { Activity } from "@/data/mock";
import { fmtRelative, fmtSigned, fmtUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

function meta(a: Activity) {
  switch (a.type) {
    case "deposit":
      return { icon: ArrowDownLeft, label: "Deposit", tone: "text-accent bg-accent/10", amount: `+${fmtUsd(a.amount)}` };
    case "withdraw_request":
      return { icon: ArrowUpRight, label: "Withdrawal requested", tone: "text-muted bg-white/5", amount: fmtUsd(a.amount) };
    case "withdraw_claim":
      return { icon: CircleCheck, label: "Withdrawal claimed", tone: "text-up bg-up/10", amount: `${fmtUsd(a.amount)}` };
    case "yield":
      return a.amount >= 0
        ? { icon: TrendingUp, label: "Options yield", tone: "text-up bg-up/10", amount: fmtSigned(a.amount) }
        : { icon: TrendingDown, label: "Options loss", tone: "text-down bg-down/10", amount: fmtSigned(a.amount) };
    case "boost":
      return { icon: Sparkles, label: "Lucky Boost", tone: "text-gold bg-gold/10", amount: "" };
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
    <ul className="divide-y divide-border/70">
      {items.map((a) => {
        const m = meta(a);
        return (
          <li key={a.id} className="flex items-center gap-3 py-3">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", m.tone)}>
              <m.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.label}</div>
              <div className="truncate text-xs text-muted">{a.note ?? fmtRelative(a.ts)}</div>
            </div>
            <div className="text-right">
              <div className={cn("num text-sm font-medium", a.type === "yield" && (a.amount >= 0 ? "text-up" : "text-down"))}>{m.amount}</div>
              {a.note && <div className="text-xs text-faint">{fmtRelative(a.ts)}</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
