import { DAY_MS, EARN, EPOCH_DAYS, VAULT } from "@/config";

/* ---------- deterministic randomness ---------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** Random walk from `start` to exactly `end`, with optional shocks on given steps */
function walk(steps: number, start: number, end: number, vol: number, seed: number, shocks: Record<number, number> = {}) {
  const rand = mulberry32(seed);
  const moves = Array.from({ length: steps }, (_, i) => vol * gaussian(rand) + (shocks[i] ?? 0));
  const drift = (Math.log(end / start) - moves.reduce((a, b) => a + b, 0)) / steps;
  const out = [start];
  for (const m of moves) out.push(out[out.length - 1] * Math.exp(m + drift));
  return out;
}

/* ---------- epoch schedule: weekly, settling with Friday 08:00 UTC expiries ---------- */

export const EPOCH_MS = EPOCH_DAYS * DAY_MS;

export function lastSettlement(now = Date.now()) {
  const d = new Date(now);
  const sinceFriday = (d.getUTCDay() + 2) % 7;
  let ts = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 8) - sinceFriday * DAY_MS;
  if (ts > now) ts -= EPOCH_MS;
  return ts;
}

const NOW = Date.now();
export const LAST_SETTLEMENT = lastSettlement(NOW);
export const NEXT_SETTLEMENT = LAST_SETTLEMENT + EPOCH_MS;

export const EPOCH_COUNT = 26;
export const LAUNCHED_AT = LAST_SETTLEMENT - EPOCH_COUNT * EPOCH_MS;
export const LIVE_EPOCH = EPOCH_COUNT + 1;

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const fmtExpiryCode = (ts: number) => {
  const d = new Date(ts);
  return `${d.getUTCDate()}${MONTHS[d.getUTCMonth()]}${String(d.getUTCFullYear()).slice(2)}`;
};

/* ---------- HYPE ---------- */

export const HYPE = { spot: 54.2, change24h: -0.016, iv30d: 0.94 };

/** Weekly HYPE closes: CLOSES[0] opens epoch 1, CLOSES[n] settles epoch n */
const CLOSES = walk(EPOCH_COUNT, 36.8, 55.1, 0.1, 4, { 6: 0.21, 19: 0.3 });

/** Calls are struck about 20% above the epoch's opening price, rounded up to a listed strike */
const strikeFor = (open: number) => Math.ceil(open * 1.2);

/* ---------- epoch history ---------- */

export type Epoch = {
  n: number;
  settledAt: number;
  /** HYPE price when the calls were sold, and at settlement */
  open: number;
  close: number;
  strike: number;
  /** HYPE locked in vaults, and the part of it in Earn mode */
  locked: number;
  earnHype: number;
  supply: number;
  staked: number;
  premium: number;
  /** HYPE finished above the strike, so Earn mode vaults paid out the difference */
  calledAway: boolean;
  /** What Earn mode vaults paid at settlement, in USD */
  givenUp: number;
  /** Stability fees for the week */
  fees: number;
  toVaults: number;
  toStakers: number;
  toProtocol: number;
  /** sUSDH → USDH rate once this epoch has fully vested */
  rate: number;
};

export const EPOCHS: Epoch[] = (() => {
  const rand = mulberry32(9);
  const out: Epoch[] = [];
  let rate = 1;
  for (let n = 1; n <= EPOCH_COUNT; n++) {
    const t = (n - 1) / (EPOCH_COUNT - 1);
    const last = n === EPOCH_COUNT;
    const locked = 560_000 * Math.pow(1_620_000 / 560_000, t) * (last ? 1 : 1 + 0.02 * gaussian(rand));
    const supply = 9_000_000 * Math.pow(31_400_000 / 9_000_000, t) * (last ? 1 : 1 + 0.02 * gaussian(rand));
    const earnHype = locked * (0.3 + 0.16 * t);
    const staked = supply * (0.48 + 0.1 * t);
    const open = CLOSES[n - 1];
    const close = CLOSES[n];
    const strike = strikeFor(open);
    const premium = earnHype * open * (0.0049 + 0.0005 * gaussian(rand));
    const givenUp = earnHype * Math.max(0, close - strike);
    const fees = supply * VAULT.stabilityFee * (EPOCH_DAYS / 365);
    const toStakers = fees + premium * EARN.split.stakers;
    rate *= 1 + toStakers / staked;
    out.push({
      n,
      settledAt: LAUNCHED_AT + n * EPOCH_MS,
      open,
      close,
      strike,
      locked,
      earnHype,
      supply,
      staked,
      premium,
      calledAway: close > strike,
      givenUp,
      fees,
      toVaults: premium * EARN.split.vaults,
      toStakers,
      toProtocol: premium * EARN.split.protocol,
      rate,
    });
  }
  return out;
})();

