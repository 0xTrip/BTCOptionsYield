import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  default: "border-border-strong text-muted",
  accent: "border-accent/40 bg-accent/10 text-accent",
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
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase leading-4 tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
