import SignInForm from "@/features/auth/components/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Boarding House",
  description:
    "Sign in to your Boarding House account to manage your properties, tenants, and bookings.",
};

export default function SignIn() {
  return <SignInForm />;
}
