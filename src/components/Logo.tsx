import { Link } from "react-router-dom";
import { APP_NAME } from "@/config";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="6" fill="#c8f53c" />
      {/* An H whose crossbar is a volatile price line */}
      <path d="M8.5 8h3.6v16H8.5zM19.9 8h3.6v16h-3.6z" fill="#0b0f00" />
      <path d="M12.1 18.6l2.9-4.1 2.1 3.1 2.8-4" fill="none" stroke="#0b0f00" strokeWidth="2.6" strokeLinejoin="miter" />
    </svg>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      <LogoMark />
      <span className="display whitespace-nowrap text-[15px] uppercase tracking-tight sm:text-[17px]">{APP_NAME}</span>
    </Link>
  );
}
