"use client";

import Link from "next/link";

const NAV_ITEMS: { label: string; href: string | null }[] = [
  { label: "Monthly", href: "/" },
  { label: "Yearly", href: null },
  { label: "Trips", href: null },
  { label: "Goals", href: null },
  { label: "Settings", href: "/settings" },
];

export default function LaptopSidebar({
  active,
}: {
  active: "Monthly" | "Settings";
}) {
  return (
    <aside className="flex w-[236px] shrink-0 flex-col justify-between border-r border-card-border bg-sidebar p-4">
      <div>
        <div className="flex items-center gap-2 px-1 pb-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-button bg-green font-display-laptop text-sm font-semibold text-card">
            B
          </span>
          <span className="font-display-laptop text-sm font-semibold text-text-primary">
            Budget
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === active;
            const classes = `rounded-button px-3 py-2 text-left text-[13px] font-medium ${
              isActive
                ? "bg-green text-card"
                : item.href
                  ? "text-text-secondary hover:bg-card"
                  : "text-text-muted"
            }`;
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={classes}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <button key={item.label} type="button" disabled className={classes}>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 rounded-card border border-card-border bg-card p-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Accounts
          </p>
          <div className="mt-2 flex items-center justify-between text-[12.5px]">
            <span className="text-text-secondary">Checking</span>
            <span className="text-text-primary">$—</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12.5px]">
            <span className="text-text-secondary">Savings</span>
            <span className="text-text-primary">$—</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-button p-2">
        <span className="h-7 w-7 rounded-full bg-card-border" />
        <span className="text-[12.5px] font-medium text-text-secondary">—</span>
      </div>
    </aside>
  );
}
