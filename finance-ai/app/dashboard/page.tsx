import { redirect } from "next/navigation";

import { TransactionManager } from "@/components/transaction-manager";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getDashboardDateRange,
  type AccountRow,
  type CategoryRow,
  type TransactionRow,
} from "@/lib/finance";

export const metadata = {
  title: "Dashboard — Selena",
  description: "Your personal finance dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/sign-in");
  }

  const { start, end } = getDashboardDateRange("this_month");

  const transactionsQuery = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (start && end) {
    transactionsQuery.gte("date", start).lte("date", end);
  }

  const [transactionsResult, categoriesResult, accountsResult, profileResult] = await Promise.all([
    transactionsQuery,
    // Include shared category rows where user_id is NULL alongside the user's own rows.
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
      .order("name", { ascending: true }),
    // Include shared account rows where user_id is NULL alongside the user's own rows.
    supabase
      .from("accounts")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", userData.user.id)
      .maybeSingle(),
  ]);

  if (transactionsResult.error || categoriesResult.error || accountsResult.error || profileResult.error) {
    throw new Error("Unable to load financial data.");
  }

  return (
    <TransactionManager
      initialTransactions={(transactionsResult.data ?? []) as TransactionRow[]}
      initialCategories={(categoriesResult.data ?? []) as CategoryRow[]}
      initialAccounts={(accountsResult.data ?? []) as AccountRow[]}
      userId={userData.user.id}
      userEmail={userData.user.email}
      onboardingCompleted={Boolean(profileResult.data?.onboarding_completed_at)}
    />
  );
}
