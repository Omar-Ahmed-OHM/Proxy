import { Suspense } from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthFormSkeleton } from "../components/AuthFormSkeleton";
import { RegisterForm } from "../components/RegisterForm";

export default function Register() {
  return (
    <AuthCard title="Create your account" description="Start organizing your days with Proxy.">
      <Suspense fallback={<AuthFormSkeleton fields={4} />}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
