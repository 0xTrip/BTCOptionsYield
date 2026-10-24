import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tip,
  highlight,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: LucideIcon;
  tip?: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("card relative overflow-hidden p-4 sm:p-5", className)}>
      {highlight && <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/15 blur-2xl" />}
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <span className="hidden size-7 place-items-center rounded-lg border border-border bg-bg/60 sm:grid">
          <Icon className="size-3.5" />
        </span>
        {label}
        {tip && <InfoTip content={tip} />}
      </div>
      <div className="num mt-3 truncate text-xl font-semibold sm:mt-4 sm:text-[28px]">{value}</div>
      {sub && <div className="mt-1 text-[11px] leading-snug text-muted sm:text-xs">{sub}</div>}
    </div>
  );
}
