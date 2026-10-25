/** Token names live here so a rename is one edit */
export const TICKER = {
  stable: "USDH",
  staked: "sUSDH",
  base: "USDT",
  collateral: "HYPE",
};

export const APP_NAME = TICKER.stable;

/** CDP parameters for HYPE vaults */
export const VAULT = {
  /** Lowest collateral ratio you can mint or withdraw down to (50% LTV) */
  minRatio: 2,
  /** Vaults below this collateral ratio are liquidated */
  liquidationRatio: 1.5,
  liquidationPenalty: 0.1,
  /** Annual interest on USDH debt; paid to sUSDH stakers */
  stabilityFee: 0.04,
};

/** Earn mode: weekly covered calls on vault HYPE */
export const EARN = {
  /** Calls are sold at least this far above spot */
  minStrikeDistance: 0.15,
  /** How each week's premium is split */
  split: { vaults: 0.75, stakers: 0.15, protocol: 0.1 },
};

/** Swap USDT ↔ USDH 1:1 through the peg reserve */
export const SWAP_FEE = 0.001;

export const EPOCH_DAYS = 7;
export const MIN_AMOUNT = 1;

/** Demo wallet balances granted on connect */
export const DEMO_WALLET = { collateral: 500, base: 5_000 };

export const DAY_MS = 86_400_000;
