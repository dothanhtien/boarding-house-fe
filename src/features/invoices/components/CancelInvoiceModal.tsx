"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useCancelInvoice } from "@/features/invoices/mutations";
import {
  cancelInvoiceSchema,
  type CancelInvoiceFormValues,
} from "@/features/invoices/schemas";
import type { Invoice } from "@/features/invoices/types";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";

interface CancelInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const FORM_FIELDS: (keyof CancelInvoiceFormValues)[] = ["reason"];

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const cancelInvoiceMutation = useCancelInvoice();
  const isPending = cancelInvoiceMutation.isPending;
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CancelInvoiceFormValues>({
    resolver: zodResolver(cancelInvoiceSchema),
    defaultValues: { reason: "" },
    mode: "all",
  });

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: CancelInvoiceFormValues) => {
    setGeneralError(null);

    cancelInvoiceMutation.mutate(
      { id: invoice.id, payload: { reason: values.reason.trim() } },
      {
        onSuccess: () => {
          toast.success(`Invoice ${invoice.invoiceNumber} cancelled`);
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
      onClose={handleClose}
      className="m-4 max-w-[520px]"
      closeOnBackdropClick={false}
    >
      <div className="relative w-full rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          Cancel invoice
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cancel invoice{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {invoice.invoiceNumber}
          </span>{" "}
          for room {invoice.roomNumber}.
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-500 dark:text-gray-400">
          <li>Pending payments on this invoice will be voided.</li>
          <li>
            Meter readings and the deposit on this invoice become billable
            again, so a new invoice can be created for this month.
          </li>
          <li>The invoice keeps its number and cannot be restored.</li>
        </ul>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col gap-5">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

            <div>
              <Label htmlFor="cancelReason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="cancelReason"
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
              Keep invoice
            </Button>
            <Button variant="danger" disabled={isPending}>
              {isPending ? "Cancelling..." : "Cancel invoice"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
