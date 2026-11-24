"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { Invoice } from "@/features/invoices/types";
import { useConfirmPayment } from "@/features/payments/mutations";
import type { Payment } from "@/features/payments/types";
import type { ApiError } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";

interface ConfirmPaymentDialogProps {
  payment: Payment;
  invoice: Invoice;
  onClose: () => void;
}

export const ConfirmPaymentDialog: React.FC<ConfirmPaymentDialogProps> = ({
  payment,
  invoice,
  onClose,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmPaymentMutation = useConfirmPayment();
  const isPending = confirmPaymentMutation.isPending;
  const remainingAfter = Math.max(0, invoice.remainingAmount - payment.amount);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleConfirm = () => {
    setErrorMessage(null);
    confirmPaymentMutation.mutate(payment, {
      onSuccess: () => {
        toast.success(`Payment of ${formatCurrency(payment.amount)} confirmed`);
        onClose();
      },
      onError: (error: ApiError) => setErrorMessage(error.message),
    });
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      closeOnBackdropClick={!isPending}
      className="m-4 max-w-[420px]"
    >
      <div className="relative w-full rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          Confirm payment
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Confirm that{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(payment.amount)}
          </span>{" "}
          was received for invoice {invoice.invoiceNumber}. Remaining after
          this:{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(remainingAfter)}
          </span>
          .
        </p>

        {errorMessage && (
          <p role="alert" className="text-error-500 mt-3 text-sm">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
