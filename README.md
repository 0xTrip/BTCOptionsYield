# BTC Yield Vault: UI MVP

A clickable front-end prototype of a USDC vault that earns yield from a basket of Bitcoin options strategies (mostly selling puts, plus spreads, calls and hedges). It was built to show potential collaborators what the product could look like.

**Everything is mock data.** There's no backend, no real wallet connection and no real funds. State is saved in the browser's localStorage. Use **Reset demo** in the app header to start over.

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Landing page: pitch, how it works, strategy basket, fees with a worked example, Lucky Boost |
| `/app` | Dashboard: fake wallet connect, balance and earnings, performance chart, allocation, deposit and withdraw flows (with the T+30 notice), activity, Lucky Boost draw |
| `/app/strategies` | Interactive sell-put payoff explorer, plus a strategy mix that shifts with the market regime (Rising / Sideways / Falling) |

## Demo flow

1. Launch App → **Connect** → choose any wallet. This loads a seeded position and 25,000 demo USDC.
2. **Deposit**: a 1% fee preview, then shares minted at the current share price.
3. **Withdraw**: a 1% exit fee and a 30-day notice timeline; the request goes into *Pending withdrawals*. Click **Skip** to fast-forward the notice period and show the **Claim** step.
4. **Strategies**: drag the BTC expiry price slider to watch the short put's P&L change.

## Editing numbers

- Fees, notice period, demo wallet balance and the put example: `src/config.ts`
- Vault TVL, price history, strategies, allocations and Lucky Boost tiers: `src/data/mock.ts`
- Product name: `APP_NAME` in `src/config.ts` (and `<title>` in `index.html`)
- Colours: CSS variables in `src/index.css`

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, Radix UI primitives, Recharts, Zustand and Lucide icons. Deploys to Vercel on every push to `main` (`vercel.json` sets up the SPA rewrites).
