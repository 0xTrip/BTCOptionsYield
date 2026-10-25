import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { OptionsBook } from "@/components/OptionsBook";
import { SectionHeading } from "@/components/SectionHeading";
import { Tk, TokenIcon } from "@/components/TokenIcon";
import { CoveredCallChart, EARN_OFF, EARN_ON } from "@/components/charts/CoveredCallChart";
import { EpochChart } from "@/components/charts/EpochChart";
import { EARN, SWAP_FEE, TICKER, VAULT } from "@/config";
import { BOOK_STATS, HYPE, LIVE_EPOCH, PROTOCOL, RATE, liquidationPrice } from "@/data/mock";
import { fmtCompact, fmtCompactNum, fmtNum, fmtPct, fmtPrice, fmtRatio, fmtUsd, fmtUsd0 } from "@/lib/format";

const FLOW = [
  { title: `Lock ${TICKER.collateral}`, body: `Deposit ${TICKER.collateral} into a vault. It stays yours, and so does the upside.` },
  {
    title: `Mint ${TICKER.stable}`,
    body: `Borrow ${TICKER.stable} against it, up to ${fmtPct(1 / VAULT.minRatio, 0)} of its value, for a ${fmtPct(VAULT.stabilityFee, 0)} stability fee.`,
  },
  {
    title: "Turn on Earn mode",
    body: `The protocol sells weekly covered calls on your ${TICKER.collateral}. The premium pays down your loan.`,
  },
  {
    title: `Stake ${TICKER.stable}`,
    body: `${TICKER.staked} earns the stability fees plus ${fmtPct(EARN.split.stakers, 0)} of the options premium.`,
  },
];

/** 1,000 HYPE, 20,000 USDH, and a year of Earn mode at today's rate */
const EXAMPLE = (() => {
  const hype = 1_000;
  const debt = 20_000;
  const value = hype * HYPE.spot;
  const premium = value * PROTOCOL.earnYield;
  return { hype, debt, value, ratio: value / debt, liq: liquidationPrice(hype, debt), premium, after: Math.max(0, debt - premium) };
})();

