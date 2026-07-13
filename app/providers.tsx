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
  loadGoals,
  loadMonthBudgets,
  loadTransactions,
  saveCategories,
  saveEnvelopes,
  saveGoals,
  saveMonthBudgets,
  saveTransactions,
} from "./lib/storage";
import type {
  Account,
  Category,
  Envelope,
  Goal,
  Transaction,
} from "./lib/types";

interface AppData {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
  accounts: Account[];
  monthBudgets: Record<string, number>;
  goals: Goal[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  setCategories: (categories: Category[]) => void;
  setEnvelopeBudget: (categoryId: string, month: string, budget: number) => void;
  setMonthBudget: (month: string, budget: number) => void;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
}

interface HydratedState {
  transactions: Transaction[];
  categories: Category[];
  envelopes: Envelope[];
  monthBudgets: Record<string, number>;
  goals: Goal[];
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HydratedState>({
    transactions: [],
    categories: STARTER_CATEGORIES,
    envelopes: [],
    monthBudgets: {},
    goals: [],
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
      goals: loadGoals(),
    });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveTransactions(state.transactions);
    saveCategories(state.categories);
    saveEnvelopes(state.envelopes);
    saveMonthBudgets(state.monthBudgets);
    saveGoals(state.goals);
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

  function addGoal(goal: Omit<Goal, "id" | "createdAt">) {
    const id = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newGoal: Goal = { ...goal, id, createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  }

  function updateGoal(id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }

  function deleteGoal(id: string) {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }

  function contributeToGoal(id: string, amount: number) {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, saved: Math.min(g.total, g.saved + amount) } : g
      ),
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
        goals: state.goals,
        addTransaction,
        setCategories,
        setEnvelopeBudget,
        setMonthBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
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
