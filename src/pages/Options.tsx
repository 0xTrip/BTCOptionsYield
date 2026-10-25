import { useDeferredValue, useState, type ReactNode } from "react";
import { CalendarClock, Layers, Power, ShieldCheck } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { InfoTip } from "@/components/ui/tooltip";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { OptionsBook } from "@/components/OptionsBook";
import { SectionHeading } from "@/components/SectionHeading";
import { Tk } from "@/components/TokenIcon";
import { CoveredCallChart, EARN_OFF, EARN_ON } from "@/components/charts/CoveredCallChart";
import { CALLED_COLOR, EpochChart, PREMIUM_COLOR } from "@/components/charts/EpochChart";
import { EARN, TICKER } from "@/config";
import { BOOK_STATS, EPOCHS, HYPE, PROTOCOL } from "@/data/mock";
import { fmtCompact, fmtCompactNum, fmtNum, fmtPct, fmtPrice, fmtShortDate, fmtSigned0, fmtSignedPct, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAccount } from "@/store/useAccount";

const RULES = [
  {
    icon: ShieldCheck,
    title: "Always covered",
    body: `Calls are only sold against ${TICKER.collateral} sitting in Earn mode vaults, never more. There's no naked exposure.`,
  },
  {
    icon: Layers,
    title: "Well out of the money",
    body: `Strikes sit at least ${fmtPct(EARN.minStrikeDistance, 0)} above spot, usually about 20%, so most weeks the calls expire worthless.`,
  },
  {
    icon: CalendarClock,
    title: "Weekly, cash-settled",
    body: `Calls expire every Friday 08:00 UTC on Deribit and Bybit. ${TICKER.collateral} only leaves a vault if the price closes above the strike.`,
  },
  {
    icon: Power,
    title: "Opt in, opt out",
    body: "Earn mode is a switch on each vault. Changes take effect from the next epoch.",
  },
];

