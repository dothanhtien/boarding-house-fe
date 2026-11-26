import type { Metadata } from "next";
import { MyProfileView } from "@/features/tenant-portal/components/MyProfileView";

export const metadata: Metadata = {
  title: "Profile | Boarding House",
  description: "Profile in the Boarding House tenant portal",
};

export default function Page() {
  return <MyProfileView />;
}
