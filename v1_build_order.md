# v1 Build Order — Budgeting App (Full-Scope Version)

A session-by-session plan for building v1 with Claude Code. Reflects the expanded scope: full reimbursement flow and Insights (run-rate projections) are in v1, per Claude Design's handoff.

Each step ends with a **working, deployed app** that does one more thing than before. Don't skip ahead.

---

## Pre-flight (do this once, before Session 1)

- [ ] Create a **GitHub repo** (private) for the app.
- [ ] Create a **Vercel account**, connect it to GitHub, and link the repo.
- [ ] Confirm: when code is pushed to GitHub, Vercel auto-deploys to a live URL.
- [ ] Have the PRD, the Claude Design handoff bundle, and this build order ready to paste/attach.

> Every session ends with a real URL you can open on your phone. No "it works on my laptop" trap.

---

## Session 1 — The skeleton that loads on your phone

**Goal:** A live Vercel URL that opens on your phone with a home-screen icon and shows an empty "June 2026" phone home screen shell. No data, no features. Just the frame in the right visual language.

**Build:**
- [ ] Project scaffold (Next.js on Vercel, since it's the natural fit).
- [ ] **PWA configuration** — manifest, icon, fullscreen mode — so "Add to Home Screen" gives a real app-like experience.
- [ ] Design tokens set up from the Claude Design handoff: oklch colors, Fredoka/Manrope/Hanken Grotesque fonts loaded, radius/spacing scale.
- [ ] Phone Home layout shell: app bar with month label + day counter, empty hero card, empty envelopes area, empty Today section, bottom tab bar (Home / center + / Insights) — no wiring yet.
- [ ] Laptop layout shell: sidebar with nav (Monthly / Yearly / Trips / Goals / Settings) + main content grid.
- [ ] Deploy to Vercel, add to phone home screen, confirm fullscreen launch with the icon.

**Done when:** you can tap the icon on your phone and see the empty app render in the right visual language.

---

## Session 2 — Data model, categories, and manual transaction entry

**Goal:** Add and view real transactions. The data model must support everything v1 needs (including reimbursement fields), even though the reimbursement UI comes later.

**Build:**
- [ ] Local storage data layer with **full** transaction shape: `id, date, name, amount, categoryId, accountId, type, reimbursable, reimbAmt, reimbPaid, tags[], notes`.
- [ ] Envelope entity: `id, name, color, budget, spent`.
- [ ] Month entity: `budget, monthStart, monthEnd, today`.
- [ ] Settings page (laptop) with the starter categories from the PRD. Editable.
- [ ] Add-transaction sheet (phone) with keypad + category picker per the design.
- [ ] Transaction list on phone Home ("Today" section) and laptop Monthly.
- [ ] **Export/backup button** in settings.

**Done when:** you can add transactions on your phone, see them in the Today list, and download a backup.

---

## Session 3 — Envelope budgeting + hero "left to spend"

**Goal:** Envelopes and the headline number work. The core daily glance is functional.

**Build:**
- [ ] Per-envelope monthly budget assignment (on laptop): "total budgeted" / "left to assign" flow.
- [ ] Derived selectors (implement once, use everywhere): `totalSpent`, `leftToSpend`, `envelopeSpent(envelope)`. Match the formulas in the Design README's Product Model.
- [ ] Phone Home hero: big **"Left to spend this month $X"** number, spent-vs-budget progress bar with pace tick.
- [ ] Phone Home envelope list: name, spent/budget, thin progress bar, red/green over/under treatment.
- [ ] Laptop Monthly hero: hero number + Income/Spent/Saved trio + **"Safe to spend per week"** sub-card.
- [ ] Laptop envelope panel: full-width two-column list, summary row.

**Done when:** you set a June budget on laptop, enter transactions on phone, and the hero + envelopes update correctly on both.

---

## Session 4 — Goals (phone + laptop)

**Goal:** Goals appear on phone and laptop, per the PRD.

**Build:**
- [ ] Goal entity: `id, name, total, saved, accent, deadline, type` (monthly/summer/yearly/wealth).
- [ ] Laptop Goals page: create/edit/delete goals.
- [ ] Laptop Monthly rotating goal ring per the design: conic-gradient ring, ‹ / › arrows + dot pager, "+$250 add" button, per-goal accent colors.
- [ ] Phone Home: top 2-3 active goals inline, showing progress + on-track/off-track indicator for the current month. No projections/analysis on phone.
- [ ] On/off-track logic: pace against deadline and current savings rate.

**Done when:** you can create your real summer savings goal, see it on your phone with an on-track indicator, and cycle through goals on the laptop ring.

---

## Session 5 — CSV import with auto-categorization rules

**Goal:** Import bank CSVs on the laptop with smart categorization.

**Build:**
- [ ] CSV upload on the laptop settings/import page.
- [ ] Handle messy bank format: skip header/summary rows, handle the no-date opening-balance row.
- [ ] Auto-detect transfers ("XFER TO SAV" etc.) and mark them as transfers, not income/spending.
- [ ] **Rules engine**: user can define rules like "if description contains WALMART → Household / Groceries." Applied on import.
- [ ] Preview screen: show categorized transactions before final import; fix inline.
- [ ] Duplicate detection so re-imports don't double-count.

**Done when:** you can drop in your bank's CSV, fix any miscategorized items, and see them populate the app.

---

## Session 6 — The reimbursement flow (the big one)

**Goal:** The signature feature. Everything the Design README specs, working end-to-end.

**Build:**
- [ ] **Derived selectors** (implement once, reuse everywhere): `reimbursableTotal`, `owedToYou`, `alreadyReimbursed`, `outOfPocket`, `envelopeSpentNet(envelope)`.
- [ ] **Auto-flag rules** (per PRD Section 7.1): fast food / restaurant purchases > $15, all rideshare / Airbnb / lodging. Auto-flag as *possibly reimbursable* on import. User can unflag or manually flag anything.
- [ ] **Transaction detail sheet (phone) / expanded row (laptop)**: toggle "Reimbursable," stepper + editable input for "to be paid back" amount (clamped 0 ≤ reimbAmt ≤ amount), "Mark as paid" toggle.
- [ ] Row tags: "Not paid" (red) / "Reimbursed" (green).
- [ ] **Owed-to-me card on phone Home**: running balance, itemized unpaid list, "reimbursed this month" figure.
- [ ] **Log a Venmo Payment sheet (phone)**: enter lump-sum amount → auto-applies oldest unpaid first, live preview of which charges clear, reassignable by editing.
- [ ] Hero-card "owed to you" inline indicator (clay/red when unpaid, green "all reimbursed" when settled).
- [ ] Laptop recent-transactions footer totals: Spent / Reimbursable / **Out of pocket** / Owed-to-you / Reimbursed chips.

**Done when:** you can flag a real Venmo group dinner as reimbursable, split the amount, log a Venmo payment that lands, and watch it clear the oldest unpaid charge.

---

## Session 7 — Insights tab (run-rate projections)

**Goal:** Phone Insights tab from the Design bundle, working from real data.

**Build:**
- [ ] **Projection selector**: `projection(envelope, {netView}) = effectiveSpent ÷ (dayOfMonth ÷ daysInMonth)`. Parameterized by `netView: bool` (net subtracts `reimbAmt`).
- [ ] Insights hero: "On pace to spend $X" with delta chip ("+$Y over" / "$Y to spare"), projection bar (spent fill + projected ghost + budget tick), legend.
- [ ] Plain-language takeaway sentence: name 1-2 hottest envelopes + any with slack.
- [ ] **Net-of-reimbursements toggle**: switches the whole tab between gross and net views. All projections recompute live.
- [ ] Per-envelope projection cards, **sorted worst-first**. Each card shows: name + dot, projected amount, projection bar, spent · budget footer, over/under badge.
- [ ] Method note (small "i" info line) explaining the math.

**Done when:** you can see June's projections on your phone, toggle net view, and watch the sort order change as reimbursable charges are subtracted.

---

## Session 8 — Laptop dashboards (all four graphs)

**Goal:** Laptop Monthly view completes with all graphs from the design.

**Build:**
- [ ] Spending-by-category donut with center total, two-column legend, footer stats strip.
- [ ] Income · Spending · Saved grouped bar chart, month-emphasized.
- [ ] Budget vs actual per envelope (already present as bars from Session 3 — polish here).
- [ ] Spending over time — trend chart.
- [ ] Envelope over/under color treatment consistent across all charts.

**Done when:** the laptop Monthly view looks like the Direction B mockup.

---

## Session 9 — Custom period pages (trips)

**Goal:** Overlay date-range views without touching monthly pages.

**Build:**
- [ ] Custom period creation (laptop): name, start date, end date, budget.
- [ ] Transaction tag system: transactions in that range are tagged into the period view while still living in their monthly pages.
- [ ] Period page: total spent vs budget, over/under, category breakdown, transaction list, graphs.
- [ ] Multiple periods can exist at once. Listed in the sidebar under "Trips."

**Done when:** you can create a "DC Trip" period with a budget and watch it fill.

---

## Session 10 — Yearly view + polish + ship

**Goal:** Fill in the yearly view, then round the rough edges.

**Build:**
- [ ] Laptop Yearly (Jan–Dec): month-by-month spending, income vs spending vs saved, category trends.
- [ ] Yearly goal progress.
- [ ] Empty states (day-one experience with no data).
- [ ] Error handling on CSV import.
- [ ] Confirmation modals on destructive actions.
- [ ] Loading states.
- [ ] Final pass on phone: open every screen, fix anything that looks bad on iOS Safari.
- [ ] Backup reminder banner if last export was > 2 weeks ago.

**Done when:** you'd be comfortable using this as your only budgeting tool for the summer.

---

## After v1 — v2 backlog

Not now. In rough order of value:

1. **Cloud sync** (real phone↔laptop sync via a backend + accounts + database).
2. **Notifications / reminders** (overspending, unpaid reimbursements, monthly reset, backup, savings nudges).

---

## Rules for working with Claude Code

- **One session = one step.** Don't try to combine sessions — the scope-per-session was carefully sized.
- **Attach the PRD and the Claude Design handoff bundle every session.** Reference specific README sections when asking for features.
- **Open the deployed URL on your phone at the end of every session.** Catch issues immediately.
- **Use the app between sessions.** Real use reveals what needs to change.
- **Keep a "questions" list** as you go. Things you're not sure about — decide them before Code guesses.
- **Commit and deploy after every session.** Vercel's auto-deploy is your friend.
- **Explicitly scope each Claude Code session.** Say "we are doing Session X only from the build order. Don't build ahead." Without that, Code will helpfully do too much.
