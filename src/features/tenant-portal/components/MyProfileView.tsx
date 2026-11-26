"use client";

import React from "react";
import { useMe } from "@/features/auth/queries";
import { PortalPageHeader } from "./ui/PortalPageHeader";
import { ProfileAccountSection } from "./ProfileAccountSection";
import { ProfilePersonalInfoSection } from "./ProfilePersonalInfoSection";

export const MyProfileView: React.FC = () => {
  const { data: user } = useMe();

  return (
    <div>
      <PortalPageHeader title="Profile" />

      <div className="space-y-4 md:space-y-6">
        {user && <ProfileAccountSection user={user} />}
        <ProfilePersonalInfoSection />
      </div>
    </div>
  );
};
