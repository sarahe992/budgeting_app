import { formatMoney } from "../lib/format";
import type { Category, Transaction } from "../lib/types";

export default function TransactionRow({
  transaction,
  category,
  onClick,
  active = false,
}: {
  transaction: Transaction;
  category: Category | undefined;
  onClick?: () => void;
  active?: boolean;
}) {
  const isIncome = transaction.type === "income";
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 py-2.5 text-left ${
        active ? "rounded-button bg-surface px-2" : ""
      }`}
    >
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
      <div className="flex shrink-0 items-center gap-2">
        {transaction.reimbursable && (
          <span
            className={`rounded-pill px-1.5 py-0.5 text-[10px] font-medium ${
              transaction.reimbPaid
                ? "bg-green-ghost text-green-deep"
                : "bg-clay-badge text-clay"
            }`}
          >
            {transaction.reimbPaid ? "Reimbursed" : "Not paid"}
          </span>
        )}
        <p
          className={`text-[13px] font-medium ${
            isIncome ? "text-green" : "text-text-primary"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatMoney(Math.abs(transaction.amount))}
        </p>
      </div>
    </Wrapper>
  );
}
