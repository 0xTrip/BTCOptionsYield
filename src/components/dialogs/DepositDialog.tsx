import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Row, SuccessState } from "@/components/dialogs/shared";
import { FEES, NOTICE_DAYS } from "@/config";
import { SHARE_PRICE, VAULT } from "@/data/mock";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import { previewDeposit } from "@/lib/vault-math";
import { useVault } from "@/store/useVault";

export function DepositDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const walletUsdc = useVault((s) => s.walletUsdc);
  const deposit = useVault((s) => s.deposit);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"form" | "pending" | "done">("form");
  const [done, setDone] = useState<{ amount: number; shares: number } | null>(null);

  const amount = Number(value) || 0;
  const p = previewDeposit(amount, SHARE_PRICE);
  const tooMuch = amount > walletUsdc + 1e-9;
  const valid = amount >= 10 && !tooMuch;

  const close = (v: boolean) => {
    if (status === "pending") return;
    onOpenChange(v);
    if (!v)
      setTimeout(() => {
        setValue("");
        setStatus("form");
      }, 200);
  };

  const submit = () => {
    setStatus("pending");
    setTimeout(() => {
      deposit(amount);
      setDone({ amount, shares: p.shares });
      setStatus("done");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        {status === "done" && done ? (
          <>
            <DialogTitle className="sr-only">Deposit complete</DialogTitle>
            <SuccessState title="Deposit complete">
              <span className="num">{fmtUsd(done.amount)}</span> deposited ·{" "}
              <span className="num">{fmtNum(done.shares, 2)}</span> vault shares received. Your USDC is now earning options yield.
            </SuccessState>
            <Button className="mt-4 w-full" onClick={() => close(false)}>Done</Button>
          </>
        ) : (
          <>
            <DialogTitle>Deposit USDC</DialogTitle>
            <DialogDescription>Earn yield from the vault's BTC options strategies.</DialogDescription>

            <div className="mt-5">
              <div className="eyebrow mb-2 flex justify-between text-[10px]">
                <span>Amount</span>
                <span className="num">Wallet: {fmtUsd(walletUsdc)}</span>
              </div>
              <AmountInput
                autoFocus
                value={value}
                onChange={setValue}
                onMax={() => setValue(String(Math.floor(walletUsdc * 100) / 100))}
                invalid={tooMuch}
              />
              <p className="mt-2 h-4 text-xs text-down">{tooMuch ? "Amount exceeds your wallet balance" : ""}</p>
            </div>

            <div className="mt-2 rounded-md border border-border bg-bg/50 px-4 py-2">
              <Row label={`Deposit fee (${fmtPct(FEES.deposit, 0)})`} value={`−${fmtUsd(p.fee)}`} muted />
              <Row label="Invested" value={fmtUsd(p.net)} strong />
              <Row label="Shares received" value={fmtNum(p.shares, 4)} />
              <Row label="Share price" value={`${fmtNum(SHARE_PRICE, 4)} USDC`} muted />
              <div className="my-1.5 h-px bg-border" />
              <Row label="BTC Yield (30D, annualised)" value={<span className="text-accent">{fmtPct(VAULT.apy30d)}</span>} />
              <Row label="Withdrawal notice" value={`${NOTICE_DAYS} days`} />
            </div>

            <Button size="lg" className="mt-5 w-full" disabled={!valid || status === "pending"} onClick={submit}>
              {status === "pending" ? (
                <>
                  <Loader2 className="animate-spin" /> Confirming…
                </>
              ) : amount > 0 ? (
                `Deposit ${fmtUsd(amount)}`
              ) : (
                "Enter an amount"
              )}
            </Button>
            <p className="mt-3 text-center font-mono text-[11px] text-faint">Minimum deposit 10 USDC · yield is variable</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
