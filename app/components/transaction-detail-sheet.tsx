"use client";

import { useAppData } from "../providers";
import { formatMoney } from "../lib/format";
import type { Transaction } from "../lib/types";
import ReimbursementControls from "./reimbursement-controls";

export default function TransactionDetailSheet({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const { categories, updateTransaction } = useAppData();
  const category = categories.find((c) => c.id === transaction.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30">
      <div
        className="max-h-[90vh] overflow-y-auto rounded-t-card-lg border-t border-card-border bg-surface p-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display-phone text-lg font-medium text-text-primary">
            Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-button border border-card-border text-text-muted"
          >
            ✕
          </button>
        </div>

        <div className="rounded-card border border-card-border bg-card p-4">
          <p className="text-[15px] font-medium text-text-primary">
            {transaction.name}
          </p>
          <p className="mt-1 text-[12px] text-text-muted">
            {category?.name ?? "Uncategorized"} · {transaction.date}
          </p>
          <p className="mt-2 font-display-phone text-[28px] font-semibold text-text-primary">
            {formatMoney(transaction.amount)}
          </p>
        </div>

        <div className="mt-4">
          <ReimbursementControls
            transaction={transaction}
            onUpdate={(patch) => updateTransaction(transaction.id, patch)}
          />
        </div>
      </div>
    </div>
  );
}
