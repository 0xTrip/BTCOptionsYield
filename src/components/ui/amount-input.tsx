import { TokenLabel, type Asset } from "@/components/TokenIcon";
import { TICKER } from "@/config";
import { cn } from "@/lib/utils";

export function AmountInput({
  value,
  onChange,
  onMax,
  asset,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onMax?: () => void;
  asset: Asset;
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
        aria-label={`Amount in ${TICKER[asset]}`}
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
      <TokenLabel asset={asset} className="text-muted" />
    </div>
  );
}
