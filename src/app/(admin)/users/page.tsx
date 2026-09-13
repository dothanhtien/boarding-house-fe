import type { Metadata } from "next";
import { UsersView } from "@/features/users/components/UsersView";

export const metadata: Metadata = {
  title: "Users | Boarding House",
  description: "User management page in the Boarding House system",
};

export default function Users() {
  return <UsersView />;
}
