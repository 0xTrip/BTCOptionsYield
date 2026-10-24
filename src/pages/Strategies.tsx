import { useDeferredValue, useState, type ReactNode } from "react";
import { Building2, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import { InfoTip } from "@/components/ui/tooltip";
import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { PayoffThumb } from "@/components/charts/PayoffThumb";
import { PutPayoffChart, PRICE_MAX, PRICE_MIN } from "@/components/charts/PutPayoffChart";
import { PUT_EXAMPLE } from "@/config";
import { ALLOCATIONS, CURRENT_REGIME, REGIME_LABEL, STRATEGIES, type Regime } from "@/data/mock";
import { fmtPct, fmtSigned0, fmtUsd0 } from "@/lib/format";
import { annualisedPremium, putPnl } from "@/lib/vault-math";
import { cn } from "@/lib/utils";

const REGIMES: { value: Regime; label: string }[] = [
  { value: "rising", label: "Rising" },
  { value: "sideways", label: "Sideways" },
  { value: "falling", label: "Falling" },
];

const REGIME_COPY: Record<Regime, string> = {
  rising: "Keep selling puts, and add a call sleeve to capture upside momentum.",
  sideways: "Range-bound BTC is ideal for premium selling, so short puts and spreads do most of the work.",
  falling: "Cut put exposure, buy protection and hold more USDC until volatility settles.",
};

const STRIKES = [
  { strike: 70_000, premium: 750 },
  { strike: 73_000, premium: PUT_EXAMPLE.premium },
  { strike: 76_000, premium: 1_850 },
];

const RISK_TONE = { Low: "up", Medium: "accent", High: "down" } as const;

export default function Strategies() {
  const [regime, setRegime] = useState<Regime>(CURRENT_REGIME);
  const [strikeIdx, setStrikeIdx] = useState(1);
  const [price, setPrice] = useState(PUT_EXAMPLE.spot);
  const chartPrice = useDeferredValue(price);

  const { strike, premium } = STRIKES[strikeIdx];
  const pnl = putPnl(price, strike, premium);
  const breakeven = strike - premium;
  const apr = annualisedPremium(premium, strike, PUT_EXAMPLE.days);
  const allocation = ALLOCATIONS[regime];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-2xl animate-fade-up">
        <Badge tone="accent">Strategy</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">How the yield works</h1>
        <p className="mt-3 text-muted">
          The vault runs a basket of Bitcoin options strategies and shifts the mix with the market. Most of the yield
          comes from <span className="text-fg">selling put options</span>: buyers pay us a premium upfront for protection against BTC falling below a set price.
        </p>
      </div>

      {/* Payoff explorer */}
      <section className="card mt-8 overflow-hidden">
        <div className="grid lg:grid-cols-5">
          <div className="border-b border-border p-5 sm:p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
            <h2 className="text-lg font-semibold">Sell-put explorer</h2>
            <p className="mt-1 text-sm text-muted">
              One 30-day BTC put, fully backed by USDC. Drag the price to see what happens at expiry.
            </p>

            <div className="mt-6">
              <div className="mb-2 text-xs font-medium text-muted">Strike price</div>
              <Segmented
                value={String(strikeIdx)}
                onChange={(v) => setStrikeIdx(Number(v))}
                options={STRIKES.map((s, i) => ({ value: String(i), label: fmtUsd0(s.strike) }))}
              />
            </div>

            <div className="mt-6">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-muted">BTC price at expiry</span>
                <span className="num text-lg font-semibold">{fmtUsd0(price)}</span>
              </div>
              <Slider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={250}
                value={[price]}
                onValueChange={([v]) => setPrice(v)}
                aria-label="BTC price at expiry"
              />
              <div className="num flex justify-between text-[11px] text-faint">
                <span>$40k</span>
                <span>$110k</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label="Premium collected" value={fmtUsd0(premium)} />
              <Metric label="Breakeven" value={fmtUsd0(breakeven)} />
              <Metric
                label="Premium rate"
                tip={`${fmtUsd0(premium)} ÷ ${fmtUsd0(strike)} collateral, × 365/30. Annualised from a single 30-day trade.`}
                value={<span className="text-accent">{fmtPct(apr)}</span>}
              />
              <Metric
                label="P&L at expiry"
                value={<span className={pnl >= 0 ? "text-up" : "text-down"}>{fmtSigned0(pnl)}</span>}
                emphasis={pnl >= 0 ? "up" : "down"}
              />
            </div>

            <p className="mt-5 rounded-xl border border-border bg-bg/40 p-3 text-sm leading-relaxed text-muted">
              {price >= strike ? (
                <>BTC finishes above {fmtUsd0(strike)}, so the put expires worthless and the vault <span className="text-up">keeps the full {fmtUsd0(premium)} premium</span>.</>
              ) : price >= breakeven ? (
                <>BTC dips below the strike, but the premium still covers the difference. The vault <span className="text-up">nets {fmtUsd0(pnl)}</span>.</>
              ) : (
                <>BTC falls below breakeven: the vault buys BTC at {fmtUsd0(strike)} while it trades at {fmtUsd0(price)}, a <span className="text-down">loss of {fmtUsd0(-pnl)}</span>. This is why the basket includes hedges.</>
              )}
            </p>
          </div>

          <div className="p-3 pt-6 sm:p-6 lg:col-span-3">
            <div className="mb-2 flex items-center justify-between px-2 sm:px-0">
              <span className="text-xs font-medium text-muted">Profit / loss at expiry (1 BTC contract)</span>
              <span className="flex items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 bg-btc" />Spot</span>
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 bg-muted" />Strike</span>
              </span>
            </div>
            <div className="h-[300px] sm:h-[360px] lg:h-[500px]">
              <PutPayoffChart strike={strike} premium={premium} spot={PUT_EXAMPLE.spot} price={chartPrice} />
            </div>
          </div>
        </div>
      </section>

      {/* Regime allocation */}
      <section className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">A basket that adapts</h2>
            <p className="mt-1 text-sm text-muted">See how the target mix shifts with market conditions.</p>
          </div>
          <Segmented value={regime} onChange={setRegime} options={REGIMES} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="card p-5 sm:p-6">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold">{REGIME_LABEL[regime]} market</h3>
              {regime === CURRENT_REGIME && <Badge tone="up">Current</Badge>}
            </div>
            <p className="mb-6 text-sm text-muted">{REGIME_COPY[regime]}</p>
            <AllocationDonut allocation={allocation} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {STRATEGIES.map((s) => {
              const weight = allocation[s.id];
              const active = weight > 0;
              return (
                <article
                  key={s.id}
                  className={cn(
                    "card flex flex-col p-5 transition-all duration-300",
                    active ? "opacity-100" : "opacity-45",
                    s.id === "idle" && "sm:col-span-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold">
                        <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                        {s.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone={RISK_TONE[s.risk]}>{s.risk} risk</Badge>
                        <Badge>{s.targetYield}</Badge>
                      </div>
                    </div>
                    <PayoffThumb kind={s.payoff} color={s.color} />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Allocation</span>
                      <span className="num font-medium">{fmtPct(weight, 0)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border-strong">
                      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${weight * 100}%`, background: s.color }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Execution */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Building2, title: "Institutional execution", body: "Trades are routed through institutional accounts on Deribit and OKX, the deepest BTC options markets." },
          { icon: FileText, title: "Published reports", body: "Monthly reports cover positions, P&L, fees and share price history." },
          { icon: ShieldCheck, title: "Risk limits", body: "Caps on put exposure, margin usage and drawdown, with hedges added when markets turn." },
        ].map((c) => (
          <div key={c.title} className="card p-5">
            <c.icon className="size-5 text-accent" />
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted">{c.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tip,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  tip?: string;
  emphasis?: "up" | "down";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-bg/40 p-3 transition-colors",
        emphasis === "up" && "border-up/30",
        emphasis === "down" && "border-down/30",
        !emphasis && "border-border",
      )}
    >
      <div className="flex items-center gap-1 text-xs text-muted">
        {label}
        {tip && <InfoTip content={tip} />}
      </div>
      <div className="num mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

