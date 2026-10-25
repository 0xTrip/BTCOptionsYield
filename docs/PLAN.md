# USDH: plan

## The product

BitStable, but for HYPE, plus one addition.

- **Base (same as BitStable):** users lock collateral in a vault and mint a dollar stablecoin against it. Vaults are overcollateralised and liquidated if they fall too far. The stablecoin can be staked, and it swaps 1:1 with major stablecoins. Here the collateral is **HYPE** and the stablecoin is **USDH**.
- **Addition, HYPE options:** vault owners can switch on **Earn mode**. Each week the protocol sells covered calls on their HYPE, and the premium pays down their USDH debt.

## How it works

### Vaults

| Parameter | Value |
| --- | --- |
| Collateral | HYPE (more assets can be added later) |
| Minimum collateral ratio to mint or withdraw | 200% (50% loan-to-value) |
| Liquidation ratio | 150% |
| Liquidation penalty | 10% |
| Stability fee | 4% a year on debt, paid to sUSDH stakers |

The 200%/150% levels are set wide because HYPE's implied volatility is around 90%.

### Earn mode (the addition)

- It's a switch on each vault. Changes take effect at the next weekly epoch.
- After each Friday 08:00 UTC expiry, the protocol sells calls on the HYPE in Earn mode vaults, struck about 20% above spot (never less than 15%), expiring the following Friday. The calls are cash-settled on Deribit and Bybit, which both list HYPE options.
- Calls are only ever sold against HYPE already in Earn mode vaults, so there is no naked exposure.
- Premium split: **75% repays the vault's debt**, 15% goes to sUSDH stakers and 10% to the protocol.
- If HYPE closes below the strike, the calls expire worthless and the vault keeps everything.
- If HYPE closes above the strike, the vault pays the difference out of its HYPE. It keeps every gain up to the strike.
- **It can't push a vault toward liquidation.** Below the strike, the premium only adds a cushion. Above it, the vault is still worth more than at the start of the week.

The pitch for borrowers: a HYPE-backed loan that pays itself down. In the mock, Earn mode has averaged about 20% a year on the HYPE's value, so a vault at 37% loan-to-value would clear its debt in roughly two years if prices held.

### Staking and the peg

- **sUSDH:** stake USDH and earn all stability fees plus 15% of options premium, with no lockup. Stakers never sell options or pay out on them; the vaults' HYPE covers the calls.
- **Swap:** USDT ↔ USDH 1:1 with a 0.10% fee, through a USDT peg reserve. BitStable offers the same 1:1 exchange between DAII and USDT/USDC.
- **Liquidations** sell collateral to keepers at a discount. The protocol's 10% share of premium builds a surplus buffer to cover any bad debt.

## What's built (this repo)

A mock UI with deterministic data, in the same stack as before:

- `/`: landing page (how it works, vault parameters with a worked example, the covered-call payoff, this week's calls, staking)
- `/app`: vault (deposit, mint, repay, withdraw with live collateral-ratio and liquidation-price previews, the Earn mode switch, health meter, activity)
- `/app/stake`: stake, unstake and swap; sUSDH rate chart; where the yield comes from
- `/app/options`: Earn mode explorer (vault value at expiry with and without calls), this week's calls, premium history

## Next phases

1. **Contracts:** a vault manager (deposit, mint, repay, withdraw, liquidate), the USDH ERC-20, an sUSDH ERC-4626 with weekly vesting, the USDT peg reserve, and an Earn mode registry that records which vaults opt in each epoch. The obvious chain is HyperEVM, where HYPE lives, with a HYPE price oracle.
2. **Options operations:** custody for the collateral that backs the calls (off-exchange settlement so HYPE isn't sitting on a venue), an execution service that sells the weekly strike, and a settlement job that credits premium to vaults and settles in-the-money weeks on-chain.
3. **Wire the UI to real data:** replace `src/data/mock.ts` with an API that returns the same shapes, and swap the fake wallet for wagmi/viem.
4. **Launch:** debt ceilings that rise over time, an Earn mode cap sized to HYPE options liquidity, audits and a bug bounty.

## Open questions

- **Name:** Native Markets already issues a USDH stablecoin on Hyperliquid. Token names live in `TICKER` in `src/config.ts`, so a rename is one edit.
- **Options capacity:** HYPE options listed on Deribit in June 2026. How much HYPE can go into Earn mode depends on how many calls the market will absorb each week, so Earn mode probably needs a cap.
- **Governance token:** BitStable pays DAII stakers in its BSSB token. This plan pays sUSDH stakers real yield instead. A governance token can be added later if wanted.
