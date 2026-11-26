"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import AvatarText from "@/components/ui/avatar/AvatarText";
import Button from "@/components/ui/button/Button";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_FILE_NAME_LENGTH,
  MEDIA_MAX_FILE_SIZE_BYTES,
} from "@/config/media";
import {
  useDeleteMyAvatar,
  useUpdateMyAvatar,
} from "@/features/auth/mutations";
import type { AuthUser } from "@/features/auth/types";
import { InfoItem } from "./ui/InfoItem";
import { PortalSection } from "./ui/PortalSection";

const getAvatarFileError = (file: File): string | null => {
  const allowedTypes: readonly string[] = MEDIA_ALLOWED_IMAGE_MIME_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return "Choose a JPEG, PNG or WebP image";
  }
  if (file.size === 0) return "The image is empty";
  if (file.size > MEDIA_MAX_FILE_SIZE_BYTES) {
    return `The image exceeds ${MEDIA_MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`;
  }
  if (file.name.length > MEDIA_MAX_FILE_NAME_LENGTH) {
    return `The file name exceeds ${MEDIA_MAX_FILE_NAME_LENGTH} characters`;
  }
  return null;
};

interface ProfileAccountSectionProps {
  user: AuthUser;
}

export const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({
  user,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateAvatar = useUpdateMyAvatar();
  const deleteAvatar = useDeleteMyAvatar();
  const isBusy = updateAvatar.isPending || deleteAvatar.isPending;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fileError = getAvatarFileError(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    updateAvatar.mutate(file, {
      onSuccess: () => toast.success("Profile photo updated"),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleRemove = () => {
    deleteAvatar.mutate(undefined, {
      onSuccess: () => toast.success("Profile photo removed"),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <PortalSection title="Account">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={80}
            height={80}
            unoptimized
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <AvatarText
            name={user.fullName}
            className="h-20 w-20 shrink-0 [&>span]:text-xl"
          />
        )}

        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_ALLOWED_IMAGE_MIME_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {updateAvatar.isPending
              ? "Uploading..."
              : user.avatarUrl
                ? "Change photo"
                : "Upload photo"}
          </Button>
          {user.avatarUrl && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={handleRemove}
            >
              {deleteAvatar.isPending ? "Removing..." : "Remove"}
            </Button>
          )}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <InfoItem label="Full name">{user.fullName}</InfoItem>
        <InfoItem label="Phone">{user.phone ?? "—"}</InfoItem>
        <InfoItem label="Email">{user.email ?? "—"}</InfoItem>
      </dl>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        To change your name, phone or email, contact your landlord.
      </p>
    </PortalSection>
  );
};
