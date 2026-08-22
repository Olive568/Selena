"use client";

import { useEffect, useMemo, useState } from "react";
import { Landmark, Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";

import { AccountBalanceDialog } from "@/components/account-balance-dialog";
import { AccountDialog, type AccountFormValues } from "@/components/account-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  centsToPesos,
  computeAccountBalancesInCents,
  formatCurrency,
  getTodayInputValue,
  normalizeAccount,
  type AccountRow,
  type DashboardAccount,
  type TransactionRow,
  type TransferSeed,
} from "@/lib/finance";
import { redirectIfAuthError, sanitizeError, supabase } from "@/lib/supabase";

type BannerState = {
  kind: "success" | "error";
  message: string;
} | null;

type AccountsPageProps = {
  initialAccounts: DashboardAccount[];
  initialTransfers: TransferSeed[];
  initialTransactions: TransactionRow[];
  userId: string;
  userEmail?: string | null;
};

type PendingAdjustment = {
  account: DashboardAccount;
  targetBalanceCents: number;
};

export function AccountsPage({
  initialAccounts,
  initialTransfers,
  initialTransactions,
  userId,
  userEmail,
}: AccountsPageProps) {
  const [accounts, setAccounts] = useState<DashboardAccount[]>(initialAccounts);
  const [transfers, setTransfers] = useState<TransferSeed[]>(initialTransfers);
  const [transactions, setTransactions] = useState<TransactionRow[]>(initialTransactions);
  const [banner, setBanner] = useState<BannerState>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DashboardAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<DashboardAccount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [balanceAccount, setBalanceAccount] = useState<DashboardAccount | null>(null);
  const [pendingAdjustment, setPendingAdjustment] = useState<PendingAdjustment | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const visibleAccounts = useMemo(
    () => [...accounts].sort((left, right) => left.name.localeCompare(right.name)),
    [accounts]
  );
  const balanceCents = useMemo(
    () => computeAccountBalancesInCents(visibleAccounts, transfers, transactions),
    [visibleAccounts, transfers, transactions]
  );

  function getBalancePesos(account: DashboardAccount) {
    return centsToPesos(balanceCents.get(account.id) ?? 0);
  }

  useEffect(() => {
    let active = true;

    async function refresh() {
      const [{ data: accountsData }, { data: transfersData }, { data: transactionsData }] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order("name", { ascending: true }),
        supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userId),
        supabase.from("transactions").select("amount, transaction_type, account_id").eq("user_id", userId),
      ]);

      if (active && !accountsData) return;
      if (active) {
        setAccounts((accountsData ?? []).map((row, index) => normalizeAccount(row as AccountRow, index)));
        setTransfers((transfersData ?? []) as TransferSeed[]);
        setTransactions((transactionsData ?? []) as TransactionRow[]);
      }
    }

    refresh();
    return () => {
      active = false;
    };
  }, [userId]);

  function openCreate() {
    setEditingAccount(null);
    setBanner(null);
    setIsDialogOpen(true);
  }

  function openEdit(account: DashboardAccount) {
    setEditingAccount(account);
    setBanner(null);
    setIsDialogOpen(true);
  }

  async function handleSave(values: AccountFormValues) {
    setIsSaving(true);
    setBanner(null);

    try {
      if (editingAccount) {
        if (editingAccount.userId === null) {
          throw new Error("Shared default accounts cannot be edited.");
        }

        const { error } = await supabase
          .from("accounts")
          .update({
            name: values.name,
            institution: values.institution || null,
            currency: values.currency,
          })
          .eq("id", editingAccount.dbId)
          .eq("user_id", userId);

        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("accounts")
          .insert({
            user_id: userId,
            name: values.name,
            institution: values.institution || null,
            currency: values.currency,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Could not create the account.");
      }

      const [{ data: accountsData }, { data: transfersData }, { data: transactionsData }] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order("name", { ascending: true }),
        supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userId),
        supabase.from("transactions").select("amount, transaction_type, account_id").eq("user_id", userId),
      ]);

      setAccounts((accountsData ?? []).map((row, index) => normalizeAccount(row as AccountRow, index)));
      setTransfers((transfersData ?? []) as TransferSeed[]);
      setTransactions((transactionsData ?? []) as TransactionRow[]);

      setBanner({
        kind: "success",
        message: editingAccount ? "Account updated." : "Account created.",
      });
      setEditingAccount(null);
    } catch (error) {
      redirectIfAuthError(error);
      throw error instanceof Error ? error : new Error("Could not save the account.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!accountToDelete) return;

    if (accountToDelete.userId === null) {
      setBanner({ kind: "error", message: "Shared default accounts cannot be deleted." });
      setAccountToDelete(null);
      return;
    }

    setIsDeleting(true);
    setBanner(null);

    try {
      const { error } = await supabase.from("accounts").delete().eq("id", accountToDelete.dbId).eq("user_id", userId);

      if (error) throw new Error(error.message);

      setAccounts((current) => current.filter((account) => account.dbId !== accountToDelete.dbId));
      setBanner({ kind: "success", message: "Account deleted." });
      setAccountToDelete(null);
    } catch (error) {
      redirectIfAuthError(error);
      setBanner({
        kind: "error",
        message: error instanceof Error ? sanitizeError(error.message) : "Could not delete the account.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function openBalance(account: DashboardAccount) {
    setBalanceAccount(account);
    setBanner(null);
    setIsBalanceDialogOpen(true);
  }

  async function handleBalanceSave(values: { balanceCents: number }) {
    if (!balanceAccount) return;

    if (balanceAccount.userId === null) {
      setBanner({ kind: "error", message: "Shared default accounts cannot be adjusted." });
      return;
    }

    setIsBalanceDialogOpen(false);
    setBalanceAccount(null);
    setBanner(null);
    setPendingAdjustment({ account: balanceAccount, targetBalanceCents: values.balanceCents });
  }

  async function applyAdjustment(account: DashboardAccount, targetBalanceCents: number) {
    setIsAdjusting(true);
    setBanner(null);

    try {
      if (account.userId === null) {
        throw new Error("Shared default accounts cannot be adjusted.");
      }

      const currentCents = balanceCents.get(account.id) ?? 0;
      const deltaCents = targetBalanceCents - currentCents;

      const { error } = await supabase
        .from("accounts")
        .update({ opening_balance: account.openingBalance + deltaCents })
        .eq("id", account.dbId)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      const [{ data: accountsData }, { data: transfersData }, { data: transactionsData }] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order("name", { ascending: true }),
        supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userId),
        supabase.from("transactions").select("amount, transaction_type, account_id").eq("user_id", userId),
      ]);

      setAccounts((accountsData ?? []).map((row, index) => normalizeAccount(row as AccountRow, index)));
      setTransfers((transfersData ?? []) as TransferSeed[]);
      setTransactions((transactionsData ?? []) as TransactionRow[]);

      setBanner({ kind: "success", message: "Account balance updated." });
      setPendingAdjustment(null);
    } catch (error) {
      redirectIfAuthError(error);
      setBanner({
        kind: "error",
        message: error instanceof Error ? sanitizeError(error.message) : "Could not update the account balance.",
      });
    } finally {
      setIsAdjusting(false);
    }
  }

  async function reflectInTransactions() {
    if (!pendingAdjustment) return;

    const { account, targetBalanceCents } = pendingAdjustment;
    const currentCents = balanceCents.get(account.id) ?? 0;
    const deltaCents = targetBalanceCents - currentCents;

    if (deltaCents === 0) {
      setPendingAdjustment(null);
      return;
    }

    setIsAdjusting(true);
    setBanner(null);

    try {
      if (account.userId === null) {
        throw new Error("Shared default accounts cannot be adjusted.");
      }

      const merchant = "Manual adjustment";
      const { error } = await supabase.rpc("create_transaction", {
        p_user_id: userId,
        p_merchant: merchant,
        p_amount: Math.abs(deltaCents),
        p_date: getTodayInputValue(),
        p_notes: `Balance adjusted to ${formatCurrency(centsToPesos(targetBalanceCents))} on ${account.name}.`,
        p_transaction_type: deltaCents > 0 ? "income" : "expense",
        p_category: "Adjustment",
        p_payment_method: account.name,
        p_account_id: account.dbId,
        p_idempotency_key: crypto.randomUUID(),
      });

      if (error) throw new Error(error.message);

      const [{ data: accountsData }, { data: transfersData }, { data: transactionsData }] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order("name", { ascending: true }),
        supabase.from("transfers").select("from_account_id, to_account_id, amount").eq("user_id", userId),
        supabase.from("transactions").select("amount, transaction_type, account_id").eq("user_id", userId),
      ]);

      setAccounts((accountsData ?? []).map((row, index) => normalizeAccount(row as AccountRow, index)));
      setTransfers((transfersData ?? []) as TransferSeed[]);
      setTransactions((transactionsData ?? []) as TransactionRow[]);

      setBanner({ kind: "success", message: "Manual adjustment added to transactions." });
      setPendingAdjustment(null);
    } catch (error) {
      redirectIfAuthError(error);
      setBanner({
        kind: "error",
        message: error instanceof Error ? sanitizeError(error.message) : "Could not add the manual adjustment.",
      });
    } finally {
      setIsAdjusting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-5 shadow-lg shadow-black/5 backdrop-blur sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Selena</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Accounts</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Track every wallet, card, and bank account. Balances update automatically from your income, expenses,
              and transfers.
            </p>
            {userEmail && <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>}
          </div>

          <Button onClick={openCreate} className="h-11 rounded-full px-5">
            <Plus className="mr-2 size-4" />
            Add Account
          </Button>
        </section>

        {banner && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              banner.kind === "error"
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {banner.message}
          </div>
        )}

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Landmark className="size-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Balances</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleAccounts.map((account) => {
              const amount = getBalancePesos(account);

              return (
                <Card key={account.id} className="border-border bg-card">
                  <CardHeader className="space-y-1 p-4 pb-2">
                    {account.institution && <p className="text-xs text-muted-foreground">{account.institution}</p>}
                    <CardTitle className="text-sm font-medium text-foreground">{account.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between gap-2 p-4 pt-0">
                    <div className="min-w-0">
                      <p className={`text-xl font-semibold tracking-tight ${amount >= 0 ? "text-foreground" : "text-rose-600 dark:text-rose-400"}`}>
                        {formatCurrency(amount)}
                      </p>
                      <CardDescription className="mt-1 text-xs">
                        {amount === 0 ? "No activity yet" : amount > 0 ? "Positive balance" : "Negative balance"}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                       className="size-11 shrink-0 rounded-full"
                      aria-label={`Set balance for ${account.name}`}
                      onClick={() => openBalance(account)}
                      disabled={account.userId === null}
                    >
                      <Wallet className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle>Manage accounts</CardTitle>
            <CardDescription>Rename accounts, set an institution, or remove accounts you no longer use.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {visibleAccounts.length > 0 ? (
              <div className="divide-y divide-border">
                {visibleAccounts.map((account) => {
                  const balance = getBalancePesos(account);

                  return (
                    <div key={account.id} className="flex items-center gap-4 px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{account.name}</p>
                          {account.userId === null && (
                            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {account.institution && <span>{account.institution}</span>}
                          <span>{account.currency ?? "PHP"}</span>
                          <span>
                            Balance{" "}
                            <span className={`font-medium ${balance >= 0 ? "text-foreground" : "text-rose-600 dark:text-rose-400"}`}>
                              {formatCurrency(balance)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-11"
                          aria-label={`Set balance for ${account.name}`}
                          onClick={() => openBalance(account)}
                          disabled={account.userId === null}
                        >
                          <Wallet className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-11"
                          aria-label={`Edit ${account.name}`}
                          onClick={() => openEdit(account)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-11"
                          aria-label={`Delete ${account.name}`}
                          onClick={() => setAccountToDelete(account)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-5 py-10 text-center">
                {isSaving ? (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <p className="text-base font-medium text-foreground">No accounts yet</p>
                    <p className="max-w-sm text-sm text-muted-foreground">Add your first account to start tracking balances.</p>
                    <Button onClick={openCreate} className="rounded-full">
                      <Plus className="mr-2 size-4" />
                      Add Account
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AccountDialog
        key={editingAccount ? String(editingAccount.dbId) : "new"}
        open={isDialogOpen}
        account={editingAccount}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSave}
        isSubmitting={isSaving}
      />

      <AlertDialog open={Boolean(accountToDelete)} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{accountToDelete?.name ?? "this account"}</span>.
              Transactions linked to it will keep their history but lose their account assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AccountBalanceDialog
        open={isBalanceDialogOpen}
        account={balanceAccount}
        currentBalanceCents={balanceAccount ? (balanceCents.get(balanceAccount.id) ?? 0) : 0}
        onOpenChange={setIsBalanceDialogOpen}
        onSubmit={handleBalanceSave}
        isSubmitting={isSaving}
      />

      <AlertDialog open={Boolean(pendingAdjustment)} onOpenChange={(open) => !open && !isAdjusting && setPendingAdjustment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reflect in transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              Update{" "}
              <span className="font-medium text-foreground">{pendingAdjustment?.account.name ?? "this account"}</span> to{" "}
              <span className="font-medium text-foreground">
                {pendingAdjustment ? formatCurrency(centsToPesos(pendingAdjustment.targetBalanceCents)) : ""}
              </span>
              . Should this change appear in the transactions page as a &ldquo;Manual adjustment&rdquo; entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdjusting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingAdjustment && applyAdjustment(pendingAdjustment.account, pendingAdjustment.targetBalanceCents)}
              disabled={isAdjusting}
            >
              {isAdjusting ? "Updating..." : "No, just update balance"}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={reflectInTransactions}
              disabled={isAdjusting}
            >
              {isAdjusting ? "Adding..." : "Yes, add adjustment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
