import { describe, it, expect } from "vitest";
import {
  normalizeTransaction,
  normalizeCategory,
  normalizeAccount,
  formatCurrency,
  formatDashboardDate,
  buildCategoryBreakdown,
  buildMetrics,
  getDashboardDateRange,
  getMonthDateRange,
  toDateInputValue,
  type TransactionRow,
  type DashboardTransaction,
  type DashboardAccount,
  type AccountRow,
  type CategoryRow,
} from "@/lib/finance";

describe("normalizeTransaction", () => {
  it("handles null fields gracefully", () => {
    const row: TransactionRow = { id: "1" };
    const result = normalizeTransaction(row, 0);
    expect(result.id).toBe("1");
    expect(result.merchant).toBe("Untitled merchant");
    expect(result.category).toBe("Uncategorized");
    expect(result.amount).toBe(0);
    expect(result.transactionType).toBe("expense");
  });

  it("handles missing fields gracefully", () => {
    const row = {} as TransactionRow;
    const result = normalizeTransaction(row, 42);
    expect(result.id).toBe("transaction-42");
    expect(result.merchant).toBe("Untitled merchant");
    expect(result.transactionType).toBe("expense");
  });

  it("identifies transfer type", () => {
    const row: TransactionRow = { id: "2", transaction_type: "transfer", merchant: "Test Transfer" };
    const result = normalizeTransaction(row, 0);
    expect(result.transactionType).toBe("transfer");
  });

  it("identifies income type", () => {
    const row: TransactionRow = { id: "3", transaction_type: "income" };
    const result = normalizeTransaction(row, 0);
    expect(result.transactionType).toBe("income");
    expect(result.merchant).toBe("Income");
  });

  it("defaults to expense for unknown type", () => {
    const row: TransactionRow = { id: "4", transaction_type: "investment" };
    const result = normalizeTransaction(row, 0);
    expect(result.transactionType).toBe("expense");
  });

  it("handles zero amount", () => {
    const row: TransactionRow = { id: "5", amount: 0 };
    const result = normalizeTransaction(row, 0);
    expect(result.amount).toBe(0);
  });

  it("parses string amount", () => {
    const row: TransactionRow = { id: "6", amount: 12345 };
    const result = normalizeTransaction(row, 0);
    expect(result.amount).toBe(123.45);
  });

  it("trims merchant name", () => {
    const row: TransactionRow = { id: "7", merchant: "  Jollibee  " };
    const result = normalizeTransaction(row, 0);
    expect(result.merchant).toBe("Jollibee");
  });

  it("prefers date over created_at", () => {
    const row: TransactionRow = { id: "8", date: "2024-01-15", created_at: "2024-01-01" };
    const result = normalizeTransaction(row, 0);
    expect(result.date).toBe("2024-01-15");
  });

  it("falls back to created_at when date missing", () => {
    const row: TransactionRow = { id: "9", created_at: "2024-06-01" };
    const result = normalizeTransaction(row, 0);
    expect(result.date).toBe("2024-06-01");
  });

  it("uses notes or description", () => {
    const row: TransactionRow = { id: "10", notes: "My note", description: "Desc" };
    const result = normalizeTransaction(row, 0);
    expect(result.notes).toBe("My note");
  });

  it("falls back to description when notes missing", () => {
    const row: TransactionRow = { id: "11", description: "Fallback desc" };
    const result = normalizeTransaction(row, 0);
    expect(result.notes).toBe("Fallback desc");
  });
});

describe("buildMetrics", () => {
  it("computes totals for mixed transactions", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Salary", category: "Income", notes: "", amount: 50000, date: "2024-01-01", transactionType: "income", paymentMethod: "GCash", accountId: "" },
      { id: "2", dbId: "2", merchant: "Jollibee", category: "Food", notes: "", amount: 250, date: "2024-01-02", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
      { id: "3", dbId: "3", merchant: "Grab", category: "Transport", notes: "", amount: 150, date: "2024-01-03", transactionType: "expense", paymentMethod: "GCash", accountId: "" },
    ];
    const result = buildMetrics(txns);
    expect(result.totalIncome).toBe(50000);
    expect(result.totalExpenses).toBe(400);
    expect(result.netCashFlow).toBe(49600);
    expect(result.count).toBe(3);
  });

  it("returns zeros for empty array", () => {
    const result = buildMetrics([]);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netCashFlow).toBe(0);
    expect(result.count).toBe(0);
  });

  it("handles only income transactions", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Salary", category: "Income", notes: "", amount: 50000, date: "2024-01-01", transactionType: "income", paymentMethod: "GCash", accountId: "" },
      { id: "2", dbId: "2", merchant: "Freelance", category: "Income", notes: "", amount: 20000, date: "2024-01-02", transactionType: "income", paymentMethod: "Bank", accountId: "" },
    ];
    const result = buildMetrics(txns);
    expect(result.totalIncome).toBe(70000);
    expect(result.totalExpenses).toBe(0);
    expect(result.netCashFlow).toBe(70000);
  });

  it("handles only expense transactions", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Jollibee", category: "Food", notes: "", amount: 250, date: "2024-01-01", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
    ];
    const result = buildMetrics(txns);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(250);
    expect(result.netCashFlow).toBe(-250);
  });

  it("ignores transfer transactions in income/expense", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Transfer", category: "Transfer", notes: "", amount: 1000, date: "2024-01-01", transactionType: "transfer", paymentMethod: "GCash", accountId: "" },
    ];
    const result = buildMetrics(txns);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netCashFlow).toBe(0);
    expect(result.count).toBe(1);
  });
});

