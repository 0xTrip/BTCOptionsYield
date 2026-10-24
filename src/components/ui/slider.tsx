import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border-strong">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-accent to-accent-2" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-5 cursor-grab rounded-full border-2 border-accent bg-bg shadow-[0_0_0_4px] shadow-accent/20 transition hover:shadow-accent/30 active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
}
