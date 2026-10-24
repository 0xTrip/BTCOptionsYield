import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Boxes, Hash, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { OptionsBook } from "@/components/OptionsBook";
import { SectionHeading } from "@/components/SectionHeading";
import { PerformanceChart, usePerformance } from "@/components/charts/PerformanceChart";
import { PayoffThumb } from "@/components/charts/PayoffThumb";
import { FEES, NOTICE_DAYS } from "@/config";
import { BOOST_POOL, BOOST_TIERS, DRAW_INTERVAL_BLOCKS, SHARE_PRICE, STRATEGIES, VAULT, nextDraw, toBtc } from "@/data/mock";
import { fmtBtc, fmtCompact, fmtNum, fmtPct, fmtSignedPct, fmtUsd, fmtUsd0 } from "@/lib/format";

const FLOW = [
  { title: "Deposit USDC", body: "Your stablecoins enter the vault and you receive shares priced in USDC." },
  { title: "Sell BTC volatility", body: "Traders pay to hedge Bitcoin. We sell them puts and spreads on Deribit and OKX." },
  { title: "Collect premium", body: "Premium is paid upfront and compounds into the vault share price." },
  { title: `Withdraw at T+${NOTICE_DAYS}`, body: `Request any time. USDC is claimable ${NOTICE_DAYS} days later as positions roll off.` },
];

function workedExample(deposit: number, grossReturn: number) {
  const entryFee = deposit * FEES.deposit;
  const invested = deposit - entryFee;
  const profit = invested * grossReturn;
  const profitShare = profit * FEES.performance;
  const value = invested + profit - profitShare;
  const exitFee = value * FEES.withdraw;
  const receive = value - exitFee;
  return { entryFee, profit, profitShare, exitFee, receive, net: receive / deposit - 1 };
}

