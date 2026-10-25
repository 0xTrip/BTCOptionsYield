import { TICKER, VAULT } from "@/config";
import { HYPE, liquidationPrice } from "@/data/mock";
import { fmtPct, fmtPrice, fmtRatio } from "@/lib/format";
import { healthBg, healthTone } from "@/lib/health";
import { cn } from "@/lib/utils";

const SCALE_MAX = 5;
const at = (r: number) => `${(Math.min(r, SCALE_MAX) / SCALE_MAX) * 100}%`;

/** Collateral ratio on a 0–500% scale with the liquidation and minimum ratios marked */
export function VaultHealth({ collateral, debt }: { collateral: number; debt: number }) {
  const ratio = debt > 0 ? (collateral * HYPE.spot) / debt : Infinity;
  const liq = liquidationPrice(collateral, debt);
  const drop = debt > 0 ? 1 - liq / HYPE.spot : 1;
  const tone = healthTone(ratio);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-[10px]">Collateral ratio</div>
          <div className={cn("display mt-2 text-5xl", tone)}>{fmtRatio(ratio)}</div>
        </div>
        <div className="text-right">
          <div className="eyebrow text-[10px]">Liquidation price</div>
          <div className="display mt-2 text-2xl">{debt > 0 ? fmtPrice(liq) : "—"}</div>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div className={cn("h-full rounded-full", healthBg(ratio))} style={{ width: debt > 0 ? at(ratio) : "100%" }} />
        </div>
        {/* Liquidation label hangs left of its marker, minimum label right, so they never collide */}
        {[
          { r: VAULT.liquidationRatio, label: "Liq.", cls: "bg-down", side: "-translate-x-full items-end" },
          { r: VAULT.minRatio, label: "Min", cls: "bg-fg/70", side: "items-start" },
        ].map((m) => (
          <div key={m.label} className={cn("absolute -top-1.5 flex flex-col", m.side)} style={{ left: at(m.r) }}>
            <span className={cn("h-5 w-px", m.cls)} />
            <span className="mt-1.5 whitespace-nowrap px-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              {m.label} {fmtPct(m.r, 0)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        {debt > 0 ? (
          <>
            {TICKER.collateral} can fall <span className="text-fg">{fmtPct(drop, 0)}</span>, from {fmtPrice(HYPE.spot)} to {fmtPrice(liq)}, before this vault is
            liquidated.
          </>
        ) : (
          <>No debt, so nothing can be liquidated.</>
        )}
      </p>
    </div>
  );
}
