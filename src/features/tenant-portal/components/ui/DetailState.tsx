import React from "react";
import { HttpStatus } from "@/enums/httpStatus";
import type { ApiError } from "@/lib/axios";
import { PortalMessage } from "./PortalMessage";

interface DetailStateProps {
  isLoading: boolean;
  error: ApiError | null;
  notFoundMessage: string;
}

export const DetailState: React.FC<DetailStateProps> = ({
  isLoading,
  error,
  notFoundMessage,
}) => {
  if (isLoading) return <PortalMessage>Loading...</PortalMessage>;
  if (!error) return null;
  if (error.status === HttpStatus.NotFound) {
    return <PortalMessage>{notFoundMessage}</PortalMessage>;
  }
  return <PortalMessage tone="error">{error.message}</PortalMessage>;
};
