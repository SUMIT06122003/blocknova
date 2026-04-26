import { create } from "zustand";

export const useStore = create((set) => ({
  account: null,
  balance: "0",
  portfolio: [],

  setAccount: (account) => set({ account }),
  setBalance: (balance) => set({ balance }),
  setPortfolio: (portfolio) => set({ portfolio }),
}));