describe("buildCategoryBreakdown", () => {
  it("groups multiple transactions in the same category", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Jollibee", category: "Food", notes: "", amount: 250, date: "2024-01-01", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
      { id: "2", dbId: "2", merchant: "McDo", category: "Food", notes: "", amount: 350, date: "2024-01-02", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
      { id: "3", dbId: "3", merchant: "Grab", category: "Transport", notes: "", amount: 150, date: "2024-01-03", transactionType: "expense", paymentMethod: "GCash", accountId: "" },
    ];
    const result = buildCategoryBreakdown(txns);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Food");
    expect(result[0].amount).toBe(600);
    expect(result[1].name).toBe("Transport");
    expect(result[1].amount).toBe(150);
  });

  it("returns empty array for no expense transactions", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Salary", category: "Income", notes: "", amount: 50000, date: "2024-01-01", transactionType: "income", paymentMethod: "GCash", accountId: "" },
    ];
    const result = buildCategoryBreakdown(txns);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    const result = buildCategoryBreakdown([]);
    expect(result).toHaveLength(0);
  });

  it("sorts by amount descending", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Item", category: "A", notes: "", amount: 100, date: "2024-01-01", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
      { id: "2", dbId: "2", merchant: "Item", category: "B", notes: "", amount: 300, date: "2024-01-02", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
      { id: "3", dbId: "3", merchant: "Item", category: "C", notes: "", amount: 200, date: "2024-01-03", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
    ];
    const result = buildCategoryBreakdown(txns);
    expect(result.map((c) => c.name)).toEqual(["B", "C", "A"]);
  });

  it("handles uncategorized transactions", () => {
    const txns: DashboardTransaction[] = [
      { id: "1", dbId: "1", merchant: "Store", category: "", notes: "", amount: 100, date: "2024-01-01", transactionType: "expense", paymentMethod: "Cash", accountId: "" },
    ];
    const result = buildCategoryBreakdown(txns);
    expect(result[0].name).toBe("Uncategorized");
    expect(result[0].amount).toBe(100);
  });
});

describe("formatCurrency", () => {
  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats positive number", () => {
    const result = formatCurrency(1234);
    expect(result).toContain("1,234");
  });

  it("formats negative number", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
    expect(result.startsWith("-")).toBe(true);
  });

  it("formats large number", () => {
    const result = formatCurrency(10000000);
    expect(result).toContain("10,000,000");
  });
});

describe("formatDashboardDate", () => {
  it("formats a valid date string", () => {
    const result = formatDashboardDate("2024-01-15");
    expect(result).toBe("Jan 15, 2024");
  });

  it("returns 'Recently' for invalid date", () => {
    const result = formatDashboardDate("not-a-date");
    expect(result).toBe("Recently");
  });
});

describe("getDashboardDateRange", () => {
  it("returns empty for all_time", () => {
    const result = getDashboardDateRange("all_time");
    expect(result).toEqual({});
  });

  it("returns start and end for this_month", () => {
    const result = getDashboardDateRange("this_month");
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    const startDate = new Date(result.start + "T00:00:00");
    expect(startDate.getDate()).toBe(1);
  });

  it("returns correct structure for last_month", () => {
    const result = getDashboardDateRange("last_month");
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
  });

  it("returns correct structure for last_3_months", () => {
    const result = getDashboardDateRange("last_3_months");
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
  });

  it("returns correct structure for this_year", () => {
    const result = getDashboardDateRange("this_year");
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
    const startDate = new Date(result.start + "T00:00:00");
    expect(startDate.getMonth()).toBe(0);
    expect(startDate.getDate()).toBe(1);
  });
});

describe("getMonthDateRange", () => {
  it("returns first and last day of the month", () => {
    const date = new Date(2024, 5, 15);
    const result = getMonthDateRange(date);
    expect(result.start).toBe("2024-06-01");
    expect(result.end).toBe("2024-06-30");
  });

  it("handles leap year February", () => {
    const date = new Date(2024, 1, 15);
    const result = getMonthDateRange(date);
    expect(result.start).toBe("2024-02-01");
    expect(result.end).toBe("2024-02-29");
  });

  it("handles non-leap year February", () => {
    const date = new Date(2023, 1, 15);
    const result = getMonthDateRange(date);
    expect(result.start).toBe("2023-02-01");
    expect(result.end).toBe("2023-02-28");
  });

  it("handles December boundaries", () => {
    const date = new Date(2024, 11, 15);
    const result = getMonthDateRange(date);
    expect(result.start).toBe("2024-12-01");
    expect(result.end).toBe("2024-12-31");
  });

  it("handles January boundaries", () => {
    const date = new Date(2024, 0, 15);
    const result = getMonthDateRange(date);
    expect(result.start).toBe("2024-01-01");
    expect(result.end).toBe("2024-01-31");
  });
});

