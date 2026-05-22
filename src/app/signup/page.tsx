
import AuthForm from '@/components/AuthForm';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Quiz App account",
};

export default function SignupPage() {
  return <AuthForm />;
}
