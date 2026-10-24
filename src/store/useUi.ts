import { create } from "zustand";

type Ui = {
  connectOpen: boolean;
  setConnectOpen: (v: boolean) => void;
};

export const useUi = create<Ui>((set) => ({
  connectOpen: false,
  setConnectOpen: (connectOpen) => set({ connectOpen }),
}));