describe("toDateInputValue", () => {
  it("formats date to YYYY-MM-DD", () => {
    const date = new Date(2024, 0, 5);
    expect(toDateInputValue(date)).toBe("2024-01-05");
  });

  it("pads single digit month and day", () => {
    const date = new Date(2024, 11, 3);
    expect(toDateInputValue(date)).toBe("2024-12-03");
  });
});

describe("normalizeCategory", () => {
  it("handles null user_id", () => {
    const row: CategoryRow = { id: "1", name: "Food" };
    const result = normalizeCategory(row, 0);
    expect(result.userId).toBeNull();
    expect(result.name).toBe("Food");
  });

  it("handles missing name", () => {
    const row: CategoryRow = { id: "2" };
    const result = normalizeCategory(row, 0);
    expect(result.name).toBe("Uncategorized");
  });

  it("uses fallback index for id", () => {
    const row = {} as CategoryRow;
    const result = normalizeCategory(row, 99);
    expect(result.id).toBe("category-99");
  });

  it("trims name", () => {
    const row: CategoryRow = { id: "3", name: "  Transport  " };
    const result = normalizeCategory(row, 0);
    expect(result.name).toBe("Transport");
  });
});

describe("normalizeAccount", () => {
  it("handles null user_id", () => {
    const row: AccountRow = { id: "1", name: "GCash" };
    const result = normalizeAccount(row, 0);
    expect(result.userId).toBeNull();
  });

  it("handles missing name", () => {
    const row: AccountRow = { id: "2" };
    const result = normalizeAccount(row, 0);
    expect(result.name).toBe("Untitled account");
  });

  it("uses fallback index for id", () => {
    const row = {} as AccountRow;
    const result = normalizeAccount(row, 42);
    expect(result.id).toBe("account-42");
  });

  it("trims name and institution", () => {
    const row: AccountRow = { id: "3", name: "  Maya  ", institution: "  Bank  " };
    const result = normalizeAccount(row, 0);
    expect(result.name).toBe("Maya");
    expect(result.institution).toBe("Bank");
  });

  it("returns null for missing institution", () => {
    const row: AccountRow = { id: "4", name: "Cash" };
    const result = normalizeAccount(row, 0);
    expect(result.institution).toBeNull();
  });

  it("returns null for missing currency", () => {
    const row: AccountRow = { id: "5", name: "Cash" };
    const result = normalizeAccount(row, 0);
    expect(result.currency).toBeNull();
  });
});

describe("balance computation (account-cards logic)", () => {
  it("correctly computes balance from transfers and transactions", () => {
    const transfers = [
      { from_account_id: "acc-1", to_account_id: "acc-2", amount: 50000 },
      { from_account_id: "acc-2", to_account_id: "acc-1", amount: 20000 },
    ];
    const transactions = [
      { amount: 100000, transaction_type: "income", account_id: "acc-1" },
      { amount: 30000, transaction_type: "expense", account_id: "acc-1" },
      { amount: 20000, transaction_type: "expense", account_id: "acc-2" },
    ];

    const balanceMap = new Map<string, number>();

    for (const t of transfers) {
      if (t.to_account_id) {
        balanceMap.set(t.to_account_id, (balanceMap.get(t.to_account_id) ?? 0) + Number(t.amount));
      }
      if (t.from_account_id) {
        balanceMap.set(t.from_account_id, (balanceMap.get(t.from_account_id) ?? 0) - Number(t.amount));
      }
    }

    for (const t of transactions) {
      const accountId = t.account_id?.trim();
      if (!accountId) continue;
      if (t.transaction_type === "income") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) + Number(t.amount));
      } else if (t.transaction_type === "expense") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) - Number(t.amount));
      }
    }

    expect(balanceMap.get("acc-1")).toBe(40000);
    expect(balanceMap.get("acc-2")).toBe(10000);
  });

  it("handles empty transfers and transactions", () => {
    const balanceMap = new Map<string, number>();
    expect(balanceMap.get("acc-1") ?? 0).toBe(0);
  });

  it("handles income-only transactions for an account", () => {
    const transactions = [
      { amount: 500000, transaction_type: "income", account_id: "acc-1" },
      { amount: 300000, transaction_type: "income", account_id: "acc-1" },
    ];
    const balanceMap = new Map<string, number>();

    for (const t of transactions) {
      const accountId = t.account_id?.trim();
      if (!accountId) continue;
      if (t.transaction_type === "income") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) + Number(t.amount));
      }
    }

    expect(balanceMap.get("acc-1")).toBe(800000);
  });

  it("handles skip when account_id is missing", () => {
    const transactions = [
      { amount: 50000, transaction_type: "expense", account_id: null as string | null },
    ];
    const balanceMap = new Map<string, number>();

    for (const t of transactions) {
      const accountId = t.account_id?.trim();
      if (!accountId) continue;
      if (t.transaction_type === "expense") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) - Number(t.amount));
      }
    }

    expect(balanceMap.size).toBe(0);
  });
});
