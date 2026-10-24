import { DAY_MS, FEES, PUT_EXAMPLE } from "@/config";

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

/** Random walk from `start` to exactly `end`, with optional shocks on given days */
function walk(
  days: number,
  start: number,
  end: number,
  vol: number,
  seed: number,
  shocks: Record<number, number> = {},
) {
  const rand = mulberry32(seed);
  const steps = Array.from({ length: days }, (_, i) => vol * gaussian(rand) + (shocks[i] ?? 0));
  const drift = (Math.log(end / start) - steps.reduce((a, b) => a + b, 0)) / days;
  const out = [start];
  for (const s of steps) out.push(out[out.length - 1] * Math.exp(s + drift));
  return out;
}

/* ---------- vault history (180 days) ---------- */

export const HISTORY_DAYS = 180;
const today = new Date();
today.setHours(0, 0, 0, 0);
const startTs = today.getTime() - HISTORY_DAYS * DAY_MS;

// Vault: steady premium carry with two drawdowns when BTC sold off through strikes
const vaultSeries = walk(HISTORY_DAYS, 1, 1.0824, 0.0019, 105, {
  58: -0.009, 59: -0.012, 60: -0.008, 61: -0.004,
  127: -0.007, 128: -0.009, 129: -0.003,
});
const btcSeries = walk(HISTORY_DAYS, 68_400, PUT_EXAMPLE.spot, 0.024, 21, {
  58: -0.05, 59: -0.06, 60: -0.03,
  127: -0.04, 128: -0.045,
});

export type HistoryPoint = { ts: number; sharePrice: number; btc: number };

export const HISTORY: HistoryPoint[] = vaultSeries.map((p, i) => ({
  ts: startTs + i * DAY_MS,
  sharePrice: p,
  btc: btcSeries[i],
}));

export const SHARE_PRICE = HISTORY[HISTORY.length - 1].sharePrice;

const priceAgo = (days: number) => HISTORY[HISTORY.length - 1 - days].sharePrice;

export const VAULT = {
  tvl: 12_480_000,
  depositors: 1_284,
  apy30d: (SHARE_PRICE / priceAgo(30) - 1) * (365 / 30),
  returnAll: SHARE_PRICE - 1,
  btcSpot: PUT_EXAMPLE.spot,
};

/* ---------- strategies ---------- */

export type Regime = "rising" | "sideways" | "falling";
export type StrategyId = "puts" | "spreads" | "calls" | "hedges" | "idle";

export type Strategy = {
  id: StrategyId;
  name: string;
  short: string;
  description: string;
  regimes: Regime[];
  risk: "Low" | "Medium" | "High";
  targetYield: string;
  color: string;
  payoff: "short-put" | "put-spread" | "long-call" | "long-put" | "flat";
};

export const STRATEGIES: Strategy[] = [
  {
    id: "puts",
    name: "Cash-secured puts",
    short: "Sell Puts",
    description:
      "Sell BTC puts below spot and collect the premium upfront. Earns when BTC holds above the strike: the core yield engine in flat and rising markets.",
    regimes: ["sideways", "rising"],
    risk: "Medium",
    targetYield: "15–25% APR",
    color: "#2dd4bf",
    payoff: "short-put",
  },
  {
    id: "spreads",
    name: "Put credit spreads",
    short: "Spreads",
    description:
      "Sell a put and buy a lower one as a floor. Less premium, but the maximum loss is capped and known in advance.",
    regimes: ["sideways", "rising", "falling"],
    risk: "Low",
    targetYield: "8–14% APR",
    color: "#0ea5e9",
    payoff: "put-spread",
  },
  {
    id: "calls",
    name: "Long calls",
    short: "Calls",
    description:
      "A small, high-conviction sleeve that buys upside calls in trending markets. Can multiply its premium, or expire worthless.",
    regimes: ["rising"],
    risk: "High",
    targetYield: "Up to 3× premium",
    color: "#818cf8",
    payoff: "long-call",
  },
  {
    id: "hedges",
    name: "Protective puts",
    short: "Hedges",
    description:
      "Buy downside puts when momentum turns, offsetting losses on short puts during sharp sell-offs.",
    regimes: ["falling"],
    risk: "Low",
    targetYield: "Protection",
    color: "#f5c451",
    payoff: "long-put",
  },
  {
    id: "idle",
    name: "USDC buffer",
    short: "Idle USDC",
    description:
      "Unallocated stablecoins held for withdrawals and margin, then redeployed when premiums are attractive.",
    regimes: ["sideways", "rising", "falling"],
    risk: "Low",
    targetYield: "Liquidity",
    color: "#64748b",
    payoff: "flat",
  },
];

