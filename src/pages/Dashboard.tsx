import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, Bitcoin, Clock, Coins, Landmark, Percent, TrendingUp, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Segmented } from "@/components/ui/segmented";
import { StatCard } from "@/components/StatCard";
import { ActivityList } from "@/components/ActivityList";
import { PendingWithdrawals } from "@/components/PendingWithdrawals";
import { LuckyBoostCard } from "@/components/LuckyBoostCard";
import { PerformanceChart, usePerformance, type Range } from "@/components/charts/PerformanceChart";
import { AllocationDonut } from "@/components/charts/AllocationDonut";
import { DepositDialog } from "@/components/dialogs/DepositDialog";
import { WithdrawDialog } from "@/components/dialogs/WithdrawDialog";
import { ALLOCATIONS, CURRENT_REGIME, REGIME_LABEL, SHARE_PRICE, VAULT } from "@/data/mock";
import { fmtCompact, fmtDate, fmtNum, fmtPct, fmtSigned, fmtSignedPct, fmtUsd, fmtUsd0 } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUi } from "@/store/useUi";
import { useVault } from "@/store/useVault";

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All" },
];

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
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="size-1.5 rounded-full bg-up animate-pulse-soft" />
            Vault live · {REGIME_LABEL[CURRENT_REGIME]} market regime
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {connected ? "Your vault" : "BTC Options Vault"}
          </h1>
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
        <div className="card relative mt-8 overflow-hidden p-6 sm:p-8 animate-fade-up">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Connect a wallet to start earning</h2>
              <p className="mt-1 max-w-lg text-sm text-muted">
                Deposit USDC and earn {fmtPct(VAULT.apy30d)} (30-day annualised) from a managed basket of BTC options strategies.
              </p>
            </div>
            <Button size="lg" onClick={() => setConnectOpen(true)}>
              <Wallet /> Connect wallet
            </Button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {connected ? (
          <>
            <StatCard
              highlight
              icon={Wallet}
              label="Your balance"
              value={fmtUsd(balance)}
              sub={<span className="num">{fmtNum(shares, 2)} shares · Wallet {fmtUsd0(walletUsdc)}</span>}
            />
            <StatCard
              icon={TrendingUp}
              label="Total earnings"
              tip="Current value minus what you deposited (after fees)."
              value={<span className={earnings >= 0 ? "text-up" : "text-down"}>{fmtSigned(earnings)}</span>}
              sub={costBasis > 0 ? `${fmtSignedPct(earnings / costBasis, 2)} on ${fmtUsd0(costBasis)} deposited` : "No deposits yet"}
            />
            <StatCard
              icon={Percent}
              label="Current yield"
              tip="Vault share price change over the last 30 days, annualised. Yield is variable."
              value={<span className="text-accent">{fmtPct(VAULT.apy30d)}</span>}
              sub="30-day annualised · variable"
            />
            <StatCard
              icon={Clock}
              label="Pending withdrawals"
              value={fmtUsd(pendingTotal)}
              sub={nextUnlock ? `Next claimable ${fmtDate(nextUnlock)}` : "Nothing pending"}
            />
          </>
        ) : (
          <>
            <StatCard highlight icon={Landmark} label="Total value locked" value={fmtCompact(VAULT.tvl)} sub="USDC across all depositors" />
            <StatCard icon={Percent} label="Current yield" value={<span className="text-accent">{fmtPct(VAULT.apy30d)}</span>} sub="30-day annualised · variable" />
            <StatCard icon={Users} label="Depositors" value={VAULT.depositors.toLocaleString("en-US")} sub="Wallets with an active position" />
            <StatCard icon={Bitcoin} label="BTC spot" value={fmtUsd0(VAULT.btcSpot)} sub="Reference price for strategies" />
          </>
        )}
      </div>

      {/* Chart + allocation */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Vault performance</h2>
              <div className="mt-1 flex items-baseline gap-3">
                <span className={cn("num text-2xl font-semibold", perf.vaultReturn >= 0 ? "text-up" : "text-down")}>
                  {fmtSignedPct(perf.vaultReturn, 2)}
                </span>
                {showBtc && (
                  <span className="num text-sm text-muted">
                    BTC <span className={perf.btcReturn >= 0 ? "text-up" : "text-down"}>{fmtSignedPct(perf.btcReturn, 1)}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBtc((v) => !v)}
                aria-pressed={showBtc}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition",
                  showBtc ? "border-btc/40 bg-btc/10 text-btc" : "border-border text-muted hover:text-fg",
                )}
              >
                <span className="h-0.5 w-3 rounded bg-current" /> BTC
              </button>
              <Segmented value={range} onChange={setRange} options={RANGES} />
            </div>
          </div>
          <div className="mt-6 -ml-2">
            <PerformanceChart data={perf.data} showBtc={showBtc} />
          </div>
        </div>

        <div className="card flex flex-col p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold">Strategy allocation</h2>
            <Badge tone="accent">{REGIME_LABEL[CURRENT_REGIME]}</Badge>
          </div>
          <AllocationDonut stacked allocation={ALLOCATIONS[CURRENT_REGIME]} total={VAULT.tvl} />
          <Link
            to="/app/strategies"
            className="mt-auto flex items-center gap-1 pt-6 text-sm font-medium text-accent transition hover:gap-2"
          >
            How the strategies work <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Activity + boost */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {connected && pending.length > 0 && <PendingWithdrawals items={pending} />}
          <div className="card p-5 sm:p-6">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <Coins className="size-4 text-muted" /> Recent activity
            </h2>
            {connected ? (
              <ActivityList items={activity.slice(0, 8)} />
            ) : (
              <div className="py-10 text-center text-sm text-muted">Connect a wallet to see your activity.</div>
            )}
          </div>
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
