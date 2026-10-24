import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-accent to-accent-2 text-accent-fg font-semibold shadow-[0_8px_24px_-8px] shadow-accent/50 hover:brightness-110 active:brightness-95",
        secondary:
          "bg-surface-2 text-fg border border-border-strong hover:border-accent/50 hover:bg-surface-2/80",
        ghost: "text-muted hover:text-fg hover:bg-white/5",
        gold: "bg-gold text-[#1a1200] font-semibold hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