export default function Landing() {
  const strikeDistance = BOOK_STATS.strike / HYPE.spot - 1;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_65%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 size-[44rem] rounded-full bg-accent/[0.08] blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:pb-24">
          <div className="animate-fade-up">
            <div className="eyebrow flex items-center gap-2 text-accent">
              <span className="size-1.5 bg-accent" /> {TICKER.collateral}-backed stablecoin
            </div>
            <h1 className="display mt-6 text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[5.2rem]">
              Mint dollars
              <br />
              against {TICKER.collateral}.
              <br />
              <span className="text-accent">Let options repay them.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">
              Lock {TICKER.collateral} in a vault and mint {TICKER.stable}, a dollar stablecoin. Switch on Earn mode and the protocol sells weekly
              covered calls on your {TICKER.collateral}. The premium pays down your loan.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/app">
                  Open a vault <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#earn">How Earn mode works</a>
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="eyebrow">Earn mode yield · annualised</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-up">
                  <span className="size-1.5 rounded-full bg-up animate-pulse-soft" /> Epoch {LIVE_EPOCH}
                </span>
              </div>
              <div className="px-5 pt-5">
                <div className="display text-[5.5rem] leading-[0.85] text-accent sm:text-[7.5rem]">{fmtPct(PROTOCOL.earnYield)}</div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                  {[
                    ["This week's strike", `${fmtPrice(BOOK_STATS.strike, 0)} · +${fmtPct(strikeDistance, 0)}`],
                    ["Debt repaid", fmtCompact(PROTOCOL.toVaultsToDate)],
                    [<><Tk asset="staked" /> APY</>, fmtPct(PROTOCOL.apy30d)],
                  ].map(([k, v], i) => (
                    <div key={i}>
                      <div className="eyebrow text-[10px]">{k}</div>
                      <div className="num mt-1 font-mono text-sm">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 px-3">
                <EpochChart height={110} axes={false} />
              </div>
              <div className="px-5 pb-4 pt-2 font-mono text-[10px] uppercase tracking-wider text-faint">Premium per week, last {PROTOCOL.lastEpoch.n} weeks</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI band */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <KpiGrid className="grid-cols-2 lg:grid-cols-5">
          <Kpi label={`${TICKER.collateral} locked`} value={fmtCompactNum(PROTOCOL.hypeLocked)} sub={`≈ ${fmtCompact(PROTOCOL.collateralValue)}`} />
          <Kpi label={`${TICKER.stable} supply`} value={fmtCompact(PROTOCOL.supply)} sub={`${PROTOCOL.vaults.toLocaleString("en-US")} vaults`} />
          <Kpi label="Collateral ratio" value={fmtRatio(PROTOCOL.systemRatio)} sub="Across all vaults" />
          <Kpi accent label="Earn mode yield" value={fmtPct(PROTOCOL.earnYield)} sub={`Premium on ${TICKER.collateral}, annualised`} />
          <Kpi className="col-span-2 lg:col-span-1" label={<><Tk asset="staked" /> APY 30D</>} value={fmtPct(PROTOCOL.apy30d)} sub="Fees + premium" />
        </KpiGrid>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          index="01"
          eyebrow="How it works"
          title={
            <>
              Keep your {TICKER.collateral}.
              <br />
              <span className="text-accent">Spend the dollars.</span>
            </>
          }
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.title} className="group relative bg-surface p-6 transition-colors hover:bg-surface-2">
              <div className="flex items-center justify-between">
                <span className="display text-4xl text-accent">0{i + 1}</span>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="hidden size-4 text-faint transition group-hover:translate-x-1 group-hover:text-accent md:block" />
                )}
              </div>
              <h3 className="mt-8 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vaults */}
      <section id="vaults" className="scroll-mt-28 border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              index="02"
              eyebrow="Vaults"
              title={`A ${TICKER.collateral} vault works like any CDP.`}
              body={`Every ${TICKER.stable} is backed by at least ${fmtPct(VAULT.minRatio, 0)} of its value in ${TICKER.collateral} when it's minted. Vaults that fall below ${fmtPct(VAULT.liquidationRatio, 0)} are liquidated, which keeps the system overcollateralised.`}
            />
            <KpiGrid className="mt-10 grid-cols-2">
              <Kpi label="Minimum ratio to mint" value={fmtPct(VAULT.minRatio, 0)} sub={`${fmtPct(1 / VAULT.minRatio, 0)} loan-to-value`} />
              <Kpi label="Liquidation ratio" value={fmtPct(VAULT.liquidationRatio, 0)} sub={`${fmtPct(VAULT.liquidationPenalty, 0)} penalty`} />
              <Kpi label="Stability fee" value={fmtPct(VAULT.stabilityFee, 0)} sub={<>A year, paid to <Tk asset="staked" /></>} />
              <Kpi label={`${TICKER.base} swap`} value="1:1" sub={`${fmtPct(SWAP_FEE, 2)} fee, either way`} />
            </KpiGrid>
          </div>

          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                Example · {fmtNum(EXAMPLE.hype, 0)} {TICKER.collateral}
              </span>
              <span className="eyebrow text-accent">Earn mode on</span>
            </div>
            <dl className="mt-6 divide-y divide-border font-mono text-[13px]">
              <ExRow k={`Lock ${fmtNum(EXAMPLE.hype, 0)} ${TICKER.collateral} at ${fmtPrice(HYPE.spot)}`} v={fmtUsd(EXAMPLE.value)} />
              <ExRow k={`Mint ${TICKER.stable}`} v={`${fmtNum(EXAMPLE.debt, 0)} ${TICKER.stable}`} />
              <ExRow k="Collateral ratio" v={fmtRatio(EXAMPLE.ratio)} muted />
              <ExRow k="Liquidation price" v={`${fmtPrice(EXAMPLE.liq)} (−${fmtPct(1 - EXAMPLE.liq / HYPE.spot, 0)})`} muted />
              <ExRow k={`Premium over a year at ${fmtPct(PROTOCOL.earnYield)}`} v={`−${fmtUsd0(EXAMPLE.premium)} debt`} up />
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-border-strong pt-5">
              <div>
                <div className="eyebrow">Debt after 12 months</div>
                <div className="display mt-2 text-4xl">
                  {fmtNum(EXAMPLE.after, 0)} <span className="text-xl text-muted">{TICKER.stable}</span>
                </div>
              </div>
              <span className="display text-2xl text-accent">−{fmtPct(1 - EXAMPLE.after / EXAMPLE.debt, 0)}</span>
            </div>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-faint">
              Assumes today's yield and {TICKER.collateral} price hold for a year, before the stability fee. In weeks when {TICKER.collateral} rallies
              past the strike, the vault gives up the gain above it.
            </p>
          </div>
        </div>
      </section>

      {/* Earn mode */}
      <section id="earn" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              index="03"
              eyebrow={`Earn mode · ${TICKER.collateral} options`}
              title="Sell the upside you weren't going to use."
              body={`Traders pay up for ${TICKER.collateral} calls. Earn mode sells them calls struck about 20% above spot, covered by the ${TICKER.collateral} already in your vault.`}
            />
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
              <li className="border-l-2 border-accent pl-4">
                <span className="text-fg">Most weeks the calls expire worthless.</span> You keep all your {TICKER.collateral}, and{" "}
                {fmtPct(EARN.split.vaults, 0)} of the premium comes off your debt.
              </li>
              <li className="border-l-2 border-border-strong pl-4">
                <span className="text-fg">In a big week you keep every gain up to the strike.</span> Anything above it goes to the call buyer. That
                happened in {PROTOCOL.calledAwayWeeks} of {PROTOCOL.lastEpoch.n} weeks so far.
              </li>
              <li className="border-l-2 border-border-strong pl-4">
                <span className="text-fg">It can't push a vault toward liquidation.</span> Below the strike, the premium only adds a cushion.
              </li>
            </ul>
          </div>
          <div className="card p-4 pt-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <span className="eyebrow">1,000 {TICKER.collateral} at Friday's expiry</span>
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
            </div>
            <div className="h-[280px] sm:h-[340px]">
              <CoveredCallChart
                hype={1_000}
                strike={BOOK_STATS.strike}
                premium={BOOK_STATS.perHype * EARN.split.vaults}
                spot={HYPE.spot}
                price={HYPE.spot}
                min={HYPE.spot * 0.6}
                max={HYPE.spot * 1.6}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="display text-2xl">This week's calls</h3>
          <Button asChild variant="secondary" className="shrink-0">
            <Link to="/app/options">
              Explore Earn mode <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="mt-6">
          <OptionsBook compact />
        </div>
      </section>

      {/* Stake */}
      <section id="stake" className="scroll-mt-28 border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            index="04"
            eyebrow="Stake"
            title={
              <>
                Hold {TICKER.stable}. Or stake it for <span className="text-accent">{fmtPct(PROTOCOL.apy30d)}.</span>
              </>
            }
            body={`${TICKER.staked} earns every stability fee in the system plus ${fmtPct(EARN.split.stakers, 0)} of Earn mode premium. No lockup: unstake any time. ${TICKER.stable} also swaps 1:1 with ${TICKER.base}.`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {(["stable", "staked"] as const).map((a) => (
              <div key={a} className={a === "staked" ? "card relative overflow-hidden border-accent/50 p-6" : "card p-6"}>
                {a === "staked" && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
                <div className="flex items-center gap-3">
                  <TokenIcon asset={a} className="size-9" />
                  <span className="display text-2xl">{TICKER[a]}</span>
                </div>
                <dl className="mt-5 divide-y divide-border border-t border-border text-sm">
                  {(a === "stable"
                    ? [
                        ["Price", `1 ${TICKER.base}`],
                        ["Yield", "None"],
                        ["Backed by", `${fmtRatio(PROTOCOL.systemRatio)} in ${TICKER.collateral}`],
                      ]
                    : [
                        ["Price", `${fmtNum(RATE, 4)} ${TICKER.stable}`],
                        ["Yield", `${fmtPct(PROTOCOL.apy30d)} APY`],
                        ["Lockup", "None"],
                      ]
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="eyebrow text-accent">
            Earn mode · {fmtPct(PROTOCOL.earnYield)} on {TICKER.collateral}
          </div>
          <h2 className="display mt-6 max-w-4xl text-[2.6rem] leading-[0.95] sm:text-7xl">
            Your {TICKER.collateral}, <span className="text-accent">working.</span>
          </h2>
          <Button asChild size="lg" className="mt-10">
            <Link to="/app">
              Open a vault <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function ExRow({ k, v, muted, up }: { k: string; v: string; muted?: boolean; up?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-muted">{k}</dt>
      <dd className={`num text-right ${muted ? "text-muted" : up ? "text-up" : "text-fg"}`}>{v}</dd>
    </div>
  );
}
