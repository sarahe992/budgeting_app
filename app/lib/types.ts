export type AccountId = "checking" | "savings";

export interface Account {
  id: AccountId;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

/** Per-category monthly budget assignment. Budget UI ships in Session 3 — for now this defaults to 0. */
export interface Envelope {
  id: string;
  categoryId: string;
  month: string; // "YYYY-MM"
  budget: number;
}

export type TransactionType = "spending" | "income" | "transfer";

export interface Transaction {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  name: string;
  amount: number;
  categoryId: string | null;
  accountId: AccountId;
  type: TransactionType;
  /**
   * Whether money entered or left `accountId`. Always "out" for spending and
   * "in" for income; meaningful mainly for transfers, which can go either
   * way (e.g. money leaving savings to pay a bill isn't "money saved").
   */
  direction: "in" | "out";
  reimbursable: boolean;
  reimbAmt: number;
  reimbPaid: boolean;
  tags: string[];
  notes: string;
}

export type GoalType = "monthly" | "summer" | "yearly" | "wealth";

export interface Goal {
  id: string;
  name: string;
  total: number;
  saved: number;
  accent: string;
  deadline: string | null; // ISO date "YYYY-MM-DD"
  type: GoalType;
  /** Internal bookkeeping used to pace on/off-track — not shown in the UI. */
  createdAt: string;
}

/** Auto-categorization rule applied during CSV import: first case-insensitive keyword match wins. */
export interface CategoryRule {
  id: string;
  keyword: string;
  categoryId: string;
}
