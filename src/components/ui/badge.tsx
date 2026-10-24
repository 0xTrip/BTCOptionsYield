import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  default: "border-border-strong bg-surface-2 text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  gold: "border-gold/30 bg-gold/10 text-gold",
  up: "border-up/30 bg-up/10 text-up",
  down: "border-down/30 bg-down/10 text-down",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
