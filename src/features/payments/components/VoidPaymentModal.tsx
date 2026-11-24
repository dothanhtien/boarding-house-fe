"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PaymentStatus } from "@/features/payments/constants";
import { useVoidPayment } from "@/features/payments/mutations";
import {
  voidPaymentSchema,
  type VoidPaymentFormValues,
} from "@/features/payments/schemas";
import type { Payment } from "@/features/payments/types";
import type { ApiError } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";
import { applyApiFormErrors } from "@/utils/formErrors";

interface VoidPaymentModalProps {
  payment: Payment;
  onClose: () => void;
}

const FORM_FIELDS: (keyof VoidPaymentFormValues)[] = ["reason"];

export const VoidPaymentModal: React.FC<VoidPaymentModalProps> = ({
  payment,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const voidPaymentMutation = useVoidPayment();
  const isPending = voidPaymentMutation.isPending;
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<VoidPaymentFormValues>({
    resolver: zodResolver(voidPaymentSchema),
    defaultValues: { reason: "" },
    mode: "all",
  });

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: VoidPaymentFormValues) => {
    setGeneralError(null);
    voidPaymentMutation.mutate(
      { payment, payload: { reason: values.reason.trim() } },
      {
        onSuccess: () => {
          toast.success(`Payment of ${formatCurrency(payment.amount)} voided`);
          onClose();
        },
        onError: (error: ApiError) => {
          applyApiFormErrors(error, FORM_FIELDS, setError, setGeneralError);
        },
      },
    );
  };

  return (
    <Modal
      isOpen
      labelledBy="voidPaymentTitle"
      onClose={handleClose}
      className="m-4 max-w-[480px]"
      closeOnBackdropClick={false}
    >
      <div className="relative w-full rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4
          id="voidPaymentTitle"
          className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90"
        >
          Void payment
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Void the payment of{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formatCurrency(payment.amount)}
          </span>{" "}
          on invoice {payment.invoiceNumber}. This can&apos;t be undone; record
          it again if it was a mistake.
        </p>
        {payment.status === PaymentStatus.Confirmed && (
          <p className="border-warning-500/30 bg-warning-50 dark:bg-warning-500/15 mt-4 rounded-lg border px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            The invoice&apos;s paid amount will decrease by{" "}
            {formatCurrency(payment.amount)}.
          </p>
        )}

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col gap-5">
            {generalError && (
              <p role="alert" className="text-error-500 text-sm">
                {generalError}
              </p>
            )}
            <div>
              <Label htmlFor="voidReason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="voidReason"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={!!errors.reason}
                    hint={errors.reason?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button variant="danger" disabled={isPending}>
              {isPending ? "Voiding..." : "Void payment"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
