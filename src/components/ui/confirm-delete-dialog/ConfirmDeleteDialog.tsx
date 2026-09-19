import React, { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface ConfirmDeleteDialogProps {
  title: string;
  description: ReactNode;
  isPending: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  title,
  description,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen onClose={onClose} className="m-4 max-w-[400px]">
      <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
        <h4 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h4>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>

        {errorMessage && (
          <p className="text-error-500 mt-3 text-sm">{errorMessage}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
