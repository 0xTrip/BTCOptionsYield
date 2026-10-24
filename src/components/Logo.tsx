import { Link } from "react-router-dom";
import { APP_NAME } from "@/config";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#0f1624" stroke="#1e2636" />
      <path d="M8.5 21.5l5-6 4 3 6-8" fill="none" stroke="url(#logo-g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23.5" cy="10.5" r="2" fill="#f5c451" />
    </svg>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 font-semibold tracking-tight">
      <LogoMark />
      <span className="text-[15px]">{APP_NAME}</span>
    </Link>
  );
}
