import { OPTIONS_BOOK, STRATEGIES, VAULT, positionPnl } from "@/data/mock";
import { fmtShortDate, fmtSigned0, fmtSignedPct, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";

const colorOf = (id: string) => STRATEGIES.find((s) => s.id === id)?.color ?? "#fff";

export function OptionsBook({ compact }: { compact?: boolean }) {
  const total = OPTIONS_BOOK.reduce((s, p) => s + positionPnl(p), 0);
  const premium = OPTIONS_BOOK.filter((p) => p.side === "Sold").reduce((s, p) => s + p.avgPremium * p.sizeBtc, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Instrument", "Position", "Size", !compact && "Avg premium", !compact && "Mark", "Distance", "Unrealised P&L"]
                .filter(Boolean)
                .map((h, i) => (
                  <th key={h as string} className={cn("eyebrow px-4 py-3 text-[10px] font-medium", i > 1 && "text-right")}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[12.5px]">
            {OPTIONS_BOOK.map((p) => {
              const pnl = positionPnl(p);
              const distance = p.strike / VAULT.btcSpot - 1;
              return (
                <tr key={p.instrument} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-4 w-0.5" style={{ background: colorOf(p.strategy) }} />
                      <span className="text-fg">{p.instrument}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-sans text-[13px] text-muted">
                    {p.label} <span className="text-faint">· {fmtShortDate(p.expiry)}</span>
                  </td>
                  <td className="num whitespace-nowrap px-4 py-3 text-right">
                    <span className={p.side === "Sold" ? "text-accent" : "text-fg"}>{p.side === "Sold" ? "−" : "+"}{p.sizeBtc}</span>
                    <span className="text-faint"> BTC</span>
                  </td>
                  {!compact && <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">{fmtUsd0(p.avgPremium)}</td>}
                  {!compact && <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">{fmtUsd0(p.mark)}</td>}
                  <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">{fmtSignedPct(distance, 1)}</td>
                  <td className={cn("num whitespace-nowrap px-4 py-3 text-right font-medium", pnl >= 0 ? "text-up" : "text-down")}>
                    {fmtSigned0(pnl)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg/40 px-4 py-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="text-faint">
          Premium sold <span className="num text-fg">{fmtUsd0(premium)}</span>
          <span className="mx-2 text-border-strong">/</span>
          Spot <span className="num text-fg">{fmtUsd0(VAULT.btcSpot)}</span>
        </span>
        <span className="text-faint">
          Book P&amp;L <span className={cn("num", total >= 0 ? "text-up" : "text-down")}>{fmtSigned0(total)}</span>
        </span>
      </div>
    </div>
  );
}
