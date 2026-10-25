import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Hairline-divided grid of headline numbers */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-lg border border-border bg-border", className)}>{children}</div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  tip,
  accent,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tip?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative bg-surface p-4 sm:p-5", className)}>
      {accent && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
      <div className="flex items-center gap-1.5">
        <span className="eyebrow truncate text-[10px] sm:text-[11px]">{label}</span>
        {tip && <InfoTip content={tip} />}
      </div>
      <div className={cn("display mt-3 truncate text-[22px] leading-none sm:text-[30px]", accent && "text-accent")}>{value}</div>
      {sub && <div className="mt-2 font-mono text-[11px] leading-snug text-muted">{sub}</div>}
    </div>
  );
}
