import React from "react";

interface PortalListProps {
  children: React.ReactNode;
}

export const PortalList: React.FC<PortalListProps> = ({ children }) => (
  <ul className="flex flex-col gap-3">{children}</ul>
);
