import type { Account, Category } from "./types";

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "checking", name: "Checking" },
  { id: "savings", name: "Savings" },
];

export const DOT_COLORS = [
  "var(--color-dot-groceries)",
  "var(--color-dot-out-to-eat)",
  "var(--color-dot-activities)",
  "var(--color-dot-transportation)",
  "var(--color-dot-gas)",
  "var(--color-dot-household)",
  "var(--color-dot-social-gifts)",
  "var(--color-ochre)",
];

// The design system names three goal accents explicitly; extend with the
// category dot palette so additional goals still get a distinct color.
export const GOAL_ACCENT_COLORS = [
  "var(--color-goal-emergency)",
  "var(--color-goal-mexico)",
  "var(--color-goal-laptop)",
  ...DOT_COLORS,
];

// Starter set from PRD Section 6, colored with the design system's category dot tokens.
export const STARTER_CATEGORIES: Category[] = [
  { id: "household-groceries", name: "Household / Groceries", color: "var(--color-dot-groceries)" },
  { id: "out-to-eat", name: "Out to eat", color: "var(--color-dot-out-to-eat)" },
  { id: "social-hosting-gifts", name: "Social, Hosting & Gifts", color: "var(--color-dot-social-gifts)" },
  { id: "transportation", name: "Transportation", color: "var(--color-dot-transportation)" },
  { id: "subscriptions", name: "Subscriptions", color: "var(--color-ochre)" },
  { id: "donations-tithing", name: "Donations / Tithing", color: "var(--color-dot-household)" },
  { id: "personal-care", name: "Personal care", color: "var(--color-dot-social-gifts)" },
  { id: "activities-fun", name: "Activities / fun", color: "var(--color-dot-activities)" },
  { id: "gas", name: "Gas", color: "var(--color-dot-gas)" },
  { id: "school", name: "School", color: "var(--color-dot-transportation)" },
  { id: "vacation", name: "Vacation", color: "var(--color-dot-out-to-eat)" },
  { id: "random", name: "Random", color: "var(--color-dot-household)" },
];
