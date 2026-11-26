"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import {
  GENDER_LABELS,
  IDENTITY_TYPE_LABELS,
} from "@/features/tenant-profiles/constants";
import { useMyTenantProfile } from "@/features/tenant-profiles/queries";
import type { TenantProfile } from "@/features/tenant-profiles/types";
import { DateFormat, formatDate } from "@/utils/date";
import { EditMyProfileModal } from "./EditMyProfileModal";
import { InfoItem } from "./ui/InfoItem";
import { PortalMessage } from "./ui/PortalMessage";
import { PortalSection } from "./ui/PortalSection";

const ProfileDetails: React.FC<{ profile: TenantProfile }> = ({ profile }) => {
  const date = (value: string | null) => formatDate(value, DateFormat.Date);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Identity document
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
          <InfoItem label="Type">
            {profile.identityType
              ? IDENTITY_TYPE_LABELS[profile.identityType]
              : "—"}
          </InfoItem>
          <InfoItem label="Number">{profile.identityNumber ?? "—"}</InfoItem>
          <InfoItem label="Issued place">
            {profile.identityIssuedPlace ?? "—"}
          </InfoItem>
          <InfoItem label="Issued date">
            {date(profile.identityIssuedDate)}
          </InfoItem>
          <InfoItem label="Expiry date">
            {date(profile.identityExpiryDate)}
          </InfoItem>
        </dl>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Personal
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
          <InfoItem label="Date of birth">{date(profile.dateOfBirth)}</InfoItem>
          <InfoItem label="Gender">
            {profile.gender ? GENDER_LABELS[profile.gender] : "—"}
          </InfoItem>
          <InfoItem label="Permanent address">
            {profile.permanentAddress ?? "—"}
          </InfoItem>
        </dl>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Emergency contact
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
          <InfoItem label="Name">
            {profile.emergencyContactName ?? "—"}
          </InfoItem>
          <InfoItem label="Phone">
            {profile.emergencyContactPhone ?? "—"}
          </InfoItem>
        </dl>
      </div>
    </div>
  );
};

export const ProfilePersonalInfoSection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading, error } = useMyTenantProfile();

  const renderBody = () => {
    if (isLoading) return <PortalMessage>Loading...</PortalMessage>;
    if (error)
      return <PortalMessage tone="error">{error.message}</PortalMessage>;
    if (!profile) {
      return (
        <PortalMessage>
          You haven&apos;t added your personal information yet. Your landlord
          needs it for your residence registration.
        </PortalMessage>
      );
    }
    return <ProfileDetails profile={profile} />;
  };

  return (
    <PortalSection
      title="Personal information"
      action={
        !isLoading &&
        !error && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            {profile ? "Edit" : "Add"}
          </Button>
        )
      }
    >
      {renderBody()}
      {isEditing && (
        <EditMyProfileModal
          profile={profile ?? null}
          onClose={() => setIsEditing(false)}
        />
      )}
    </PortalSection>
  );
};
