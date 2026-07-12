import { formatMoney } from "../lib/format";
import type { Category, Transaction } from "../lib/types";

export default function TransactionRow({
  transaction,
  category,
}: {
  transaction: Transaction;
  category: Category | undefined;
}) {
  const isIncome = transaction.type === "income";
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: category?.color ?? "var(--color-text-muted)" }}
        />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-text-primary">
            {transaction.name}
          </p>
          <p className="truncate text-[11.5px] text-text-muted">
            {category?.name ?? "Uncategorized"} · {transaction.date}
          </p>
        </div>
      </div>
      <p
        className={`shrink-0 text-[13px] font-medium ${
          isIncome ? "text-green" : "text-text-primary"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatMoney(Math.abs(transaction.amount))}
      </p>
    </div>
  );
}
