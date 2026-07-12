# Handoff: Budgeting App — Envelope budgeting with reimbursement tracking

## Overview
A personal budgeting app built around **envelopes** (per-category monthly budgets) with two things that make it distinct from a generic budget tracker:

1. **Reimbursement tracking** — some charges aren't really *your* expense (a team lunch you'll expense, a dinner a friend will Venmo you back for). The app lets you flag any charge as reimbursable, record how much is owed back, and mark it paid — then subtracts that from your "out of pocket" / spending math everywhere it matters.
2. **Run-rate projections** — instead of only showing what you've spent, the app projects each envelope forward to month-end at your current pace, so you see trouble *before* you overspend.

This bundle covers three shipped screens:
- **Phone — Home** (`Budget Phone - Home v4.dc.html`): the daily driver. Balance, envelopes, today's activity, add-transaction, and the full reimbursement flow.
- **Phone — Insights** (`Budget Phone - Insights.dc.html`): the projections tab. Where each envelope is *headed* by month-end, with a net-of-reimbursements toggle.
- **Laptop — Monthly** (`Budget Laptop - Monthly B.dc.html`): the desktop overview. Hero + donut + budget-vs-actual + trend + transactions, with the reimbursement flow inline in the transactions panel.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show the intended look and behavior. They are **not** production code to copy directly. They're authored as "Design Components" (a lightweight in-house HTML format); the markup and inline styles are accurate to the pixel, but the component/runtime plumbing (`support.js`, `<x-dc>`, `sc-for`, `renderVals()`) is specific to the prototyping tool and should **not** be reproduced.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.), using its established component library, styling approach, state management, and data layer. If there is no existing codebase yet, choose the most appropriate framework for the platform (e.g. React + TypeScript for web, SwiftUI for iOS) and implement there. Treat the HTML as the spec for layout, color, type, copy, and interaction — not as source to port line-by-line.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interaction behavior are all intentional. Recreate the UI faithfully using the codebase's own primitives. Exact color and type values are in the **Design Tokens** section. All colors are specified in `oklch()` — convert to the codebase's color format as needed (they're deliberately low-chroma / muted; preserve that character).

---

## Product model (read this first)

The app is organized around a **month** with a total budget split into **envelopes** (categories). The canonical sample state across these files is **June 2026** (the phone Home screen sits at day 14 of 30; Insights sits at day 27 — see note in Interactions). Real implementation should be date-driven, not hardcoded.

### Core entities
- **Month**: `{ budget, monthStart, monthEnd }`. Sample: budget `$3,200`.
- **Envelope** (category): `{ id, name, color, budget, spent }`. The 5 "flexible" envelopes users actively manage are Out to eat, Activities/fun, Groceries, Transportation, Gas. The laptop view shows a longer list (Household, Social & Gifts, Utilities, etc.) plus an "Everything else"/fixed bucket (rent etc., ~$1,740).
- **Transaction**: `{ id, date, name, amount, categoryId, reimbursable: bool, reimbAmt: number, reimbPaid: bool }`.
  - `reimbAmt` = the portion of `amount` that someone else owes you (can be the full amount, or a split — e.g. a $48.60 dinner where your share is $24.30 and $24.30 is owed back).
  - `reimbPaid` = whether that money has come back to you yet.

### Derived values (the important math — implement these as computed selectors)
- **reimbursableTotal** = Σ `reimbAmt` over reimbursable txns.
- **owedToYou** = Σ `reimbAmt` where `reimbPaid === false`.
- **alreadyReimbursed** = Σ `reimbAmt` where `reimbPaid === true`.
- **outOfPocket** = `totalSpent − reimbursableTotal`. This is the number that should drive "what you actually spent."
- **Envelope spent (net view)** = `envelope.spent − Σ(reimbAmt of that envelope's txns)`.
- **Projection (run-rate)** = `effectiveSpent ÷ (dayOfMonth ÷ daysInMonth)`. In net view, `effectiveSpent` is the net-of-reimbursement figure. This is the single most important formula in the app — it powers the Insights tab.
- **Safe to spend per week** (laptop hero) = `leftToSpend ÷ (daysRemaining ÷ 7)`.

