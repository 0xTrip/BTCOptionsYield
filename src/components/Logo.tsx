import { Link } from "react-router-dom";
import { APP_NAME } from "@/config";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="6" fill="#f7931a" />
      {/* Bitcoin glyph with a rising yield stroke */}
      <path
        d="M11 8.5h6.2c2.6 0 4.3 1.4 4.3 3.6 0 1.4-.8 2.5-2 3 1.6.4 2.6 1.7 2.6 3.3 0 2.5-1.9 4.1-4.8 4.1H11V8.5zm3 2.6v3.6h2.8c1.1 0 1.8-.7 1.8-1.8s-.7-1.8-1.8-1.8H14zm0 6.1v3.9h3.2c1.2 0 2-.8 2-1.95 0-1.15-.8-1.95-2-1.95H14z"
        fill="#0a0500"
      />
      <path d="M13 6v2.5M16.5 6v2.5M13 23v2.5M16.5 23v2.5" stroke="#0a0500" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  const [first, ...rest] = APP_NAME.split(" ");
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      <LogoMark />
      <span className="display whitespace-nowrap text-[13px] uppercase tracking-tight sm:text-[15px]">
        {first} <span className="text-accent">{rest.join(" ")}</span>
      </span>
    </Link>
  );
}
