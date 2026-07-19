import type { Envelope, Goal, Transaction } from "./types";

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Day-of-month "today" is on, scoped to `month`. Past/future months read as fully elapsed. */
export function dayOfMonth(month: string): number {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (month !== currentMonth) return daysInMonth(month);
  return today.getDate();
}

/** Fraction of the month elapsed (0–1), used to place the pace tick on progress bars. */
export function paceFraction(month: string): number {
  return Math.min(1, dayOfMonth(month) / daysInMonth(month));
}

/** The `n` months ending at (and including) `endMonth`, oldest first. */
export function lastNMonths(n: number, endMonth: string): string[] {
  const [y, m] = endMonth.split("-").map(Number);
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function monthShortLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export function envelopeSpent(
  transactions: Transaction[],
  categoryId: string,
  month: string
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "spending" &&
        t.categoryId === categoryId &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalSpent(transactions: Transaction[], month: string): number {
  return transactions
    .filter((t) => t.type === "spending" && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function totalIncome(transactions: Transaction[], month: string): number {
  return transactions
    .filter((t) => t.type === "income" && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Money moved to savings this month (transfers arriving in the savings account). */
export function totalSaved(transactions: Transaction[], month: string): number {
  return transactions
    .filter(
      (t) =>
        t.type === "transfer" &&
        t.accountId === "savings" &&
        t.direction === "in" &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Sum of reimbursable charges' owed-back amount, dated within `month`. */
export function reimbursableTotal(
  transactions: Transaction[],
  month: string
): number {
  return transactions
    .filter((t) => t.reimbursable && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.reimbAmt, 0);
}

/** What you actually paid for yourself this month, net of reimbursable charges. */
export function outOfPocket(transactions: Transaction[], month: string): number {
  return totalSpent(transactions, month) - reimbursableTotal(transactions, month);
}

/**
 * Running "owed to you" balance — unlike the month-scoped stats above, this
 * is deliberately all-time: a debt from last month doesn't stop being owed
 * just because the calendar rolled over.
 */
export function owedToYou(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.reimbursable && !t.reimbPaid)
    .reduce((sum, t) => sum + t.reimbAmt, 0);
}

/** All-time total of reimbursable charges that have been paid back. */
export function alreadyReimbursed(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.reimbursable && t.reimbPaid)
    .reduce((sum, t) => sum + t.reimbAmt, 0);
}

/** Reimbursed charges dated within `month` — the phone Owed-to-me card's "this month" figure. */
export function reimbursedThisMonth(
  transactions: Transaction[],
  month: string
): number {
  return transactions
    .filter((t) => t.reimbursable && t.reimbPaid && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.reimbAmt, 0);
}

/** Envelope spend net of whatever portion of it is reimbursable. */
export function envelopeSpentNet(
  transactions: Transaction[],
  categoryId: string,
  month: string
): number {
  const catTxns = transactions.filter(
    (t) =>
      t.type === "spending" && t.categoryId === categoryId && t.date.startsWith(month)
  );
  const spent = catTxns.reduce((sum, t) => sum + t.amount, 0);
  const reimb = catTxns
    .filter((t) => t.reimbursable)
    .reduce((sum, t) => sum + t.reimbAmt, 0);
  return spent - reimb;
}

export function envelopeBudget(
  envelopes: Envelope[],
  categoryId: string,
  month: string
): number {
  return (
    envelopes.find((e) => e.categoryId === categoryId && e.month === month)
      ?.budget ?? 0
  );
}

/** Sum of every envelope's assigned budget for the month ("Assigned"). */
export function totalAssigned(envelopes: Envelope[], month: string): number {
  return envelopes
    .filter((e) => e.month === month)
    .reduce((sum, e) => sum + e.budget, 0);
}

/** Portion of the month's total budget not yet assigned to an envelope. */
export function leftToAssign(
  monthBudget: number,
  envelopes: Envelope[],
  month: string
): number {
  return monthBudget - totalAssigned(envelopes, month);
}

/** The hero number: month's total budget minus everything spent, month-wide. */
export function leftToSpend(
  monthBudget: number,
  transactions: Transaction[],
  month: string
): number {
  return monthBudget - totalSpent(transactions, month);
}

export function safeToSpendPerWeek(
  monthBudget: number,
  transactions: Transaction[],
  month: string
): number {
  const left = leftToSpend(monthBudget, transactions, month);
  const remainingDays = Math.max(
    1,
    daysInMonth(month) - dayOfMonth(month) + 1
  );
  return left / (remainingDays / 7);
}

/** Fraction (0–1) of a goal's createdAt→deadline window that has elapsed. */
export function goalElapsedFraction(goal: Goal): number {
  if (!goal.deadline) return 1;
  const start = new Date(goal.createdAt).getTime();
  const end = new Date(goal.deadline).getTime();
  if (end <= start) return 1;
  return Math.max(0, Math.min(1, (Date.now() - start) / (end - start)));
}

/**
 * A goal with no deadline can't be behind pace. Otherwise, on track means
 * saved-so-far is at or ahead of what a linear pace toward the deadline
 * would require by now.
 */
export function goalOnTrack(goal: Goal): boolean {
  if (!goal.deadline || goal.saved >= goal.total) return true;
  return goal.saved >= goal.total * goalElapsedFraction(goal);
}
