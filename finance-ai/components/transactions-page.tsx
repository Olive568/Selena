"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionDialog, type TransactionFormValues } from "@/components/transaction-dialog";
import { TransactionRowItem } from "@/components/transaction-row-item";
import {
  dashboardRangeOptions,
  formatMonthYear,
  getDashboardDateRange,
  getCurrentMonthValue,
  getMonthDateRange,
  getTodayInputValue,
  normalizeAccount,
  normalizeCategory,
  normalizeTransaction,
  parseMonthValue,
  pesosToCents,
  type AccountRow,
  type CategoryType,
  type CategoryRow,
  type DashboardAccount,
  type DashboardCategory,
  type DashboardRange,
  type DashboardTransaction,
  type TransactionRow,
  type TransactionType,
} from "@/lib/finance";
import { redirectIfAuthError, sanitizeError, supabase } from "@/lib/supabase";

type BannerState = {
  kind: "success" | "error";
  message: string;
} | null;

type TransactionFilters = {
  month: string;
  range: DashboardRange | null;
  type: TransactionType | "all";
  category: string;
};

type TransactionSort = "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "merchant_asc" | "category_asc";

const transactionSortOptions: Array<{ label: string; value: TransactionSort }> = [
  { label: "Newest first", value: "date_desc" },
  { label: "Oldest first", value: "date_asc" },
  { label: "Amount: high to low", value: "amount_desc" },
  { label: "Amount: low to high", value: "amount_asc" },
  { label: "Merchant: A to Z", value: "merchant_asc" },
  { label: "Category: A to Z", value: "category_asc" },
];

const defaultTransactionSort: TransactionSort = "date_desc";

type TransactionsPageProps = {
  initialTransactions: DashboardTransaction[];
  initialCategories: DashboardCategory[];
  initialAccounts: DashboardAccount[];
  initialFilters: TransactionFilters;
  userId: string;
  userEmail?: string | null;
};

