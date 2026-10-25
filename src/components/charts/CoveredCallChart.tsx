import { memo, useMemo } from "react";
import { Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { TICKER } from "@/config";
import { fmtCompact, fmtPrice, fmtUsd0 } from "@/lib/format";

const STEPS = 160;
export const EARN_ON = "#c8f53c";
export const EARN_OFF = "#8a867f";

// Stable prop objects: Recharts re-registers reference elements whenever these change identity
const label = (value: string, fill: string) => ({ value, position: "top", fill, fontSize: 10, fontFamily: "Geist Mono Variable" }) as const;
const SPOT_LABEL = label("SPOT", "#f6f4f1");
const STRIKE_LABEL = label("STRIKE", "#a8a29e");
const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 };
const TICK = { fill: "#6f6964", fontSize: 10, fontFamily: "Geist Mono Variable" };
const CURSOR = { stroke: "#33312e" };

type Point = { price: number; on: number; off: number };

function ValueTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Point;
  return (
    <div className="rounded-md border border-border-strong bg-surface-2 px-3 py-2 font-mono text-[11px] shadow-xl">
      <div className="mb-1 text-muted">
        {TICKER.collateral} at {fmtPrice(d.price)}
      </div>
      <div className="flex justify-between gap-6">
        <span className="flex items-center gap-1.5">
          <i className="h-0.5 w-3" style={{ background: EARN_ON }} />
          Earn mode
        </span>
        <span className="num font-medium">{fmtUsd0(d.on)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="flex items-center gap-1.5">
          <i className="h-0.5 w-3" style={{ background: EARN_OFF }} />
          Plain {TICKER.collateral}
        </span>
        <span className="num font-medium">{fmtUsd0(d.off)}</span>
      </div>
    </div>
  );
}

/** Value of a vault's HYPE at expiry, with and without this week's covered call */
export const CoveredCallChart = memo(function CoveredCallChart({
  hype,
  strike,
  premium,
  spot,
  price,
  min,
  max,
}: {
  hype: number;
  strike: number;
  /** Premium credited to the vault, per HYPE */
  premium: number;
  spot: number;
  price: number;
  min: number;
  max: number;
}) {
  const { data, step, ticks } = useMemo(() => {
    const step = (max - min) / STEPS;
    const data: Point[] = Array.from({ length: STEPS + 1 }, (_, i) => {
      const p = min + i * step;
      return { price: p, on: hype * (Math.min(p, strike) + premium), off: hype * p };
    });
    const ticks = Array.from({ length: 7 }, (_, i) => min + ((max - min) * i) / 6);
    return { data, step, ticks };
  }, [hype, strike, premium, min, max]);

  const x = min + Math.round((price - min) / step) * step;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={MARGIN}>
        <XAxis
          dataKey="price"
          type="number"
          domain={[min, max]}
          ticks={ticks}
          tickFormatter={(v: number) => fmtPrice(v, 0)}
          tick={TICK}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis tickFormatter={(v: number) => fmtCompact(v)} tick={TICK} axisLine={false} tickLine={false} width={56} />
        <Tooltip cursor={CURSOR} content={ValueTooltip} />
        <ReferenceLine x={spot} stroke="#f6f4f1" strokeOpacity={0.4} strokeDasharray="3 3" label={SPOT_LABEL} />
        <ReferenceLine x={strike} stroke="#a8a29e" strokeOpacity={0.5} strokeDasharray="3 3" label={STRIKE_LABEL} />
        <Line type="linear" dataKey="off" stroke={EARN_OFF} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Line type="linear" dataKey="on" stroke={EARN_ON} strokeWidth={2} dot={false} isAnimationActive={false} />
        <ReferenceDot x={x} y={hype * (Math.min(x, strike) + premium)} r={6} fill={EARN_ON} stroke="#050505" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
});
