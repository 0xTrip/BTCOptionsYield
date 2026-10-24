import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  body,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="eyebrow flex items-center gap-3">
        {index && <span className="text-accent">{index}</span>}
        {index && <span className="h-px w-8 bg-border-strong" />}
        <span>{eyebrow}</span>
      </div>
      <h2 className="display mt-4 text-[2rem] leading-[1.02] sm:text-5xl">{title}</h2>
      {body && <p className="mt-5 max-w-xl leading-relaxed text-muted">{body}</p>}
    </div>
  );
}
