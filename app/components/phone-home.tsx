"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import { currentMonthLabel, formatMoney, todayIso } from "../lib/format";
import {
  dayOfMonth,
  daysInMonth,
  envelopeBudget,
  envelopeSpent,
  leftToSpend,
  paceFraction,
  totalSpent,
} from "../lib/selectors";
import AddTransactionSheet from "./add-transaction-sheet";
import ProgressBar from "./progress-bar";
import TransactionRow from "./transaction-row";

function EmptyCard({
  title,
  hint,
  className = "",
}: {
  title: string;
  hint: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-card-border bg-card p-5 ${className}`}
    >
      <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
        {title}
      </h2>
      <p className="mt-2 text-[13px] text-text-muted">{hint}</p>
    </section>
  );
}

export default function PhoneHome() {
  const { transactions, categories, envelopes, monthBudgets } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = todayIso();
  const month = today.slice(0, 7);
  const todaysTransactions = transactions.filter((t) => t.date === today);

  const budget = monthBudgets[month] ?? 0;
  const hasBudget = budget > 0;
  const spent = totalSpent(transactions, month);
  const left = leftToSpend(budget, transactions, month);
  const over = left < 0;
  const spentPercent = hasBudget ? (spent / budget) * 100 : 0;
  const pacePercent = paceFraction(month) * 100;

  const budgetedEnvelopes = categories
    .map((c) => ({
      category: c,
      budget: envelopeBudget(envelopes, c.id, month),
      spent: envelopeSpent(transactions, c.id, month),
    }))
    .filter((e) => e.budget > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* App bar */}
      <header
        className="flex items-center justify-between px-5 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Monthly
          </p>
          <h1 className="font-display-phone text-2xl font-medium text-text-primary">
            {currentMonthLabel()}
          </h1>
        </div>
        <div className="rounded-pill border border-card-border bg-card px-3 py-1.5 text-[12px] font-medium text-text-secondary">
          Day {dayOfMonth(month)} / {daysInMonth(month)}
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        {/* Hero card */}
        <section className="rounded-card-lg border border-card-border bg-card p-6 shadow-card">
          <p className="text-[13px] font-medium text-text-secondary">
            Left to spend this month
          </p>
          <p
            className={`font-display-phone mt-1 text-[54px] leading-none font-semibold tracking-[-0.02em] ${
              hasBudget && over ? "text-clay" : "text-text-primary"
            }`}
          >
            {hasBudget ? formatMoney(left) : "$—"}
          </p>
          <p className="mt-2 text-[12.5px] text-text-muted">
            {hasBudget
              ? `${formatMoney(spent)} spent of ${formatMoney(budget)} budgeted`
              : "of $— budgeted"}
          </p>
          <div className="mt-4">
            <ProgressBar
              fillPercent={spentPercent}
              over={over}
              pacePercent={hasBudget ? pacePercent : undefined}
            />
          </div>
        </section>

        {/* Envelopes */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
              Envelopes
            </h2>
          </div>
          {budgetedEnvelopes.length === 0 ? (
            <EmptyCard
              title="No envelopes yet"
              hint="Categories you budget for will show up here."
            />
          ) : (
            <section className="space-y-3 rounded-card border border-card-border bg-card p-4">
              {budgetedEnvelopes.map(({ category, budget, spent }) => {
                const isOver = spent > budget;
                return (
                  <div key={category.id}>
                    <div className="mb-1 flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-1.5 font-medium text-text-primary">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: category.color }}
                        />
                        {category.name}
                      </span>
                      <span
                        className={isOver ? "text-clay" : "text-text-muted"}
                      >
                        {formatMoney(spent)} / {formatMoney(budget)}
                      </span>
                    </div>
                    <ProgressBar
                      thin
                      fillPercent={(spent / budget) * 100}
                      over={isOver}
                    />
                  </div>
                );
              })}
            </section>
          )}
        </section>

        {/* Owed to me */}
        <EmptyCard
          title="Owed to me"
          hint="Reimbursable charges you're waiting to get paid back for will appear here."
        />

        {/* Today */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
              Today
            </h2>
          </div>
          {todaysTransactions.length === 0 ? (
            <EmptyCard
              title="No transactions yet"
              hint="Tap the + button below to add your first charge."
            />
          ) : (
            <section className="divide-y divide-card-border rounded-card border border-card-border bg-card px-4">
              {todaysTransactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categories.find((c) => c.id === t.categoryId)}
                />
              ))}
            </section>
          )}
        </section>
      </main>

      {/* Bottom tab bar */}
      <nav
        className="flex items-center justify-around border-t border-card-border bg-surface px-6"
        style={{
          height: "66px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <button
          type="button"
          aria-current="page"
          className="flex h-10 w-10 items-center justify-center rounded-button bg-green text-card"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-card" />
        </button>
        <button
          type="button"
          aria-label="Add transaction"
          onClick={() => setSheetOpen(true)}
          className="flex items-center justify-center rounded-button bg-green text-card shadow-raised"
          style={{ height: 52, width: 52 }}
        >
          <span className="text-2xl leading-none">+</span>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-button border border-card-border text-text-muted"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-text-muted" />
        </button>
      </nav>

      {sheetOpen && <AddTransactionSheet onClose={() => setSheetOpen(false)} />}
    </div>
  );
}
