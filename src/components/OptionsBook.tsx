import { TICKER } from "@/config";
import { BOOK, BOOK_STATS, HYPE, NEXT_SETTLEMENT, PROTOCOL, distanceOf, instrument, pnlOf, premiumOf } from "@/data/mock";
import { fmtCompactNum, fmtExpiry, fmtPct, fmtPrice, fmtSigned0, fmtSignedPct, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";

/** This epoch's covered calls, sold against HYPE in Earn mode vaults */
export function OptionsBook({ compact }: { compact?: boolean }) {
  const heads = ["Instrument", "Venue", "Size", "Above spot", "Premium", !compact && "Mark", !compact && "P&L"].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {heads.map((h, i) => (
                <th key={h} className={cn("eyebrow px-4 py-3 text-[10px] font-medium", i > 1 && "text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[12.5px]">
            {BOOK.map((c) => {
              const pnl = pnlOf(c);
              return (
                <tr key={instrument(c) + c.venue} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-fg">{instrument(c)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-sans text-[13px] text-muted">{c.venue}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right">
                    −{fmtCompactNum(c.size)}
                    <span className="text-faint"> {TICKER.collateral}</span>
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">{fmtSignedPct(distanceOf(c), 1)}</td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-accent">{fmtUsd0(premiumOf(c))}</td>
                  {!compact && <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">{fmtPrice(c.mark)}</td>}
                  {!compact && (
                    <td className={cn("num whitespace-nowrap px-4 py-3 text-right font-medium", pnl >= 0 ? "text-up" : "text-down")}>{fmtSigned0(pnl)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border bg-bg/40 px-4 py-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="text-faint">
          Premium <span className="num text-accent">{fmtUsd0(BOOK_STATS.premium)}</span>
          <span className="mx-2 text-border-strong">/</span>
          Covered by <span className="num text-fg">{fmtCompactNum(PROTOCOL.earnHype)}</span> {TICKER.collateral} ({fmtPct(PROTOCOL.earnShare, 0)} of vaults)
          <span className="mx-2 text-border-strong">/</span>
          Spot <span className="num text-fg">{fmtPrice(HYPE.spot)}</span>
        </span>
        <span className="text-faint">Settles {fmtExpiry(NEXT_SETTLEMENT)}</span>
      </div>
    </div>
  );
}
