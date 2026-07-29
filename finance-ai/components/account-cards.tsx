"use client";

import { useEffect, useState } from "react";
import { Landmark, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency, type DashboardAccount } from "@/lib/finance";

type AccountCardsProps = {
  accounts: DashboardAccount[];
  userId: string;
};

type AccountBalance = {
  name: string;
  balance: number;
  currency: string;
  institution: string | null;
};

async function fetchAccountBalances(userId: string, accounts: DashboardAccount[]): Promise<AccountBalance[]> {
  const [transfersResult, txResult] = await Promise.all([
    supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userId),
    supabase.from("transactions").select("amount, transaction_type, account_id").eq("user_id", userId),
  ]);

  const balanceMap = new Map<string, number>();

  if (!transfersResult.error && transfersResult.data) {
    for (const t of transfersResult.data) {
      if (t.to_account_id) {
        balanceMap.set(String(t.to_account_id), (balanceMap.get(String(t.to_account_id)) ?? 0) + Number(t.amount));
      }
      if (t.from_account_id) {
        balanceMap.set(String(t.from_account_id), (balanceMap.get(String(t.from_account_id)) ?? 0) - Number(t.amount));
      }
    }
  }

  if (!txResult.error && txResult.data) {
    for (const t of txResult.data) {
      const accountId = t.account_id?.trim();
      if (!accountId) continue;

      if (t.transaction_type === "income") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) + Number(t.amount));
      } else if (t.transaction_type === "expense") {
        balanceMap.set(accountId, (balanceMap.get(accountId) ?? 0) - Number(t.amount));
      }
    }
  }

  return accounts.map((a) => ({
    name: a.name,
    balance: balanceMap.get(a.id) ?? 0,
    currency: a.currency ?? "PHP",
    institution: a.institution ?? null,
  }));
}

export function AccountCards({ accounts: initialAccounts, userId }: AccountCardsProps) {
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const result = await fetchAccountBalances(userId, initialAccounts);
      if (active) setBalances(result);
      setLoading(false);
    }

    load();
    return () => { active = false; };
  }, [userId]);

  if (initialAccounts.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Landmark className="size-4 text-primary" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Accounts</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {initialAccounts.map((account) => {
          const balance = balances.find((b) => b.name === account.name);
          const amount = balance?.balance ?? 0;

          return (
            <Card key={account.id} className="border-border bg-card">
              <CardHeader className="space-y-1 p-4 pb-2">
                {account.institution && (
                  <p className="text-xs text-muted-foreground">{account.institution}</p>
                )}
                <CardTitle className="text-sm font-medium text-foreground">{account.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loading ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p className={`text-xl font-semibold tracking-tight ${amount >= 0 ? "text-foreground" : "text-rose-600 dark:text-rose-400"}`}>
                      {formatCurrency(amount)}
                    </p>
                    <CardDescription className="mt-1 text-xs">
                      {amount === 0 ? "No activity yet" : amount > 0 ? "Positive balance" : "Negative balance"}
                    </CardDescription>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
