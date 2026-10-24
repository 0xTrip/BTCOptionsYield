import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-xl border border-border bg-bg/60 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            value === o.value ? "bg-surface-2 text-fg shadow-sm ring-1 ring-border-strong" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
