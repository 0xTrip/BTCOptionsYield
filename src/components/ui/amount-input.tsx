import { cn } from "@/lib/utils";

export function AmountInput({
  value,
  onChange,
  onMax,
  unit = "USDC",
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onMax?: () => void;
  unit?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border bg-bg px-4 py-3 transition focus-within:border-accent",
        invalid ? "border-down/60" : "border-border-strong",
      )}
    >
      <input
        inputMode="decimal"
        autoFocus={autoFocus}
        placeholder="0.00"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/,/g, "");
          if (/^\d*\.?\d{0,6}$/.test(v)) onChange(v);
        }}
        className="display min-w-0 flex-1 bg-transparent text-3xl outline-none placeholder:text-faint"
        aria-label={`Amount in ${unit}`}
      />
      {onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-sm border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-accent transition hover:bg-accent hover:text-accent-fg"
        >
          MAX
        </button>
      )}
      <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-muted">
        <UsdcIcon /> {unit}
      </span>
    </div>
  );
}

export function UsdcIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.9" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fontFamily="system-ui">$</text>
    </svg>
  );
}
