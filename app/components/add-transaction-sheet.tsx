"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import { todayIso } from "../lib/format";
import type { AccountId, TransactionType } from "../lib/types";

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function AddTransactionSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const { categories, addTransaction } = useAppData();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [accountId, setAccountId] = useState<AccountId>("checking");
  const [type, setType] = useState<TransactionType>("spending");

  function pressKey(key: string) {
    if (key === "⌫") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((a) => (a === "0" ? key : a + key));
  }

  const numericAmount = parseFloat(amount || "0");
  const canSubmit = numericAmount > 0 && name.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    addTransaction({
      date: todayIso(),
      name: name.trim(),
      amount: numericAmount,
      categoryId: type === "spending" ? categoryId : null,
      accountId,
      type,
      reimbursable: false,
      reimbAmt: 0,
      reimbPaid: false,
      tags: [],
      notes: "",
    });
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
            Add transaction
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

        {/* Amount display */}
        <p className="font-display-phone text-center text-[44px] font-semibold tracking-[-0.02em] text-text-primary">
          ${amount || "0"}
        </p>

        {/* Type toggle */}
        <div className="mt-4 flex gap-2 rounded-button bg-card p-1">
          {(["spending", "income", "transfer"] as TransactionType[]).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-button py-1.5 text-[12.5px] font-medium capitalize ${
                  type === t
                    ? "bg-green text-card"
                    : "text-text-secondary"
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What was it?"
          className="mt-4 w-full rounded-button border border-card-border bg-card px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />

        {/* Account toggle */}
        <div className="mt-3 flex gap-2 rounded-button bg-card p-1">
          {(["checking", "savings"] as AccountId[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccountId(a)}
              className={`flex-1 rounded-button py-1.5 text-[12.5px] font-medium capitalize ${
                accountId === a ? "bg-green text-card" : "text-text-secondary"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Category picker */}
        {type === "spending" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[12px] font-medium ${
                  categoryId === c.id
                    ? "border-green bg-green-ghost text-text-primary"
                    : "border-card-border bg-card text-text-secondary"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: c.color }}
                />
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Keypad */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              className="rounded-button bg-card py-3 text-[18px] font-medium text-text-primary"
            >
              {key}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-4 w-full rounded-button bg-green py-3 text-[14px] font-medium text-card disabled:opacity-40"
        >
          Add transaction
        </button>
      </div>
    </div>
  );
}
