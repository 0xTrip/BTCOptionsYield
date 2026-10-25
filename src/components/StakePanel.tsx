import { useState } from "react";
import { Row } from "@/components/dialogs/shared";
import { TxForm, TxTabs, type TxSpec } from "@/components/TxPanel";
import { Segmented } from "@/components/ui/segmented";
import { SWAP_FEE, TICKER } from "@/config";
import { PROTOCOL, RATE } from "@/data/mock";
import { fmtCompact, fmtNum, fmtPct } from "@/lib/format";
import { useAccount } from "@/store/useAccount";

type Tab = "stake" | "unstake" | "swap";

const TABS: { value: Tab; label: string; blurb: string }[] = [
  { value: "stake", label: "Stake", blurb: `Stake ${TICKER.stable} for ${TICKER.staked}, which earns stability fees and a share of options premium.` },
  { value: "unstake", label: "Unstake", blurb: `Swap ${TICKER.staked} back to ${TICKER.stable} at the current rate. No lockup.` },
  { value: "swap", label: "Swap", blurb: `Swap ${TICKER.base} and ${TICKER.stable} 1:1 through the peg reserve.` },
];

export function StakePanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("stake");
  const [toStable, setToStable] = useState(true);
  const account = useAccount();

  const rateRow = <Row label="Exchange rate" value={`1 ${TICKER.staked} = ${fmtNum(RATE, 4)} ${TICKER.stable}`} muted />;

  const specs: Record<Tab, TxSpec> = {
    stake: {
      from: "stable",
      available: account.usdh,
      to: "staked",
      quote: (a) => a / RATE,
      rows: () => (
        <>
          {rateRow}
          <Row label={`${TICKER.staked} APY (30D)`} value={<span className="text-accent">{fmtPct(PROTOCOL.apy30d)}</span>} />
          <Row label="Lockup" value="None" muted />
        </>
      ),
      cta: `Stake ${TICKER.stable}`,
      submit: account.stake,
      done: (a) => (
        <>
          You received <span className="num text-fg">{fmtNum(a / RATE, 4)} {TICKER.staked}</span>. It earns from the next epoch.
        </>
      ),
    },
    unstake: {
      from: "staked",
      available: account.shares,
      to: "stable",
      quote: (a) => a * RATE,
      rows: () => rateRow,
      cta: `Unstake ${TICKER.staked}`,
      submit: account.unstake,
      done: (a) => (
        <>
          You received <span className="num text-fg">{fmtNum(a * RATE)} {TICKER.stable}</span>.
        </>
      ),
    },
    swap: {
      top: (
        <div className="mb-4">
          <Segmented
            value={toStable ? "in" : "out"}
            onChange={(v) => setToStable(v === "in")}
            options={[
              { value: "in", label: `${TICKER.base} → ${TICKER.stable}` },
              { value: "out", label: `${TICKER.stable} → ${TICKER.base}` },
            ]}
          />
        </div>
      ),
      from: toStable ? "base" : "stable",
      available: toStable ? account.usdt : account.usdh,
      to: toStable ? "stable" : "base",
      quote: (a) => a * (1 - SWAP_FEE),
      rows: (a) => (
        <>
          <Row label={`Swap fee (${fmtPct(SWAP_FEE, 2)})`} value={fmtNum(a * SWAP_FEE)} muted />
          <Row label="Rate" value={`1 ${TICKER.base} = 1 ${TICKER.stable}`} muted />
          <Row label={`${TICKER.base} in peg reserve`} value={fmtCompact(PROTOCOL.swapReserve)} muted />
        </>
      ),
      cta: "Swap",
      submit: (a) => account.swap(a, toStable),
      done: (a) => (
        <>
          You received{" "}
          <span className="num text-fg">
            {fmtNum(a * (1 - SWAP_FEE))} {toStable ? TICKER.stable : TICKER.base}
          </span>
          .
        </>
      ),
    },
  };

  return (
    <TxTabs tabs={TABS} value={tab} onChange={setTab} className={className}>
      <TxForm key={tab === "swap" ? `swap-${toStable}` : tab} spec={specs[tab]} />
    </TxTabs>
  );
}
