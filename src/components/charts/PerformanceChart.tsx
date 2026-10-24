import { useMemo } from "react";
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HISTORY } from "@/data/mock";
import { fmtNum, fmtShortDate, fmtSignedPct, fmtUsd0 } from "@/lib/format";

export type Range = "7d" | "30d" | "90d" | "all";
export const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90, all: HISTORY.length - 1 };

type Point = { ts: number; vault: number; btc: number; sharePrice: number; btcPrice: number };

export function usePerformance(range: Range) {
  return useMemo(() => {
    const slice = HISTORY.slice(-(RANGE_DAYS[range] + 1));
    const v0 = slice[0].sharePrice;
    const b0 = slice[0].btc;
    const data: Point[] = slice.map((p) => ({
      ts: p.ts,
      vault: p.sharePrice / v0 - 1,
      btc: p.btc / b0 - 1,
      sharePrice: p.sharePrice,
      btcPrice: p.btc,
    }));
    return { data, vaultReturn: data[data.length - 1].vault, btcReturn: data[data.length - 1].btc };
  }, [range]);
}

export function PerformanceChart({ data, showBtc, height = 280 }: { data: Point[]; showBtc: boolean; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="vault-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7931a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f7931a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vault-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b4500e" />
            <stop offset="100%" stopColor="#ffb85c" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="ts"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={fmtShortDate}
          tick={{ fill: "#6f6964", fontSize: 10, fontFamily: "Geist Mono Variable" }}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={(v: number) => (v === 0 ? "0%" : fmtSignedPct(v, Math.abs(v) < 0.1 ? 1 : 0))}
          tick={{ fill: "#6f6964", fontSize: 10, fontFamily: "Geist Mono Variable" }}
          axisLine={false}
          tickLine={false}
          width={48}
          domain={["auto", "auto"]}
        />
        <Tooltip
          cursor={{ stroke: "#33312e", strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as Point;
            return (
              <div className="rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 font-mono text-[11px] shadow-xl">
                <div className="mb-1.5 uppercase tracking-wider text-faint">{fmtShortDate(p.ts)}</div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-accent" />Vault share</span>
                  <span className="num font-medium">{fmtSignedPct(p.vault, 2)} · {fmtNum(p.sharePrice, 4)}</span>
                </div>
                {showBtc && (
                  <div className="mt-1 flex items-center justify-between gap-6">
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-fg" />BTC</span>
                    <span className="num font-medium">{fmtSignedPct(p.btc, 2)} · {fmtUsd0(p.btcPrice)}</span>
                  </div>
                )}
              </div>
            );
          }}
        />
        {showBtc && (
          <Line type="monotone" dataKey="btc" stroke="#f6f4f1" strokeOpacity={0.45} strokeWidth={1.25} strokeDasharray="3 4" dot={false} isAnimationActive={false} />
        )}
        <Area
          type="monotone"
          dataKey="vault"
          stroke="url(#vault-stroke)"
          strokeWidth={2.25}
          fill="url(#vault-fill)"
          dot={false}
          activeDot={{ r: 4, fill: "#f7931a", stroke: "#050505", strokeWidth: 2 }}
          animationDuration={600}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
