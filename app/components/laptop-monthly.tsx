"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import { currentMonthLabel, todayIso } from "../lib/format";
import AddTransactionSheet from "./add-transaction-sheet";
import LaptopSidebar from "./laptop-sidebar";
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
  const { transactions, categories } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentMonth = todayIso().slice(0, 7); // "YYYY-MM"
  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );

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
            <p className="font-display-laptop mt-1 text-[44px] leading-none font-semibold tracking-[-0.02em] text-text-primary">
              $—
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-green-ghost">
              <div className="h-2 w-0 rounded-full bg-green-fill" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <p className="text-text-muted">Income</p>
                <p className="text-text-primary">$—</p>
              </div>
              <div>
                <p className="text-text-muted">Spent</p>
                <p className="text-text-primary">$—</p>
              </div>
              <div>
                <p className="text-text-muted">Saved</p>
                <p className="text-text-primary">$—</p>
              </div>
            </div>
            <div className="mt-4 rounded-button border border-card-border bg-surface px-3 py-2 text-[12px] text-text-secondary">
              Safe to spend per week · $—/week
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

          <Card title="Savings goal">
            <div className="mt-3 flex items-center justify-center">
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(var(--color-green-ghost) 0deg 360deg)",
                }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-[13px] font-medium text-text-primary">
                  $—
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-button bg-green py-2 text-[12.5px] font-medium text-card"
            >
              + Add $250
            </button>
          </Card>
        </div>

        {/* Centerpiece: envelopes */}
        <Card title="Envelopes — budget vs actual">
          <div className="mt-3 flex items-center gap-6 border-b border-card-border pb-3 text-[12px]">
            <span className="text-text-muted">
              Assigned <span className="text-text-primary">$—</span>
            </span>
            <span className="text-text-muted">
              Spent <span className="text-text-primary">$—</span>
            </span>
            <span className="text-text-muted">
              Available <span className="text-text-primary">$—</span>
            </span>
          </div>
          <p className="mt-4 text-[12.5px] text-text-muted">
            No envelopes yet. Set up categories and monthly budgets in
            Settings to see them here.
          </p>
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
            {monthTransactions.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-text-muted">
                No transactions yet.
              </p>
            ) : (
              <div className="mt-3 max-h-64 divide-y divide-card-border overflow-y-auto">
                {monthTransactions.map((t) => (
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
