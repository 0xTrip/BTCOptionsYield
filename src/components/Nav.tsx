import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, Menu, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useUi } from "@/store/useUi";
import { useVault } from "@/store/useVault";

const MARKETING_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#strategies", label: "Strategies" },
  { href: "#fees", label: "Fees" },
  { href: "#boost", label: "Lucky Boost" },
];

const APP_LINKS = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/strategies", label: "Strategies", end: false },
];

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
      <span className="size-1.5 rounded-full bg-gold animate-pulse-soft" />
      Demo
    </span>
  );
}

function WalletButton() {
  const connected = useVault((s) => s.connected);
  const address = useVault((s) => s.address);
  const disconnect = useVault((s) => s.disconnect);
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
      className="group flex h-9 items-center gap-2 rounded-xl border border-border-strong bg-surface-2 px-3 text-xs font-medium transition hover:border-down/40"
    >
      <span className="size-2 rounded-full bg-up group-hover:bg-down" />
      <span className="num">{`${address.slice(0, 6)}…${address.slice(-4)}`}</span>
      <LogOut className="size-3.5 text-muted group-hover:text-down" />
    </button>
  );
}

export function Nav({ variant }: { variant: "marketing" | "app" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reset = useVault((s) => s.reset);
  const navigate = useNavigate();

  const doReset = () => {
    reset();
    setMenuOpen(false);
    navigate("/app");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo to={variant === "app" ? "/app" : "/"} />

        <nav className="hidden items-center gap-1 md:flex">
          {variant === "marketing"
            ? MARKETING_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-fg">
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
                      "rounded-lg px-3 py-2 text-sm transition",
                      isActive ? "bg-white/5 text-fg" : "text-muted hover:text-fg",
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

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent side="right" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="mb-8 mt-1">
            <DemoBadge />
          </div>
          <nav className="flex flex-col gap-1">
            {variant === "marketing"
              ? MARKETING_LINKS.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-muted hover:bg-white/5 hover:text-fg">
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
                      cn("rounded-lg px-3 py-3 text-base", isActive ? "bg-white/5 text-fg" : "text-muted hover:text-fg")
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
            <div className="my-3 h-px bg-border" />
            {variant === "marketing" ? (
              <Button asChild className="mt-2">
                <Link to="/app" onClick={() => setMenuOpen(false)}>
                  Launch App <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-muted hover:text-fg">
                  Home
                </Link>
                <button type="button" onClick={doReset} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-base text-muted hover:text-fg">
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
