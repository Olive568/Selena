import { redirect } from "next/navigation";

import { AccountsPage } from "@/components/accounts-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  normalizeAccount,
  type AccountRow,
  type TransactionRow,
} from "@/lib/finance";

export const metadata = {
  title: "Accounts — Selena",
  description: "Manage your accounts and balances.",
};

export default async function AccountsRoute() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/sign-in");
  }

  const accountsQuery = supabase
    .from("accounts")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
    .order("name", { ascending: true });

  const [{ data: accountsData }, { data: transfersData }, { data: transactionsData }] =
    await Promise.all([
      accountsQuery,
      supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userData.user.id),
      supabase
        .from("transactions")
        .select("amount, transaction_type, account_id")
        .eq("user_id", userData.user.id),
    ]);

  return (
    <AccountsPage
      initialAccounts={(accountsData ?? []).map((row, index) => normalizeAccount(row as AccountRow, index))}
      initialTransfers={(transfersData ?? []) as { from_account_id: string | null; to_account_id: string | null; amount: number }[]}
      initialTransactions={(transactionsData ?? []) as TransactionRow[]}
      userId={userData.user.id}
      userEmail={userData.user.email}
    />
  );
}