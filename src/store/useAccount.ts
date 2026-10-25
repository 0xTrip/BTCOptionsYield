import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_WALLET, SWAP_FEE, TICKER } from "@/config";
import { RATE, seedUser, type Activity, type Vault } from "@/data/mock";

export type WalletName = "MetaMask" | "Rabby" | "WalletConnect";

type State = {
  connected: boolean;
  wallet: WalletName | null;
  address: string | null;
  hype: number;
  usdh: number;
  usdt: number;
  /** sUSDH held */
  shares: number;
  /** USDH staked, net of unstakes, for the earnings figure */
  stakeCost: number;
  vault: Vault | null;
  activity: Activity[];
};

type Actions = {
  connect: (wallet: WalletName) => void;
  disconnect: () => void;
  deposit: (hype: number) => void;
  withdraw: (hype: number) => void;
  mint: (usdh: number) => void;
  repay: (usdh: number) => void;
  setEarn: (on: boolean) => void;
  stake: (usdh: number) => void;
  unstake: (shares: number) => void;
  /** USDT → USDH when `toStable`, otherwise USDH → USDT */
  swap: (amount: number, toStable: boolean) => void;
  reset: () => void;
};

const initial: State = {
  connected: false,
  wallet: null,
  address: null,
  hype: 0,
  usdh: 0,
  usdt: 0,
  shares: 0,
  stakeCost: 0,
  vault: null,
  activity: [],
};

const uid = () => Math.random().toString(36).slice(2, 10);

function fakeAddress() {
  const hex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `0x${hex}`;
}

const entry = (type: Activity["type"], amount: number): Activity => ({ id: uid(), type, ts: Date.now(), amount });

const emptyVault = (): Vault => ({ collateral: 0, debt: 0, earn: true, premiumEarned: 0, calledHype: 0, openedAt: Date.now() });

export const useAccount = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      connect: (wallet) => {
        // Returning demo users keep their history; first connect loads a seeded vault
        if (get().address) return set({ connected: true, wallet });
        set({ ...seedUser(), hype: DEMO_WALLET.collateral, usdt: DEMO_WALLET.base, connected: true, wallet, address: fakeAddress() });
      },

      disconnect: () => set({ connected: false }),

      deposit: (hype) => {
        const s = get();
        const v = s.vault ?? emptyVault();
        set({ hype: s.hype - hype, vault: { ...v, collateral: v.collateral + hype }, activity: [entry("deposit", hype), ...s.activity] });
      },

      withdraw: (hype) => {
        const s = get();
        if (!s.vault) return;
        set({ hype: s.hype + hype, vault: { ...s.vault, collateral: s.vault.collateral - hype }, activity: [entry("withdraw", hype), ...s.activity] });
      },

      mint: (usdh) => {
        const s = get();
        if (!s.vault) return;
        set({ usdh: s.usdh + usdh, vault: { ...s.vault, debt: s.vault.debt + usdh }, activity: [entry("mint", usdh), ...s.activity] });
      },

      repay: (usdh) => {
        const s = get();
        if (!s.vault) return;
        set({ usdh: s.usdh - usdh, vault: { ...s.vault, debt: s.vault.debt - usdh }, activity: [entry("repay", usdh), ...s.activity] });
      },

      setEarn: (on) => {
        const s = get();
        if (!s.vault || s.vault.earn === on) return;
        set({ vault: { ...s.vault, earn: on }, activity: [entry(on ? "earn_on" : "earn_off", 0), ...s.activity] });
      },

      stake: (usdh) => {
        const s = get();
        set({
          usdh: s.usdh - usdh,
          shares: s.shares + usdh / RATE,
          stakeCost: s.stakeCost + usdh,
          activity: [entry("stake", usdh), ...s.activity],
        });
      },

      unstake: (shares) => {
        const s = get();
        set({
          usdh: s.usdh + shares * RATE,
          shares: s.shares - shares,
          stakeCost: s.stakeCost * (1 - shares / s.shares),
          activity: [entry("unstake", shares * RATE), ...s.activity],
        });
      },

      swap: (amount, toStable) => {
        const s = get();
        const out = amount * (1 - SWAP_FEE);
        const note = toStable ? `${TICKER.base} → ${TICKER.stable}` : `${TICKER.stable} → ${TICKER.base}`;
        const activity = [{ ...entry("swap", amount), note }, ...s.activity];
        set(toStable ? { usdt: s.usdt - amount, usdh: s.usdh + out, activity } : { usdh: s.usdh - amount, usdt: s.usdt + out, activity });
      },

      reset: () => set(initial),
    }),
    { name: "usdh-hype-demo", version: 1 },
  ),
);
