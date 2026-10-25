import { cn } from "@/lib/utils";

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40", checked ? "bg-accent" : "bg-border-strong")}
    >
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-bg transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}
