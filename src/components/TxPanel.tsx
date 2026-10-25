import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { SuccessState } from "@/components/dialogs/shared";
import { Tk, TokenLabel, type Asset } from "@/components/TokenIcon";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAccount } from "@/store/useAccount";
import { useUi } from "@/store/useUi";

export type TxSpec = {
  from: Asset;
  /** Most the user can enter, in `from` units */
  available: number;
  availableLabel?: string;
  to?: Asset;
  quote?: (amount: number) => number;
  receiveLabel?: string;
  rows: (amount: number) => ReactNode;
  cta: string;
  /** Returns an error message, or null when the amount is fine */
  check?: (amount: number) => string | null;
  submit: (amount: number) => void;
  done: (amount: number) => ReactNode;
  footnote?: ReactNode;
  /** Extra controls above the amount, e.g. a direction toggle */
  top?: ReactNode;
};

export const digits = (a: Asset) => (a === "staked" || a === "collateral" ? 4 : 2);

/** "before → after" for preview rows; just the value when nothing changes */
export function Change({ from, to, unit, tone }: { from: string; to: string; unit?: string; tone?: string }) {
  const suffix = unit ? ` ${unit}` : "";
  if (from === to) return <span className={tone}>{to + suffix}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-faint">{from}</span>
      <ArrowRight className="size-3 text-faint" />
      <span className={tone ?? "text-fg"}>{to + suffix}</span>
    </span>
  );
}

export function TxTabs<T extends string>({
  tabs,
  value,
  onChange,
  children,
  className,
}: {
  tabs: { value: T; label: string; blurb: string }[];
  value: T;
  onChange: (v: T) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card overflow-hidden", className)}>
      <div role="tablist" className="grid border-b border-border" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative py-3.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:transition-colors",
              value === t.value ? "text-fg after:bg-accent" : "text-muted after:bg-transparent hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="px-5 pt-4 text-sm text-muted">{tabs.find((t) => t.value === value)?.blurb}</p>
      {children}
    </section>
  );
}

export function TxForm({ spec }: { spec: TxSpec }) {
  const connected = useAccount((s) => s.connected);
  const setConnectOpen = useUi((s) => s.setConnectOpen);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"form" | "pending" | "done">("form");
  const [summary, setSummary] = useState<ReactNode>(null);

  const typed = Number(value) || 0;
  // Treat (near) full amounts as "everything" so no dust is left behind
  const amount = connected && Math.abs(typed - spec.available) < 1e-4 ? spec.available : typed;
  const tooMuch = connected && amount > spec.available + 1e-6;
  const error = amount <= 0 ? null : tooMuch ? "More than is available" : (spec.check?.(amount) ?? null);
  const valid = amount > 0 && !error;
  const out = spec.quote?.(amount) ?? 0;

  const submit = () => {
    setStatus("pending");
    setTimeout(() => {
      spec.submit(amount);
      setSummary(spec.done(amount));
      setStatus("done");
    }, 1000);
  };

  if (status === "done")
    return (
      <div className="p-5">
        <SuccessState title="Done">{summary}</SuccessState>
        <Button
          className="mt-4 w-full"
          variant="secondary"
          onClick={() => {
            setValue("");
            setStatus("form");
          }}
        >
          New transaction
        </Button>
      </div>
    );

  return (
    <div className="p-5">
      {spec.top}
      <div className="eyebrow mb-2 flex justify-between text-[10px]">
        <span>Amount</span>
        <span className="num">
          {spec.availableLabel ?? "Balance"}: {connected ? fmtNum(spec.available, digits(spec.from)) : "—"} <Tk asset={spec.from} />
        </span>
      </div>
      <AmountInput
        value={value}
        onChange={setValue}
        asset={spec.from}
        onMax={connected ? () => setValue(String(Math.floor(spec.available * 1e4) / 1e4)) : undefined}
        invalid={!!error}
      />
      <p className="mt-2 h-4 text-xs text-down">{error ?? ""}</p>

      {spec.to && (
        <>
          <div className="relative my-3 flex justify-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative grid size-8 place-items-center rounded-full border border-border-strong bg-surface text-muted">
              <ArrowDown className="size-4" />
            </span>
          </div>
          <div className="rounded-md border border-border bg-bg/50 px-4 py-3">
            <div className="eyebrow text-[10px]">{spec.receiveLabel ?? "You receive"}</div>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className={cn("display truncate text-3xl", amount > 0 ? "text-fg" : "text-faint")}>{fmtNum(out, digits(spec.to))}</span>
              <TokenLabel asset={spec.to} className="text-muted" />
            </div>
          </div>
        </>
      )}

      <div className="mt-3 rounded-md border border-border bg-bg/50 px-4 py-2">{spec.rows(valid ? amount : 0)}</div>

      {connected ? (
        <Button size="lg" className="mt-5 w-full" disabled={!valid || status === "pending"} onClick={submit}>
          {status === "pending" ? (
            <>
              <Loader2 className="animate-spin" /> Confirming…
            </>
          ) : amount > 0 ? (
            spec.cta
          ) : (
            "Enter an amount"
          )}
        </Button>
      ) : (
        <Button size="lg" className="mt-5 w-full" onClick={() => setConnectOpen(true)}>
          <Wallet /> Connect wallet
        </Button>
      )}
      {spec.footnote && <p className="mt-3 text-center font-mono text-[11px] leading-relaxed text-faint">{spec.footnote}</p>}
    </div>
  );
}
