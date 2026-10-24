const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fmtUsd = (n: number) => usd.format(n);
export const fmtUsd0 = (n: number) => usd0.format(n);
export const fmtCompact = (n: number) => compact.format(n);

export const fmtSigned = (n: number) => (n >= 0 ? "+" : "−") + usd.format(Math.abs(n));
export const fmtSigned0 = (n: number) => (n >= 0 ? "+" : "−") + usd0.format(Math.abs(n));

export const fmtPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
export const fmtSignedPct = (n: number, digits = 1) =>
  (n >= 0 ? "+" : "−") + `${Math.abs(n * 100).toFixed(digits)}%`;

export const fmtNum = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const fmtShortDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export function fmtRelative(ts: number, now = Date.now()) {
  const diff = now - ts;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtShortDate(ts);
}