---

## Screens / Views

### 1. Phone — Home (`Budget Phone - Home v4.dc.html`)
**Purpose:** The everyday view. See how much is left, glance at envelopes, review today's activity, add a charge, and manage reimbursements.

**Frame:** 390 × 844 iOS-style screen (status bar with notch/Dynamic-Island pill, home indicator). Vertically scrolling content with a fixed bottom tab bar. Design width in the mock is a phone; on real iOS this is a standard full-screen view.

**Layout (top → bottom):**
- **App bar**: greeting/month label left, small day counter chip right ("Day 14 / 30").
- **Hero card** — "Left to spend this month." Big number (`$1,284` at day 14). A progress bar showing spent vs budget with a pace tick. Below it, when there's money owed to you, an inline indicator (e.g. "$X owed to you") in the clay/red accent; when all reimbursable charges are paid, it flips to a green "all reimbursed" state.
- **Envelopes** section — a row/list of the flexible envelopes, each with name, spent/budget, and a thin progress bar. Over-budget envelopes render in clay/red; under in green.
- **Owed to me card** — running "owed to you" balance, an itemized list of unpaid reimbursable charges, and a "reimbursed this month" figure. Includes **"Log a Venmo payment"** action (see Interactions).
- **Today** section — the day's transactions as tappable rows. Reimbursable rows carry an "Owed" or "Reimbursed" tag.
- **Bottom tab bar** (fixed): **Home** (active), center **＋** (add transaction), **Insights**. 66px tall, hairline top border, cream background. The center ＋ is a raised 52px rounded-square green button.

**Key components & states** — see Interactions & Design Tokens.

### 2. Phone — Insights (`Budget Phone - Insights.dc.html`)
**Purpose:** Answer "will I blow my budget, and where?" via run-rate projections. Sits behind the "Insights" tab.

**Frame:** same 390 × 844 phone frame + same bottom tab bar (here **Insights** is active).

**Layout (top → bottom):**
- **App bar**: "INSIGHTS" eyebrow + "June 2026", day counter chip right ("Day 27 / 30").
- **Takeaway hero** — "ON PACE TO SPEND" eyebrow, a large **projected** total for the flexible budget (`$1,423` in gross view), and a delta chip ("+$193 over" in red, or "$X under" in green). Subline: "projected · of $1,230 flexible budget."
  - **Projection bar**: a track with two fills — a solid fill = **spent so far**, a lighter/ghost fill = **projected total** — plus a vertical **budget tick** marking the budget line. Legend row beneath (spent / projected / budget).
  - **Takeaway sentence**: plain-language, names the 1–2 hottest envelopes and where there's slack (e.g. "Out to eat and Activities / fun are running hottest. Groceries has $39 to spare.").
- **Net-of-reimbursements toggle** — a full-width row with a switch. Label "Net of what you're owed." Off (default): subline shows "$48 still owed to you · $90 paid back." On: subline shows "On — subtracting $138 in reimbursable charges," and **all projections + the hero recompute** using net-of-reimbursement spending.
- **Per-envelope projection list** — heading "Each envelope by month-end" with an "N over" count on the right. Each envelope is a card:
  - Name + colored dot (left), "proj" label + projected amount (right).
  - A projection bar (same spent-fill / projected-ghost / budget-tick treatment as the hero, scaled per-envelope).
  - Footer: "$X spent · $Y budget" (left) and a badge (right): "+$Z over" (clay/red) or "$Z to spare" (green).
  - **Sorted worst-first** — the envelope most over pace is at the top.
- **Method note** (optional, toggleable): a small "i" info line explaining the projection math and net view.

### 3. Laptop — Monthly (`Budget Laptop - Monthly B.dc.html`)
**Purpose:** The desktop command center — a full monthly overview in a single dashboard.

