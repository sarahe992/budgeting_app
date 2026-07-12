# Product Requirements Document — Personal Budgeting Web App

**Owner:** (you)
**Version:** 1.0 (draft for Claude Design → Claude Code)
**Date:** June 2026

---

## 1. Summary

A personal budgeting web app for tracking income, spending, savings, and financial goals. Built phone-first for daily use, with laptop used mainly for importing bank CSVs. Uses **envelope / "every dollar has a job"** budgeting (YNAB-style). Core purpose: know how much money is left to spend this month to stay on track with savings goals, handle real-world messy spending (especially group expenses that get reimbursed via Venmo), and see where each envelope is *headed* before it goes over.

This document specifies the **full vision**. Following Claude Design's handoff, **v1 includes the full reimbursement flow and Insights (run-rate projections)** — features originally planned for v2. Only cloud sync and notifications remain in v2.

---

## 2. Goals & Non-Goals

### Goals
- **Phone (glance tool):** see, at a glance, how much money is left to spend this month, and category envelope balances. That's it.
- **Laptop (analysis tool):** everything else — graphs, yearly views, custom periods, CSV import, category management, goals management, deep transaction analysis.
- Budget every dollar into categories at the start of each month (envelope model).
- Track income, spending, and savings per month, per year, and per custom period.
- Pull out custom time periods (e.g. a trip) as their own view **without** altering monthly pages.
- Make sense of reimbursements: stop group expenses from inflating spending and stop Venmo paybacks from looking like income.
- Track savings & wealth goals (monthly, summer, yearly, plus long-term like a Roth IRA).
- Visualize everything with clear graphs (laptop), in the spirit of the user's existing budget spreadsheet.

### Non-Goals (explicitly out of scope)
- **No "how much can I spend today" daily allowance number.** The user does not want this. The key number is **money left to spend this month**.
- No native iOS/Android app. This is a **web app** only.
- No automatic bank account syncing (Plaid etc.) in any current phase.
- No multi-user / sharing in v1.

---

## 3. Users & Platform

- **User:** one person (the owner). Single-user app.
- **Devices:** phone-first **glance** (daily checks of "money left to spend"); laptop for **analysis** (graphs, CSV import, deep work).
- **Platform:** Web app, hosted on **Vercel**, code stored on **GitHub** (auto-deploy on push). Configured as a **PWA (Progressive Web App)** so it can be added to the phone home screen with an icon and opens fullscreen, behaving like a native app.
- **Storage (v1):** Browser-local storage — data lives on the device. Free, private, offline-capable. Designed so a cloud-sync backend (v2) can be added later without a rewrite.

---

## 4. Key Concepts & Data Model

### Accounts
- Two accounts tracked: **Checking** and **Savings**.
- Transactions can be assigned to an account.

### Transaction
Fields:
- Date
- Amount
- Description (raw, from bank or manual)
- Category (assigned via rules or manually)
- Account (checking / savings)
- Type: spending / income / transfer
- **Reimbursable?** flag (see Section 7)
- **Reimbursed?** status + amount owed back
- Tags (for custom period membership, e.g. "Mexico")
- Notes (optional)

### Category
- Editable list. User can add/remove/rename.
- Starts from a suggested set (Section 6).
- Each category can hold a monthly budgeted amount (the "envelope").

### Income
- Tracked per month.
- Supports **projected** vs **received** income (the user knows summer income in advance and wants to budget against it).

### Goal
- Types: monthly budget goal, monthly/summer/yearly savings goal, long-term wealth goal (e.g. Roth IRA).
- Has a target amount, optional deadline, and tracks progress.

---

## 5. Views / Pages

The app is **responsive with different priorities per device**:
- **Phone view:** stripped-down daily glance. Only the monthly page (in a simplified form) and quick-add transaction.
- **Laptop view:** the full experience. All pages, all graphs, all management.

Same data, same app, same URL. The phone hides the deeper views; the laptop shows everything.

> Treat the phone view as the "lock screen widget" version of the app. Treat the laptop view as the "spreadsheet" version.

### 5.1 Monthly Page

**On phone (the daily glance + reimbursement management):**

*Home tab:*
- Hero: **money left to spend this month** (large, immediately visible). Includes an "owed to you" inline indicator (clay/red when unpaid; green "all reimbursed" when settled).
- List of category envelopes with balances (budgeted / spent / remaining). Over-budget = clay/red, under = green.
- **Owed to me card** — running balance, itemized list of unpaid reimbursable charges, "reimbursed this month" figure, and a "Log a Venmo payment" action for lump-sum reconciliation.
- **Today** section — that day's transactions as tappable rows, with "Owed" / "Reimbursed" tags where applicable.
- **Top 2-3 active goals** — progress toward target + on-track/off-track indicator. No projections/analysis (that lives on Insights).
- Bottom tab bar: Home (active), center **＋** (add transaction), Insights.

