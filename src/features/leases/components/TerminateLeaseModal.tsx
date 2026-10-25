"use client";

import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import DatePicker from "@/components/form/date-picker";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useTerminateLease } from "@/features/leases/mutations";
import {
  buildTerminateLeaseSchema,
  type TerminateLeaseFormValues,
} from "@/features/leases/schemas";
import type { Lease } from "@/features/leases/types";
import { getLatestLeftDate } from "@/features/leases/utils";
import type { ApiError } from "@/lib/axios";
import { applyApiFormErrors } from "@/utils/formErrors";

interface TerminateLeaseModalProps {
  lease: Lease;
  onClose: () => void;
}

const FORM_FIELDS: (keyof TerminateLeaseFormValues)[] = ["reason", "leftDate"];

export const TerminateLeaseModal: React.FC<TerminateLeaseModalProps> = ({
  lease,
  onClose,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const terminateLeaseMutation = useTerminateLease();
  const isPending = terminateLeaseMutation.isPending;
  const schema = useMemo(() => buildTerminateLeaseSchema(lease), [lease]);
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<TerminateLeaseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", leftDate: getLatestLeftDate(lease) },
    mode: "all",
  });

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = (values: TerminateLeaseFormValues) => {
    setGeneralError(null);

    terminateLeaseMutation.mutate(
      { lease, payload: values },
      {
        onSuccess: () => {
          toast.success("Lease terminated");
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
          Terminate lease
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          End lease{" "}
          <span className="font-medium text-gray-800 dark:text-white/90">
            {lease.leaseCode}
          </span>{" "}
          for room {lease.roomNumber} before its end date.
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-500 dark:text-gray-400">
          <li>
            Tenants still on the lease will be marked as left on the left date.
          </li>
          <li>Room {lease.roomNumber} will be marked as available.</li>
          <li>A terminated lease cannot be reactivated.</li>
        </ul>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="flex flex-col gap-5">
            {generalError && (
              <p className="text-error-500 text-sm">{generalError}</p>
            )}

            <div>
              <Label htmlFor="leftDate">
                Left date <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="leftDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="leftDate"
                    placeholder="Select a date"
                    value={field.value}
                    onChange={(_, dateStr) => field.onChange(dateStr)}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    error={!!errors.leftDate}
                    hint={errors.leftDate?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="reason"
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
              {isPending ? "Terminating..." : "Terminate"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
