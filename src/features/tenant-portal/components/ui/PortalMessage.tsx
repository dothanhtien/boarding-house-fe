import React from "react";

interface PortalMessageProps {
  children: React.ReactNode;
  tone?: "muted" | "error";
}

export const PortalMessage: React.FC<PortalMessageProps> = ({
  children,
  tone = "muted",
}) => (
  <p
    className={`py-6 text-center text-sm ${
      tone === "error" ? "text-error-500" : "text-gray-500 dark:text-gray-400"
    }`}
    role={tone === "error" ? "alert" : undefined}
  >
    {children}
  </p>
);
