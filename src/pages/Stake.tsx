import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { Panel } from "@/components/Panel";
import { StakePanel } from "@/components/StakePanel";
import { Tk } from "@/components/TokenIcon";
import { RateChart, useRateHistory, type Range } from "@/components/charts/RateChart";
import { EARN, EPOCH_DAYS, TICKER, VAULT } from "@/config";
import { EPOCHS, PROTOCOL, RATE } from "@/data/mock";
import { fmtCompact, fmtNum, fmtPct, fmtSigned, fmtSignedPct, fmtUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAccount } from "@/store/useAccount";

const RANGES: { value: Range; label: string }[] = [
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" },
];

/** Where stakers' income came from over the last four epochs */
function useSources() {
  const recent = EPOCHS.slice(-4);
  const fees = recent.reduce((s, e) => s + e.fees, 0);
  const premium = recent.reduce((s, e) => s + e.toStakers - e.fees, 0);
  const staked = recent.reduce((s, e) => s + e.staked, 0) / recent.length;
  const annualise = (x: number) => (x / staked) * (365 / (EPOCH_DAYS * recent.length));
  return [
    { k: "Stability fees", sub: `${fmtPct(VAULT.stabilityFee, 0)} a year on every ${TICKER.stable} of vault debt`, v: fees, apr: annualise(fees) },
    { k: `${TICKER.collateral} options premium`, sub: `${fmtPct(EARN.split.stakers, 0)} of Earn mode premium`, v: premium, apr: annualise(premium) },
  ];
}

export default function Stake() {
  const connected = useAccount((s) => s.connected);
  const shares = useAccount((s) => s.shares);
  const stakeCost = useAccount((s) => s.stakeCost);
  const [range, setRange] = useState<Range>("90d");
  const history = useRateHistory(range);
  const sources = useSources();
  const total = sources.reduce((s, x) => s + x.v, 0);

  const staked = shares * RATE;
  const earned = staked - stakeCost;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="animate-fade-up">
        <div className="eyebrow">
          Stake · swap 1:1 with {TICKER.base}
        </div>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Stake {TICKER.stable}</h1>
      </div>

      <KpiGrid className="mt-8 grid-cols-2 lg:grid-cols-4">
        <Kpi
          accent
          label={<><Tk asset="staked" /> APY 30D</>}
          tip={`Change in the ${TICKER.staked} rate over the last 30 days, annualised. Variable.`}
          value={fmtPct(PROTOCOL.apy30d)}
          sub="Fees + options premium"
        />
        {connected ? (
          <>
            <Kpi label="Your stake" value={fmtUsd(staked)} sub={`${fmtNum(shares, 2)} ${TICKER.staked}`} />
            <Kpi
              label="Earned"
              value={<span className={earned >= 0 ? "text-up" : "text-down"}>{fmtSigned(earned)}</span>}
              sub={stakeCost > 0 ? `${fmtSignedPct(earned / stakeCost, 2)} on ${fmtUsd(stakeCost)}` : "Nothing staked yet"}
            />
          </>
        ) : (
          <>
            <Kpi label={`${TICKER.stable} staked`} value={fmtCompact(PROTOCOL.staked)} sub={`${fmtPct(PROTOCOL.stakedShare, 0)} of supply`} />
            <Kpi label="Paid to stakers" value={fmtCompact(EPOCHS.reduce((s, e) => s + e.toStakers, 0))} sub="Since launch" />
          </>
        )}
        <Kpi label="Exchange rate" value={fmtNum(RATE, 4)} sub={`${TICKER.stable} per ${TICKER.staked}`} />
      </KpiGrid>

      <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          <Panel title={<><Tk asset="staked" /> value</>} right={<Segmented value={range} onChange={setRange} options={RANGES} />}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="display text-4xl text-accent">{fmtSignedPct(history.change, 2)}</span>
              <span className="font-mono text-xs text-muted">
                1 {TICKER.staked} = <span className="num text-fg">{fmtNum(RATE, 4)}</span> {TICKER.stable}
              </span>
            </div>
            <div className="-ml-2 mt-6">
              <RateChart data={history.data} height={260} />
            </div>
          </Panel>

          <Panel title="Where the yield comes from · last 4 epochs">
            <ul className="space-y-5">
              {sources.map((s, i) => (
                <li key={s.k}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{s.k}</span>
                    <span className="num font-mono text-[13px]">
                      {fmtCompact(s.v)} <span className="text-faint">· {fmtPct(s.apr)} APR</span>
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">{s.sub}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <div className={cn("h-full rounded-full", i === 0 ? "bg-fg/60" : "bg-accent")} style={{ width: `${(s.v / total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Stakers don't sell the options themselves and never pay out on them: calls are covered by vault {TICKER.collateral}. Staked{" "}
              {TICKER.stable} earns on the whole system, so the APY is higher than the fee rate alone.
            </p>
          </Panel>
        </div>

        <div className="order-first lg:order-none lg:sticky lg:top-28">
          <StakePanel />
        </div>
      </div>
    </div>
  );
}
