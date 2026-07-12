"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import { exportBackup } from "../lib/storage";
import LaptopSidebar from "./laptop-sidebar";

const DOT_COLORS = [
  "var(--color-dot-groceries)",
  "var(--color-dot-out-to-eat)",
  "var(--color-dot-activities)",
  "var(--color-dot-transportation)",
  "var(--color-dot-gas)",
  "var(--color-dot-household)",
  "var(--color-dot-social-gifts)",
  "var(--color-ochre)",
];

export default function SettingsPage() {
  const { categories, setCategories } = useAppData();
  const [newCategoryName, setNewCategoryName] = useState("");

  function renameCategory(id: string, name: string) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
  }

  function removeCategory(id: string) {
    setCategories(categories.filter((c) => c.id !== id));
  }

  function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const color = DOT_COLORS[categories.length % DOT_COLORS.length];
    setCategories([...categories, { id, name, color }]);
    setNewCategoryName("");
  }

  return (
    <div className="flex min-h-dvh bg-cream">
      <LaptopSidebar active="Settings" />

      <div className="max-w-2xl flex-1 space-y-4 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Settings
          </p>
          <h1 className="font-display-laptop text-xl font-medium text-text-primary">
            Categories & backup
          </h1>
        </div>

        <section className="rounded-card border border-card-border bg-card p-5">
          <h2 className="font-display-laptop text-[15px] font-medium text-text-primary">
            Categories
          </h2>
          <p className="mt-1 text-[12px] text-text-muted">
            Edit, rename, or remove the categories you budget against.
          </p>

          <div className="mt-4 space-y-1">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => renameCategory(c.id, e.target.value)}
                  className="flex-1 rounded-button border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-text-primary hover:border-card-border focus:border-card-border focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(c.id)}
                  aria-label={`Remove ${c.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-button text-text-muted hover:bg-surface"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 border-t border-card-border pt-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCategory();
              }}
              placeholder="New category name"
              className="flex-1 rounded-button border border-card-border bg-surface px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={addCategory}
              className="rounded-button bg-green px-4 py-2 text-[12.5px] font-medium text-card"
            >
              + Add
            </button>
          </div>
        </section>

        <section className="rounded-card border border-card-border bg-card p-5">
          <h2 className="font-display-laptop text-[15px] font-medium text-text-primary">
            Backup
          </h2>
          <p className="mt-1 text-[12px] text-text-muted">
            Download everything — transactions, categories, envelopes — as a
            JSON file you can keep or restore from later.
          </p>
          <button
            type="button"
            onClick={exportBackup}
            className="mt-4 rounded-button bg-green px-4 py-2 text-[12.5px] font-medium text-card"
          >
            Export backup
          </button>
        </section>
      </div>
    </div>
  );
}
