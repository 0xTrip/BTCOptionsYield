import { useState } from "react";
import { Row } from "@/components/dialogs/shared";
import { Change, TxForm, TxTabs, type TxSpec } from "@/components/TxPanel";
import { TICKER, VAULT } from "@/config";
import { collateralRatio, liquidationPrice, maxMint, maxWithdraw } from "@/data/mock";
import { fmtNum, fmtPct, fmtPrice, fmtRatio } from "@/lib/format";
import { healthTone } from "@/lib/health";
import { useAccount } from "@/store/useAccount";

type Tab = "deposit" | "mint" | "repay" | "withdraw";

const TABS: { value: Tab; label: string; blurb: string }[] = [
  { value: "deposit", label: "Deposit", blurb: `Lock ${TICKER.collateral} in your vault as collateral.` },
  { value: "mint", label: "Mint", blurb: `Mint ${TICKER.stable} against your ${TICKER.collateral}, down to a ${fmtPct(VAULT.minRatio, 0)} collateral ratio.` },
  { value: "repay", label: "Repay", blurb: `Pay back ${TICKER.stable} to lower your debt and liquidation price.` },
  { value: "withdraw", label: "Withdraw", blurb: `Take ${TICKER.collateral} out while staying at or above ${fmtPct(VAULT.minRatio, 0)}.` },
];

export function VaultPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("mint");
  const account = useAccount();
  const v = account.vault ?? { collateral: 0, debt: 0 };

  const preview = (coll: number, debt: number) => {
    const before = collateralRatio(v.collateral, v.debt);
    const after = collateralRatio(coll, debt);
    return (
      <>
        {tab === "deposit" || tab === "withdraw" ? (
          <Row label="Collateral" value={<Change from={fmtNum(v.collateral)} to={fmtNum(coll)} unit={TICKER.collateral} />} />
        ) : (
          <Row label="Debt" value={<Change from={fmtNum(v.debt)} to={fmtNum(debt)} unit={TICKER.stable} />} />
        )}
        <Row label="Collateral ratio" value={<Change from={fmtRatio(before)} to={fmtRatio(after)} tone={healthTone(after)} />} />
        <Row
          label="Liquidation price"
          value={<Change from={v.debt ? fmtPrice(liquidationPrice(v.collateral, v.debt)) : "—"} to={debt ? fmtPrice(liquidationPrice(coll, debt)) : "—"} />}
        />
      </>
    );
  };

  const specs: Record<Tab, TxSpec> = {
    deposit: {
      from: "collateral",
      available: account.hype,
      rows: (a) => (
        <>
          {preview(v.collateral + a, v.debt)}
          <Row label="Can mint after" value={`${fmtNum(maxMint(v.collateral + a, v.debt))} ${TICKER.stable}`} muted />
        </>
      ),
      cta: `Deposit ${TICKER.collateral}`,
      submit: account.deposit,
      done: (a) => (
        <>
          Deposited <span className="num text-fg">{fmtNum(a)} {TICKER.collateral}</span>. You can now mint up to{" "}
          {fmtNum(maxMint(v.collateral + a, v.debt))} {TICKER.stable}.
        </>
      ),
    },
    mint: {
      from: "stable",
      available: maxMint(v.collateral, v.debt),
      availableLabel: "Can mint",
      rows: (a) => (
        <>
          {preview(v.collateral, v.debt + a)}
          <Row label="Stability fee" value={`${fmtPct(VAULT.stabilityFee, 0)} a year`} muted />
        </>
      ),
      cta: `Mint ${TICKER.stable}`,
      submit: account.mint,
      done: (a) => (
        <>
          Minted <span className="num text-fg">{fmtNum(a)} {TICKER.stable}</span> to your wallet.
        </>
      ),
      footnote: `Below ${fmtPct(VAULT.liquidationRatio, 0)} a vault is liquidated with a ${fmtPct(VAULT.liquidationPenalty, 0)} penalty.`,
    },
    repay: {
      from: "stable",
      available: Math.min(account.usdh, v.debt),
      availableLabel: "Can repay",
      rows: (a) => preview(v.collateral, v.debt - a),
      cta: `Repay ${TICKER.stable}`,
      submit: account.repay,
      done: (a) => (
        <>
          Repaid <span className="num text-fg">{fmtNum(a)} {TICKER.stable}</span>. Debt is now {fmtNum(v.debt - a)} {TICKER.stable}.
        </>
      ),
    },
    withdraw: {
      from: "collateral",
      available: maxWithdraw(v.collateral, v.debt),
      availableLabel: "Can withdraw",
      rows: (a) => preview(v.collateral - a, v.debt),
      cta: `Withdraw ${TICKER.collateral}`,
      submit: account.withdraw,
      done: (a) => (
        <>
          Withdrew <span className="num text-fg">{fmtNum(a)} {TICKER.collateral}</span> to your wallet.
        </>
      ),
    },
  };

  return (
    <TxTabs tabs={TABS} value={tab} onChange={setTab} className={className}>
      <TxForm key={tab} spec={specs[tab]} />
    </TxTabs>
  );
}
