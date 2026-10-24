import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Row({ label, value, strong, muted }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={cn("num text-right font-mono text-[13px]", strong && "font-semibold text-fg", muted && "text-muted")}>{value}</span>
    </div>
  );
}

export function SuccessState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-4 text-center animate-fade-up">
      <div className="grid size-14 place-items-center rounded-full bg-accent ring-8 ring-accent/10">
        <Check className="size-7 text-accent-fg" strokeWidth={3} />
      </div>
      <h3 className="display mt-5 text-2xl">{title}</h3>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </div>
  );
}
