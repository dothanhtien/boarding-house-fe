"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ROUTES } from "@/config/routeDefinition";
import { useRoom } from "@/features/rooms/queries";
import { ChevronLeftIcon } from "@/icons";
import { CreateLeaseForm } from "./CreateLeaseForm";

interface CreateLeaseViewProps {
  initialRoomId?: string;
}

export const CreateLeaseView: React.FC<CreateLeaseViewProps> = ({
  initialRoomId,
}) => {
  const router = useRouter();
  const {
    data: initialRoom,
    isLoading,
    error,
  } = useRoom(initialRoomId ?? "", { enabled: !!initialRoomId });

  const backPath =
    initialRoomId && initialRoom
      ? ROUTES.roomDetail(initialRoom.propertyId, initialRoom.id)
      : ROUTES.leases;

  return (
    <div>
      <PageBreadcrumb pageTitle="New lease" />

      <Link
        href={backPath}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        {initialRoom
          ? `Back to room ${initialRoom.roomNumber}`
          : "Back to leases"}
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        {initialRoomId && isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {initialRoomId && error && !isLoading && (
          <p className="text-error-500 text-sm">{error.message}</p>
        )}

        {(!initialRoomId || initialRoom) && (
          <CreateLeaseForm
            initialRoom={initialRoom}
            onCancel={() => router.push(backPath)}
          />
        )}
      </div>
    </div>
  );
};
