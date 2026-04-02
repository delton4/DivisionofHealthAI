import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function LoginPage() {
  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-sm px-6">
        <h1 className="font-display text-3xl tracking-tight mb-8">Sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