**Frame:** 1440px-wide app inside a browser-window chrome (traffic lights + address bar `budget.app/monthly`). Left sidebar + main content. Overall app height in the mock ~1052px.

**Layout:**
- **Left sidebar** (236px): brand mark, nav (Monthly [active], Yearly, Trips, Goals, Settings), an ACCOUNTS mini-panel (Checking $4,210 / Savings $12,480), and a user chip at the bottom.
- **Main content** (fills rest), vertical stack with 16px gaps:
  1. **Header row**: "MONTHLY / June 2026" left, primary **＋ Add transaction** button right (green, 38px tall).
  2. **Top row** (three cards side by side):
     - **Hero card** (400px): "Left to spend this month" `$1,284`, progress bar + pace tick, then Income / Spent / Saved stat trio, then a **"Safe to spend per week · $560/week"** sub-card ("to finish June on track"). When money is owed, the hero shows an owed indicator; flips to "All reimbursed" when settled.
     - **Spending by category** (flex): a conic-gradient **donut** with center total ($1,916 spent), a two-column legend of categories with amounts, and a footer strip of stats (Biggest / Top 3 / Tracked).
     - **Savings goal** (280px): a **rotating** goal ring — ‹ › arrows + dot pager cycle through Emergency Fund / Mexico Trip / New Laptop. The ring is a conic-gradient progress ring with saved/total in the center, a "X% there · $Y to close the ring" line, and an **＋ Add $250** button that advances the ring live (the goal's accent color changes per goal).
  3. **Centerpiece — "Envelopes — budget vs actual"**: full-width card, summary row (Assigned $3,200 / Spent $1,916 / Available $1,284), then a **two-column list** of every envelope as a labeled horizontal bar (name + dot, filled bar vs track, "$spent/$budget"). Over-budget envelopes use the clay/red bar + track treatment; under use green.
  4. **Bottom row** (two cards):
     - **Trend chart** (flex): "Income · Spending · Saved" grouped bar chart, Jan–Jun, with a y-axis ($0–$5k) and legend. June is emphasized.
     - **Recent transactions** (420px): the reimbursement flow. Scrollable transaction list; **click a row to expand** its reimbursement controls (see Interactions). Footer totals: Spent this month, Reimbursable (−), **Out of pocket** (emphasized), and Owed-to-you / Reimbursed chips.

---

## Interactions & Behavior

### Reimbursement flow (appears on Phone Home and Laptop)
This is the signature interaction. On the **laptop**, it lives in the "Recent transactions" panel; on the **phone**, in the transaction detail sheet / rows.

1. **Select a transaction** → its row expands (laptop) or opens a detail sheet (phone), with a tinted background on the active row.
2. **Mark reimbursable** → a toggle button. On first enable, `reimbAmt` defaults to the full `amount`. Disabling also clears the paid state.
3. **Set "to be paid back"** → a stepper (− / +, $5 increments in the mock) plus a **directly editable amount input**. Clamp to `0 ≤ reimbAmt ≤ amount`. This supports splits (your share vs. owed-back share).
4. **Mark as paid** → toggle. Paid charges count toward "already reimbursed"; unpaid count toward "owed to you."
5. **Live recomputation** everywhere: row tags ("Not paid" red / "Reimbursed" green), the per-row owed line (−$X unpaid / +$X paid), the footer totals (Reimbursable, **Out of pocket = spent − reimbursable**), and the Owed-to-you / Reimbursed chips all update immediately.

### Log a Venmo payment (Phone Home)
A lump-sum reconciliation sheet: enter one amount received and it **auto-applies to your oldest unpaid reimbursable charges first**, showing a live preview of which charges clear. The applied amount is reassignable by editing the number. This is how a user marks several charges paid at once when a friend Venmos them a round number.

### Add transaction (Phone Home)
A sheet with a numeric **keypad** and a **category picker**. Committing updates the hero, the relevant envelope, and the Today list live.

### Insights — Net-of-reimbursements toggle
Toggling recomputes the hero projection, the takeaway sentence, the "N over" count, and every envelope card using net-of-reimbursement spending (`spent − reimbAmt`). Because reimbursable charges are concentrated in Out to eat and Activities, those envelopes visibly cool off in net view. **This must be real math, not a cosmetic swap** — implement it as a derived selector parameterized by `netView: bool`.

### Insights — projection recompute (what-if pace)
The projection formula is `effectiveSpent ÷ (day ÷ daysInMonth)`. In the prototype there's a "what-if" control that lets you slide the current day (14–30) and watch projections change; at minimum, the shipped app should compute projections from the real current date. Envelope cards **re-sort worst-first** whenever projections change.

### Savings goal ring (Laptop)
- ‹ / › arrows and the dot pager switch between goals; the ring, center numbers, accent color, and pager dot all update.
- **＋ Add $250** increments the current goal's saved amount (clamped to its total) and animates the ring fill. When saved ≥ total, the ring is full and the label reads "Ring closed — goal reached."

### Navigation
- Phone bottom tab bar switches Home ↔ Insights (center ＋ opens Add transaction). In the prototypes these are separate files linked via the tab bar; in the app they're tabs/routes within one shell.

### Animation & transition notes
- Toggle switches: knob slides ~0.2s ease, track color crossfades.
- Savings ring: background (conic-gradient) transitions ~0.45s ease on change.
- Keep motion subtle and quick; this is a calm, low-chroma UI, not a flashy one.

---

## State Management
Suggested state shape (adapt to the codebase's conventions — Redux/Zustand/Context/SwiftUI @Observable/etc.):

- **month**: `{ budget, monthStart, monthEnd, today }` (drives day-of-month and daysInMonth).
- **envelopes**: `Envelope[]` (`id, name, color, budget, spent`).
- **transactions**: `Transaction[]` (`id, date, name, amount, categoryId, reimbursable, reimbAmt, reimbPaid`).
- **goals**: `Goal[]` (`id, name, total, saved, accent`) + `activeGoalIdx`.
- **UI**: `selectedTxnId | null`, `netView: bool` (Insights), `addSheetOpen`, `venmoSheetOpen`.

**Derived selectors** (implement once, reuse across screens): `reimbursableTotal`, `owedToYou`, `alreadyReimbursed`, `outOfPocket`, `envelopeSpentNet(envelope)`, `projection(envelope, {netView})`, `leftToSpend`, `safeToSpendPerWeek`. See the Product model section for formulas.

**Data fetching:** all values here come from the user's own accounts/transactions. Assume a transactions API and an accounts/balances API; everything else is derived client-side. No third-party data in these screens.

---

## Design Tokens

All colors are `oklch(L C H)` — low-chroma, warm. Convert to the codebase's format; preserve the muted character (don't saturate).

### Color — surfaces & neutrals
- Page background (cream): `oklch(0.925 0.012 110)`
- Screen/app surface: `oklch(0.966 0.014 92)`
- Card surface (raised white): `oklch(0.995 0.005 92)`
- Card border (hairline): `oklch(0.91 0.012 110)`
- Sidebar (laptop): `oklch(0.945 0.022 150)`
- Primary text: `oklch(0.31 0.03 152)`
- Secondary text: `oklch(0.5 0.025 150)` – `oklch(0.55 0.03 150)`
- Muted/hint text: `oklch(0.6 0.02 150)`

### Color — brand & accents
- **Primary green** (buttons, active nav, positive): `oklch(0.5 0.085 153)`; deeper text green `oklch(0.42–0.47 0.07–0.09 153–155)`; fills `oklch(0.58 0.08 152)`, ghost/track `oklch(0.82–0.9 0.03–0.05 150)`.
- **Clay / red** (over budget, owed, warnings): text `oklch(0.5 0.095 38)` / `oklch(0.5 0.13 28)`; fill `oklch(0.58–0.62 0.095–0.16 28–42)`; ghost `oklch(0.83 0.07 45)`; badge bg `oklch(0.93 0.05 28–38)`.
- **Ochre** (secondary category accent): `oklch(0.73 0.075 82)`.
- Category dots (examples): Groceries `oklch(0.6 0.075 152)`, Out to eat `oklch(0.62 0.085 47)`, Activities `oklch(0.73 0.075 82)`, Transportation `oklch(0.62 0.06 320)`, Gas `oklch(0.66 0.08 62)`, Household `oklch(0.66 0.05 180)`, Social & Gifts `oklch(0.58 0.06 320)`.
- Goal accents: Emergency `oklch(0.5 0.085 153)`, Mexico `oklch(0.55 0.08 235)`, Laptop `oklch(0.62 0.095 68)`.

### Typography
- **Display / headers / all numbers**: **Fredoka** (phone) and **Manrope** (laptop) — weights 400/500/600/700. Fredoka is the quirky-rounded display face used on phone headers and hero numbers; Manrope is the laptop's display/number face. Big hero numbers use weight 600, letter-spacing ≈ −0.02em.
- **Body / labels**: **Hanken Grotesque** — weights 400/500/600/700.
- Scale (phone): hero number ~50–58px; screen title ~24px; card title ~15px; body 12.5–14px; labels/eyebrows 10.5–12px (uppercase eyebrows use letter-spacing 0.1–0.16em, weight 600–700).
- Scale (laptop): hero number ~58px; section titles 15–16px; body 12–14px; small stats 10–12px.

### Spacing, radius, shadow
- Card radius: 18px (large cards / phone hero 26px); pills/chips 8–14px; buttons 9–11px; toggle track 14px.
- Card padding: ~18–22px; list-row padding ~7–13px.
- Gaps: major sections 13–16px; inline groups 6–14px (use flex/grid `gap`).
- Phone frame: outer bezel radius 46–52px; status-bar pill 112×28.
- Shadows (soft, warm, low): e.g. card `0 30px 70px -30px rgba(35,45,30,0.45), 0 8px 20px -12px rgba(35,45,30,0.3)`; raised button `0 10px 18px -7px rgba(40,70,40,0.5)`.
- **Rounded everything** — this is a core aesthetic rule. No sharp corners.

### Progress-bar / projection-bar pattern (reused everywhere)
Track (light) → **spent fill** (solid, colored by over/under) → **projected ghost fill** (lighter, only on Insights) → **budget tick** (thin vertical mark at the budget line). Reuse this as one component with variants.

---

## Assets
No raster images or logos are used — all iconography is simple CSS shapes (dots, rounded squares, bars) and the brand mark is a letterform ("B"). Fonts load from Google Fonts (Fredoka, Manrope, Hanken Grotesque). If the codebase has an icon set, substitute real icons for the placeholder CSS squares in the nav/tab bar. No external/brand assets to license.

## Files
Design-reference prototypes included in this bundle (open in a browser to interact; `support.js` is the prototype runtime and is **not** to be reproduced):
- `Budget Phone - Home v4.dc.html` — phone home + reimbursement flow + add-transaction + Log-a-Venmo-payment.
- `Budget Phone - Insights.dc.html` — phone Insights tab (projections + net toggle).
- `Budget Laptop - Monthly B.dc.html` — laptop monthly dashboard (chosen direction B).
- `support.js` — prototype runtime dependency (do not port).
- `screenshots/` — reference renders: `01-phone-home.png`, `02-phone-insights.png`, `03-laptop-monthly.png`.

## Known caveats in the sample data (not bugs to preserve)
- **Two sample "days" across screens**: Phone Home and the Laptop are at **day 14** of June; Insights is at **day 27**. Each screen's math is internally correct for its day. In the real app, everything must derive from the actual current date — don't hardcode.
- **Reimbursable transactions differ per device**: the phone sample is a friends-splitting flavor (~$48 owed, $90 already paid back); the laptop sample is a business-travel flavor (United Airlines flight, team lunch → ~$336 owed, ~$86 reimbursed). Each screen's totals are internally consistent, but they are illustrative sets, not one shared ledger. In production there is a single transactions source and these reconcile automatically.
