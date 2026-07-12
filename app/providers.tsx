"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_ACCOUNTS, STARTER_CATEGORIES } from "./lib/categories";
import {
  loadCategories,
  loadEnvelopes,
  loadTransactions,
  saveCategories,
  saveEnvelopes,
  saveTransactions,
} from "./lib/storage";
import type { Account, Category, Envelope, Transaction } from "./lib/types";

interface AppData {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
  accounts: Account[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  setCategories: (categories: Category[]) => void;
}

interface HydratedState {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HydratedState>({
    transactions: [],
    categories: STARTER_CATEGORIES,
    envelopes: [],
  });
  const [accounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const hydrated = useRef(false);

  // One-time sync from localStorage on mount. localStorage is unavailable
  // during SSR, so this can't be a lazy useState initializer without
  // causing a hydration mismatch (server renders empty, client would render
  // populated on the very first pass).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      transactions: loadTransactions(),
      categories: loadCategories(),
      envelopes: loadEnvelopes(),
    });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveTransactions(state.transactions);
    saveCategories(state.categories);
    saveEnvelopes(state.envelopes);
  }, [state]);

  function addTransaction(tx: Omit<Transaction, "id">) {
    const id = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setState((prev) => ({
      ...prev,
      transactions: [{ ...tx, id }, ...prev.transactions],
    }));
  }

  function setCategories(categories: Category[]) {
    setState((prev) => ({ ...prev, categories }));
  }

  return (
    <AppDataContext.Provider
      value={{
        transactions: state.transactions,
        categories: state.categories,
        envelopes: state.envelopes,
        accounts,
        addTransaction,
        setCategories,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
