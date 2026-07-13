"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import { GOAL_ACCENT_COLORS } from "../lib/categories";
import { formatMoney } from "../lib/format";
import { goalOnTrack } from "../lib/selectors";
import type { GoalType } from "../lib/types";
import BudgetInput from "./budget-input";
import LaptopSidebar from "./laptop-sidebar";

const GOAL_TYPES: GoalType[] = ["monthly", "summer", "yearly", "wealth"];

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppData();
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [type, setType] = useState<GoalType>("monthly");
  const [deadline, setDeadline] = useState("");

  function handleAdd() {
    const totalAmount = parseFloat(total);
    if (!name.trim() || !totalAmount || totalAmount <= 0) return;
    addGoal({
      name: name.trim(),
      total: totalAmount,
      saved: 0,
      accent: GOAL_ACCENT_COLORS[goals.length % GOAL_ACCENT_COLORS.length],
      deadline: deadline || null,
      type,
    });
    setName("");
    setTotal("");
    setDeadline("");
    setType("monthly");
  }

  return (
    <div className="flex min-h-dvh bg-cream">
      <LaptopSidebar active="Goals" />

      <div className="max-w-2xl flex-1 space-y-4 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Goals
          </p>
          <h1 className="font-display-laptop text-xl font-medium text-text-primary">
            Savings & wealth goals
          </h1>
        </div>

        <section className="rounded-card border border-card-border bg-card p-5">
          <h2 className="font-display-laptop text-[15px] font-medium text-text-primary">
            Your goals
          </h2>
          {goals.length === 0 && (
            <p className="mt-2 text-[12px] text-text-muted">
              No goals yet — add your first one below.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {goals.map((g) => {
              const onTrack = goalOnTrack(g);
              const pct = Math.min(100, (g.saved / g.total) * 100);
              return (
                <div
                  key={g.id}
                  className="rounded-card border border-card-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: g.accent }}
                      />
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => updateGoal(g.id, { name: e.target.value })}
                        className="min-w-0 flex-1 rounded-button border border-transparent bg-transparent px-1.5 py-1 text-[13px] font-medium text-text-primary hover:border-card-border focus:border-card-border focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteGoal(g.id)}
                      aria-label={`Remove ${g.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-button text-text-muted hover:bg-card"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                    <label className="flex items-center gap-1.5 text-text-muted">
                      Type
                      <select
                        value={g.type}
                        onChange={(e) =>
                          updateGoal(g.id, { type: e.target.value as GoalType })
                        }
                        className="rounded-button border border-card-border bg-card px-1.5 py-1 text-text-primary focus:outline-none"
                      >
                        {GOAL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex items-center gap-1.5 text-text-muted">
                      Target $
                      <BudgetInput
                        value={g.total}
                        onCommit={(v) => updateGoal(g.id, { total: v })}
                        className="w-20 border-card-border bg-card"
                      />
                    </label>

                    <label className="flex items-center gap-1.5 text-text-muted">
                      Saved $
                      <BudgetInput
                        value={g.saved}
                        onCommit={(v) =>
                          updateGoal(g.id, { saved: Math.min(v, g.total) })
                        }
                        className="w-20 border-card-border bg-card"
                      />
                    </label>

                    <label className="flex items-center gap-1.5 text-text-muted">
                      Deadline
                      <input
                        type="date"
                        value={g.deadline ?? ""}
                        onChange={(e) =>
                          updateGoal(g.id, { deadline: e.target.value || null })
                        }
                        className="rounded-button border border-card-border bg-card px-1.5 py-1 text-text-primary focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-green-ghost">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: g.accent }}
                      />
                    </div>
                    <span className="shrink-0 text-[11.5px] text-text-muted">
                      {formatMoney(g.saved)} / {formatMoney(g.total)}
                    </span>
                    {g.deadline && (
                      <span
                        className={`shrink-0 rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
                          onTrack
                            ? "bg-green-ghost text-green-deep"
                            : "bg-clay-badge text-clay"
                        }`}
                      >
                        {onTrack ? "On track" : "Behind pace"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-card-border pt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Goal name"
              className="min-w-[140px] flex-1 rounded-button border border-card-border bg-surface px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <input
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Target $"
              className="w-28 rounded-button border border-card-border bg-surface px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GoalType)}
              className="rounded-button border border-card-border bg-surface px-2 py-2 text-[13px] text-text-primary focus:outline-none"
            >
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-button border border-card-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-button bg-green px-4 py-2 text-[12.5px] font-medium text-card"
            >
              + Add goal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
