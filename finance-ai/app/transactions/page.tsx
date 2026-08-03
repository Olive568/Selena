import { redirect } from "next/navigation";

import { TransactionsPage } from "@/components/transactions-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getCurrentMonthValue,
  getMonthDateRange,
  normalizeAccount,
  normalizeCategory,
  normalizeTransaction,
  parseMonthValue,
  type AccountRow,
  type CategoryRow,
  type DashboardAccount,
  type DashboardCategory,
  type DashboardTransaction,
  type TransactionRow,
  type TransactionType,
} from "@/lib/finance";

type SearchParamValue = string | string[] | undefined;

type TransactionsPageSearchParams = {
  month?: SearchParamValue;
  type?: SearchParamValue;
  category?: SearchParamValue;
};

function getSingleValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getTransactionType(value: SearchParamValue): TransactionType | "all" {
  const type = getSingleValue(value);

  if (type === "income" || type === "expense" || type === "transfer") {
    return type;
  }

  return "all";
}

export default async function TransactionsRoute({
  searchParams,
}: {
  searchParams?: TransactionsPageSearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/sign-in");
  }

  const month = getSingleValue(searchParams?.month) || getCurrentMonthValue();
  const transactionType = getTransactionType(searchParams?.type);
  const category = getSingleValue(searchParams?.category) || "all";
  const monthDate = parseMonthValue(month);
  const { start, end } = getMonthDateRange(monthDate);

  const transactionsQuery = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  transactionsQuery.gte("date", start).lte("date", end);

  if (transactionType !== "all") {
    transactionsQuery.eq("transaction_type", transactionType);
  }

  if (category !== "all") {
    transactionsQuery.eq("category", category);
  }

  const [transactionsResult, categoriesResult, accountsResult] = await Promise.all([
    transactionsQuery,
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
      .order("name", { ascending: true }),
    supabase
      .from("accounts")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
      .order("name", { ascending: true }),
  ]);

  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (accountsResult.error) {
    throw new Error(accountsResult.error.message);
  }

  const transactions = (transactionsResult.data ?? []).map((row, index) => normalizeTransaction(row as TransactionRow, index));
  const categories = (categoriesResult.data ?? []).map((row, index) => normalizeCategory(row as CategoryRow, index));
  const accounts = (accountsResult.data ?? []).map((row, index) => normalizeAccount(row as AccountRow, index));

  return (
    <TransactionsPage
      key={`${month}-${transactionType}-${category}`}
      initialTransactions={transactions as DashboardTransaction[]}
      initialCategories={categories as DashboardCategory[]}
      initialAccounts={accounts as DashboardAccount[]}
      initialFilters={{ month, type: transactionType, category }}
      userId={userData.user.id}
      userEmail={userData.user.email}
    />
  );
}
