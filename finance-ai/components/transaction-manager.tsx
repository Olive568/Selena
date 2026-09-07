"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";

import { AccountCards } from "@/components/account-cards";
import { DashboardChartsShell } from "@/components/dashboard-charts-shell";
import { MonthlySummary } from "@/components/monthly-summary";
import { NewUserOnboarding } from "@/components/new-user-onboarding";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionRowItem } from "@/components/transaction-row-item";
import {
  buildCategoryBreakdown,
  dashboardRangeOptions,
  getDashboardDateRange,
  getTodayInputValue,
  normalizeAccount,
  normalizeCategory,
  normalizeTransaction,
  pesosToCents,
  type AccountRow,
  type CategoryRow,
  type DashboardAccount,
  type DashboardCategory,
  type DashboardRange,
  type DashboardTransaction,
  type TransactionRow,
  type TransactionType,
} from "@/lib/finance";
import { redirectIfAuthError, sanitizeError, supabase } from "@/lib/supabase";
import { TransactionDialog, type TransactionFormValues } from "@/components/transaction-dialog";

type TransactionManagerProps = {
  initialTransactions: TransactionRow[];
  initialCategories: CategoryRow[];
  initialAccounts: AccountRow[];
  userId: string;
  userEmail?: string | null;
  onboardingCompleted: boolean;
};

type BannerState = {
  kind: "success" | "error";
  message: string;
} | null;

