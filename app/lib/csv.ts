import type { AccountId, CategoryRule, TransactionType } from "./types";

export interface ParsedRow {
  date: string; // "YYYY-MM-DD"
  name: string;
  amount: number; // always positive; direction is carried separately
  type: TransactionType;
  direction: "in" | "out";
  categoryId: string | null;
  accountId: AccountId;
}

/** RFC4180-ish line splitter: respects quoted fields (commas, doubled-quote escapes). */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// Substrings (case-insensitive) that mark a line as a transfer rather than
// real income/spending: inter-account transfers, a savings→card payment, a
// card's payment-received line, and a Venmo balance cashout to the bank.
const TRANSFER_KEYWORDS = ["XFER", "PYMT TO VSA", "THANK YOU", "CASHOUT"];

function isTransferDescription(description: string): boolean {
  const upper = description.toUpperCase();
  return TRANSFER_KEYWORDS.some((k) => upper.includes(k));
}

function classifyType(description: string, isCredit: boolean): TransactionType {
  if (isTransferDescription(description)) return "transfer";
  return isCredit ? "income" : "spending";
}

export function matchCategory(
  description: string,
  rules: CategoryRule[]
): string | null {
  const upper = description.toUpperCase();
  for (const rule of rules) {
    if (upper.includes(rule.keyword.toUpperCase())) return rule.categoryId;
  }
  return null;
}

function cleanDescription(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** "MM/DD/YYYY" -> "YYYY-MM-DD"; returns null if it doesn't parse. */
function parseUsDate(raw: string): string | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts;
  if (!mm || !dd || !yyyy) return null;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

/**
 * Parses this bank's export format: two metadata lines, a header row on
 * line 3, one row per transaction, and a totals/footer row (blank Date)
 * at the end. Skips anything before the header and the footer row.
 */
export function parseBankCsv(
  text: string,
  accountId: AccountId,
  rules: CategoryRule[]
): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headerIdx = lines.findIndex(
    (l) => parseCsvLine(l)[0]?.trim() === "Date"
  );
  if (headerIdx === -1) return [];

  const header = parseCsvLine(lines[headerIdx]).map((h) => h.trim());
  const dateCol = header.indexOf("Date");
  const descCol = header.indexOf("Description");
  const creditCol = header.indexOf("Credit");
  const debitCol = header.indexOf("Debit");
  if (dateCol === -1 || descCol === -1 || creditCol === -1 || debitCol === -1) {
    return [];
  }

  const rows: ParsedRow[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const date = parseUsDate(cells[dateCol] ?? "");
    if (!date) continue; // skips the blank-date totals/footer row

    const creditRaw = cells[creditCol]?.trim();
    const debitRaw = cells[debitCol]?.trim();
    const isCredit = !!creditRaw;
    const amount = Math.abs(parseFloat((isCredit ? creditRaw : debitRaw) || "0"));
    if (!amount) continue;

    const name = cleanDescription(cells[descCol] ?? "");
    const type = classifyType(name, isCredit);
    const direction: "in" | "out" = isCredit ? "in" : "out";
    const categoryId = type === "spending" ? matchCategory(name, rules) : null;

    rows.push({ date, name, amount, type, direction, categoryId, accountId });
  }
  return rows;
}

/** Guesses the target account from the bank's own account-name line (row 1). */
export function inferAccountFromCsvHeader(text: string): AccountId {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const accountName = parseCsvLine(firstLine)[0] ?? "";
  return /saving|saver/i.test(accountName) ? "savings" : "checking";
}