*Insights tab:*
- **"On pace to spend"** hero — projected total for the flexible budget using run-rate math (`effectiveSpent ÷ (day ÷ daysInMonth)`), delta chip ("+$X over" / "$X to spare"), projection bar showing spent vs projected vs budget.
- Plain-language takeaway ("Out to eat and Activities are running hottest. Groceries has $39 to spare.").
- **Net-of-reimbursements toggle** — recomputes hero + every envelope card using `spent − reimbAmt`.
- Per-envelope projection cards, sorted worst-first.

**On laptop (the full view):**
- Hero: "Left to spend this month" number, progress bar with pace tick, Income / Spent / Saved stat trio, and a **"Safe to spend per week"** sub-card. Owed indicator flips to "All reimbursed" when settled.
- Income this month (projected + received).
- **Spending by category** — donut chart with legend and top-stats footer.
- **Savings goal card** — rotating goal ring (‹ / › arrows + dot pager cycle through goals), saved/total in center, "% there · $X to close the ring," and a **＋ Add $250** quick-contribute button.
- **Envelopes — budget vs actual** — full-width two-column card, summary row (Assigned / Spent / Available), then each envelope as a labeled horizontal bar with red/green over/under treatment.
- **Trend chart** — Income · Spending · Saved grouped bar chart, Jan–Jun (or year-to-date), current month emphasized.
- **Recent transactions panel** — reimbursement flow lives here. Click a row to expand its reimbursement controls (mark reimbursable, set "to be paid back" amount, mark as paid). Footer totals: Spent / Reimbursable / **Out of pocket** / Owed-to-you / Reimbursed chips.
- Full filterable/sortable transaction list.
- All four graph types (Section 8).

**Transaction row contents (used on both phone and laptop):**
Each transaction row shows: amount, description, category, and date. Tapping a row opens its details (full description, account, notes, reimbursement flag if applicable).

Monthly pages are **never** altered by custom-period overlays.

### 5.2 Custom Period Page (e.g. trips)
**Laptop-only in v1.**
- User creates a page for any date range (e.g. Mexico, Apr 25 – May 23).
- Transactions in that range are **tagged/overlaid** into this view but still live in their monthly pages (overlap is intentional).
- Tracks against a **budget the user sets** for that period (e.g. the $1,700 Mexico stipend).
- Shows: total spent vs budget, over/under, category breakdown, transaction list, graphs.

### 5.3 Yearly / Long-Term View
**Laptop-only in v1.**
- **Calendar year** (Jan–Dec).
- Shows month-by-month trends: spending over time, income vs spending vs saved, category trends.
- Progress toward yearly savings & wealth goals.

### 5.4 Goals Page
- **Phone:** the top 2-3 active goals appear directly on the monthly page (per 5.1) — progress + on-track/off-track only. No separate goals page on phone in v1.
- **Laptop:** dedicated goals page to create / edit / manage all goals; full on-track/off-track analysis, projected hit dates, and "why" insights linking current spending to future goal impact.

### 5.5 Settings
**Laptop-only in v1** (no need to manage settings on the phone).
- Edit categories.
- Edit auto-categorization rules.
- Manage accounts.
- **Export / backup data** (always available) + optional backup reminders.
- Import CSV.

---

## 6. Categories (suggested starting set)

Derived from the user's real spending analysis. All editable.

| Category | Notes |
|---|---|
| Household / Groceries | Includes Target-type runs (food + household blend) |
| Out to eat | All restaurants, coffee, fast food |
| Social, Hosting & Gifts | Includes money sent to people |
| Transportation | Uber/Lyft/rideshare, transit, parking |
| Subscriptions | Recurring services (flag redundancies, e.g. multiple AI tools) |
| Donations / Tithing | Intentional giving — its own line |
| Personal care | Salon, nails, orthodontist, etc. |
| Activities / fun | Events, park entries, recreation |
| Gas | Fuel only |
| School | Tuition, textbooks, campus charges |
| Vacation | Trip-related (often overlaps a custom period) |
| Random | Genuinely miscellaneous, one-off |

**Suggested improvement to surface in-app:** when one category balloons (like "Random" did historically), prompt the user to split it. Flag recurring subscriptions, especially potential duplicates.

---

## 7. Reimbursement System (the differentiator)

The user frequently fronts group expenses and is paid back in **Venmo lump sums**. The app must prevent two distortions: (1) spending looking too high, (2) Venmo cash-ins looking like income.

### 7.1 Auto-flagging rules (suggested, user-editable)
- Fast food / restaurant purchases **over $15** → auto-flag as *possibly reimbursable*.
- All rideshare (Uber/Lyft), and Airbnb / lodging bookings → auto-flag as *possibly reimbursable*.
- User can **unflag** any auto-flagged item, or **manually flag** anything.

### 7.2 Split logic
- When flagged, the user sets how much is **theirs** vs **owed back** (default to a split — the user usually pays their own share too, not the whole charge).
- The "owed back" portion enters an **"Owed to me"** ledger.

### 7.3 Lump-sum reconciliation
- Incoming Venmo lump sums are treated as **paybacks, not income**.
- A lump sum **auto-applies** against the outstanding "owed to me" pile (oldest charges first), **but** the user can **reassign** which specific charges it covers.
- Goal: answer "I was owed all this, $200 came in — does that cover it?"