/** Each epoch's staker income vests linearly over the following week, so the rate never jumps */
export function rateAt(ts: number) {
  let prev = 1;
  for (const e of EPOCHS) {
    if (ts < e.settledAt) return prev;
    const vested = (ts - e.settledAt) / EPOCH_MS;
    if (vested < 1) return prev + (e.rate - prev) * vested;
    prev = e.rate;
  }
  return prev;
}

export type RatePoint = { ts: number; rate: number };

export const RATE_HISTORY: RatePoint[] = (() => {
  const out: RatePoint[] = [];
  for (let ts = LAUNCHED_AT; ts < NOW; ts += DAY_MS) out.push({ ts, rate: rateAt(ts) });
  out.push({ ts: NOW, rate: rateAt(NOW) });
  return out;
})();

/** Current sUSDH → USDH exchange rate */
export const RATE = rateAt(NOW);

/* ---------- protocol snapshot ---------- */

const LAST = EPOCHS[EPOCHS.length - 1];
const RECENT = EPOCHS.slice(-4);
const sum = (xs: Epoch[], f: (e: Epoch) => number) => xs.reduce((s, e) => s + f(e), 0);

export const PROTOCOL = {
  hypeLocked: LAST.locked,
  collateralValue: LAST.locked * HYPE.spot,
  supply: LAST.supply,
  /** Total collateral value ÷ USDH debt */
  systemRatio: (LAST.locked * HYPE.spot) / LAST.supply,
  earnHype: LAST.earnHype,
  earnShare: LAST.earnHype / LAST.locked,
  staked: LAST.staked,
  stakedShare: LAST.staked / LAST.supply,
  /** sUSDH, last 30 days, compounded */
  apy30d: Math.pow(RATE / rateAt(NOW - 30 * DAY_MS), 365 / 30) - 1,
  /** Premium paid to Earn mode vaults over the last 4 epochs, annualised on the HYPE they put in */
  earnYield: (sum(RECENT, (e) => e.toVaults / (e.earnHype * e.open)) / RECENT.length) * (365 / EPOCH_DAYS),
  premiumToDate: sum(EPOCHS, (e) => e.premium),
  toVaultsToDate: sum(EPOCHS, (e) => e.toVaults),
  feesToDate: sum(EPOCHS, (e) => e.fees),
  calledAwayWeeks: EPOCHS.filter((e) => e.calledAway).length,
  vaults: 2_148,
  /** USDT held to back 1:1 swaps */
  swapReserve: 6_240_000,
  lastEpoch: LAST,
};

/* ---------- this epoch's covered calls ---------- */

export type Call = {
  strike: number;
  /** Contracts, in HYPE */
  size: number;
  /** Premium received per HYPE */
  credit: number;
  /** Current cost to close, per HYPE */
  mark: number;
  venue: string;
};

const LIVE_STRIKE = strikeFor(LAST.close);
const lot = (share: number) => Math.round((PROTOCOL.earnHype * share) / 1_000) * 1_000;

export const BOOK: Call[] = [
  { strike: LIVE_STRIKE, size: lot(0.62), credit: 0.27, mark: 0.19, venue: "Deribit" },
  { strike: LIVE_STRIKE, size: lot(0.24), credit: 0.26, mark: 0.19, venue: "Bybit" },
  { strike: LIVE_STRIKE + 3, size: lot(0.14), credit: 0.17, mark: 0.11, venue: "Deribit" },
];

