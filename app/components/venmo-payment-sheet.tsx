"use client";

import { useMemo, useState } from "react";
import { useAppData } from "../providers";
import { formatMoney } from "../lib/format";

export default function VenmoPaymentSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const { transactions, categories, markTransactionsPaid } = useAppData();
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<Set<string> | null>(null);

  const unpaidOldestFirst = useMemo(
    () =>
      transactions
        .filter((t) => t.reimbursable && !t.reimbPaid)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions]
  );

  const lump = parseFloat(amount) || 0;

  // Greedy oldest-first selection, recomputed whenever the amount changes —
  // unless the user has started manually reassigning checkboxes.
  const autoSelected = useMemo(() => {
    const ids = new Set<string>();
    let remaining = lump;
    for (const t of unpaidOldestFirst) {
      // Stop at the first charge the remaining amount can't cover, rather
      // than skipping ahead to smaller later ones — "oldest first" should
      // read as a prefix of the list, not a scavenger hunt for a fit. The
      // user can still check/uncheck individual charges to reassign.
      if (t.reimbAmt > remaining) break;
      ids.add(t.id);
      remaining -= t.reimbAmt;
    }
    return ids;
  }, [unpaidOldestFirst, lump]);

  const selectedIds = selected ?? autoSelected;
  const selectedTotal = unpaidOldestFirst
    .filter((t) => selectedIds.has(t.id))
    .reduce((sum, t) => sum + t.reimbAmt, 0);
  const leftover = lump - selectedTotal;

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleLog() {
    if (selectedIds.size === 0) return;
    markTransactionsPaid(Array.from(selectedIds));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30">
      <div
        className="max-h-[90vh] overflow-y-auto rounded-t-card-lg border-t border-card-border bg-surface p-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display-phone text-lg font-medium text-text-primary">
            Log a Venmo payment
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

        <p className="text-[12.5px] text-text-secondary">
          Enter what came in — it auto-applies to your oldest unpaid charges
          first. Uncheck or check specific charges to reassign it.
        </p>

        <div className="mt-3 flex items-center gap-1 rounded-button border border-card-border bg-card px-3 py-2.5">
          <span className="text-[20px] text-text-muted">$</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSelected(null); // fall back to auto-selection on a fresh amount
            }}
            placeholder="0.00"
            className="w-full bg-transparent text-[22px] font-medium text-text-primary focus:outline-none"
          />
        </div>

        {unpaidOldestFirst.length === 0 ? (
          <p className="mt-4 text-[12.5px] text-text-muted">
            Nothing outstanding right now.
          </p>
        ) : (
          <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
            {unpaidOldestFirst.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const checked = selectedIds.has(t.id);
              return (
                <label
                  key={t.id}
                  className={`flex items-center gap-2.5 rounded-button border px-3 py-2 ${
                    checked
                      ? "border-green bg-green-ghost"
                      : "border-card-border bg-card"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(t.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-text-primary">
                      {t.name}
                    </p>
                    <p className="truncate text-[11px] text-text-muted">
                      {category?.name ?? "Uncategorized"} · {t.date}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12.5px] font-medium text-text-primary">
                    {formatMoney(t.reimbAmt)}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="mt-4 rounded-button border border-card-border bg-card px-3 py-2.5 text-[12.5px]">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Applying to selected</span>
            <span className="font-medium text-text-primary">
              {formatMoney(selectedTotal)}
            </span>
          </div>
          {lump > 0 && (
            <div className="mt-1 flex items-center justify-between text-text-secondary">
              <span>Leftover</span>
              <span
                className={`font-medium ${leftover < 0 ? "text-clay" : "text-text-primary"}`}
              >
                {formatMoney(leftover)}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={handleLog}
          className="mt-4 w-full rounded-button bg-green py-3 text-[14px] font-medium text-card disabled:opacity-40"
        >
          Mark {selectedIds.size} charge{selectedIds.size === 1 ? "" : "s"} paid
        </button>
      </div>
    </div>
  );
}
