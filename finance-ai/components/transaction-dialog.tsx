"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCurrency,
  getTodayInputValue,
  type DashboardAccount,
  type DashboardTransaction,
  type TransactionType,
} from "@/lib/finance";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { redirectIfAuthError } from "@/lib/supabase";

export type TransactionFormValues = {
  merchant: string;
  category: string;
  notes: string;
  amount: number;
  date: string;
  transactionType: TransactionType;
  sourceAccountId: string;
  destinationAccountId: string;
};

type TransactionDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  defaultTransactionType: TransactionType;
  categories: string[];
  accounts: DashboardAccount[];
  onAddAccount: (accountName: string) => Promise<string | null>;
  onAddCategory: (categoryName: string) => Promise<string | null>;
  onDeleteCategory: (categoryName: string) => Promise<boolean>;
  initialTransaction?: DashboardTransaction | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

function getInitialState(
  mode: TransactionDialogProps["mode"],
  defaultTransactionType: TransactionType,
  initialTransaction?: DashboardTransaction | null
): TransactionFormValues {
  if (mode === "edit" && initialTransaction) {
    return {
      merchant: initialTransaction.merchant,
      category: initialTransaction.category,
      notes: initialTransaction.notes,
      amount: initialTransaction.amount,
      date: initialTransaction.date,
      transactionType: initialTransaction.transactionType,
      sourceAccountId: "",
      destinationAccountId: "",
    };
  }

  return {
    merchant: "",
    category: "",
    notes: "",
    amount: 0,
    date: getTodayInputValue(),
    transactionType: defaultTransactionType,
    sourceAccountId: "",
    destinationAccountId: "",
  };
}