export default function Landing() {
  const perf = usePerformance("all");
  const ex = workedExample(10_000, 0.2);
  const draw = nextDraw();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_65%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 size-[44rem] rounded-full bg-accent/[0.13] blur-[140px]" />
        <div
          aria-hidden
          className="display pointer-events-none absolute -bottom-24 right-[-4rem] hidden select-none text-[44rem] leading-none text-accent/[0.04] lg:block"
        >
          ₿
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:pb-24">
          <div className="animate-fade-up">
            <div className="eyebrow flex items-center gap-2 text-accent">
              <span className="size-1.5 bg-accent" /> Bitcoin options vault · USDC
            </div>
            <h1 className="display mt-6 text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[5.4rem]">
              Bitcoin volatility,
              <br />
              paid out as <span className="text-accent">yield.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">
              Deposit USDC. The vault sells Bitcoin options to traders who want protection, and the premium they pay
              compounds into your share price.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/app">
                  Start earning <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#book">See the options book</a>
              </Button>
            </div>
          </div>

          {/* BTC Yield panel */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="eyebrow">BTC Yield · 30D annualised</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-up">
                  <span className="size-1.5 rounded-full bg-up animate-pulse-soft" /> Live
                </span>
              </div>
              <div className="px-5 pt-5">
                <div className="display text-[5.5rem] leading-[0.85] text-accent sm:text-[7.5rem]">{fmtPct(VAULT.apy30d)}</div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                  {[
                    ["Share price", fmtNum(SHARE_PRICE, 4)],
                    ["Since launch", fmtSignedPct(VAULT.returnAll, 1)],
                    ["Premium 30D", fmtCompact(VAULT.premium30d)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="eyebrow text-[10px]">{k}</div>
                      <div className="num mt-1 font-mono text-sm">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="-mb-1 mt-3 pr-3">
                <PerformanceChart data={perf.data} showBtc={false} height={150} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI band */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <KpiGrid className="grid-cols-2 lg:grid-cols-5">
          <Kpi label="Vault TVL" value={fmtCompact(VAULT.tvl)} sub={`≈ ${fmtBtc(toBtc(VAULT.tvl), 1)}`} />
          <Kpi accent label="BTC Yield 30D" value={fmtPct(VAULT.apy30d)} sub="Annualised · variable" />
          <Kpi label="Premium 30D" value={fmtUsd0(VAULT.premium30d)} sub={`≈ ${fmtBtc(toBtc(VAULT.premium30d), 2)}`} />
          <Kpi label="Depositors" value={VAULT.depositors.toLocaleString("en-US")} sub="Active wallets" />
          <Kpi className="col-span-2 lg:col-span-1" label="Venues" value="Deribit · OKX" sub="Institutional accounts" />
        </KpiGrid>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          index="01"
          eyebrow="How it works"
          title={
            <>
              Traders pay for protection.
              <br />
              <span className="text-accent">You collect it.</span>
            </>
          }
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.title} className="group relative bg-surface p-6 transition-colors hover:bg-surface-2">
              <div className="flex items-center justify-between">
                <span className="display text-4xl text-accent">0{i + 1}</span>
                {i < FLOW.length - 1 && <ArrowRight className="hidden size-4 text-faint transition group-hover:translate-x-1 group-hover:text-accent md:block" />}
              </div>
              <h3 className="mt-8 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Options book */}
      <section id="book" className="scroll-mt-28 border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              index="02"
              eyebrow="The options book"
              title="Every position, in the open."
              body="A basket of BTC options that shifts with the market. Selling premium does the heavy lifting; spreads and hedges cap the downside."
            />
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/app/strategies">
                Explore the payoff <ArrowUpRight />
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <OptionsBook compact />
          </div>

          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STRATEGIES.filter((s) => s.id !== "idle").map((s) => (
              <div key={s.id} className="flex flex-col bg-surface p-5">
                <div className="flex items-start justify-between">
                  <span className="eyebrow" style={{ color: s.color }}>{s.short}</span>
                  <PayoffThumb kind={s.payoff} color={s.color} />
                </div>
                <h3 className="mt-2 font-semibold">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] uppercase tracking-wider">
                  <span className="text-faint">{s.risk} risk</span>
                  <span className="text-fg">{s.targetYield}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section id="fees" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading index="03" eyebrow="Fees" title="Simple pricing. We earn when you earn." body="No management fee. Just a small fee on the way in and out, and a share of profits." />
            <KpiGrid className="mt-10 grid-cols-2">
              <Kpi label="Deposit fee" value={fmtPct(FEES.deposit, 0)} />
              <Kpi label="Withdrawal fee" value={fmtPct(FEES.withdraw, 0)} />
              <Kpi accent label="Share of profits" value={fmtPct(FEES.performance, 0)} />
              <Kpi label="Withdrawal notice" value={`T+${NOTICE_DAYS}`} />
            </KpiGrid>
          </div>

          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Example · $10,000 · 12 months</span>
              <span className="eyebrow text-accent">20% gross</span>
            </div>
            <dl className="mt-6 divide-y divide-border font-mono text-[13px]">
              <ExRow k="Deposit" v={fmtUsd(10_000)} />
              <ExRow k={`Deposit fee ${fmtPct(FEES.deposit, 0)}`} v={`−${fmtUsd(ex.entryFee)}`} muted />
              <ExRow k="Options premium earned" v={`+${fmtUsd(ex.profit)}`} up />
              <ExRow k={`Profit share ${fmtPct(FEES.performance, 0)}`} v={`−${fmtUsd(ex.profitShare)}`} muted />
              <ExRow k={`Withdrawal fee ${fmtPct(FEES.withdraw, 0)}`} v={`−${fmtUsd(ex.exitFee)}`} muted />
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-border-strong pt-5">
              <div>
                <div className="eyebrow">You receive</div>
                <div className="display mt-2 text-4xl">{fmtUsd(ex.receive)}</div>
              </div>
              <span className="display text-2xl text-accent">{fmtSignedPct(ex.net, 1)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lucky Boost */}
      <section id="boost" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative overflow-hidden rounded-lg bg-accent p-6 text-accent-fg sm:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgb(0_0_0/0.5)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">04 — Lucky Boost</div>
              <h2 className="display mt-4 text-[2.4rem] leading-[0.95] sm:text-6xl">Hold longer.<br />Win bigger.</h2>
              <p className="mt-5 max-w-md leading-relaxed text-accent-fg/75">
                Every {DRAW_INTERVAL_BLOCKS.toLocaleString("en-US")} blocks (about a month), long-term depositors are drawn
                to win a yield boost on top of normal returns. More USDC for longer means more tickets.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 font-mono text-[12px]">
                <span className="inline-flex items-center gap-2 rounded-md bg-accent-fg/90 px-3 py-2 text-accent">
                  <Ticket className="size-3.5" /> balance × days held ÷ 1,000
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-accent-fg/25 px-3 py-2">
                  <Hash className="size-3.5" /> Next draw · block {draw.block.toLocaleString("en-US")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-accent-fg/25 px-3 py-2">
                  <Boxes className="size-3.5" /> Winners picked from the block hash
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {BOOST_TIERS.map((t, i) => (
                <div key={t.label} className={`rounded-md px-2 py-5 text-center sm:p-6 ${i === 0 ? "bg-accent-fg text-accent" : "bg-accent-fg/10"}`}>
                  <div className="display text-4xl sm:text-5xl">{t.multiplier}</div>
                  <div className="mt-2 text-sm font-semibold">{t.label}</div>
                  <div className="mt-1 font-mono text-[11px] opacity-70">{t.winners} {t.winners === 1 ? "winner" : "winners"}</div>
                </div>
              ))}
              <p className="col-span-3 text-center font-mono text-[11px] text-accent-fg/70">
                Funded by a {fmtUsd0(BOOST_POOL.monthlyBudget)} monthly budget from protocol fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="eyebrow text-accent">BTC Yield · {fmtPct(VAULT.apy30d)} · 30D annualised</div>
          <h2 className="display mt-6 max-w-4xl text-[2.6rem] leading-[0.95] sm:text-7xl">
            Put your USDC to work on <span className="text-accent">Bitcoin.</span>
          </h2>
          <Button asChild size="lg" className="mt-10">
            <Link to="/app">
              Launch App <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function ExRow({ k, v, muted, up }: { k: string; v: string; muted?: boolean; up?: boolean }) {
  return (
    <div className="flex justify-between py-3">
      <dt className="text-muted">{k}</dt>
      <dd className={`num ${muted ? "text-muted" : up ? "text-up" : "text-fg"}`}>{v}</dd>
    </div>
  );
}