### 7.4 Display
- A running **"Owed to me" balance** number.
- The **itemized list** of unreimbursed charges behind that balance.
- (v2) Optional alerts when something's been unpaid too long.

### 7.5 Effect on reports
- Reimbursable portions are **excluded from "real spending"** once marked.
- Venmo lump sums are **excluded from income**.
- So dashboards reflect what the user actually paid for themselves.

---

## 8. Graphs / Dashboards

**Laptop-only in v1.** The phone is for glancing; the laptop is where the analysis happens.

All four are priorities (mirroring the user's existing budget spreadsheet style):

1. **Spending by category** — pie/donut, per month and per period.
2. **Spending over time** — line/bar by month.
3. **Income vs spending vs saved** — per month and yearly.
4. **Budget vs actual per category** — envelope tracking.

Graphs appear on monthly pages (laptop), custom period pages, and the yearly view.

---

## 9. Transfers & Special Handling

- Distinguish **transfers** (e.g. checking→savings) from real income/spending. Transfers must **not** count as either.
- Auto-detect likely transfers and savings moves; let the user confirm/mark manually.
- Savings transfers should reflect in savings-goal progress, not as spending.

---

## 10. Notifications / Reminders (v2)

The user wants reminders. Candidates:
- Overspending a category / month.
- Unpaid reimbursements outstanding too long.
- Monthly reset / "assign your dollars" nudge.
- Backup reminder.
- **Encouraging nudge** when a category is underspent at month end: offer to move leftover to savings with a positive message (e.g. "Nice — want to send this to savings? That'd be awesome.").

> Note: true push notifications on a web app are limited, especially on iOS. v2 should scope what's actually feasible (in-app reminders vs browser push) before committing.

---

## 11. Underspend / Overspend Behavior

- **Underspend a category:** ask the user what to do with the leftover, **with an encouraging note to move it to savings.**
- **Overspend a category:** simply show it red/negative; the user will fix it manually (no auto-pulling).

---

## 12. Build Phasing

### v1 — The full app (based on Claude Design handoff)
- **Phone Home tab:** hero "left to spend," envelope list, Owed-to-me card + Log-a-Venmo-payment reconciliation, Today transactions, top 2-3 goals with on/off-track status, bottom tab bar, quick-add sheet.
- **Phone Insights tab:** run-rate projection hero, per-envelope projection cards (sorted worst-first), Net-of-reimbursements toggle.
- **Laptop Monthly view:** hero + safe-to-spend-per-week, spending donut, rotating savings-goal ring, envelope bars, trend chart, recent-transactions panel with inline reimbursement flow.
- Editable categories (start from suggested set) + auto-categorization rules.
- Manual transaction entry + CSV import (handle messy bank format).
- **Full reimbursement ledger** (auto-flag rules, split logic, lump-sum reconciliation, owed-to-me balance + list, per-transaction paid/unpaid state).
- Projected vs received income.
- Custom period pages (trip overlays) with a budget to measure against.
- Yearly (calendar) view.
- Goals with progress bars, on/off-track, projection.
- All four graph types (laptop).
- Checking + savings accounts.
- Export/backup button.
- Hosted on Vercel; browser-local storage; phone-first responsive design; PWA / add-to-home-screen.

### v2 — Infrastructure & polish
- **Cloud sync** (true phone↔laptop) via a backend + accounts + database.
- **Notifications / reminders** (overspending, unpaid reimbursements too long, monthly reset, backup reminder, savings nudge on underspend).

> Note: This scope is significantly larger than the original v1. Expect a longer build time. The tradeoff (accepted by owner) is a richer initial experience with all the distinctive features (reimbursement flow, Insights projections) present from day one.

---

## 13. Design Direction

- Phone-first, glanceable. The "money left this month" number is the hero.
- Clean, muted, warm, low-chroma. Rounded everything.
- **Follow the Claude Design handoff bundle** for exact colors (oklch tokens), typography (Fredoka for phone display/numbers, Manrope for laptop display, Hanken Grotesque for body), spacing, and radii. All values are in the handoff README under "Design Tokens."
- Reuse the projection-bar pattern (track → spent fill → projected ghost → budget tick) as one component across hero, envelopes, and Insights cards.

---

## 14. Open Questions for Later
- Exact CSV format mapping (column names) — handle on first real import.
- Feasibility of web push notifications on the user's phone (decide in v2).
- Whether Household and Groceries should eventually split.
- Whether to add a "personal care" budget cap or leave it tracked-only.

---

## 15. Success Criteria

- On the **phone**, the user can see "money left to spend this month" and category envelope balances **in under 5 seconds** from tapping the home-screen icon.
- On the **laptop**, the user can import a CSV, fix categorization, and analyze spending with all four graph types.
- Monthly CSV import correctly separates real spending, income, transfers, and (v2) reimbursements.
- Custom trip views measure spend against a budget without disturbing monthly numbers.
- The user actually uses the phone glance daily through the summer and stays on track with savings goals.
