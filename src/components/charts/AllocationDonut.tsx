import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { STRATEGIES, type StrategyId } from "@/data/mock";
import { fmtCompact, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AllocationDonut({
  allocation,
  total,
  centerLabel = "Deployed",
  stacked,
}: {
  allocation: Record<StrategyId, number>;
  total?: number;
  centerLabel?: string;
  stacked?: boolean;
}) {
  const data = STRATEGIES.map((s) => ({ name: s.short, value: allocation[s.id], color: s.color })).filter((d) => d.value > 0);
  const deployed = 1 - allocation.idle;

  return (
    <div className={cn("flex flex-col items-center gap-6", !stacked && "sm:flex-row")}>
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="72%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={600}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="num text-2xl font-semibold">{fmtPct(deployed, 0)}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {STRATEGIES.map((s) => (
          <li key={s.id} className="flex items-center gap-3 text-sm">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 whitespace-nowrap text-muted">{s.short}</span>
            {total !== undefined && (
              <span className="num text-xs text-faint">{fmtCompact(total * allocation[s.id])}</span>
            )}
            <span className="num w-10 text-right font-medium">{fmtPct(allocation[s.id], 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
