import { Suspense } from "react";
import { Metadata } from "next";
import SignInForm from "@/features/auth/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | Boarding House",
  description:
    "Sign in to your Boarding House account to manage your properties, tenants, and bookings.",
};

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
