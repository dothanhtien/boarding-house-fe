import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Boarding House",
  description:
    "Create a Boarding House account to start managing your properties, tenants, and bookings.",
};

export default function SignUp() {
  return <SignUpForm />;
}
