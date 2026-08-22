"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDashboardDate, getTypeLabel, type DashboardTransaction, type TransactionType } from "@/lib/finance";

type TransactionRowItemProps = {
  transaction: DashboardTransaction;
  onEdit?: (transaction: DashboardTransaction) => void;
  onDelete?: (transaction: DashboardTransaction) => void;
  disableActions?: boolean;
  showTransferNotice?: boolean;
};

function getAmountStyles(transactionType: TransactionType) {
  if (transactionType === "income") {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (transactionType === "transfer") {
    return "text-muted-foreground";
  }

  return "text-rose-600 dark:text-rose-400";
}

function getAmountPrefix(transactionType: TransactionType) {
  if (transactionType === "income") {
    return "+";
  }

  if (transactionType === "expense") {
    return "-";
  }

  return "";
}

function getTypeVariant(transactionType: TransactionType) {
  if (transactionType === "income") {
    return "success";
  }

  if (transactionType === "transfer") {
    return "secondary";
  }

  return "danger";
}

export function TransactionRowItem({
  transaction,
  onEdit,
  onDelete,
  disableActions = false,
  showTransferNotice = false,
}: TransactionRowItemProps) {
  const canEdit = Boolean(onEdit) && !disableActions;
  const canDelete = Boolean(onDelete) && !disableActions;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      {showTransferNotice && (
        <Badge variant="outline" className="w-fit border-dashed text-[11px] text-muted-foreground">
          Part of transfer - edit from Transfers
        </Badge>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 sm:justify-start">
            <p className="min-w-0 truncate text-base font-medium text-foreground">{transaction.merchant}</p>
            <p className={`shrink-0 text-base font-semibold ${getAmountStyles(transaction.transactionType)}`}>
              {getAmountPrefix(transaction.transactionType)}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{transaction.category}</Badge>
            <Badge variant={getTypeVariant(transaction.transactionType)}>{getTypeLabel(transaction.transactionType)}</Badge>
            <span className="text-sm text-muted-foreground">{formatDashboardDate(transaction.date)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Payment method: {transaction.paymentMethod}</span>
          </div>

          {transaction.notes && <p className="text-sm leading-6 text-muted-foreground">{transaction.notes}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11"
            disabled={!canEdit}
            onClick={() => onEdit?.(transaction)}
            aria-label={`Edit ${transaction.merchant}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={!canDelete}
            onClick={() => onDelete?.(transaction)}
            aria-label={`Delete ${transaction.merchant}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
