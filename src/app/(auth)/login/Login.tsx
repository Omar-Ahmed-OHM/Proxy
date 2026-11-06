import { Suspense } from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthFormSkeleton } from "../components/AuthFormSkeleton";
import { LoginForm } from "../components/LoginForm";

export default function Login() {
  return (
    <AuthCard title="Welcome back" description="Sign in to continue to Proxy.">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
