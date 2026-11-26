"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import { Select } from "@/components/form/Select";
import Pagination from "@/components/tables/Pagination";
import {
  PAYMENT_STATUS_OPTIONS,
  type PaymentStatus,
} from "@/features/payments/constants";
import { useMyPayments } from "../queries";
import { MyPaymentCard } from "./MyPaymentCard";
import { PortalList } from "./ui/PortalList";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalPageHeader } from "./ui/PortalPageHeader";

const PAGE_SIZE = 10;

export const MyPaymentsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const { data, isLoading, error } = useMyPayments({
    page,
    pageSize: PAGE_SIZE,
    status: status || undefined,
  });
  const payments = data?.items ?? [];

  return (
    <div>
      <PortalPageHeader
        title="Payments"
        aside={
          <div className="w-full sm:w-44">
            <Label htmlFor="myPaymentStatusFilter" className="sr-only">
              Status
            </Label>
            <Select
              id="myPaymentStatusFilter"
              options={PAYMENT_STATUS_OPTIONS}
              placeholder="All statuses"
              value={status}
              onChange={(value) => {
                setStatus(value as PaymentStatus | "");
                setPage(1);
              }}
            />
          </div>
        }
      />

      {isLoading && <PortalMessage>Loading...</PortalMessage>}
      {error && <PortalMessage tone="error">{error.message}</PortalMessage>}
      {data && payments.length === 0 && (
        <PortalMessage>
          {status
            ? "No payments with this status."
            : "You have no payments yet."}
        </PortalMessage>
      )}

      {payments.length > 0 && (
        <PortalList>
          {payments.map((payment) => (
            <MyPaymentCard key={payment.id} payment={payment} />
          ))}
        </PortalList>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
