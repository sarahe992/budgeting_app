import { DEFAULT_ACCOUNTS, STARTER_CATEGORIES } from "./categories";
import type { Account, Category, Envelope, Transaction } from "./types";

const KEYS = {
  transactions: "budget-app:v1:transactions",
  categories: "budget-app:v1:categories",
  envelopes: "budget-app:v1:envelopes",
  accounts: "budget-app:v1:accounts",
  monthBudgets: "budget-app:v1:month-budgets",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadTransactions(): Transaction[] {
  return read(KEYS.transactions, []);
}

export function saveTransactions(transactions: Transaction[]) {
  write(KEYS.transactions, transactions);
}

export function loadCategories(): Category[] {
  return read(KEYS.categories, STARTER_CATEGORIES);
}

export function saveCategories(categories: Category[]) {
  write(KEYS.categories, categories);
}

export function loadEnvelopes(): Envelope[] {
  return read(KEYS.envelopes, []);
}

export function saveEnvelopes(envelopes: Envelope[]) {
  write(KEYS.envelopes, envelopes);
}

export function loadAccounts(): Account[] {
  return read(KEYS.accounts, DEFAULT_ACCOUNTS);
}

/** Total budget target per month ("YYYY-MM" -> dollars), set on the laptop. */
export function loadMonthBudgets(): Record<string, number> {
  return read(KEYS.monthBudgets, {});
}

export function saveMonthBudgets(monthBudgets: Record<string, number>) {
  write(KEYS.monthBudgets, monthBudgets);
}

export function exportBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    categories: loadCategories(),
    envelopes: loadEnvelopes(),
    accounts: loadAccounts(),
    monthBudgets: loadMonthBudgets(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `budget-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
