import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUi } from "@/store/useUi";
import { useVault, type WalletName } from "@/store/useVault";

const WALLETS: { name: WalletName; color: string; letter: string; hint: string }[] = [
  { name: "MetaMask", color: "#f6851b", letter: "M", hint: "Browser extension" },
  { name: "Rabby", color: "#7084ff", letter: "R", hint: "Browser extension" },
  { name: "WalletConnect", color: "#3b99fc", letter: "W", hint: "Scan with mobile wallet" },
];

export function ConnectWalletDialog() {
  const open = useUi((s) => s.connectOpen);
  const setOpen = useUi((s) => s.setConnectOpen);
  const connect = useVault((s) => s.connect);
  const [pending, setPending] = useState<WalletName | null>(null);

  const choose = (w: WalletName) => {
    setPending(w);
    setTimeout(() => {
      connect(w);
      setPending(null);
      setOpen(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      <DialogContent>
        <DialogTitle>Connect wallet</DialogTitle>
        <DialogDescription>Demo mode: no real wallet is accessed.</DialogDescription>
        <div className="mt-5 space-y-2">
          {WALLETS.map((w) => (
            <button
              key={w.name}
              type="button"
              disabled={!!pending}
              onClick={() => choose(w.name)}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-bg p-3 text-left transition hover:border-accent disabled:opacity-60"
            >
              <span
                className="grid size-10 place-items-center rounded-md text-sm font-bold text-white"
                style={{ background: w.color }}
              >
                {w.letter}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{w.name}</span>
                <span className="block font-mono text-[11px] text-muted">{w.hint}</span>
              </span>
              {pending === w.name && <Loader2 className="size-4 animate-spin text-accent" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
