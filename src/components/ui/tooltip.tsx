import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tip({ children, content, className }: { children: React.ReactNode; content: React.ReactNode; className?: string }) {
  return (
    <TooltipPrimitive.Root delayDuration={150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn(
            "z-50 max-w-64 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-xs leading-relaxed text-fg shadow-xl animate-fade-up",
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function InfoTip({ content }: { content: React.ReactNode }) {
  return (
    <Tip content={content}>
      <button type="button" className="inline-flex text-faint transition hover:text-muted" aria-label="More info">
        <Info className="size-3.5" />
      </button>
    </Tip>
  );
}
