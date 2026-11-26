import React from "react";

interface InfoItemProps {
  label: string;
  children: React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium break-words text-gray-800 dark:text-white/90">
      {children}
    </dd>
  </div>
);
