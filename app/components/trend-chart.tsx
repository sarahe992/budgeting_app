"use client";

import { useAppData } from "../providers";
import { formatMoney } from "../lib/format";
import {
  lastNMonths,
  monthShortLabel,
  totalIncome,
  totalSaved,
  totalSpent,
} from "../lib/selectors";

const BAR_HEIGHT = 140;

export default function TrendChart({ currentMonth }: { currentMonth: string }) {
  const { transactions } = useAppData();
  const months = lastNMonths(6, currentMonth);

  const data = months.map((month) => ({
    month,
    label: monthShortLabel(month),
    income: totalIncome(transactions, month),
    spending: totalSpent(transactions, month),
    saved: totalSaved(transactions, month),
  }));

  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.spending, d.saved]));
  const hasAnyData = data.some((d) => d.income || d.spending || d.saved);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-clay" />
          Spending
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--color-ochre)" }}
          />
          Saved
        </span>
      </div>

      <div
        className="mt-4 flex items-end justify-around gap-2 border-b border-card-border"
        style={{ height: BAR_HEIGHT }}
      >
        {data.map((d) => {
          const isCurrent = d.month === currentMonth;
          return (
            <div
              key={d.month}
              className={`flex items-end gap-0.5 ${isCurrent ? "" : "opacity-45"}`}
              title={`${d.label}: income ${formatMoney(d.income)}, spending ${formatMoney(d.spending)}, saved ${formatMoney(d.saved)}`}
            >
              <div
                className="w-3 rounded-t bg-green"
                style={{ height: Math.max(2, (d.income / max) * BAR_HEIGHT) }}
              />
              <div
                className="w-3 rounded-t bg-clay"
                style={{ height: Math.max(2, (d.spending / max) * BAR_HEIGHT) }}
              />
              <div
                className="w-3 rounded-t"
                style={{
                  height: Math.max(2, (d.saved / max) * BAR_HEIGHT),
                  background: "var(--color-ochre)",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-around text-[10.5px]">
        {data.map((d) => (
          <span
            key={d.month}
            className={
              d.month === currentMonth
                ? "font-medium text-text-primary"
                : "text-text-muted"
            }
          >
            {d.label}
          </span>
        ))}
      </div>

      {!hasAnyData && (
        <p className="mt-3 text-[12px] text-text-muted">
          No data yet — this fills in once you have a few months of
          transactions.
        </p>
      )}
    </div>
  );
}
