import { Link } from "react-router-dom";
import { LogoMark } from "@/components/Logo";
import { APP_NAME } from "@/config";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark className="size-6" />
          <span className="display text-sm uppercase">{APP_NAME}</span>
          <span className="eyebrow text-faint">Prototype · illustrative data</span>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link to="/" className="hover:text-accent">Home</Link>
          <Link to="/app" className="hover:text-accent">Vault</Link>
          <Link to="/app/stake" className="hover:text-accent">Stake</Link>
          <Link to="/app/options" className="hover:text-accent">Options</Link>
        </div>
      </div>
    </footer>
  );
}