export default function Options() {
  const connected = useAccount((s) => s.connected);
  const vault = useAccount((s) => s.vault);
  const mine = connected && vault && vault.collateral > 0;
  const hype = mine ? vault.collateral : 1_000;

  const strike = BOOK_STATS.strike;
  const premium = BOOK_STATS.perHype * EARN.split.vaults;
  const min = HYPE.spot * 0.6;
  const max = HYPE.spot * 1.6;
  const [price, setPrice] = useState(HYPE.spot);
  const chartPrice = useDeferredValue(price);

  const on = hype * (Math.min(price, strike) + premium);
  const off = hype * price;
  const diff = on - off;
  const crossover = strike + premium;
  const recent = EPOCHS.slice(-8).reverse();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        className="animate-fade-up"
        eyebrow={`${TICKER.collateral} options`}
        title={
          <>
            Earn mode: <span className="text-accent">covered calls</span> on vault {TICKER.collateral}
          </>
        }
        body={
          <>
            Each week the protocol sells call options on the {TICKER.collateral} in Earn mode vaults, struck well above spot. Buyers pay for the
            upside; {fmtPct(EARN.split.vaults, 0)} of that premium repays the vaults' debt, {fmtPct(EARN.split.stakers, 0)} goes to {TICKER.staked}{" "}
            stakers.
          </>
        }
      />

      <KpiGrid className="mt-10 grid-cols-2 lg:grid-cols-5">
        <Kpi label={`${TICKER.collateral} in Earn mode`} value={fmtCompactNum(PROTOCOL.earnHype)} sub={`${fmtPct(PROTOCOL.earnShare, 0)} of locked ${TICKER.collateral}`} />
        <Kpi label="Premium this epoch" value={fmtUsd0(BOOK_STATS.premium)} sub={`${fmtPrice(BOOK_STATS.perHype)} per ${TICKER.collateral}`} />
        <Kpi
          accent
          label="Earn mode yield"
          tip={`Premium paid to vaults over the last 4 epochs, annualised on the value of their ${TICKER.collateral}. Before any gains given up above the strike.`}
          value={fmtPct(PROTOCOL.earnYield)}
          sub="Annualised · to vaults"
        />
        <Kpi label="Repaid to date" value={fmtCompact(PROTOCOL.toVaultsToDate)} sub={`${TICKER.stable} debt paid by premium`} />
        <Kpi
          className="col-span-2 lg:col-span-1"
          label="Weeks in the money"
          value={`${PROTOCOL.calledAwayWeeks} of ${EPOCHS.length}`}
          sub={`${TICKER.collateral} closed above the strike`}
        />
      </KpiGrid>

      {/* Explorer */}
      <section className="card mt-4 overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="eyebrow text-fg">{mine ? "Your vault at expiry" : `${fmtNum(hype, 0)} ${TICKER.collateral} at expiry`}</h2>
          <span className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4" style={{ background: EARN_ON }} />
              Earn mode
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4" style={{ background: EARN_OFF }} />
              Plain {TICKER.collateral}
            </span>
          </span>
        </header>
        <div className="grid lg:grid-cols-5">
          <div className="border-b border-border p-5 sm:p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
            <p className="text-sm text-muted">
              This week's call is struck at {fmtPrice(strike, 0)}. Drag the price to compare {mine ? "your vault" : "a vault"} with and without Earn mode
              at Friday's settlement.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="eyebrow text-[10px]">{TICKER.collateral} at expiry</span>
                <span className="display text-3xl">{fmtPrice(price)}</span>
              </div>
              <Slider min={min} max={max} step={(max - min) / 300} value={[price]} onValueChange={([p]) => setPrice(p)} aria-label={`${TICKER.collateral} price at expiry`} />
              <div className="flex justify-between font-mono text-[10px] text-faint">
                <span>{fmtSignedPct(-0.4, 0)}</span>
                <span>Spot {fmtPrice(HYPE.spot)}</span>
                <span>{fmtSignedPct(0.6, 0)}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
              <Metric label="Premium to vault" value={<span className="text-accent">{fmtUsd0(hype * premium)}</span>} />
              <Metric label="Strike" value={fmtPrice(strike, 0)} />
              <Metric
                label="Earn mode ahead below"
                tip={`Strike plus the ${fmtPrice(premium)} premium per ${TICKER.collateral}. Above this price, plain ${TICKER.collateral} would have done better this week.`}
                value={fmtPrice(crossover)}
              />
              <Metric label="Difference" value={<span className={diff >= 0 ? "text-up" : "text-fg"}>{fmtSigned0(diff)}</span>} />
            </div>

            <p className={cn("mt-5 border-l-2 pl-4 text-sm leading-relaxed text-muted transition-colors", diff >= 0 ? "border-up" : "border-fg/40")}>
              {price <= strike ? (
                <>
                  The call expires worthless. {mine ? "Your vault" : "The vault"} keeps all its {TICKER.collateral} and{" "}
                  <span className="text-up">{fmtUsd0(hype * premium)} of premium</span> comes off the debt.
                </>
              ) : diff >= 0 ? (
                <>
                  {TICKER.collateral} closes above the strike. The vault pays out {fmtUsd0(hype * (price - strike))}, but the premium still leaves it{" "}
                  <span className="text-up">{fmtUsd0(diff)} ahead</span>.
                </>
              ) : (
                <>
                  A big week: gains above {fmtPrice(strike, 0)} go to the call buyer, so the vault ends {fmtUsd0(-diff)} behind plain {TICKER.collateral}. It's still
                  worth more than at the start of the week, so it's no closer to liquidation.
                </>
              )}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <div className="text-faint">Earn mode</div>
                <div className="num text-fg">{fmtUsd0(on)}</div>
              </div>
              <div>
                <div className="text-faint">Plain {TICKER.collateral}</div>
                <div className="num text-fg">{fmtUsd0(off)}</div>
              </div>
            </div>
          </div>

          <div className="p-3 pt-6 sm:p-6 lg:col-span-3">
            <div className="mb-2 px-2 sm:px-0">
              <span className="eyebrow text-[10px]">Vault value at expiry</span>
            </div>
            <div className="h-[300px] sm:h-[360px] lg:h-[460px]">
              <CoveredCallChart hype={hype} strike={strike} premium={premium} spot={HYPE.spot} price={chartPrice} min={min} max={max} />
            </div>
          </div>
        </div>
      </section>

      {/* Book */}
      <section className="mt-16">
        <SectionHeading eyebrow="This epoch" title="The calls" body="One strike for every vault, split across venues for liquidity." />
        <div className="mt-8">
          <OptionsBook />
        </div>
      </section>

      {/* History */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="History"
          title="Premium, week by week"
          body={`Most weeks the calls expire worthless and the premium is pure income. In ${PROTOCOL.calledAwayWeeks} of ${EPOCHS.length} weeks ${TICKER.collateral} rallied past the strike and vaults paid out part of the gain.`}
        />
        <div className="card mt-8 p-5 pr-3">
          <div className="mb-4 flex gap-4 font-mono text-[10px] uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: PREMIUM_COLOR }} />
              Expired worthless
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: CALLED_COLOR }} />
              Closed above strike
            </span>
          </div>
          <EpochChart height={220} />
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Epoch", "Settled", `${TICKER.collateral} open → close`, "Strike", "Premium", "To vaults", <>To <Tk asset="staked" /></>, "Result"].map((h, i) => (
                    <th key={i} className={cn("eyebrow px-4 py-3 text-[10px] font-medium", i > 1 && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[12.5px]">
                {recent.map((e) => (
                  <tr key={e.n} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">E{e.n}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtShortDate(e.settledAt)}</td>
                    <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">
                      {fmtPrice(e.open)} → <span className="text-fg">{fmtPrice(e.close)}</span>
                    </td>
                    <td className="num px-4 py-3 text-right">{fmtPrice(e.strike, 0)}</td>
                    <td className="num px-4 py-3 text-right text-accent">{fmtUsd0(e.premium)}</td>
                    <td className="num px-4 py-3 text-right">{fmtUsd0(e.toVaults)}</td>
                    <td className="num px-4 py-3 text-right">{fmtUsd0(e.toStakers - e.fees)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {e.calledAway ? <span className="text-fg">Paid {fmtUsd0(e.givenUp)}</span> : <span className="text-faint">Expired</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((r) => (
          <div key={r.title} className="bg-surface p-6">
            <r.icon className="size-5 text-accent" />
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value, tip }: { label: string; value: ReactNode; tip?: string }) {
  return (
    <div className="bg-surface p-3.5">
      <div className="flex items-center gap-1">
        <span className="eyebrow text-[10px]">{label}</span>
        {tip && <InfoTip content={tip} />}
      </div>
      <div className="display mt-2 text-xl">{value}</div>
    </div>
  );
}
