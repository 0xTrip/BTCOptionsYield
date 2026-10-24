import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_WALLET_USDC } from "@/config";
import { SHARE_PRICE, seedUser, type Activity, type Withdrawal } from "@/data/mock";
import { previewDeposit, previewWithdraw } from "@/lib/vault-math";

export type WalletName = "MetaMask" | "Rabby" | "WalletConnect";

type State = {
  connected: boolean;
  wallet: WalletName | null;
  address: string | null;
  walletUsdc: number;
  shares: number;
  costBasis: number;
  firstDepositAt: number | null;
  activity: Activity[];
  withdrawals: Withdrawal[];
};

type Actions = {
  connect: (wallet: WalletName) => void;
  disconnect: () => void;
  deposit: (amount: number) => void;
  requestWithdraw: (shares: number) => void;
  claim: (id: string) => void;
  fastForward: (id: string) => void;
  reset: () => void;
};

const initial: State = {
  connected: false,
  wallet: null,
  address: null,
  walletUsdc: 0,
  shares: 0,
  costBasis: 0,
  firstDepositAt: null,
  activity: [],
  withdrawals: [],
};

const uid = () => Math.random().toString(36).slice(2, 10);

function fakeAddress() {
  const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `0x${hex}`;
}

export const useVault = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      connect: (wallet) => {
        // Returning demo users keep their history; first connect loads a seeded position
        if (get().address) return set({ connected: true, wallet });
        set({ ...seedUser(), connected: true, wallet, address: fakeAddress(), walletUsdc: DEMO_WALLET_USDC });
      },

      disconnect: () => set({ connected: false }),

      deposit: (amount) => {
        const { shares } = previewDeposit(amount, SHARE_PRICE);
        const s = get();
        set({
          walletUsdc: s.walletUsdc - amount,
          shares: s.shares + shares,
          costBasis: s.costBasis + amount,
          firstDepositAt: s.firstDepositAt ?? Date.now(),
          activity: [{ id: uid(), type: "deposit", ts: Date.now(), amount }, ...s.activity],
        });
      },

      requestWithdraw: (shares) => {
        const s = get();
        const p = previewWithdraw(shares, SHARE_PRICE);
        const w: Withdrawal = {
          id: uid(),
          shares,
          gross: p.gross,
          fee: p.fee,
          net: p.net,
          requestedAt: Date.now(),
          unlockAt: p.unlockAt,
          claimed: false,
        };
        set({
          shares: s.shares - shares,
          costBasis: s.costBasis * (1 - shares / s.shares),
          withdrawals: [w, ...s.withdrawals],
          activity: [{ id: uid(), type: "withdraw_request", ts: Date.now(), amount: p.gross }, ...s.activity],
        });
      },

      claim: (id) => {
        const s = get();
        const w = s.withdrawals.find((x) => x.id === id);
        if (!w || w.claimed || w.unlockAt > Date.now()) return;
        set({
          walletUsdc: s.walletUsdc + w.net,
          withdrawals: s.withdrawals.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
          activity: [{ id: uid(), type: "withdraw_claim", ts: Date.now(), amount: w.net }, ...s.activity],
        });
      },

      /** Demo helper: skip the notice period so the claim flow can be shown */
      fastForward: (id) =>
        set((s) => ({
          withdrawals: s.withdrawals.map((x) => (x.id === id ? { ...x, unlockAt: Date.now() - 1 } : x)),
        })),

      reset: () => set(initial),
    }),
    { name: "btc-yield-vault-demo", version: 1 },
  ),
);

export const selectBalance = (s: State) => s.shares * SHARE_PRICE;
export const selectPending = (s: State) => s.withdrawals.filter((w) => !w.claimed);
