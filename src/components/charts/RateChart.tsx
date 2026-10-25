import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TICKER } from "@/config";
import { RATE_HISTORY } from "@/data/mock";
import { fmtNum, fmtShortDate, fmtSignedPct } from "@/lib/format";

export type Range = "30d" | "90d" | "all";
export const RANGE_DAYS: Record<Range, number> = { "30d": 30, "90d": 90, all: RATE_HISTORY.length - 1 };

type Point = { ts: number; rate: number; change: number };

/** sUSDH → USDH rate over a range, indexed to the first point */
export function useRateHistory(range: Range) {
  return useMemo(() => {
    const slice = RATE_HISTORY.slice(-(RANGE_DAYS[range] + 1));
    const r0 = slice[0].rate;
    const data: Point[] = slice.map((p) => ({ ts: p.ts, rate: p.rate, change: p.rate / r0 - 1 }));
    return { data, change: data[data.length - 1].change };
  }, [range]);
}

const TICK = { fill: "#6f6964", fontSize: 10, fontFamily: "Geist Mono Variable" };

export function RateChart({ data, height = 260, axes = true }: { data: Point[]; height?: number; axes?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8f53c" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#c8f53c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          hide={!axes}
          dataKey="ts"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={fmtShortDate}
          tick={TICK}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
          tickMargin={10}
        />
        <YAxis
          hide={!axes}
          tickFormatter={(v: number) => (v === 0 ? "0%" : fmtSignedPct(v, 1))}
          tick={TICK}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={["auto", "auto"]}
        />
        <Tooltip
          cursor={{ stroke: "#33312e" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as Point;
            return (
              <div className="rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 font-mono text-[11px] shadow-xl">
                <div className="mb-1.5 uppercase tracking-wider text-faint">{fmtShortDate(p.ts)}</div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted">1 {TICKER.staked}</span>
                  <span className="num font-medium">
                    {fmtNum(p.rate, 4)} {TICKER.stable}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-6">
                  <span className="text-muted">Change</span>
                  <span className={`num font-medium ${p.change >= 0 ? "text-up" : "text-down"}`}>{fmtSignedPct(p.change, 2)}</span>
                </div>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="change"
          stroke="#c8f53c"
          strokeWidth={2}
          fill="url(#rate-fill)"
          dot={false}
          activeDot={{ r: 4, fill: "#c8f53c", stroke: "#050505", strokeWidth: 2 }}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
