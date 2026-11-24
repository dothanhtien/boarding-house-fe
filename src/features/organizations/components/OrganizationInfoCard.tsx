"use client";

import React from "react";
import { Mail, MapPin, Phone, SquarePen } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { Organization } from "../types";
import Badge from "@/components/ui/badge/Badge";
import { DateFormat, formatDate } from "@/utils/date";
import { OrganizationInfoEditModal } from "./OrganizationInfoEditModal";

interface OrganizationInfoCardProps {
  organization: Organization;
}

const formatFullAddress = (organization: Organization) =>
  [
    organization.address,
    organization.ward,
    organization.district,
    organization.province,
  ]
    .filter(Boolean)
    .join(", ") || null;

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  href?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({
  icon,
  label,
  value,
  href,
}) => (
  <div className="flex min-w-0 items-start gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      {value && href ? (
        <a
          href={href}
          className="hover:text-brand-500 block truncate text-sm font-medium text-gray-800 dark:text-white/90"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium wrap-break-word text-gray-800 dark:text-white/90">
          {value ?? "—"}
        </p>
      )}
    </div>
  </div>
);

export const OrganizationInfoCard: React.FC<OrganizationInfoCardProps> = ({
  organization,
}) => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate text-xl font-semibold text-gray-800 dark:text-white/90">
              {organization.name}
            </h3>
            <Badge
              size="sm"
              color={organization.isActive ? "success" : "error"}
            >
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tax code{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {organization.taxCode ?? "—"}
            </span>
            {" · "}
            Created {formatDate(organization.createdAt, DateFormat.Date)}
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="shadow-theme-xs inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-800 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
        >
          <SquarePen className="h-4 w-4" aria-hidden />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 border-t border-gray-100 p-5 sm:grid-cols-2 lg:p-6 xl:grid-cols-[1fr_1fr_2fr] dark:border-gray-800">
        <ContactItem
          icon={<Phone className="h-4 w-4" aria-hidden />}
          label="Phone"
          value={organization.phone}
          href={organization.phone ? `tel:${organization.phone}` : undefined}
        />
        <ContactItem
          icon={<Mail className="h-4 w-4" aria-hidden />}
          label="Email"
          value={organization.email}
          href={organization.email ? `mailto:${organization.email}` : undefined}
        />
        <div className="sm:col-span-2 xl:col-span-1">
          <ContactItem
            icon={<MapPin className="h-4 w-4" aria-hidden />}
            label="Address"
            value={formatFullAddress(organization)}
          />
        </div>
      </div>

      <OrganizationInfoEditModal
        organization={organization}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </section>
  );
};
