import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { OptionsBook } from "@/components/OptionsBook";
import { ActivityList } from "@/components/ActivityList";
import { PendingWithdrawals } from "@/components/PendingWithdrawals";
import { LuckyBoostCard } from "@/components/LuckyBoostCard";
import { PerformanceChart, usePerformance, type Range } from "@/components/charts/PerformanceChart";
import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { DepositDialog } from "@/components/dialogs/DepositDialog";
import { WithdrawDialog } from "@/components/dialogs/WithdrawDialog";
import { ALLOCATIONS, CURRENT_REGIME, REGIME_LABEL, SHARE_PRICE, VAULT, toBtc } from "@/data/mock";
import { fmtBtc, fmtCompact, fmtDate, fmtNum, fmtPct, fmtSigned, fmtSignedPct, fmtUsd, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUi } from "@/store/useUi";
import { useVault } from "@/store/useVault";

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" },
];

function Panel({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card flex flex-col", className)}>
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-5 py-2.5">
        <h2 className="eyebrow text-fg">{title}</h2>
        {right}
      </header>
      <div className="flex flex-1 flex-col p-5">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const connected = useVault((s) => s.connected);
  const shares = useVault((s) => s.shares);
  const costBasis = useVault((s) => s.costBasis);
  const walletUsdc = useVault((s) => s.walletUsdc);
  const firstDepositAt = useVault((s) => s.firstDepositAt);
  const activity = useVault((s) => s.activity);
  const withdrawals = useVault((s) => s.withdrawals);
  const setConnectOpen = useUi((s) => s.setConnectOpen);

  const [range, setRange] = useState<Range>("90d");
  const [showBtc, setShowBtc] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const perf = usePerformance(range);

  const balance = shares * SHARE_PRICE;
  const earnings = balance - costBasis;
  const pending = useMemo(() => withdrawals.filter((w) => !w.claimed), [withdrawals]);
  const pendingTotal = pending.reduce((s, w) => s + w.net, 0);
  const nextUnlock = pending.length ? Math.min(...pending.map((w) => w.unlockAt)) : null;

  const requireWallet = (fn: () => void) => () => (connected ? fn() : setConnectOpen(true));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <div className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-up">
              <span className="size-1.5 rounded-full bg-up animate-pulse-soft" /> Vault live
            </span>
            <span className="text-border-strong">/</span>
            <span>{REGIME_LABEL[CURRENT_REGIME]} regime</span>
            <span className="text-border-strong">/</span>
            <span>BTC {fmtUsd0(VAULT.btcSpot)}</span>
          </div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{connected ? "Your vault" : "BTC Yield Vault"}</h1>
        </div>
        <div className="flex gap-2">
          <Button size="lg" className="flex-1 sm:flex-none" onClick={requireWallet(() => setDepositOpen(true))}>
            <ArrowDownToLine /> Deposit
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 sm:flex-none"
            disabled={connected && balance < 0.01}
            onClick={requireWallet(() => setWithdrawOpen(true))}
          >
            <ArrowUpFromLine /> Withdraw
          </Button>
        </div>
      </div>

      {/* Connect banner */}
      {!connected && (
        <div className="relative mt-8 overflow-hidden rounded-lg border border-accent/40 bg-accent/[0.06] p-6 animate-fade-up sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:linear-gradient(to_left,black,transparent_60%)]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="display text-2xl">Connect a wallet to start earning</h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                Deposit USDC and earn <span className="text-accent">{fmtPct(VAULT.apy30d)} BTC Yield</span> (30-day annualised)
                from a managed book of Bitcoin options.
              </p>
            </div>
            <Button size="lg" onClick={() => setConnectOpen(true)}>
              <Wallet /> Connect wallet
            </Button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <KpiGrid className="mt-8 grid-cols-2 lg:grid-cols-4">
        {connected ? (
          <>
            <Kpi
              label="Your balance"
              value={fmtUsd(balance)}
              sub={`≈ ${fmtBtc(toBtc(balance))} · ${fmtNum(shares, 2)} shares`}
            />
            <Kpi
              label="Earned"
              tip="Current value minus what you deposited, after fees."
              value={<span className={earnings >= 0 ? "text-up" : "text-down"}>{fmtSigned(earnings)}</span>}
              sub={costBasis > 0 ? `${fmtSignedPct(earnings / costBasis, 2)} · ≈ ${fmtBtc(toBtc(earnings), 5)}` : "No deposits yet"}
            />
            <Kpi
              accent
              label="BTC Yield 30D"
              tip="Vault share price change over the last 30 days, annualised. Variable."
              value={fmtPct(VAULT.apy30d)}
              sub="Annualised · variable"
            />
            <Kpi
              label="Pending withdrawals"
              value={fmtUsd(pendingTotal)}
              sub={nextUnlock ? `Claimable ${fmtDate(nextUnlock)}` : `Wallet ${fmtUsd0(walletUsdc)}`}
            />
          </>
        ) : (
          <>
            <Kpi label="Vault TVL" value={fmtCompact(VAULT.tvl)} sub={`≈ ${fmtBtc(toBtc(VAULT.tvl), 1)}`} />
            <Kpi accent label="BTC Yield 30D" value={fmtPct(VAULT.apy30d)} sub="Annualised · variable" />
            <Kpi label="Premium 30D" value={fmtUsd0(VAULT.premium30d)} sub={`≈ ${fmtBtc(toBtc(VAULT.premium30d), 2)}`} />
            <Kpi label="Depositors" value={VAULT.depositors.toLocaleString("en-US")} sub="Active wallets" />
          </>
        )}
      </KpiGrid>

      {/* Chart + allocation */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Vault performance"
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBtc((v) => !v)}
                aria-pressed={showBtc}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-md border px-2 font-mono text-[11px] uppercase tracking-wider transition",
                  showBtc ? "border-fg/40 text-fg" : "border-border-strong text-muted hover:text-fg",
                )}
              >
                <span className="h-px w-3 border-t border-dashed border-current" /> vs BTC
              </button>
              <Segmented value={range} onChange={setRange} options={RANGES} className="hidden sm:inline-flex" />
            </div>
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-4">
              <span className={cn("display text-4xl", perf.vaultReturn >= 0 ? "text-accent" : "text-down")}>
                {fmtSignedPct(perf.vaultReturn, 2)}
              </span>
              {showBtc && (
                <span className="font-mono text-xs text-muted">
                  BTC <span className={perf.btcReturn >= 0 ? "text-up" : "text-down"}>{fmtSignedPct(perf.btcReturn, 1)}</span>
                </span>
              )}
            </div>
            <Segmented value={range} onChange={setRange} options={RANGES} className="sm:hidden" />
          </div>
          <div className="-ml-2 mt-6">
            <PerformanceChart data={perf.data} showBtc={showBtc} height={260} />
          </div>
        </Panel>

        <Panel title="Allocation" right={<Badge tone="accent">{REGIME_LABEL[CURRENT_REGIME]}</Badge>}>
          <AllocationDonut stacked allocation={ALLOCATIONS[CURRENT_REGIME]} total={VAULT.tvl} />
          <Link
            to="/app/strategies"
            className="mt-auto flex items-center gap-1 pt-6 font-mono text-[11px] uppercase tracking-wider text-accent transition hover:gap-2"
          >
            How the strategies work <ArrowRight className="size-3.5" />
          </Link>
        </Panel>
      </div>

      {/* Options book */}
      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow text-fg">Options book</h2>
          <span className="eyebrow text-faint">Deribit · OKX</span>
        </div>
        <OptionsBook />
      </div>

      {/* Activity + boost */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {connected && pending.length > 0 && <PendingWithdrawals items={pending} />}
          <Panel title="Recent activity">
            {connected ? (
              <ActivityList items={activity.slice(0, 8)} />
            ) : (
              <div className="py-10 text-center text-sm text-muted">Connect a wallet to see your activity.</div>
            )}
          </Panel>
        </div>
        <div className="lg:self-start">
          <LuckyBoostCard balance={connected ? balance : null} firstDepositAt={firstDepositAt} />
        </div>
      </div>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
}
