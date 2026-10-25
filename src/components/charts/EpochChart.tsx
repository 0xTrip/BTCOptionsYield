import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TICKER } from "@/config";
import { EPOCHS, type Epoch } from "@/data/mock";
import { fmtCompact, fmtPrice, fmtShortDate, fmtUsd0 } from "@/lib/format";

const TICK = { fill: "#6f6964", fontSize: 10, fontFamily: "Geist Mono Variable" };
export const PREMIUM_COLOR = "#c8f53c";
export const CALLED_COLOR = "#e8e4dc";

/** Premium collected each epoch; weeks where HYPE closed above the strike are marked */
export function EpochChart({ height = 220, axes = true }: { height?: number; axes?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={EPOCHS} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={2}>
        <XAxis hide={!axes} dataKey="n" tick={TICK} axisLine={false} tickLine={false} tickMargin={8} interval={4} tickFormatter={(n: number) => `E${n}`} />
        <YAxis hide={!axes} tick={TICK} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => fmtCompact(v)} />
        <Tooltip
          cursor={{ fill: "rgb(255 255 255 / 0.03)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const e = payload[0].payload as Epoch;
            return (
              <div className="max-w-64 rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 font-mono text-[11px] shadow-xl">
                <div className="mb-1.5 uppercase tracking-wider text-faint">
                  Epoch {e.n} · {fmtShortDate(e.settledAt)}
                </div>
                <Line k={TICKER.collateral} v={`${fmtPrice(e.open)} → ${fmtPrice(e.close)}`} />
                <Line k="Strike" v={fmtPrice(e.strike, 0)} />
                <Line k="Premium" v={fmtUsd0(e.premium)} tone="text-accent" />
                <Line k="To vaults" v={fmtUsd0(e.toVaults)} />
                <Line k={`To ${TICKER.staked}`} v={fmtUsd0(e.toStakers - e.fees)} />
                {e.calledAway && <div className="mt-1.5 whitespace-normal text-muted">Closed above the strike: vaults paid {fmtUsd0(e.givenUp)} from their gains.</div>}
              </div>
            );
          }}
        />
        <Bar dataKey="premium" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {EPOCHS.map((e) => (
            <Cell key={e.n} fill={e.calledAway ? CALLED_COLOR : PREMIUM_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Line({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted">{k}</span>
      <span className={`num font-medium ${tone ?? ""}`}>{v}</span>
    </div>
  );
}