export const ALLOCATIONS: Record<Regime, Record<StrategyId, number>> = {
  rising: { puts: 0.45, spreads: 0.15, calls: 0.2, hedges: 0.05, idle: 0.15 },
  sideways: { puts: 0.6, spreads: 0.2, calls: 0.05, hedges: 0.05, idle: 0.1 },
  falling: { puts: 0.2, spreads: 0.15, calls: 0, hedges: 0.25, idle: 0.4 },
};

export const CURRENT_REGIME: Regime = "sideways";

export const REGIME_LABEL: Record<Regime, string> = {
  rising: "Rising",
  sideways: "Sideways",
  falling: "Falling",
};

/* ---------- seeded demo user ---------- */

export type ActivityType = "deposit" | "withdraw_request" | "withdraw_claim" | "yield" | "boost";

export type Activity = {
  id: string;
  type: ActivityType;
  ts: number;
  amount: number;
  note?: string;
};

export type Withdrawal = {
  id: string;
  shares: number;
  gross: number;
  fee: number;
  net: number;
  requestedAt: number;
  unlockAt: number;
  claimed: boolean;
};

export type UserSeed = {
  shares: number;
  costBasis: number;
  firstDepositAt: number;
  activity: Activity[];
  withdrawals: Withdrawal[];
};

const idx = (daysAgo: number) => HISTORY.length - 1 - daysAgo;

export function seedUser(): UserSeed {
  const now = Date.now();
  const deposits = [
    { daysAgo: 118, amount: 4_000 },
    { daysAgo: 41, amount: 1_500 },
  ];
  let shares = 0;
  let costBasis = 0;
  const activity: Activity[] = [];

  for (const d of deposits) {
    const p = HISTORY[idx(d.daysAgo)].sharePrice;
    shares += (d.amount * (1 - FEES.deposit)) / p;
    costBasis += d.amount;
    activity.push({ id: `seed-dep-${d.daysAgo}`, type: "deposit", ts: now - d.daysAgo * DAY_MS, amount: d.amount });
  }

  // Monthly yield credits, computed from the share price path
  for (const daysAgo of [90, 60, 30]) {
    const held = deposits.filter((d) => d.daysAgo > daysAgo);
    const sh = held.reduce((s, d) => s + (d.amount * (1 - FEES.deposit)) / HISTORY[idx(d.daysAgo)].sharePrice, 0);
    const gain = sh * (HISTORY[idx(daysAgo)].sharePrice - HISTORY[idx(daysAgo + 30)].sharePrice);
    activity.push({ id: `seed-yield-${daysAgo}`, type: "yield", ts: now - daysAgo * DAY_MS, amount: gain, note: "Monthly options P&L" });
  }

  activity.push({
    id: "seed-boost",
    type: "boost",
    ts: now - 24 * DAY_MS,
    amount: 0,
    note: "Entered monthly Lucky Boost draw",
  });

  // One withdrawal sitting in its notice period
  const wShares = 450 / SHARE_PRICE;
  const gross = wShares * SHARE_PRICE;
  const requestedAt = now - 12 * DAY_MS;
  costBasis *= 1 - wShares / shares;
  shares -= wShares;
  const withdrawal: Withdrawal = {
    id: "seed-wd",
    shares: wShares,
    gross,
    fee: gross * FEES.withdraw,
    net: gross * (1 - FEES.withdraw),
    requestedAt,
    unlockAt: requestedAt + 30 * DAY_MS,
    claimed: false,
  };
  activity.push({ id: "seed-wd-req", type: "withdraw_request", ts: requestedAt, amount: gross });

  activity.sort((a, b) => b.ts - a.ts);
  return { shares, costBasis, firstDepositAt: now - 118 * DAY_MS, activity, withdrawals: [withdrawal] };
}

/* ---------- Lucky Boost ---------- */

export const BOOST_TIERS = [
  { multiplier: "3×", winners: 1, label: "Grand boost" },
  { multiplier: "2×", winners: 10, label: "Gold boost" },
  { multiplier: "1.5×", winners: 50, label: "Silver boost" },
];

export const BOOST_POOL = {
  totalTickets: 1_842_000,
  monthlyBudget: 18_500,
};

export function nextDrawDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0).getTime();
}
