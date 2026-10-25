import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card flex flex-col", className)}>
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-5 py-2.5">
        <h2 className="eyebrow text-fg">{title}</h2>
        {right}
      </header>
      <div className="flex flex-1 flex-col p-5">{children}</div>
    </section>
  );
}