export const instrument = (c: Call) => `HYPE_USDC-${fmtExpiryCode(NEXT_SETTLEMENT)}-${c.strike}-C`;
export const premiumOf = (c: Call) => c.credit * c.size;
export const pnlOf = (c: Call) => (c.credit - c.mark) * c.size;
export const distanceOf = (c: Call) => c.strike / HYPE.spot - 1;

export const BOOK_STATS = {
  strike: LIVE_STRIKE,
  opened: LAST.close,
  size: BOOK.reduce((s, c) => s + c.size, 0),
  premium: BOOK.reduce((s, c) => s + premiumOf(c), 0),
  pnl: BOOK.reduce((s, c) => s + pnlOf(c), 0),
  /** Premium per HYPE in Earn mode, before the split */
  perHype: BOOK.reduce((s, c) => s + premiumOf(c), 0) / BOOK.reduce((s, c) => s + c.size, 0),
};

/* ---------- vault maths ---------- */

export const collateralRatio = (collateral: number, debt: number, price = HYPE.spot) => (debt > 0 ? (collateral * price) / debt : Infinity);
export const liquidationPrice = (collateral: number, debt: number) => (collateral > 0 ? (debt * VAULT.liquidationRatio) / collateral : 0);
/** Most USDH that can be minted against a vault right now */
export const maxMint = (collateral: number, debt: number) => Math.max(0, (collateral * HYPE.spot) / VAULT.minRatio - debt);
/** Most HYPE that can be withdrawn while staying at or above the minimum ratio */
export const maxWithdraw = (collateral: number, debt: number) => Math.max(0, collateral - (debt * VAULT.minRatio) / HYPE.spot);

/* ---------- seeded demo user ---------- */

export type ActivityType = "deposit" | "withdraw" | "mint" | "repay" | "earn" | "called" | "earn_on" | "earn_off" | "stake" | "unstake" | "swap";

export type Activity = {
  id: string;
  type: ActivityType;
  ts: number;
  amount: number;
  note?: string;
};

export type Vault = {
  /** HYPE */
  collateral: number;
  /** USDH */
  debt: number;
  earn: boolean;
  /** USDH of debt repaid by Earn mode premium */
  premiumEarned: number;
  /** HYPE sold to settle calls that finished in the money */
  calledHype: number;
  openedAt: number;
};

export type UserSeed = {
  usdh: number;
  shares: number;
  stakeCost: number;
  vault: Vault;
  activity: Activity[];
};

export function seedUser(): UserSeed {
  const now = Date.now();
  const openedAt = now - 100 * DAY_MS;
  const vault: Vault = { collateral: 1_200, debt: 20_000, earn: true, premiumEarned: 0, calledHype: 0, openedAt };
  const activity: Activity[] = [
    { id: "seed-dep", type: "deposit", ts: openedAt, amount: 1_200 },
    { id: "seed-mint", type: "mint", ts: openedAt + 60_000, amount: 20_000 },
    { id: "seed-earn-on", type: "earn_on", ts: openedAt + 120_000, amount: 0 },
    { id: "seed-stake", type: "stake", ts: openedAt + 180_000, amount: 12_000 },
  ];

  // Each settled epoch since the vault opened: premium repays debt, and calls in the money sell a little HYPE
  for (const e of EPOCHS.filter((x) => x.settledAt - EPOCH_MS > openedAt)) {
    const share = vault.collateral / e.earnHype;
    const credit = e.toVaults * share;
    vault.debt -= credit;
    vault.premiumEarned += credit;
    activity.push({ id: `seed-earn-${e.n}`, type: "earn", ts: e.settledAt, amount: credit, note: `Epoch ${e.n} premium` });
    if (e.calledAway) {
      const sold = (vault.collateral * (e.close - e.strike)) / e.close;
      vault.collateral -= sold;
      vault.calledHype += sold;
      activity.push({ id: `seed-called-${e.n}`, type: "called", ts: e.settledAt + 1, amount: sold, note: `Epoch ${e.n} · HYPE closed above $${e.strike}` });
    }
  }

  activity.sort((a, b) => b.ts - a.ts);
  return {
    usdh: 2_500,
    shares: 12_000 / rateAt(openedAt),
    stakeCost: 12_000,
    vault,
    activity,
  };
}
