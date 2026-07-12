"use client";

import { useState } from "react";

export default function BudgetInput({
  value,
  onCommit,
  className = "",
}: {
  value: number;
  onCommit: (next: number) => void;
  className?: string;
}) {
  const [text, setText] = useState(value ? String(value) : "");
  // Re-sync the draft text when `value` changes externally (e.g. another
  // tab, or a re-render after commit) — computed during render rather than
  // in an effect, per React's "adjusting state on prop change" pattern.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value ? String(value) : "");
  }

  return (
    <input
      type="number"
      min={0}
      step={5}
      inputMode="decimal"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onCommit(Math.max(0, parseFloat(text) || 0))}
      placeholder="0"
      className={`rounded-button border border-transparent bg-transparent px-1.5 py-0.5 text-right text-[12px] text-text-primary hover:border-card-border focus:border-card-border focus:outline-none ${className}`}
    />
  );
}
