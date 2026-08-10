"use client";

import { useState, type FormEvent } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DashboardAccount } from "@/lib/finance";

export type AccountFormValues = {
  name: string;
  institution: string;
  currency: string;
};

const currencyOptions = ["PHP", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];

type AccountDialogProps = {
  open: boolean;
  account?: DashboardAccount | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

function getInitialForm(account?: DashboardAccount | null): AccountFormValues {
  return {
    name: account?.name ?? "",
    institution: account?.institution ?? "",
    currency: account?.currency ?? "PHP",
  };
}

export function AccountDialog({ open, account, onOpenChange, onSubmit, isSubmitting = false }: AccountDialogProps) {
  const [form, setForm] = useState<AccountFormValues>(() => getInitialForm(account));
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();

    if (!name) {
      setError("Account name is required.");
      return;
    }

    if (name.length > 100) {
      setError("Account name must be 100 characters or less.");
      return;
    }

    try {
      await onSubmit({
        name,
        institution: form.institution.trim(),
        currency: form.currency || "PHP",
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save the account.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {account ? "Edit Account" : "Add Account"}
            </p>
            <DialogTitle>{account ? "Update account details" : "Create a new account"}</DialogTitle>
            <DialogDescription>
              Accounts hold your balances and are used when recording income, expenses, and transfers.
            </DialogDescription>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="account-name">Account name</Label>
            <Input
              id="account-name"
              maxLength={100}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Wallet, GCash, Bank Account"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="account-institution">Institution (optional)</Label>
            <Input
              id="account-institution"
              maxLength={100}
              value={form.institution}
              onChange={(event) => setForm((current) => ({ ...current, institution: event.target.value }))}
              placeholder="e.g. BPI, BDO, GCash"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="account-currency">Currency</Label>
            <Select
              value={form.currency}
              onValueChange={(value) => setForm((current) => ({ ...current, currency: value }))}
            >
              <SelectTrigger id="account-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : account ? "Save Changes" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}