export function TransactionDialog({
  open,
  mode,
  defaultTransactionType,
  categories,
  accounts,
  onAddAccount,
  onAddCategory,
  onDeleteCategory,
  initialTransaction,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: TransactionDialogProps) {
  const [form, setForm] = useState<TransactionFormValues>(
    getInitialState(mode, defaultTransactionType, initialTransaction)
  );
  const [error, setError] = useState<string | null>(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isManagingAccount, setIsManagingAccount] = useState(false);
  const [isManagingCategory, setIsManagingCategory] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const isTransfer = form.transactionType === "transfer";
  const merchantLabel = form.transactionType === "income" ? "Income Source" : "Merchant";
  const merchantPlaceholder =
    form.transactionType === "income" ? "e.g. Salary, Freelance, Refund" : "e.g. Metro Grocery";
  const categoryHelper =
    form.transactionType === "income"
      ? "Optional for income. You can still choose a category from the list below."
      : "Required for expenses. Pick an existing category or add a new one below.";
  const submitLabel =
    mode === "edit"
      ? "Save Changes"
      : isTransfer
        ? "Transfer Money"
        : form.transactionType === "income"
          ? "Save Income"
          : "Save Expense";

  const categorySuggestions = useMemo(() => {
    const values = new Set(categories.map((category) => category.trim()).filter(Boolean));

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [categories]);

  const accountOptions = useMemo(() => {
    return [...accounts].sort((left, right) => left.name.localeCompare(right.name));
  }, [accounts]);

  const selectedCategoryExists = categorySuggestions.some(
    (category) => category.toLowerCase() === form.category.trim().toLowerCase()
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const isTransfer = form.transactionType === "transfer";
    const merchant = form.merchant.trim();
    const category = form.category.trim();
    const notes = form.notes.trim();
    const amount = Number(form.amount);
    const sourceAccount = accountOptions.find((account) => account.id === form.sourceAccountId);
    const destinationAccount = accountOptions.find((account) => account.id === form.destinationAccountId);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (isTransfer) {
      if (!sourceAccount || !destinationAccount) {
        setError("Choose both a source account and a destination account.");
        return;
      }

      if (sourceAccount.id === destinationAccount.id) {
        setError("Source and destination accounts must be different.");
        return;
      }

      setShowTransferConfirm(true);
      return;
    } else {
      if (!sourceAccount) {
        setError(form.transactionType === "income" ? "Select the account you received money into." : "Select the account you paid from.");
        return;
      }

      if (!merchant) {
        setError(form.transactionType === "income" ? "Income source is required." : "Merchant is required.");
        return;
      }

      if (form.transactionType === "expense" && !category) {
        setError("Category is required for expenses.");
        return;
      }
    }

    await handleTransferSubmit();
  }

  async function handleTransferSubmit() {
    setError(null);

    const notes = form.notes.trim();
    const amount = Number(form.amount);

    try {
      await onSubmit({
        merchant: "",
        category: "",
        notes,
        amount,
        date: form.date || getTodayInputValue(),
        transactionType: form.transactionType,
        sourceAccountId: form.sourceAccountId,
        destinationAccountId: form.destinationAccountId,
      });
      onOpenChange(false);
    } catch (submitError) {
      redirectIfAuthError(submitError);
      setError(submitError instanceof Error ? submitError.message : "Could not save the transaction.");
    }
  }

  async function handleAddCategory() {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setError("Type a category name first.");
      return;
    }

    setError(null);

    setIsManagingCategory(true);

    try {
      const createdName = await onAddCategory(trimmedName);
      if (createdName) {
        setForm((current) => ({ ...current, category: createdName }));
        setNewCategoryName("");
      }
    } finally {
      setIsManagingCategory(false);
    }
  }

  async function handleAddAccount() {
    const trimmedName = newAccountName.trim();

    if (!trimmedName) {
      setError("Type an account name first.");
      return;
    }

    setError(null);
    setIsManagingAccount(true);

    try {
      const createdAccountId = await onAddAccount(trimmedName);
      if (createdAccountId) {
        setForm((current) => ({
          ...current,
          sourceAccountId: current.sourceAccountId || createdAccountId,
          destinationAccountId: current.sourceAccountId ? current.destinationAccountId || createdAccountId : current.destinationAccountId,
        }));
        setNewAccountName("");
      }
    } finally {
      setIsManagingAccount(false);
    }
  }

  async function handleDeleteSelectedCategory() {
    const categoryName = form.category.trim();

    if (!categoryName) {
      setError("Select a category first.");
      return;
    }

    const confirmed = window.confirm(`Remove "${categoryName}" from categories?`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setIsManagingCategory(true);

    try {
      const deleted = await onDeleteCategory(categoryName);

      if (deleted) {
        setForm((current) => ({ ...current, category: "" }));
      }
    } finally {
      setIsManagingCategory(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {mode === "edit"
                ? "Edit Transaction"
                : form.transactionType === "transfer"
                  ? "Transfer"
                  : form.transactionType === "income"
                    ? "Add Income"
                    : "Add Expense"}
            </p>
            <DialogTitle>{mode === "edit" ? "Update transaction details" : "Create a new entry"}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Update the transaction details, including transfer accounts if needed."
                : isTransfer
                  ? "Move money from one account to another."
                  : "Keep the entry simple and mobile-friendly. Required fields change based on the selected type."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "edit" && (
            <div className="grid gap-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={form.transactionType}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    transactionType: value as TransactionType,
                    category: value === "expense" ? current.category : current.category,
                  }))
                }
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isTransfer ? (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="source-account">From Account</Label>
                  <Select
                    value={form.sourceAccountId || undefined}
                    onValueChange={(value) => setForm((current) => ({ ...current, sourceAccountId: value }))}
                  >
                    <SelectTrigger id="source-account">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountOptions.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="destination-account">To Account</Label>
                  <Select
                    value={form.destinationAccountId || undefined}
                    onValueChange={(value) => setForm((current) => ({ ...current, destinationAccountId: value }))}
                  >
                    <SelectTrigger id="destination-account">
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountOptions.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="new-account">Add account</Label>
                    <Input
                      id="new-account"
                      maxLength={100}
                      value={newAccountName}
                      onChange={(event) => setNewAccountName(event.target.value)}
                      placeholder="New account name"
                    />
                  </div>
                  <Button type="button" className="h-10" onClick={handleAddAccount} disabled={isManagingAccount}>
                    <Plus className="mr-2 size-4" />
                    {isManagingAccount ? "Saving..." : "Add Account"}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Create a new account to use it immediately in the transfer.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="merchant">{merchantLabel}</Label>
              <Input
                id="merchant"
                maxLength={200}
                value={form.merchant}
                onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))}
                placeholder={merchantPlaceholder}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value === "" ? 0 : Number(event.target.value),
                }))
              }
              placeholder={formatCurrency(0)}
            />
          </div>

          {!isTransfer && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="income-expense-account">
                  {form.transactionType === "income" ? "Received to" : "Paid from"}
                </Label>
                <Select
                  value={form.sourceAccountId || undefined}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      sourceAccountId: value,
                    }))
                  }
                >
                  <SelectTrigger id="income-expense-account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountOptions.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category || undefined}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={form.transactionType === "income" ? "No category" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categorySuggestions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{categoryHelper}</p>
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="new-category">Add category</Label>
                    <Input
                      id="new-category"
                      maxLength={100}
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="New category name"
                    />
                  </div>
                  <div className="flex gap-2 sm:self-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      onClick={handleDeleteSelectedCategory}
                      disabled={!selectedCategoryExists || isManagingCategory}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                    <Button type="button" className="h-10" onClick={handleAddCategory} disabled={isManagingCategory}>
                      <Plus className="mr-2 size-4" />
                      {isManagingCategory ? "Saving..." : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {isTransfer && (
            <div className="rounded-2xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Transfers move money between accounts without a merchant or category.
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                maxLength={2000}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Optional notes"
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>

        <AlertDialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                {(() => {
                  const src = accountOptions.find((a) => a.id === form.sourceAccountId);
                  const dst = accountOptions.find((a) => a.id === form.destinationAccountId);
                  return `Transfer ${formatCurrency(Number(form.amount))} from ${src?.name ?? "?"} to ${dst?.name ?? "?"}`;
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransferSubmit}>Confirm Transfer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
