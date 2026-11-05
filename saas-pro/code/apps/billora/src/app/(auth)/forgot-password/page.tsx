import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "../auth-card";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you signed up with and we'll send you a link to choose a new password."
      footer={<>Remembered it? <Link className="font-medium text-primary hover:underline" href="/sign-in">Back to sign in</Link></>}
    >
      <ForgotForm />
    </AuthCard>
  );
}
