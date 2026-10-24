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
        "flex items-center gap-3 rounded-xl border bg-bg/70 px-4 py-3 transition focus-within:border-accent/60",
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
        className="num min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-faint"
        aria-label={`Amount in ${unit}`}
      />
      {onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent transition hover:bg-accent/20"
        >
          MAX
        </button>
      )}
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted">
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
