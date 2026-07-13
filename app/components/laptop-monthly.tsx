"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "../providers";
import { currentMonthLabel, formatMoney, todayIso } from "../lib/format";
import {
  envelopeBudget,
  envelopeSpent,
  leftToAssign,
  leftToSpend,
  paceFraction,
  safeToSpendPerWeek,
  totalAssigned,
  totalIncome,
  totalSaved,
  totalSpent,
} from "../lib/selectors";
import AddTransactionSheet from "./add-transaction-sheet";
import BudgetInput from "./budget-input";
import LaptopSidebar from "./laptop-sidebar";
import ProgressBar from "./progress-bar";
import TransactionRow from "./transaction-row";

function Card({
  title,
  hint,
  className = "",
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-card border border-card-border bg-card p-5 ${className}`}
    >
      <h2 className="font-display-laptop text-[15px] font-medium text-text-primary">
        {title}
      </h2>
      {hint && <p className="mt-2 text-[12px] text-text-muted">{hint}</p>}
      {children}
    </section>
  );
}

export default function LaptopMonthly() {
  const {
    transactions,
    categories,
    envelopes,
    monthBudgets,
    goals,
    setEnvelopeBudget,
    setMonthBudget,
    contributeToGoal,
  } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeGoalIdx, setActiveGoalIdx] = useState(0);
  const goalIdx = goals.length ? ((activeGoalIdx % goals.length) + goals.length) % goals.length : 0;
  const activeGoal = goals[goalIdx];

  const month = todayIso().slice(0, 7); // "YYYY-MM"

  // Not month-scoped on purpose — right after a CSV import spanning several
  // months, this should still show what actually came in, not just this
  // calendar month's slice. The budget/envelope math below stays monthly.
  const recentTransactions = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const budget = monthBudgets[month] ?? 0;
  const hasBudget = budget > 0;
  const spent = totalSpent(transactions, month);
  const income = totalIncome(transactions, month);
  const saved = totalSaved(transactions, month);
  const left = leftToSpend(budget, transactions, month);
  const over = left < 0;
  const spentPercent = hasBudget ? (spent / budget) * 100 : 0;
  const pacePercent = paceFraction(month) * 100;
  const safePerWeek = safeToSpendPerWeek(budget, transactions, month);

  const assigned = totalAssigned(envelopes, month);
  const toAssign = leftToAssign(budget, envelopes, month);

  return (
    <div className="flex min-h-dvh bg-cream">
      <LaptopSidebar active="Monthly" />

      {/* Main content */}
      <div className="flex-1 space-y-4 p-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Monthly
            </p>
            <h1 className="font-display-laptop text-xl font-medium text-text-primary">
              {currentMonthLabel()}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="rounded-button bg-green px-4 py-2 text-[13px] font-medium text-card"
            style={{ height: 38 }}
          >
            + Add transaction
          </button>
        </div>

        {/* Top row: hero / donut / savings goal */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[400px_1fr_280px]">
          <Card title="Left to spend this month">
            <p
              className={`font-display-laptop mt-1 text-[44px] leading-none font-semibold tracking-[-0.02em] ${
                hasBudget && over ? "text-clay" : "text-text-primary"
              }`}
            >
              {hasBudget ? formatMoney(left) : "$—"}
            </p>
            <div className="mt-4">
              <ProgressBar
                fillPercent={spentPercent}
                over={over}
                pacePercent={hasBudget ? pacePercent : undefined}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <p className="text-text-muted">Income</p>
                <p className="text-text-primary">{formatMoney(income)}</p>
              </div>
              <div>
                <p className="text-text-muted">Spent</p>
                <p className="text-text-primary">{formatMoney(spent)}</p>
              </div>
              <div>
                <p className="text-text-muted">Saved</p>
                <p className="text-text-primary">{formatMoney(saved)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-button border border-card-border bg-surface px-3 py-2 text-[12px] text-text-secondary">
              Safe to spend per week ·{" "}
              {hasBudget ? `${formatMoney(safePerWeek)}/week` : "$—/week"}
            </div>
          </Card>

          <Card title="Spending by category">
            <div className="mt-3 flex items-center gap-4">
              <div
                className="h-28 w-28 shrink-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(var(--color-green-ghost) 0deg 360deg)",
                }}
              />
              <p className="text-[12px] text-text-muted">
                No spending yet — categories will appear here once you add
                transactions.
              </p>
            </div>
          </Card>

          <Card title="Savings goal" className="relative">
            {goals.length === 0 ? (
              <p className="mt-3 text-[12px] text-text-muted">
                No goals yet — create one on the{" "}
                <Link href="/goals" className="text-green underline">
                  Goals
                </Link>{" "}
                page.
              </p>
            ) : (
              <>
                <div className="mt-1 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous goal"
                    onClick={() => setActiveGoalIdx((i) => i - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-button text-text-muted hover:bg-surface"
                  >
                    ‹
                  </button>
                  <span className="truncate px-2 text-[12.5px] font-medium text-text-primary">
                    {activeGoal.name}
                  </span>
                  <button
                    type="button"
                    aria-label="Next goal"
                    onClick={() => setActiveGoalIdx((i) => i + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-button text-text-muted hover:bg-surface"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-center">
                  <div
                    className="flex h-28 w-28 items-center justify-center rounded-full transition-[background] duration-500"
                    style={{
                      background: `conic-gradient(${activeGoal.accent} ${Math.min(100, (activeGoal.saved / activeGoal.total) * 100)}%, var(--color-green-ghost) ${Math.min(100, (activeGoal.saved / activeGoal.total) * 100)}% 100%)`,
                    }}
                  >
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-card text-center">
                      <span className="text-[13px] font-medium text-text-primary">
                        {formatMoney(activeGoal.saved)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        of {formatMoney(activeGoal.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-[11.5px] text-text-muted">
                  {activeGoal.saved >= activeGoal.total
                    ? "Ring closed — goal reached."
                    : `${Math.round((activeGoal.saved / activeGoal.total) * 100)}% there · ${formatMoney(activeGoal.total - activeGoal.saved)} to close the ring`}
                </p>

                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {goals.map((g, i) => (
                    <button
                      key={g.id}
                      type="button"
                      aria-label={`Show ${g.name}`}
                      onClick={() => setActiveGoalIdx(i)}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          i === goalIdx ? "var(--color-text-primary)" : "var(--color-card-border)",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => contributeToGoal(activeGoal.id, 250)}
                  className="mt-4 w-full rounded-button bg-green py-2 text-[12.5px] font-medium text-card"
                >
                  + Add $250
                </button>
              </>
            )}
          </Card>
        </div>

        {/* Centerpiece: envelopes */}
        <Card title="Envelopes — budget vs actual">
          <div className="mt-3 flex items-center justify-between rounded-button border border-card-border bg-surface px-3 py-2">
            <span className="text-[12px] font-medium text-text-secondary">
              Monthly budget
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-[12px] ${
                  toAssign < 0 ? "text-clay" : "text-text-muted"
                }`}
              >
                {toAssign < 0
                  ? `${formatMoney(Math.abs(toAssign))} over-assigned`
                  : `${formatMoney(toAssign)} left to assign`}
              </span>
              <span className="flex items-center gap-1 text-[13px] font-medium text-text-primary">
                $
                <BudgetInput
                  value={budget}
                  onCommit={(v) => setMonthBudget(month, v)}
                  className="w-20 border-card-border bg-card"
                />
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-6 border-b border-card-border pb-3 text-[12px]">
            <span className="text-text-muted">
              Assigned <span className="text-text-primary">{formatMoney(assigned)}</span>
            </span>
            <span className="text-text-muted">
              Spent <span className="text-text-primary">{formatMoney(spent)}</span>
            </span>
            <span className="text-text-muted">
              Available{" "}
              <span className="text-text-primary">
                {formatMoney(assigned - spent)}
              </span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {categories.map((c) => {
              const catBudget = envelopeBudget(envelopes, c.id, month);
              const catSpent = envelopeSpent(transactions, c.id, month);
              const isOver = catBudget > 0 && catSpent > catBudget;
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-text-primary">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span
                      className={`flex shrink-0 items-center gap-1 ${
                        isOver ? "text-clay" : "text-text-muted"
                      }`}
                    >
                      {formatMoney(catSpent)} / $
                      <BudgetInput
                        value={catBudget}
                        onCommit={(v) => setEnvelopeBudget(c.id, month, v)}
                        className="w-14"
                      />
                    </span>
                  </div>
                  <ProgressBar
                    thin
                    fillPercent={catBudget > 0 ? (catSpent / catBudget) * 100 : 0}
                    over={isOver}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Bottom row: trend chart / recent transactions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
          <Card title="Income · Spending · Saved">
            <div className="mt-4 flex h-40 items-end justify-around border-b border-card-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 rounded-t bg-green-ghost"
                  style={{ height: "12%" }}
                />
              ))}
            </div>
            <p className="mt-2 text-[12px] text-text-muted">
              No data yet — this fills in once you have a few months of
              transactions.
            </p>
          </Card>

          <Card title="Recent transactions">
            {recentTransactions.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-text-muted">
                No transactions yet.
              </p>
            ) : (
              <div className="mt-3 max-h-64 divide-y divide-card-border overflow-y-auto">
                {recentTransactions.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={categories.find((c) => c.id === t.categoryId)}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-card-border pt-3 text-[12px]">
              <div>
                <p className="text-text-muted">Out of pocket</p>
                <p className="text-text-primary">$—</p>
              </div>
              <div>
                <p className="text-text-muted">Owed to you</p>
                <p className="text-clay">$—</p>
              </div>
              <div>
                <p className="text-text-muted">Reimbursed</p>
                <p className="text-green">$—</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {sheetOpen && (
        <AddTransactionSheet onClose={() => setSheetOpen(false)} />
      )}
    </div>
  );
}
