"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ROUTES } from "@/config/routeDefinition";
import { ChevronLeftIcon } from "@/icons";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

export const CreateInvoiceView: React.FC = () => {
  const router = useRouter();

  return (
    <div>
      <PageBreadcrumb pageTitle="New invoice" />

      <Link
        href={ROUTES.invoices}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to invoices
      </Link>

      <CreateInvoiceForm
        onCreated={(invoice) => {
          toast.success(`Invoice ${invoice.invoiceNumber} created`);
          router.replace(ROUTES.invoiceDetail(invoice.id));
        }}
      />
    </div>
  );
};
