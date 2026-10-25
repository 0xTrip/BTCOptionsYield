import { TICKER } from "@/config";
import { cn } from "@/lib/utils";

export type Asset = keyof typeof TICKER;

export function TokenIcon({ asset, className }: { asset: Asset; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5 shrink-0", className)} aria-hidden>
      {asset === "base" && (
        <>
          <circle cx="16" cy="16" r="16" fill="#26a17b" />
          <path d="M9.5 9.5h13v3h-5v3c3.4.2 5.8.9 5.8 1.7s-2.4 1.5-5.8 1.7V24h-3v-5.1c-3.4-.2-5.8-.9-5.8-1.7s2.4-1.5 5.8-1.7v-3h-5z" fill="#fff" />
        </>
      )}
      {asset === "collateral" && (
        <>
          <circle cx="16" cy="16" r="16" fill="#86e8d0" />
          <path d="M9.5 10.5v11M22.5 10.5v11M9.5 16c2.2-2.6 4.3-2.6 6.5 0s4.3 2.6 6.5 0" fill="none" stroke="#04211b" strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {asset === "stable" && (
        <>
          <circle cx="16" cy="16" r="16" fill="#c8f53c" />
          <path d="M10.6 10h2.7v12h-2.7zM18.7 10h2.7v12h-2.7z" fill="#0b0f00" />
          <path d="M13.3 17.4l2-2.9 1.5 2.2 1.9-2.8" fill="none" stroke="#0b0f00" strokeWidth="2" />
        </>
      )}
      {asset === "staked" && (
        <>
          <circle cx="16" cy="16" r="15" fill="#0b0f00" stroke="#c8f53c" strokeWidth="2" />
          <path d="M10.6 10h2.7v12h-2.7zM18.7 10h2.7v12h-2.7z" fill="#c8f53c" />
          <path d="M13.3 17.4l2-2.9 1.5 2.2 1.9-2.8" fill="none" stroke="#c8f53c" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

/** Ticker that keeps its casing inside uppercase labels, so sUSDH never reads as SUSDH */
export function Tk({ asset }: { asset: Asset }) {
  return <span className="normal-case">{TICKER[asset]}</span>;
}

/** Icon plus ticker, e.g. for balances and inputs */
export function TokenLabel({ asset, className }: { asset: Asset; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs font-medium", className)}>
      <TokenIcon asset={asset} /> {TICKER[asset]}
    </span>
  );
}
