import type { Metadata } from "next";
import { PropertiesView } from "@/features/properties/components/PropertiesView";

export const metadata: Metadata = {
  title: "Properties | Boarding House",
  description: "Property management page in the Boarding House system",
};

export default function Properties() {
  return <PropertiesView />;
}
