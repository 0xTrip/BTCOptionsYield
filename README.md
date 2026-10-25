# USDH: UI prototype

A clickable front-end prototype of **USDH**, a dollar stablecoin minted against **HYPE**. It works like BitStable does for Bitcoin assets: lock collateral in a vault, mint a stablecoin against it, and stake the stablecoin for yield. The one addition is **Earn mode**, which sells weekly covered calls on vault HYPE so the premium pays down the loan. The design and build plan are in [`docs/PLAN.md`](docs/PLAN.md).

**Everything is mock data.** There's no backend, no real wallet connection and no real funds. State is saved in the browser's localStorage. Use **Reset demo** in the app header to start over.

## How it works

1. **Lock HYPE** in a vault.
2. **Mint USDH** against it, down to a 200% collateral ratio (50% loan-to-value). Vaults below 150% are liquidated with a 10% penalty. Debt carries a 4% stability fee.
3. **Earn mode** (optional, per vault): each Friday the protocol sells calls on the vault's HYPE, struck about 20% above spot. Of the premium, 75% repays the vault's debt, 15% goes to sUSDH stakers and 10% to the protocol. If HYPE closes above the strike, the vault gives up the gain above it.
4. **Stake USDH** as sUSDH to earn all stability fees plus 15% of the premium, with no lockup. USDH also swaps 1:1 with USDT for a 0.10% fee.

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Landing page: Earn mode yield, how it works, vault parameters with a worked example, the covered-call payoff, this week's calls, staking |
| `/app` | Vault: fake wallet connect, collateral, debt, collateral ratio and liquidation price, a Deposit / Mint / Repay / Withdraw panel with live previews, the Earn mode switch, activity |
| `/app/stake` | Stake: sUSDH rate chart, where the yield comes from, a Stake / Unstake / Swap panel |
| `/app/options` | Earn mode: vault value at expiry with and without covered calls (drag the price), this week's calls, premium history, the rules |

## Demo flow

1. Launch App → **Connect** → choose any wallet. This loads a seeded vault: about 1,190 HYPE against 16.9k USDH, with Earn mode on for 100 days. It also loads 12k staked USDH, 500 HYPE, 2.5k USDH and 5k USDT in the wallet.
2. **Mint**: type an amount and watch the collateral ratio and liquidation price update before you confirm.
3. **Earn mode**: flip the switch on the Vault page. Then open **Options** and drag the price past the strike to see the cap.
4. **Stake** or **Swap** on the Stake page.

## Editing numbers

- Token names, vault parameters, the premium split, swap fee and demo wallet: `src/config.ts`. `TICKER` holds the token names, so a rename is one edit.
- HYPE price, epoch history, this week's calls and the seeded vault: `src/data/mock.ts`. The 26 weekly epochs are generated deterministically, and the sUSDH rate, APYs, Earn mode yield and the seeded vault's history are all derived from them.
- Epochs settle with the Friday 08:00 UTC expiries and are computed from today's date, so the book never shows an expired instrument.
- Colours and fonts: CSS variables in `src/index.css` (volt lime `#c8f53c` on black; Archivo for display type, Geist and Geist Mono for text and data).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, Radix UI primitives, Recharts, Zustand and Lucide icons. Deploys to Vercel on every push to `main` (`vercel.json` sets up the SPA rewrites).
