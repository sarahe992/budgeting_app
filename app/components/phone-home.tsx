function EmptyCard({
  title,
  hint,
  className = "",
}: {
  title: string;
  hint: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-card-border bg-card p-5 ${className}`}
    >
      <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
        {title}
      </h2>
      <p className="mt-2 text-[13px] text-text-muted">{hint}</p>
    </section>
  );
}

export default function PhoneHome() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* App bar */}
      <header
        className="flex items-center justify-between px-5 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Monthly
          </p>
          <h1 className="font-display-phone text-2xl font-medium text-text-primary">
            June 2026
          </h1>
        </div>
        <div className="rounded-pill border border-card-border bg-card px-3 py-1.5 text-[12px] font-medium text-text-secondary">
          Day — / —
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        {/* Hero card */}
        <section className="rounded-card-lg border border-card-border bg-card p-6 shadow-card">
          <p className="text-[13px] font-medium text-text-secondary">
            Left to spend this month
          </p>
          <p className="font-display-phone mt-1 text-[54px] leading-none font-semibold tracking-[-0.02em] text-text-primary">
            $—
          </p>
          <p className="mt-2 text-[12.5px] text-text-muted">
            of $— budgeted
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-green-ghost">
            <div className="h-2 w-0 rounded-full bg-green-fill" />
          </div>
        </section>

        {/* Envelopes */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
              Envelopes
            </h2>
          </div>
          <EmptyCard
            title="No envelopes yet"
            hint="Categories you budget for will show up here."
          />
        </section>

        {/* Owed to me */}
        <EmptyCard
          title="Owed to me"
          hint="Reimbursable charges you're waiting to get paid back for will appear here."
        />

        {/* Today */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="font-display-phone text-[15px] font-medium text-text-primary">
              Today
            </h2>
          </div>
          <EmptyCard
            title="No transactions yet"
            hint="Tap the + button below to add your first charge."
          />
        </section>
      </main>

      {/* Bottom tab bar */}
      <nav
        className="flex items-center justify-around border-t border-card-border bg-surface px-6"
        style={{
          height: "66px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <button
          type="button"
          aria-current="page"
          className="flex h-10 w-10 items-center justify-center rounded-button bg-green text-card"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-card" />
        </button>
        <button
          type="button"
          aria-label="Add transaction"
          className="flex items-center justify-center rounded-button bg-green text-card shadow-raised"
          style={{ height: 52, width: 52 }}
        >
          <span className="text-2xl leading-none">+</span>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-button border border-card-border text-text-muted"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-text-muted" />
        </button>
      </nav>
    </div>
  );
}
