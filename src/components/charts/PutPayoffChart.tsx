import { memo, useMemo } from "react";
import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { putPnl } from "@/lib/vault-math";
import { fmtSigned0, fmtUsd0 } from "@/lib/format";

export const PRICE_MIN = 40_000;
export const PRICE_MAX = 110_000;

// Stable prop objects: Recharts re-registers reference elements whenever these change identity
const SPOT_LABEL = { value: "Spot", position: "top", fill: "#f7931a", fontSize: 11 } as const;
const STRIKE_LABEL = { value: "Strike", position: "top", fill: "#8b96ab", fontSize: 11 } as const;
const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 };
const TICK = { fill: "#5b667c", fontSize: 11 };
const X_TICKS = [40_000, 50_000, 60_000, 70_000, 80_000, 90_000, 100_000, 110_000];
const X_DOMAIN = [PRICE_MIN, PRICE_MAX];
const CURSOR = { stroke: "#2a3447", strokeDasharray: "3 3" };
const k = (v: number) => `$${Math.round(v / 1000)}k`;
const yTick = (v: number) => (v === 0 ? "$0" : `${v > 0 ? "+" : "−"}$${Math.abs(v / 1000)}k`);

function PayoffTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { price: number; pnl: number };
  return (
    <div className="rounded-xl border border-border-strong bg-surface-2/95 px-3 py-2 text-xs shadow-xl">
      <div className="text-muted">BTC at expiry {fmtUsd0(d.price)}</div>
      <div className={`num mt-0.5 font-semibold ${d.pnl >= 0 ? "text-up" : "text-down"}`}>{fmtSigned0(d.pnl)}</div>
    </div>
  );
}

export const PutPayoffChart = memo(function PutPayoffChart({
  strike,
  premium,
  spot,
  price,
}: {
  strike: number;
  premium: number;
  spot: number;
  price: number;
}) {
  const { data, zeroOffset } = useMemo(() => {
    const data = [];
    for (let p = PRICE_MIN; p <= PRICE_MAX; p += 500) data.push({ price: p, pnl: putPnl(p, strike, premium) });
    const max = Math.max(...data.map((d) => d.pnl));
    const min = Math.min(...data.map((d) => d.pnl));
    return { data, zeroOffset: max / (max - min) };
  }, [strike, premium]);

  const pnl = putPnl(price, strike, premium);
  const breakeven = strike - premium;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={MARGIN}>
        <defs>
          <linearGradient id="payoff-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#34d399" stopOpacity={0.35} />
            <stop offset={zeroOffset} stopColor="#34d399" stopOpacity={0.05} />
            <stop offset={zeroOffset} stopColor="#f87171" stopOpacity={0.05} />
            <stop offset={1} stopColor="#f87171" stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id="payoff-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset={zeroOffset} stopColor="#34d399" />
            <stop offset={zeroOffset} stopColor="#f87171" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="price"
          type="number"
          domain={X_DOMAIN}
          ticks={X_TICKS}
          tickFormatter={k}
          tick={TICK}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={yTick}
          tick={TICK}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip cursor={CURSOR} content={PayoffTooltip} />
        <ReferenceLine y={0} stroke="#2a3447" />
        <ReferenceLine x={spot} stroke="#f7931a" strokeOpacity={0.6} strokeDasharray="3 3" label={SPOT_LABEL} />
        <ReferenceLine x={strike} stroke="#8b96ab" strokeOpacity={0.5} strokeDasharray="3 3" label={STRIKE_LABEL} />
        <ReferenceLine x={breakeven} stroke="#8b96ab" strokeOpacity={0.25} />
        <Area type="linear" dataKey="pnl" stroke="url(#payoff-stroke)" strokeWidth={2.25} fill="url(#payoff-fill)" isAnimationActive={false} />
        <ReferenceDot
          x={Math.round(price / 500) * 500}
          y={pnl}
          r={6}
          fill={pnl >= 0 ? "#34d399" : "#f87171"}
          stroke="#07090f"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
