"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ROUTES } from "@/config/routeDefinition";
import type { Lease } from "@/features/leases/types";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

interface CreateInvoiceModalProps {
  lease: Lease;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  lease,
  onClose,
}) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      className="m-4 max-w-[1200px]"
      closeOnBackdropClick={false}
    >
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          New invoice
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Lines for rent, utilities and deposit are calculated from lease{" "}
          {lease.leaseCode} for the selected month.
        </p>

        <CreateInvoiceForm
          lease={lease}
          idPrefix="leaseInvoice"
          stickyTopClassName="lg:top-0"
          onPendingChange={setIsPending}
          onCancel={handleClose}
          onCreated={(invoice) => {
            toast.success(`Invoice ${invoice.invoiceNumber} created`, {
              action: {
                label: "View",
                onClick: () => router.push(ROUTES.invoiceDetail(invoice.id)),
              },
            });
            onClose();
          }}
        />
      </div>
    </Modal>
  );
};
