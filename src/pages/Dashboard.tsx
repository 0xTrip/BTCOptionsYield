import { Link } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Kpi, KpiGrid } from "@/components/Kpi";
import { ActivityList } from "@/components/ActivityList";
import { Panel } from "@/components/Panel";
import { Row } from "@/components/dialogs/shared";
import { VaultHealth } from "@/components/VaultHealth";
import { VaultPanel } from "@/components/VaultPanel";
import { EARN, TICKER, VAULT } from "@/config";
import { BOOK_STATS, HYPE, LIVE_EPOCH, NEXT_SETTLEMENT, PROTOCOL, collateralRatio, liquidationPrice } from "@/data/mock";
import { fmtCompact, fmtCompactNum, fmtExpiry, fmtNum, fmtPct, fmtPrice, fmtRatio, fmtSignedPct, fmtUsd, fmtUsd0 } from "@/lib/format";
import { healthTone } from "@/lib/health";
import { cn } from "@/lib/utils";
import { useAccount } from "@/store/useAccount";
import { useUi } from "@/store/useUi";

/** Premium a vault would earn this epoch, after the split */
const weeklyPremium = (hype: number) => hype * BOOK_STATS.perHype * EARN.split.vaults;

export default function Dashboard() {
  const connected = useAccount((s) => s.connected);
  const vault = useAccount((s) => s.vault);
  const activity = useAccount((s) => s.activity);
  const setEarn = useAccount((s) => s.setEarn);
  const setConnectOpen = useUi((s) => s.setConnectOpen);

  const v = connected ? vault : null;
  const ratio = v ? collateralRatio(v.collateral, v.debt) : Infinity;
  const strikeDistance = BOOK_STATS.strike / HYPE.spot - 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {TICKER.collateral} {fmtPrice(HYPE.spot)}{" "}
            <span className={HYPE.change24h >= 0 ? "text-up" : "text-down"}>{fmtSignedPct(HYPE.change24h, 1)}</span>
          </span>
          <span className="text-border-strong">/</span>
          <span className="flex items-center gap-1.5 text-up">
            <span className="size-1.5 rounded-full bg-up animate-pulse-soft" /> Epoch {LIVE_EPOCH} · calls settle {fmtExpiry(NEXT_SETTLEMENT)}
          </span>
          <span className="text-border-strong">/</span>
          <span>Liquidation at {fmtPct(VAULT.liquidationRatio, 0)}</span>
        </div>
        <h1 className="display mt-3 text-4xl sm:text-5xl">{v ? "Your vault" : `${TICKER.collateral} vaults`}</h1>
      </div>

      {/* KPIs */}
      <KpiGrid className="mt-8 grid-cols-2 lg:grid-cols-4">
        {v ? (
          <>
            <Kpi label={`Collateral · ${TICKER.collateral}`} value={fmtNum(v.collateral, 1)} sub={`≈ ${fmtUsd0(v.collateral * HYPE.spot)}`} />
            <Kpi label="Debt" value={fmtUsd(v.debt)} sub={`${TICKER.stable} · ${fmtPct(VAULT.stabilityFee, 0)} stability fee`} />
            <Kpi
              label="Collateral ratio"
              tip={`Collateral value ÷ debt. Mint down to ${fmtPct(VAULT.minRatio, 0)}; liquidated below ${fmtPct(VAULT.liquidationRatio, 0)}.`}
              value={<span className={healthTone(ratio)}>{fmtRatio(ratio)}</span>}
              sub={v.debt > 0 ? `Liquidation at ${fmtPrice(liquidationPrice(v.collateral, v.debt))}` : "No debt"}
            />
            <Kpi accent label="Repaid by Earn mode" value={`+${fmtUsd(v.premiumEarned)}`} sub={v.earn ? "Earn mode on" : "Earn mode off"} />
          </>
        ) : (
          <>
            <Kpi label={`${TICKER.collateral} locked`} value={fmtCompactNum(PROTOCOL.hypeLocked)} sub={`≈ ${fmtCompact(PROTOCOL.collateralValue)}`} />
            <Kpi label={`${TICKER.stable} supply`} value={fmtCompact(PROTOCOL.supply)} sub={`${PROTOCOL.vaults.toLocaleString("en-US")} vaults`} />
            <Kpi label="Collateral ratio" value={fmtRatio(PROTOCOL.systemRatio)} sub="Across all vaults" />
            <Kpi accent label="Earn mode yield" value={fmtPct(PROTOCOL.earnYield)} sub={`Premium on ${TICKER.collateral}, annualised`} />
          </>
        )}
      </KpiGrid>

      <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Vault health">
            {v ? (
              <VaultHealth collateral={v.collateral} debt={v.debt} />
            ) : (
              <div className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm text-muted">
                  Lock {TICKER.collateral}, mint {TICKER.stable} up to {fmtPct(1 / VAULT.minRatio, 0)} of its value, and keep your {TICKER.collateral} exposure.
                </p>
                <Button onClick={() => setConnectOpen(true)}>
                  <Wallet /> Connect wallet
                </Button>
              </div>
            )}
          </Panel>

          <Panel
            title="Earn mode"
            right={
              v && (
                <span className="flex items-center gap-2.5">
                  <span className={cn("font-mono text-[11px] uppercase tracking-wider", v.earn ? "text-accent" : "text-muted")}>{v.earn ? "On" : "Off"}</span>
                  <Switch checked={v.earn} onChange={setEarn} label="Earn mode" />
                </span>
              )
            }
          >
            <p className="text-sm leading-relaxed text-muted">
              {v?.earn === false ? (
                <>
                  Turn it on and this vault's {TICKER.collateral} backs weekly covered calls. At this week's prices that would repay about{" "}
                  <span className="text-accent">{fmtUsd0(weeklyPremium(v.collateral))}</span> of debt.
                </>
              ) : (
                <>
                  This week the protocol sold calls on {TICKER.collateral} struck at <span className="text-fg">{fmtPrice(BOOK_STATS.strike, 0)}</span>,{" "}
                  {fmtPct(strikeDistance, 0)} above spot. You keep every gain up to the strike, and {fmtPct(EARN.split.vaults, 0)} of the premium
                  repays your debt at settlement.
                </>
              )}
            </p>
            <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
              <div>
                <Row label="Strike this week" value={`${fmtPrice(BOOK_STATS.strike, 0)} (+${fmtPct(strikeDistance, 1)})`} />
                <Row label="Settles" value={fmtExpiry(NEXT_SETTLEMENT)} muted />
              </div>
              <div>
                <Row
                  label={v ? "Your premium this week" : `Premium per 1,000 ${TICKER.collateral}`}
                  value={<span className="text-accent">{fmtUsd(weeklyPremium(v ? v.collateral : 1_000))}</span>}
                />
                <Row
                  label="Calls in the money"
                  value={v && v.calledHype > 0 ? `${fmtNum(v.calledHype, 1)} ${TICKER.collateral} sold` : `${PROTOCOL.calledAwayWeeks} of ${PROTOCOL.lastEpoch.n} weeks`}
                  muted
                />
              </div>
            </div>
            <Link
              to="/app/options"
              className="mt-4 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-accent transition hover:gap-2"
            >
              How Earn mode works <ArrowRight className="size-3.5" />
            </Link>
          </Panel>

          <Panel title="Recent activity">
            {v ? (
              <ActivityList items={activity.slice(0, 8)} />
            ) : (
              <div className="py-10 text-center text-sm text-muted">Connect a wallet to see your activity.</div>
            )}
          </Panel>
        </div>

        {/* Actions: first on mobile, right column on desktop */}
        <div className="order-first lg:order-none lg:sticky lg:top-28">
          <VaultPanel />
        </div>
      </div>
    </div>
  );
}
