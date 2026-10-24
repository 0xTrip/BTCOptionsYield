import { useState } from "react";
import { CalendarClock, Hourglass, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Row, SuccessState } from "@/components/dialogs/shared";
import { FEES, NOTICE_DAYS } from "@/config";
import { SHARE_PRICE } from "@/data/mock";
import { fmtDate, fmtPct, fmtUsd } from "@/lib/format";
import { previewWithdraw } from "@/lib/vault-math";
import { useVault } from "@/store/useVault";

export function WithdrawTimeline({ requestedAt, unlockAt }: { requestedAt: number; unlockAt: number }) {
  const steps = [
    { icon: Send, label: "Requested", date: fmtDate(requestedAt) },
    { icon: Hourglass, label: `${NOTICE_DAYS}-day notice`, date: "Positions unwind" },
    { icon: CalendarClock, label: "Claimable", date: fmtDate(unlockAt) },
  ];
  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex flex-col items-center text-center">
          {i > 0 && <span className="absolute right-1/2 top-4 h-px w-full bg-border-strong" />}
          <span className={`relative grid size-8 place-items-center rounded-full border ${i === 0 ? "border-accent bg-accent text-accent-fg" : "border-border-strong bg-surface-2 text-muted"}`}>
            <s.icon className="size-3.5" />
          </span>
          <span className="mt-2 text-xs font-semibold">{s.label}</span>
          <span className="num mt-0.5 font-mono text-[10px] text-muted">{s.date}</span>
        </li>
      ))}
    </ol>
  );
}

export function WithdrawDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const shares = useVault((s) => s.shares);
  const requestWithdraw = useVault((s) => s.requestWithdraw);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"form" | "pending" | "done">("form");
  const [done, setDone] = useState<{ net: number; unlockAt: number } | null>(null);

  const balance = shares * SHARE_PRICE;
  const amount = Number(value) || 0;
  // Treat (near) full-balance requests as "withdraw everything" to avoid dust
  const reqShares = amount >= balance - 0.005 ? shares : amount / SHARE_PRICE;
  const p = previewWithdraw(reqShares, SHARE_PRICE);
  const tooMuch = amount > balance + 0.005;
  const valid = amount > 0 && !tooMuch;

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
      requestWithdraw(reqShares);
      setDone({ net: p.net, unlockAt: p.unlockAt });
      setStatus("done");
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        {status === "done" && done ? (
          <>
            <DialogTitle className="sr-only">Withdrawal requested</DialogTitle>
            <SuccessState title="Withdrawal requested">
              <span className="num">{fmtUsd(done.net)}</span> will be claimable on{" "}
              <span className="font-medium text-fg">{fmtDate(done.unlockAt)}</span>. You'll find it under Pending withdrawals.
            </SuccessState>
            <Button className="mt-4 w-full" onClick={() => close(false)}>Done</Button>
          </>
        ) : (
          <>
            <DialogTitle>Request withdrawal</DialogTitle>
            <DialogDescription>Withdrawals have a {NOTICE_DAYS}-day notice period so the vault can unwind positions.</DialogDescription>

            <div className="mt-5">
              <div className="eyebrow mb-2 flex justify-between text-[10px]">
                <span>Amount</span>
                <span className="num">Available: {fmtUsd(balance)}</span>
              </div>
              <AmountInput
                autoFocus
                value={value}
                onChange={setValue}
                onMax={() => setValue(String(Math.floor(balance * 100) / 100))}
                invalid={tooMuch}
              />
              <p className="mt-2 h-4 text-xs text-down">{tooMuch ? "Amount exceeds your vault balance" : ""}</p>
            </div>

            <div className="mt-2 rounded-md border border-border bg-bg/50 px-4 py-2">
              <Row label="Withdrawal value" value={fmtUsd(p.gross)} />
              <Row label={`Withdrawal fee (${fmtPct(FEES.withdraw, 0)})`} value={`−${fmtUsd(p.fee)}`} muted />
              <Row label="You receive (est.)" value={fmtUsd(p.net)} strong />
            </div>

            <div className="mt-5 rounded-md border border-border bg-bg/50 px-3 py-4">
              <WithdrawTimeline requestedAt={Date.now()} unlockAt={p.unlockAt} />
            </div>

            <Button size="lg" className="mt-5 w-full" disabled={!valid || status === "pending"} onClick={submit}>
              {status === "pending" ? (
                <>
                  <Loader2 className="animate-spin" /> Submitting…
                </>
              ) : amount > 0 ? (
                "Request withdrawal"
              ) : (
                "Enter an amount"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
