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
  loadMonthBudgets,
  loadTransactions,
  saveCategories,
  saveEnvelopes,
  saveMonthBudgets,
  saveTransactions,
} from "./lib/storage";
import type { Account, Category, Envelope, Transaction } from "./lib/types";

interface AppData {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
  accounts: Account[];
  monthBudgets: Record<string, number>;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  setCategories: (categories: Category[]) => void;
  setEnvelopeBudget: (categoryId: string, month: string, budget: number) => void;
  setMonthBudget: (month: string, budget: number) => void;
}

interface HydratedState {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
  monthBudgets: Record<string, number>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HydratedState>({
    transactions: [],
    categories: STARTER_CATEGORIES,
    envelopes: [],
    monthBudgets: {},
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
      monthBudgets: loadMonthBudgets(),
    });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveTransactions(state.transactions);
    saveCategories(state.categories);
    saveEnvelopes(state.envelopes);
    saveMonthBudgets(state.monthBudgets);
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

  function setEnvelopeBudget(categoryId: string, month: string, budget: number) {
    setState((prev) => {
      const idx = prev.envelopes.findIndex(
        (e) => e.categoryId === categoryId && e.month === month
      );
      if (idx >= 0) {
        const envelopes = prev.envelopes.slice();
        envelopes[idx] = { ...envelopes[idx], budget };
        return { ...prev, envelopes };
      }
      const envelope: Envelope = {
        id: `env_${categoryId}_${month}`,
        categoryId,
        month,
        budget,
      };
      return { ...prev, envelopes: [...prev.envelopes, envelope] };
    });
  }

  function setMonthBudget(month: string, budget: number) {
    setState((prev) => ({
      ...prev,
      monthBudgets: { ...prev.monthBudgets, [month]: budget },
    }));
  }

  return (
    <AppDataContext.Provider
      value={{
        transactions: state.transactions,
        categories: state.categories,
        envelopes: state.envelopes,
        accounts,
        monthBudgets: state.monthBudgets,
        addTransaction,
        setCategories,
        setEnvelopeBudget,
        setMonthBudget,
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
