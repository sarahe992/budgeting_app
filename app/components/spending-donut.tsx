"use client";

import { useAppData } from "../providers";
import { formatMoney } from "../lib/format";
import { envelopeSpent } from "../lib/selectors";

export default function SpendingDonut({ month }: { month: string }) {
  const { transactions, categories } = useAppData();

  const perCategory = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      amount: envelopeSpent(transactions, c.id, month),
    }))
    .filter((c) => c.amount > 0);

  const uncategorized = transactions
    .filter(
      (t) =>
        t.type === "spending" &&
        t.categoryId === null &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const slices = [
    ...perCategory,
    ...(uncategorized > 0
      ? [
          {
            id: "uncategorized",
            name: "Uncategorized",
            color: "var(--color-text-muted)",
            amount: uncategorized,
          },
        ]
      : []),
  ].sort((a, b) => b.amount - a.amount);

  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  if (total === 0) {
    return (
      <p className="mt-3 text-[12px] text-text-muted">
        No spending yet — categories will appear here once you add
        transactions.
      </p>
    );
  }

  const stops = slices
    .reduce<{ text: string; cumulative: number }[]>((acc, s) => {
      const prevCumulative = acc.length ? acc[acc.length - 1].cumulative : 0;
      const start = (prevCumulative / total) * 100;
      const cumulative = prevCumulative + s.amount;
      const end = (cumulative / total) * 100;
      return [...acc, { text: `${s.color} ${start}% ${end}%`, cumulative }];
    }, [])
    .map((s) => s.text)
    .join(", ");

  const biggest = slices[0];
  const top3Percent = Math.round(
    (slices.slice(0, 3).reduce((sum, s) => sum + s.amount, 0) / total) * 100
  );

  return (
    <div className="mt-3">
      <div className="flex items-center gap-4">
        <div
          className="relative h-28 w-28 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-card text-center">
            <div>
              <p className="text-[13px] font-semibold text-text-primary">
                {formatMoney(total)}
              </p>
              <p className="text-[9.5px] text-text-muted">spent</p>
            </div>
          </div>
        </div>
        <div className="grid max-h-28 flex-1 grid-cols-2 gap-x-3 gap-y-1.5 overflow-y-auto">
          {slices.map((s) => (
            <div key={s.id} className="flex min-w-0 items-center gap-1.5 text-[11px]">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="truncate text-text-secondary">{s.name}</span>
              <span className="ml-auto shrink-0 text-text-primary">
                {formatMoney(s.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-card-border pt-2 text-[10.5px] text-text-muted">
        <span>
          Biggest{" "}
          <span className="text-text-primary">
            {biggest.name} · {Math.round((biggest.amount / total) * 100)}%
          </span>
        </span>
        <span>
          Top 3 <span className="text-text-primary">{top3Percent}%</span>
        </span>
        <span>
          Tracked <span className="text-text-primary">{categories.length}</span>
        </span>
      </div>
    </div>
  );
}
