import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, ChartCandlestick, FileText, Sparkles, Ticket, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PerformanceChart, usePerformance } from "@/components/charts/PerformanceChart";
import { PayoffThumb } from "@/components/charts/PayoffThumb";
import { FEES, NOTICE_DAYS } from "@/config";
import { BOOST_POOL, BOOST_TIERS, SHARE_PRICE, STRATEGIES, VAULT } from "@/data/mock";
import { fmtCompact, fmtNum, fmtPct, fmtSignedPct, fmtUsd, fmtUsd0 } from "@/lib/format";

const SAMPLE_POSITIONS = [
  { name: "BTC $73k Put", meta: "Sold · 29 Nov", pnl: 1200 },
  { name: "BTC $70k / $65k Put spread", meta: "Sold · 29 Nov", pnl: 640 },
  { name: "BTC $100k Call", meta: "Bought · 26 Dec", pnl: -310 },
];

const STEPS = [
  {
    icon: Wallet,
    title: "Deposit USDC",
    body: "Connect your wallet and deposit stablecoins. You receive vault shares that track the vault's value.",
  },
  {
    icon: ChartCandlestick,
    title: "We run the options book",
    body: "Professional traders sell BTC puts, run spreads and add hedges, adjusting the basket as the market moves.",
  },
  {
    icon: CalendarClock,
    title: "Earn, then withdraw",
    body: `Yield accrues to your share price. Request a withdrawal any time and claim it after ${NOTICE_DAYS} days.`,
  },
];

function workedExample(deposit: number, grossReturn: number) {
  const entryFee = deposit * FEES.deposit;
  const invested = deposit - entryFee;
  const profit = invested * grossReturn;
  const profitShare = profit * FEES.performance;
  const value = invested + profit - profitShare;
  const exitFee = value * FEES.withdraw;
  const receive = value - exitFee;
  return { entryFee, invested, profit, profitShare, exitFee, receive, net: receive / deposit - 1 };
}

