"use client";

import { formatMoney } from "../lib/format";
import type { Transaction } from "../lib/types";

const STEP = 5;

export default function ReimbursementControls({
  transaction,
  onUpdate,
}: {
  transaction: Transaction;
  onUpdate: (patch: Partial<Transaction>) => void;
}) {
  function toggleReimbursable() {
    if (transaction.reimbursable) {
      onUpdate({ reimbursable: false, reimbAmt: 0, reimbPaid: false });
    } else {
      onUpdate({ reimbursable: true, reimbAmt: transaction.amount });
    }
  }

  function setReimbAmt(next: number) {
    const clamped = Math.max(0, Math.min(transaction.amount, next));
    onUpdate({ reimbAmt: clamped });
  }

  function togglePaid() {
    onUpdate({ reimbPaid: !transaction.reimbPaid });
  }

  return (
    <div className="rounded-card border border-card-border bg-surface p-3">
      <button
        type="button"
        onClick={toggleReimbursable}
        className={`w-full rounded-button py-2 text-[12.5px] font-medium ${
          transaction.reimbursable
            ? "bg-green text-card"
            : "border border-card-border bg-card text-text-secondary"
        }`}
      >
        {transaction.reimbursable ? "Reimbursable" : "Mark reimbursable"}
      </button>

      {transaction.reimbursable && (
        <>
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-medium text-text-muted">
              To be paid back
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReimbAmt(transaction.reimbAmt - STEP)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button border border-card-border bg-card text-text-primary"
              >
                −
              </button>
              <div className="flex flex-1 items-center gap-1 rounded-button border border-card-border bg-card px-2 py-1.5">
                <span className="text-[13px] text-text-muted">$</span>
                <input
                  type="number"
                  min={0}
                  max={transaction.amount}
                  step={STEP}
                  value={transaction.reimbAmt}
                  onChange={(e) => setReimbAmt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-[13px] text-text-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setReimbAmt(transaction.reimbAmt + STEP)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button border border-card-border bg-card text-text-primary"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              of {formatMoney(transaction.amount)} — your share{" "}
              {formatMoney(transaction.amount - transaction.reimbAmt)}
            </p>
          </div>

          <button
            type="button"
            onClick={togglePaid}
            className={`mt-3 w-full rounded-button py-2 text-[12.5px] font-medium ${
              transaction.reimbPaid
                ? "bg-green-ghost text-green-deep"
                : "border border-card-border bg-card text-text-secondary"
            }`}
          >
            {transaction.reimbPaid ? "✓ Paid" : "Mark as paid"}
          </button>
        </>
      )}
    </div>
  );
}