function sameCategory(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function getTransactionSort(value: string | string[] | null | undefined): TransactionSort {
  const sort = Array.isArray(value) ? value[0] : value;

  if (
    sort === "date_desc" ||
    sort === "date_asc" ||
    sort === "amount_desc" ||
    sort === "amount_asc" ||
    sort === "merchant_asc" ||
    sort === "category_asc"
  ) {
    return sort;
  }

  return defaultTransactionSort;
}

function buildSearchParams(filters: TransactionFilters, sort: TransactionSort) {
  const params = new URLSearchParams();

  params.set("month", filters.month);

  if (filters.range) {
    params.set("range", filters.range);
  }

  if (filters.type !== "all") {
    params.set("type", filters.type);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (sort !== defaultTransactionSort) {
    params.set("sort", sort);
  }

  return params;
}

function buildFilterLabel(filters: TransactionFilters) {
  if (filters.range) {
    return dashboardRangeOptions.find((option) => option.value === filters.range)?.label ?? "Selected period";
  }

  return formatMonthYear(parseMonthValue(filters.month));
}

export function TransactionsPage({
  initialTransactions,
  initialCategories,
  initialAccounts,
  initialFilters,
  userId,
  userEmail,
}: TransactionsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(initialCategories);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("edit");
  const [draftType, setDraftType] = useState<TransactionType>("expense");
  const [editingTransaction, setEditingTransaction] = useState<DashboardTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<DashboardTransaction | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [dialogVersion, setDialogVersion] = useState(0);

  const currentMonthValue = getCurrentMonthValue();
  const sortBy = getTransactionSort(searchParams.get("sort"));

  const sortedTransactions = useMemo(() => {
    const compareText = (left: string, right: string) => left.localeCompare(right, undefined, { sensitivity: "base" });

    return [...transactions].sort((left, right) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(left.date).getTime() - new Date(right.date).getTime() || compareText(left.merchant, right.merchant);
        case "amount_desc":
          return right.amount - left.amount || compareText(left.merchant, right.merchant);
        case "amount_asc":
          return left.amount - right.amount || compareText(left.merchant, right.merchant);
        case "merchant_asc":
          return compareText(left.merchant, right.merchant) || compareText(left.date, right.date);
        case "category_asc":
          return compareText(left.category, right.category) || compareText(left.merchant, right.merchant);
        case "date_desc":
        default:
          return new Date(right.date).getTime() - new Date(left.date).getTime() || compareText(left.merchant, right.merchant);
      }
    });
  }, [sortBy, transactions]);

  const sortedCategories = useMemo(() => [...categories].sort((left, right) => left.name.localeCompare(right.name)), [categories]);
  const sortedAccounts = useMemo(() => [...accounts].sort((left, right) => left.name.localeCompare(right.name)), [accounts]);
  const visibleAccounts = useMemo(
    () => sortedAccounts.filter((account) => account.userId === userId),
    [sortedAccounts, userId]
  );
  const visibleCategories = useMemo(
    () => sortedCategories.filter((category) => category.userId === null || category.userId === userId),
    [sortedCategories, userId]
  );
  const categoryOptions = useMemo(() => {
    const filtered = filters.type === "all"
      ? visibleCategories
      : visibleCategories.filter((category) => category.categoryType === filters.type);

    return Array.from(new Set(filtered.map((category) => category.name))).filter(Boolean);
  }, [filters.type, visibleCategories]);

  const hasActiveFilters = filters.type !== "all" || filters.category !== "all";
  const isCurrentMonth = filters.month === currentMonthValue;
  const emptyTitle = hasActiveFilters || !isCurrentMonth ? "No transactions match these filters" : "No transactions yet";
  const emptyDescription = hasActiveFilters || !isCurrentMonth
    ? "Try widening the month, transaction type, or category filters."
    : "Add your first transaction to see the full history here.";

  function syncFilters(nextFilters: TransactionFilters, nextSort: TransactionSort = sortBy) {
    setFilters(nextFilters);

    const params = buildSearchParams(nextFilters, nextSort);
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }

  function syncSort(nextSort: TransactionSort) {
    syncFilters(filters, nextSort);
  }

  async function reloadTransactions(nextFilters: TransactionFilters = filters) {
    const range = nextFilters.range
      ? getDashboardDateRange(nextFilters.range)
      : getMonthDateRange(parseMonthValue(nextFilters.month));
    const transactionsQuery = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (range.start && range.end) {
      transactionsQuery.gte("date", range.start).lte("date", range.end);
    }

    if (nextFilters.type !== "all") {
      transactionsQuery.eq("transaction_type", nextFilters.type);
    }

    if (nextFilters.category !== "all") {
      transactionsQuery.eq("category", nextFilters.category);
    }

    const { data, error } = await transactionsQuery;

    if (error) {
      throw new Error(error.message);
    }

    setTransactions((data ?? []).map((row, index) => normalizeTransaction(row as TransactionRow, index)));
  }

  function setFilterMonth(month: string) {
    syncFilters({ ...filters, month: month || currentMonthValue, range: null });
  }

  function setFilterType(type: TransactionFilters["type"]) {
    const categoryIsCompatible = type === "all" || filters.category === "all" || visibleCategories.some(
      (category) => category.categoryType === type && sameCategory(category.name, filters.category)
    );

    syncFilters({ ...filters, type, category: categoryIsCompatible ? filters.category : "all" });
  }

  function setFilterCategory(category: string) {
    syncFilters({ ...filters, category });
  }

  async function createCategoryRecord(name: string, categoryType: CategoryType) {
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

  async function resolveCategoryRecord(name: string, categoryType: CategoryType) {
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

    const existing = sortedAccounts.find(
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

    const created = normalizeAccount(data as AccountRow, sortedAccounts.length);
    setAccounts((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));

    return created;
  }

  async function handleAddCategory(categoryName: string, categoryType: CategoryType) {
    const created = await createCategoryRecord(categoryName, categoryType);

    return created?.name ?? null;
  }

  async function handleAddAccount(accountName: string) {
    const created = await createAccountRecord(accountName);

    return created?.id ?? null;
  }

  async function handleDeleteCategory(categoryName: string, categoryType: CategoryType) {
    const target = sortedCategories.find(
      (category) =>
        sameCategory(category.name, categoryName) &&
        category.categoryType === categoryType &&
        category.userId === userId
    );

    if (!target || target.userId === null) {
      return false;
    }

    const { error } = await supabase.from("categories").delete().eq("id", target.dbId);

    if (error) {
      throw new Error(error.message);
    }

    setCategories((current) => current.filter((category) => category.dbId !== target.dbId));

    return true;
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
        try {
          await reloadTransactions();
          setBanner({ kind: "success", message: "Transfer saved." });
        } catch {
          setBanner({ kind: "error", message: "Transfer saved, but the transaction list could not be refreshed." });
        }
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
      try {
        await reloadTransactions();
        setBanner({ kind: "success", message: successMessage });
      } catch {
        setBanner({ kind: "error", message: `${successMessage} The transaction list could not be refreshed.` });
      }
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
      try {
        await reloadTransactions();
        setBanner({ kind: "success", message: "Transaction deleted." });
      } catch {
        setBanner({ kind: "error", message: "Transaction deleted, but the transaction list could not be refreshed." });
      }
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

  const dialogInitialValues = editingTransaction ? editingTransaction : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_34%),linear-gradient(180deg,_var(--background)_0%,_var(--background)_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-5 shadow-lg shadow-black/5 backdrop-blur sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Button asChild variant="outline" className="h-10 rounded-full px-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 size-4" />
                Back to dashboard
              </Link>
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Selena</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Transaction History</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Browse every transaction for the selected month, then edit or delete items without leaving the page.
            </p>
            {userEmail && <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>}
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{buildFilterLabel(filters)}</p>
            <p>{sortedTransactions.length} transactions shown</p>
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

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Use month, type, category, and sort controls to narrow the transaction history.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div className="grid gap-2">
              <Label htmlFor="month-filter">Month</Label>
              <Input
                id="month-filter"
                type="month"
                value={filters.month}
                onChange={(event) => setFilterMonth(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type-filter">Transaction type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilterType(value as TransactionFilters["type"])}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={filters.category} onValueChange={setFilterCategory}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent viewportClassName="grid max-h-48 grid-cols-3 gap-1 overflow-y-auto">
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sort-filter">Sort by</Label>
              <Select value={sortBy} onValueChange={(value) => syncSort(value as TransactionSort)}>
                <SelectTrigger id="sort-filter">
                  <SelectValue placeholder="Newest first" />
                </SelectTrigger>
                <SelectContent>
                  {transactionSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {sortedTransactions.length} transaction{sortedTransactions.length === 1 ? "" : "s"} in this filtered view.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {sortedTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {sortedTransactions.map((transaction) => (
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
                <p className="text-base font-medium text-foreground">{emptyTitle}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionDialog
        key={dialogVersion}
        open={isDialogOpen}
        mode={dialogMode}
         defaultTransactionType={draftType}
         categories={{
           expense: visibleCategories.filter((category) => category.categoryType === "expense").map((category) => category.name),
           income: visibleCategories.filter((category) => category.categoryType === "income").map((category) => category.name),
         }}
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
    </main>
  );
}