export default function Landing() {
  const perf = usePerformance("all");
  const ex = workedExample(10_000, 0.2);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:pb-24">
          <div className="animate-fade-up">
            <Badge tone="accent" className="px-3 py-1 text-xs">
              <span className="size-1.5 rounded-full bg-accent" /> Bitcoin options · USDC vault
            </Badge>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Put your stablecoins to work in <span className="text-gradient">Bitcoin options</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Deposit USDC into a professionally managed basket of BTC options strategies. Earn yield from option
              premiums without managing a single trade.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/app">
                  Launch App <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#how">How it works</a>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                ["Current yield", fmtPct(VAULT.apy30d)],
                ["Vault TVL", fmtCompact(VAULT.tvl)],
                ["Notice period", `T+${NOTICE_DAYS}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="num mt-1 text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-accent-2/10 blur-2xl" />
            <div className="card relative p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted">Vault share price</div>
                  <div className="num mt-1 text-3xl font-semibold">
                    {fmtNum(SHARE_PRICE, 4)} <span className="text-base font-medium text-muted">USDC</span>
                  </div>
                </div>
                <Badge tone="up" className="num text-xs">
                  {fmtSignedPct(perf.vaultReturn, 2)} · 6M
                </Badge>
              </div>
              <div className="-ml-2 mt-4">
                <PerformanceChart data={perf.data} showBtc={false} height={190} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted">
                  <span>Open positions</span>
                  <span>Unrealised P&amp;L</span>
                </div>
                <ul className="space-y-1">
                  {SAMPLE_POSITIONS.map((p) => (
                    <li key={p.name} className="flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-faint">{p.meta}</div>
                      </div>
                      <span className={`num text-sm font-medium ${p.pnl >= 0 ? "text-up" : "text-down"}`}>
                        {p.pnl >= 0 ? "+" : "−"}
                        {fmtUsd0(Math.abs(p.pnl))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/70 bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {[
            ["Total value locked", fmtCompact(VAULT.tvl)],
            ["30-day yield (annualised)", fmtPct(VAULT.apy30d)],
            ["Depositors", VAULT.depositors.toLocaleString("en-US")],
            ["Venues", "Deribit · OKX"],
          ].map(([k, v]) => (
            <div key={k} className="px-2 lg:border-l lg:border-border lg:px-6 lg:first:border-l-0">
              <div className="num text-2xl font-semibold sm:text-3xl">{v}</div>
              <div className="mt-1 text-xs text-muted sm:text-sm">{k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading eyebrow="How it works" title="Three steps to options yield" />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card group relative p-6 transition hover:border-border-strong">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  <s.icon className="size-5" />
                </span>
                <span className="num text-5xl font-semibold text-white/[0.04] transition group-hover:text-white/[0.07]">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategies */}
      <section id="strategies" className="scroll-mt-20 border-y border-border/70 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Strategies"
              title="A basket built for every market"
              body="Premium selling does the heavy lifting in flat and rising markets. Spreads, hedges and a USDC buffer manage the downside."
            />
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/app/strategies">
                Explore the payoff <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STRATEGIES.filter((s) => s.id !== "idle").map((s) => (
              <div key={s.id} className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-border-strong">
                <PayoffThumb kind={s.payoff} color={s.color} />
                <h3 className="mt-4 font-semibold">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <span className="text-muted">{s.risk} risk</span>
                  <span className="font-medium" style={{ color: s.color }}>{s.targetYield}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section id="fees" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Fees" title="Simple, transparent pricing" body="No management fee. We only earn a share when you do." />
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                [fmtPct(FEES.deposit, 0), "Deposit fee"],
                [fmtPct(FEES.withdraw, 0), "Withdrawal fee"],
                [fmtPct(FEES.performance, 0), "Share of profits"],
                [`${NOTICE_DAYS} days`, "Withdrawal notice"],
              ].map(([v, k]) => (
                <div key={k} className="card p-5">
                  <div className="num text-3xl font-semibold text-gradient">{v}</div>
                  <div className="mt-1 text-sm text-muted">{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Example: $10,000 for one year</h3>
              <Badge>20% gross return</Badge>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <ExRow k="Deposit" v={fmtUsd(10_000)} />
              <ExRow k={`Deposit fee (${fmtPct(FEES.deposit, 0)})`} v={`−${fmtUsd(ex.entryFee)}`} muted />
              <ExRow k="Trading profit" v={`+${fmtUsd(ex.profit)}`} up />
              <ExRow k={`Profit share (${fmtPct(FEES.performance, 0)})`} v={`−${fmtUsd(ex.profitShare)}`} muted />
              <ExRow k={`Withdrawal fee (${fmtPct(FEES.withdraw, 0)})`} v={`−${fmtUsd(ex.exitFee)}`} muted />
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
              <div>
                <div className="text-sm text-muted">You receive</div>
                <div className="num mt-1 text-3xl font-semibold">{fmtUsd(ex.receive)}</div>
              </div>
              <span className="num text-lg font-semibold text-up">{fmtSignedPct(ex.net, 1)} net</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lucky Boost */}
      <section id="boost" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="card relative overflow-hidden border-gold/20 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/15 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 left-10 size-72 rounded-full bg-accent/10 blur-[100px]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge tone="gold" className="px-3 py-1 text-xs">
                <Sparkles className="size-3" /> Lucky Boost
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Stay longer. Win bigger.</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                Every month, long-term depositors are drawn to win a yield boost on top of normal returns. The longer you
                hold and the more you deposit, the more tickets you earn.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-bg/50 px-4 py-3 text-sm">
                <Ticket className="size-4 text-gold" />
                <span className="text-muted">Tickets =</span>
                <span className="font-medium">balance × days held ÷ 1,000</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {BOOST_TIERS.map((t, i) => (
                <div
                  key={t.label}
                  className={`rounded-2xl border px-2 py-4 text-center sm:p-5 ${i === 0 ? "border-gold/40 bg-gold/10" : "border-border bg-bg/50"}`}
                >
                  <div className="num text-3xl font-semibold text-gold sm:text-4xl">{t.multiplier}</div>
                  <div className="mt-2 text-sm font-medium">{t.label}</div>
                  <div className="mt-1 text-xs text-muted">{t.winners} {t.winners === 1 ? "winner" : "winners"} / month</div>
                </div>
              ))}
              <p className="col-span-3 text-center text-xs text-faint">
                Funded by a {fmtUsd0(BOOST_POOL.monthlyBudget)} monthly budget from protocol fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust + CTA */}
      <section className="border-t border-border/70 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card flex items-start gap-4 p-6">
              <Building2 className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-semibold">Institutional venues</h3>
                <p className="mt-1 text-sm text-muted">Options are executed through institutional accounts on Deribit and OKX.</p>
              </div>
            </div>
            <div className="card flex items-start gap-4 p-6">
              <FileText className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-semibold">Monthly reports</h3>
                <p className="mt-1 text-sm text-muted">Positions, P&amp;L, fees and share price history, published every month.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center text-center">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Start earning <span className="text-gradient">options yield</span> on your USDC
            </h2>
            <Button asChild size="lg" className="mt-8">
              <Link to="/app">
                Launch App <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-sm font-medium text-accent">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

function ExRow({ k, v, muted, up }: { k: string; v: string; muted?: boolean; up?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className={`num ${muted ? "text-muted" : up ? "text-up" : "font-medium"}`}>{v}</dd>
    </div>
  );
}
