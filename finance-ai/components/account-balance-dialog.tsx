"use client";

import { useState, type FormEvent } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToPesos, formatCurrency, type DashboardAccount } from "@/lib/finance";

export type BalanceFormValues = {
  balanceCents: number;
};

type BalanceDialogProps = {
  open: boolean;
  account?: DashboardAccount | null;
  currentBalanceCents: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BalanceFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function AccountBalanceDialog({
  open,
  account,
  currentBalanceCents,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: BalanceDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const currentBalance = centsToPesos(currentBalanceCents);

  function handleInputChange(value: string) {
    setAmount(value.replace(/[^0-9.]/g, ""));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = Number(amount);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid balance amount.");
      return;
    }

    if (Math.round(parsed * 100) === currentBalanceCents) {
      setError("The balance is already set to this amount.");
      return;
    }

    try {
      await onSubmit({ balanceCents: Math.round(parsed * 100) });
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not update the account balance.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Set Balance</p>
            <DialogTitle>{account ? `Update ${account.name} balance` : "Update account balance"}</DialogTitle>
            <DialogDescription>
              Current balance: {formatCurrency(currentBalance)}. Set a new target balance for this account.
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
            <Label htmlFor="account-balance">New balance</Label>
            <Input
              id="account-balance"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(event) => handleInputChange(event.target.value)}
              placeholder={formatCurrency(currentBalance)}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Balance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}