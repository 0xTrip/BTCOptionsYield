import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Menu, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { Ticker } from "@/components/Ticker";
import { cn } from "@/lib/utils";
import { useUi } from "@/store/useUi";
import { useAccount } from "@/store/useAccount";

const MARKETING_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#vaults", label: "Vaults" },
  { href: "#earn", label: "Earn mode" },
  { href: "#stake", label: "Stake" },
];

const APP_LINKS = [
  { to: "/app", label: "Vault", end: true },
  { to: "/app/stake", label: "Stake", end: false },
  { to: "/app/options", label: "Options", end: false },
];

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-accent/40 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-accent">
      <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
      Demo
    </span>
  );
}

function WalletButton() {
  const connected = useAccount((s) => s.connected);
  const address = useAccount((s) => s.address);
  const disconnect = useAccount((s) => s.disconnect);
  const setConnectOpen = useUi((s) => s.setConnectOpen);

  if (!connected || !address)
    return (
      <Button size="sm" className="h-9" onClick={() => setConnectOpen(true)}>
        <Wallet /> Connect
      </Button>
    );

  return (
    <button
      type="button"
      onClick={disconnect}
      title="Disconnect"
      className="group flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border-strong px-2.5 font-mono text-[11px] transition hover:border-down/50 sm:px-3 sm:text-xs"
    >
      <span className="size-1.5 rounded-full bg-up group-hover:bg-down" />
      <span className="num">{`${address.slice(0, 6)}…${address.slice(-4)}`}</span>
      <LogOut className="hidden size-3.5 text-muted group-hover:text-down sm:block" />
    </button>
  );
}

const linkBase = "relative px-3 py-2 text-sm font-medium transition-colors";

export function Nav({ variant }: { variant: "marketing" | "app" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reset = useAccount((s) => s.reset);
  const navigate = useNavigate();

  const doReset = () => {
    reset();
    setMenuOpen(false);
    navigate("/app");
  };

  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md">
      <Ticker />
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Logo to={variant === "app" ? "/app" : "/"} />

          <nav className="hidden items-center md:flex">
            {variant === "marketing"
              ? MARKETING_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className={cn(linkBase, "text-muted hover:text-fg")}>
                    {l.label}
                  </a>
                ))
              : APP_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        linkBase,
                        "after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:transition-colors",
                        isActive ? "text-fg after:bg-accent" : "text-muted after:bg-transparent hover:text-fg",
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <DemoBadge />
            </span>
            {variant === "marketing" ? (
              <Button asChild size="sm" className="h-9">
                <Link to="/app">
                  Launch App <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden h-9 lg:inline-flex" onClick={doReset}>
                  <RotateCcw /> Reset demo
                </Button>
                <WalletButton />
              </>
            )}
            <Button variant="ghost" size="icon" className="size-9 md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent side="right" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="mb-8 mt-1">
            <DemoBadge />
          </div>
          <nav className="flex flex-col">
            {variant === "marketing"
              ? MARKETING_LINKS.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="border-b border-border py-4 text-lg font-medium text-muted hover:text-fg">
                    {l.label}
                  </a>
                ))
              : APP_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn("border-b border-border py-4 text-lg font-medium", isActive ? "text-accent" : "text-muted hover:text-fg")
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
            {variant === "marketing" ? (
              <Button asChild className="mt-6">
                <Link to="/app" onClick={() => setMenuOpen(false)}>
                  Launch App <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 text-lg font-medium text-muted hover:text-fg">
                  Home
                </Link>
                <button type="button" onClick={doReset} className="flex items-center gap-2 py-4 text-left text-lg font-medium text-muted hover:text-fg">
                  <RotateCcw className="size-4" /> Reset demo
                </button>
              </>
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
