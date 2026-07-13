"use client";

import { useState } from "react";
import { useAppData } from "../providers";
import {
  inferAccountFromCsvHeader,
  parseBankCsv,
  type ParsedRow,
} from "../lib/csv";
import { formatMoney } from "../lib/format";
import type { AccountId, TransactionType } from "../lib/types";

interface PreviewRow extends ParsedRow {
  key: string;
  included: boolean;
  isDuplicate: boolean;
}

function txnSignature(
  accountId: AccountId,
  date: string,
  amount: number,
  type: TransactionType
): string {
  return `${accountId}|${date}|${amount.toFixed(2)}|${type}`;
}

export default function ImportPanel() {
  const { transactions, categories, rules, importTransactions } = useAppData();
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setImportedCount(null);

    const existingSignatures = new Set(
      transactions.map((t) =>
        txnSignature(t.accountId, t.date, t.amount, t.type)
      )
    );

    const parsed: PreviewRow[] = [];
    for (const file of Array.from(fileList)) {
      const text = await file.text();
      const accountId = inferAccountFromCsvHeader(text);
      const fileRows = parseBankCsv(text, accountId, rules);
      for (const r of fileRows) {
        const sig = txnSignature(r.accountId, r.date, r.amount, r.type);
        parsed.push({
          ...r,
          key: `${sig}|${parsed.length}`,
          isDuplicate: existingSignatures.has(sig),
          included: !existingSignatures.has(sig),
        });
      }
    }
    // Newest first, matching the rest of the app's transaction lists.
    parsed.sort((a, b) => b.date.localeCompare(a.date));
    setRows(parsed);
  }

  function updateRow(key: string, patch: Partial<PreviewRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function handleImport() {
    const toImport = rows.filter((r) => r.included);
    importTransactions(
      toImport.map((r) => ({
        date: r.date,
        name: r.name,
        amount: r.amount,
        categoryId: r.categoryId,
        accountId: r.accountId,
        type: r.type,
        direction: r.direction,
        reimbursable: false,
        reimbAmt: 0,
        reimbPaid: false,
        tags: [],
        notes: "",
      }))
    );
    setImportedCount(toImport.length);
    setRows([]);
  }

  const includedCount = rows.filter((r) => r.included).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  return (
    <section className="rounded-card border border-card-border bg-card p-5">
      <h2 className="font-display-laptop text-[15px] font-medium text-text-primary">
        Import CSV
      </h2>
      <p className="mt-1 text-[12px] text-text-muted">
        Drop in one or more bank CSVs. The account (checking or savings) and
        category are guessed automatically — fix anything before importing.
      </p>

      <input
        type="file"
        accept=".csv"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="mt-4 text-[12.5px] text-text-secondary file:mr-3 file:rounded-button file:border-0 file:bg-green file:px-3 file:py-2 file:text-[12.5px] file:font-medium file:text-card"
      />

      {importedCount !== null && (
        <p className="mt-3 text-[12.5px] text-green-deep">
          Imported {importedCount} transaction{importedCount === 1 ? "" : "s"}.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-text-muted">
            <span>
              {includedCount} of {rows.length} selected
              {duplicateCount > 0 &&
                ` · ${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"} skipped`}
            </span>
          </div>

          <div className="mt-2 max-h-96 overflow-y-auto rounded-button border border-card-border">
            {rows.map((r) => (
              <div
                key={r.key}
                className={`flex items-center gap-2 border-b border-card-border px-3 py-2 last:border-b-0 ${
                  r.isDuplicate ? "opacity-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={r.included}
                  onChange={(e) =>
                    updateRow(r.key, { included: e.target.checked })
                  }
                  className="shrink-0"
                />
                <span className="w-[84px] shrink-0 text-[11.5px] text-text-muted">
                  {r.date}
                </span>
                <input
                  type="text"
                  value={r.name}
                  onChange={(e) => updateRow(r.key, { name: e.target.value })}
                  className="min-w-0 flex-1 rounded-button border border-transparent bg-transparent px-1.5 py-1 text-[12px] text-text-primary hover:border-card-border focus:border-card-border focus:outline-none"
                />
                <select
                  value={r.type}
                  onChange={(e) => {
                    const nextType = e.target.value as TransactionType;
                    updateRow(r.key, {
                      type: nextType,
                      categoryId: nextType === "spending" ? r.categoryId : null,
                      direction:
                        nextType === "spending"
                          ? "out"
                          : nextType === "income"
                            ? "in"
                            : r.direction,
                    });
                  }}
                  className="w-24 shrink-0 rounded-button border border-card-border bg-surface px-1 py-1 text-[11px] text-text-primary focus:outline-none"
                >
                  <option value="spending">Spending</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
                {r.type === "spending" && (
                  <select
                    value={r.categoryId ?? ""}
                    onChange={(e) =>
                      updateRow(r.key, { categoryId: e.target.value || null })
                    }
                    className="w-36 shrink-0 rounded-button border border-card-border bg-surface px-1 py-1 text-[11px] text-text-primary focus:outline-none"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                <span className="w-20 shrink-0 text-right text-[12px] font-medium text-text-primary">
                  {formatMoney(r.amount)}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={includedCount === 0}
            className="mt-4 rounded-button bg-green px-4 py-2 text-[12.5px] font-medium text-card disabled:opacity-40"
          >
            Import {includedCount} transaction{includedCount === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </section>
  );
}
