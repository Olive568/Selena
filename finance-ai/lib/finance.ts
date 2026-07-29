export type TransactionType = "income" | "expense" | "transfer";

export type DashboardRange = "this_month" | "last_month" | "last_3_months" | "this_year" | "all_time";

export const dashboardRangeOptions: Array<{ label: string; value: DashboardRange }> = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "This Year", value: "this_year" },
  { label: "All Time", value: "all_time" },
];

export type TransactionRow = {
  id: string | number;
  merchant?: string | null;
  category?: string | null;
  amount?: number | string | null;
  date?: string | null;
  created_at?: string | null;
  transaction_type?: string | null;
  payment_method?: string | null;
  description?: string | null;
  notes?: string | null;
  user_id?: string | null;
  account_id?: string | null;
};

export type CategoryRow = {
  id: string | number;
  name?: string | null;
  user_id?: string | null;
};

export type AccountRow = {
  id: string | number;
  user_id?: string | null;
  name?: string | null;
  institution?: string | null;
  currency?: string | null;
  created_at?: string | null;
};

export type DashboardTransaction = {
  id: string;
  dbId: string | number;
  merchant: string;
  category: string;
  notes: string;
  amount: number;
  date: string;
  transactionType: TransactionType;
  paymentMethod: string;
  accountId: string;
};

export type DashboardCategory = {
  id: string;
  dbId: string | number;
  name: string;
  userId: string | null;
};

export type DashboardAccount = {
  id: string;
  dbId: string | number;
  name: string;
  userId: string | null;
  institution?: string | null;
  currency?: string | null;
};

export type CategoryBreakdownItem = {
  name: string;
  amount: number;
};

export type DashboardMetrics = {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  count: number;
};

export function getTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthValue(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function parseMonthValue(value?: string | null) {
  if (!value) {
    return new Date();
  }

  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return new Date();
  }

  return new Date(year, month - 1, 1);
}

export function normalizeTransaction(row: TransactionRow, fallbackIndex: number): DashboardTransaction {
  const dbId = row.id ?? `transaction-${fallbackIndex}`;
  const transactionType =
    row.transaction_type === "income" || row.transaction_type === "transfer" ? row.transaction_type : "expense";
  const date = row.date ?? row.created_at ?? getTodayInputValue();

  return {
    id: String(dbId),
    dbId,
    merchant: row.merchant?.trim() || (transactionType === "income" ? "Income" : "Untitled merchant"),
    category: row.category?.trim() || "Uncategorized",
    notes: row.notes?.trim() || row.description?.trim() || "",
    amount: Number(row.amount ?? 0) / 100,
    date,
    transactionType,
    paymentMethod: row.payment_method?.trim() || "Not set",
    accountId: row.account_id?.trim() || "",
  };
}

export function normalizeCategory(row: CategoryRow, fallbackIndex: number): DashboardCategory {
  const dbId = row.id ?? `category-${fallbackIndex}`;

  return {
    id: String(dbId),
    dbId,
    name: row.name?.trim() || "Uncategorized",
    userId: row.user_id ?? null,
  };
}

export function normalizeAccount(row: AccountRow, fallbackIndex: number): DashboardAccount {
  const dbId = row.id ?? `account-${fallbackIndex}`;

  return {
    id: String(dbId),
    dbId,
    name: row.name?.trim() || "Untitled account",
    userId: row.user_id ?? null,
    institution: row.institution?.trim() || null,
    currency: row.currency?.trim() || null,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildCategoryBreakdown(transactions: DashboardTransaction[]) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.transactionType !== "expense") {
      continue;
    }

    const key = transaction.category.trim() || "Uncategorized";
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((left, right) => right.amount - left.amount);
}

export function buildMetrics(transactions: DashboardTransaction[]): DashboardMetrics {
  const totalIncome = transactions
    .filter((transaction) => transaction.transactionType === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.transactionType === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    count: transactions.length,
  };
}

export function getDashboardDateRange(range: DashboardRange): { start?: string; end?: string } {
  const end = new Date();
  const start = new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case "last_month":
      start.setMonth(start.getMonth() - 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      start.setDate(1);
      break;
    case "last_3_months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "this_year":
      start.setMonth(0, 1);
      break;
    case "all_time":
      return {};
    case "this_month":
    default:
      start.setDate(1);
      break;
  }

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

export function getMonthDateRange(referenceDate: Date) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

export function formatMonthYear(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTypeLabel(transactionType: TransactionType) {
  if (transactionType === "income") {
    return "Income";
  }

  if (transactionType === "transfer") {
    return "Transfer";
  }

  return "Expense";
}