function sameCategory(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function TransactionManager({
  initialTransactions,
  initialCategories,
  initialAccounts,
  userId,
  userEmail,
  onboardingCompleted,
}: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<DashboardTransaction[]>(
    () => initialTransactions.map((row, index) => normalizeTransaction(row, index))
  );
  const [categories, setCategories] = useState<DashboardCategory[]>(
    () => initialCategories.map((row, index) => normalizeCategory(row, index))
  );
  const [accounts, setAccounts] = useState<DashboardAccount[]>(
    // Reserved for future transfer UI that will surface source/destination accounts.
    () => initialAccounts.map((row, index) => normalizeAccount(row, index))
  );
  const [activeFilter, setActiveFilter] = useState<DashboardRange>("this_month");
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [draftType, setDraftType] = useState<TransactionType>("expense");
  const [editingTransaction, setEditingTransaction] = useState<DashboardTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<DashboardTransaction | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [dialogVersion, setDialogVersion] = useState(0);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !onboardingCompleted && initialTransactions.length === 0 && !localStorage.getItem("selena-onboarding-done");
  });

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((left, right) => {
        const leftTime = new Date(left.date).getTime();
        const rightTime = new Date(right.date).getTime();

        return rightTime - leftTime;
      }),
    [transactions]
  );

  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name)),
    [categories]
  );
  const sortedAccounts = useMemo(() => [...accounts].sort((left, right) => left.name.localeCompare(right.name)), [accounts]);
  // Keep global defaults visible by preserving rows where userId is NULL.
  const visibleAccounts = useMemo(
    () => sortedAccounts.filter((account) => account.userId === userId),
    [sortedAccounts, userId]
  );
  // Keep global defaults visible by preserving rows where userId is NULL.
  const visibleCategories = useMemo(
    () => sortedCategories.filter((category) => category.userId === null || category.userId === userId),
    [sortedCategories, userId]
  );

  const expenseData = useMemo(() => buildCategoryBreakdown(sortedTransactions, "expense"), [sortedTransactions]);
  const incomeData = useMemo(() => buildCategoryBreakdown(sortedTransactions, "income"), [sortedTransactions]);
  const recentTransactions = useMemo(() => sortedTransactions.slice(0, 5), [sortedTransactions]);
  const categoryOptions = useMemo(
    () => ({
      expense: Array.from(new Set(visibleCategories.filter((category) => category.categoryType === "expense").map((category) => category.name))).filter(Boolean),
      income: Array.from(new Set(visibleCategories.filter((category) => category.categoryType === "income").map((category) => category.name))).filter(Boolean),
    }),
    [visibleCategories]
  );

  async function loadDashboardData(nextFilter: DashboardRange = activeFilter) {
    setIsDashboardLoading(true);
    setBanner(null);

    try {
      const range = getDashboardDateRange(nextFilter);
      const transactionsQuery = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (range.start && range.end) {
        transactionsQuery.gte("date", range.start).lte("date", range.end);
      }

      const [transactionsResult, categoriesResult, accountsResult] = await Promise.all([
        transactionsQuery,
        // Include global category defaults with NULL user_id.
        supabase
          .from("categories")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order("name", { ascending: true }),
        // Include global account defaults with NULL user_id.
        supabase
          .from("accounts")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userId}`)
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

      setTransactions((transactionsResult.data ?? []).map((row, index) => normalizeTransaction(row, index)));
      setCategories((categoriesResult.data ?? []).map((row, index) => normalizeCategory(row, index)));
      setAccounts((accountsResult.data ?? []).map((row, index) => normalizeAccount(row, index)));
      setDashboardRefreshKey((current) => current + 1);
      return true;
    } catch (error) {
      redirectIfAuthError(error);
      setBanner({
        kind: "error",
        message: error instanceof Error ? sanitizeError(error.message) : "Could not refresh dashboard data.",
      });
      return false;
    } finally {
      setIsDashboardLoading(false);
    }
  }

  async function handleDashboardRangeChange(nextFilter: DashboardRange) {
    setActiveFilter(nextFilter);
    await loadDashboardData(nextFilter);
  }

  async function createCategoryRecord(name: string, categoryType: "expense" | "income") {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const existing = sortedCategories.find(
      (category) =>
        sameCategory(category.name, trimmedName) && category.userId === userId && category.categoryType === categoryType
    );
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase.rpc("create_category", {
      p_name: trimmedName,
      p_category_type: categoryType,
      p_idempotency_key: crypto.randomUUID(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const created = normalizeCategory(data as CategoryRow, sortedCategories.length);
    setCategories((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));

    return created;
  }

  async function resolveCategoryRecord(name: string, categoryType: "expense" | "income") {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const existing = sortedCategories.find(
      (category) =>
        sameCategory(category.name, trimmedName) &&
        (category.userId === null || category.userId === userId) &&
        category.categoryType === categoryType
    );
    if (existing) {
      return existing;
    }

    return createCategoryRecord(trimmedName, categoryType);
  }

  async function createAccountRecord(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const existing = accounts.find(
      (account) =>
        (account.userId === null || account.userId === userId) &&
        account.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase.rpc("create_account", {
      p_name: trimmedName,
      p_idempotency_key: crypto.randomUUID(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    const created = normalizeAccount(data as AccountRow, accounts.length);
    setAccounts((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));

    return created;
  }

  async function handleAddCategory(categoryName: string, categoryType: "expense" | "income") {
    const created = await createCategoryRecord(categoryName, categoryType);
    await loadDashboardData(activeFilter);

    return created?.name ?? null;
  }

  async function handleAddAccount(accountName: string) {
    const created = await createAccountRecord(accountName);
    await loadDashboardData(activeFilter);

    return created?.id ?? null;
  }

  async function handleDeleteCategory(categoryName: string, categoryType: "expense" | "income") {
    const target = sortedCategories.find(
      (category) =>
        sameCategory(category.name, categoryName) &&
        category.categoryType === categoryType &&
        category.userId === userId
    );

    if (!target) {
      return false;
    }

    if (target.userId === null) {
      return false;
    }

    const { error } = await supabase.from("categories").delete().eq("id", target.dbId);

    if (error) {
      throw new Error(error.message);
    }

    await loadDashboardData(activeFilter);
    return true;
  }

  function openCreateExpense() {
    setDialogMode("create");
    setDraftType("expense");
    setEditingTransaction(null);
    setBanner(null);
    setIsDialogOpen(true);
    setDialogVersion((current) => current + 1);
  }

  function openCreateIncome() {
    setDialogMode("create");
    setDraftType("income");
    setEditingTransaction(null);
    setBanner(null);
    setIsDialogOpen(true);
    setDialogVersion((current) => current + 1);
  }

  function openCreateTransfer() {
    setDialogMode("create");
    setDraftType("transfer");
    setEditingTransaction(null);
    setBanner(null);
    setIsDialogOpen(true);
    setDialogVersion((current) => current + 1);
  }

  async function openEditTransaction(transaction: DashboardTransaction) {
    if (transaction.transactionType === "transfer" && !transaction.transferId) {
      setBanner({
        kind: "error",
        message: "This legacy transfer is not linked and cannot be edited safely.",
      });
      return;
    }

    let nextTransaction = transaction;
    if (transaction.transferId) {
      const { data, error } = await supabase
        .from("transfers")
        .select("from_account_id, to_account_id")
        .eq("id", transaction.transferId)
        .single();
      if (error || !data) {
        setBanner({ kind: "error", message: "Unable to load transfer details." });
        return;
      }
      nextTransaction = {
        ...transaction,
        sourceAccountId: String(data.from_account_id),
        destinationAccountId: String(data.to_account_id),
      };
    }

    setDialogMode("edit");
    setDraftType(nextTransaction.transactionType);
    setEditingTransaction(nextTransaction);
    setBanner(null);
    setIsDialogOpen(true);
    setDialogVersion((current) => current + 1);
  }

  async function handleSaveTransaction(values: TransactionFormValues) {
    setIsSaving(true);
    setBanner(null);

    try {
      const isIncome = values.transactionType === "income";
      const isTransfer = values.transactionType === "transfer";
      const merchant = values.merchant.trim();
      const categoryName = values.category.trim();
      const notes = values.notes.trim();
      const sourceAccount = sortedAccounts.find((account) => account.id === values.sourceAccountId);
      const destinationAccount = sortedAccounts.find((account) => account.id === values.destinationAccountId);

      if (isTransfer) {
        if (!sourceAccount || !destinationAccount) {
          throw new Error("Choose both a source account and a destination account.");
        }

        if (sourceAccount.id === destinationAccount.id) {
          throw new Error("Source and destination accounts must be different.");
        }
      } else if (!merchant) {
        throw new Error(isIncome ? "Income source is required." : "Merchant is required.");
      }

      if (!Number.isFinite(values.amount) || values.amount <= 0) {
        throw new Error("Amount must be greater than zero.");
      }

      const amountInCents = pesosToCents(values.amount);

      if (!isTransfer && !categoryName) {
        throw new Error(isIncome ? "Income source is required." : "Category is required for expenses.");
      }

      if (isTransfer) {
        const transferRpc = editingTransaction?.transferId ? "update_transfer" : "create_transfer";
        const transferPayload = {
          p_from_account_id: values.sourceAccountId,
          p_to_account_id: values.destinationAccountId,
          p_amount: amountInCents,
          p_date: values.date || getTodayInputValue(),
          p_notes: values.notes || null,
          ...(editingTransaction?.transferId
            ? { p_id: editingTransaction.transferId }
            : { p_idempotency_key: values.idempotencyKey }),
        };
        const { error: rpcError } = await supabase.rpc(transferRpc, transferPayload);

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        setEditingTransaction(null);
        const refreshed = await loadDashboardData(activeFilter);
        setBanner(refreshed
          ? { kind: "success", message: "Transfer saved." }
          : { kind: "error", message: "Transfer saved, but dashboard data could not be refreshed." });
        return;
      }

      const category = isTransfer
        ? null
        : await resolveCategoryRecord(categoryName, isIncome ? "income" : "expense");
      const transferMerchant = isTransfer
        ? `Transfer: ${sourceAccount?.name ?? "Source"} → ${destinationAccount?.name ?? "Destination"}`
        : merchant;
      const transferNotes = isTransfer
        ? [
            `From: ${sourceAccount?.name ?? "Source account"}`,
            `To: ${destinationAccount?.name ?? "Destination account"}`,
            notes,
          ]
            .filter(Boolean)
            .join(" | ")
        : notes;

      const payload = {
        user_id: userId,
        merchant: transferMerchant,
        category: isTransfer ? "Transfer" : category?.name ?? categoryName ?? "Uncategorized",
        amount: amountInCents,
        date: values.date || getTodayInputValue(),
        notes: transferNotes || null,
        payment_method: sourceAccount?.name ?? null,
        transaction_type: values.transactionType,
        account_id: sourceAccount?.id ?? null,
      };

      if (editingTransaction) {
        const { error } = await supabase.rpc("update_transaction", {
          p_id: editingTransaction.dbId,
          p_merchant: payload.merchant,
          p_amount: payload.amount,
          p_date: payload.date,
          p_notes: payload.notes,
          p_transaction_type: payload.transaction_type,
          p_category: payload.category,
          p_payment_method: payload.payment_method,
          p_account_id: payload.account_id,
        });

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase.rpc("create_transaction", {
          p_merchant: payload.merchant,
          p_amount: payload.amount,
          p_date: payload.date,
          p_notes: payload.notes,
          p_transaction_type: payload.transaction_type,
          p_category: payload.category,
          p_payment_method: payload.payment_method,
          p_account_id: payload.account_id,
          p_idempotency_key: values.idempotencyKey,
        });

        if (error) {
          if (error.code === "23505") return;
          throw new Error(error.message);
        }
      }

      const successMessage = editingTransaction ? "Transaction updated." : "Transaction saved.";
      setEditingTransaction(null);
      const refreshed = await loadDashboardData(activeFilter);
      setBanner(refreshed
        ? { kind: "success", message: successMessage }
        : { kind: "error", message: `${successMessage} Dashboard data could not be refreshed.` });
    } catch (error) {
      redirectIfAuthError(error);
      throw error instanceof Error ? error : new Error("Could not save the transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTransaction() {
    if (!transactionToDelete) {
      return;
    }

    if (transactionToDelete.transactionType === "transfer" && !transactionToDelete.transferId) {
      setBanner({
        kind: "error",
        message: "This legacy transfer is not linked and cannot be deleted safely.",
      });
      setTransactionToDelete(null);
      return;
    }

    setIsDeleting(true);
    setBanner(null);

    try {
      const { error } = transactionToDelete.transferId
        ? await supabase.rpc("delete_transfer", { p_id: transactionToDelete.transferId })
        : await supabase.rpc("delete_transaction", { p_id: transactionToDelete.dbId });

      if (error) {
        throw new Error(error.message);
      }

      setTransactionToDelete(null);
      const refreshed = await loadDashboardData(activeFilter);
      setBanner(refreshed
        ? { kind: "success", message: "Transaction deleted." }
        : { kind: "error", message: "Transaction deleted, but dashboard data could not be refreshed." });
    } catch (error) {
      redirectIfAuthError(error);
      setBanner({
        kind: "error",
        message: error instanceof Error ? sanitizeError(error.message) : "Could not delete the transaction.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.assign("/sign-in");
  }

  const dialogInitialValues = editingTransaction
    ? editingTransaction
    : null;

  return (
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)]"
      data-account-count={accounts.length}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-5 shadow-lg shadow-black/5 backdrop-blur sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Selena</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Financial Dashboard</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Track transactions, watch category spending, and keep everything synced with Supabase.
            </p>
            {userEmail && <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>}
          </div>

           <div className="flex flex-col items-stretch gap-3 sm:items-end">
             <div className="grid gap-1.5 sm:w-52">
               <label htmlFor="dashboard-range" className="text-xs font-medium text-muted-foreground">
                 Dashboard period
               </label>
               <Select
                 value={activeFilter}
                 onValueChange={(value) => void handleDashboardRangeChange(value as DashboardRange)}
                 disabled={isDashboardLoading}
               >
                 <SelectTrigger id="dashboard-range" className="h-11 rounded-full bg-background/70 px-4">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {dashboardRangeOptions.map((option) => (
                     <SelectItem key={option.value} value={option.value}>
                       {option.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="flex flex-wrap justify-end gap-2">
               <Button onClick={openCreateExpense} className="h-11 rounded-full px-5">
                 <Plus className="mr-2 size-4" />
                 Add Expense
               </Button>
              <Button onClick={openCreateIncome} variant="outline" className="h-11 rounded-full px-5">
                <Plus className="mr-2 size-4" />
                Add Income
              </Button>
              <Button onClick={openCreateTransfer} variant="outline" className="h-11 rounded-full px-5">
                <Plus className="mr-2 size-4" />
                Transfer
              </Button>
               <Button variant="ghost" className="h-11 rounded-full px-4 text-muted-foreground" onClick={handleLogout}>
                 <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
             </div>
           </div>
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

        {isDashboardLoading && (
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Refreshing dashboard...
          </div>
        )}

        <AccountCards accounts={visibleAccounts} userId={userId} refreshKey={dashboardRefreshKey} />

        <MonthlySummary userId={userId} refreshKey={dashboardRefreshKey} />

         <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
           <DashboardChartsShell
             expenseData={expenseData}
             incomeData={incomeData}
             range={activeFilter}
             onAddTransaction={(type) => (type === "income" ? openCreateIncome() : openCreateExpense())}
           />

          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Latest activity from your selected period.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransactions.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentTransactions.map((transaction) => (
                    <TransactionRowItem
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={openEditTransaction}
                      onDelete={setTransactionToDelete}
                      disableActions={transaction.transactionType === "transfer" && !transaction.transferId}
                      showTransferNotice={transaction.transactionType === "transfer" && !transaction.transferId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-5 py-10 text-center">
                  <p className="text-base font-medium text-foreground">No transactions yet</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Add your first transaction to see totals, trends, and recent activity.
                  </p>
                  <Button onClick={openCreateExpense} className="rounded-full">
                    + Add Your First Transaction
                  </Button>
                </div>
              )}
              {recentTransactions.length > 0 && (
                <div className="border-t border-border p-4 sm:p-5">
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link href="/transactions">View all transactions</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <TransactionDialog
        key={dialogVersion}
        open={isDialogOpen}
        mode={dialogMode}
         defaultTransactionType={draftType}
         categories={categoryOptions}
        accounts={visibleAccounts}
        onAddAccount={handleAddAccount}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        initialTransaction={dialogInitialValues}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSaveTransaction}
        isSubmitting={isSaving}
      />

      <AlertDialog open={Boolean(transactionToDelete)} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{transactionToDelete?.merchant ?? "this transaction"}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showOnboarding && (
        <NewUserOnboarding
          accounts={visibleAccounts.filter((a) => a.userId === userId)}
          onAddTransaction={(transactionType) => {
            if (transactionType === "income") {
              openCreateIncome();
            } else {
              openCreateExpense();
            }
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </main>
  );
}
