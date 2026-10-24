import { Link } from "react-router-dom";
import { LogoMark } from "@/components/Logo";
import { APP_NAME } from "@/config";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-6" />
          <span>{APP_NAME}</span>
          <span className="text-faint">·</span>
          <span className="text-faint">Prototype with illustrative data</span>
        </div>
        <div className="flex gap-5">
          <Link to="/" className="hover:text-fg">Home</Link>
          <Link to="/app" className="hover:text-fg">Dashboard</Link>
          <Link to="/app/strategies" className="hover:text-fg">Strategies</Link>
        </div>
      </div>
    </footer>
  );
}
