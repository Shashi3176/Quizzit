
import AuthForm from '@/components/AuthForm';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Quiz App account",
};

export default function LoginPage() {
  return <AuthForm isLogin />;
}
