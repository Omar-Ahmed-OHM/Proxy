"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useLogin } from "../hooks/useAuth";
import type { FormErrors, LoginFormValues } from "../types";
import { focusFirstInvalid, hasErrors, sanitizeNext, toFormErrorState, validateLogin } from "../utils/validation";
import { AuthAlert } from "./AuthAlert";

const FIELDS = ["email", "password"] as const;

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));
  const login = useLogin(next);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors<keyof LoginFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const busy = login.isPending || login.isSuccess;

  const update = (field: keyof LoginFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) {
      focusFirstInvalid(formRef.current);
      return;
    }

    login.mutate(
      { email: values.email.trim().toLowerCase(), password: values.password },
      {
        onError: (error) => {
          const state = toFormErrorState(error, FIELDS);
          setErrors(state.fieldErrors);
          setFormError(state.message);
          focusFirstInvalid(formRef.current);
        },
      },
    );
  };

  const registerHref = next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formError && <AuthAlert message={formError} />}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        required
        value={values.email}
        onChange={update("email")}
        error={errors.email}
        leftIcon={<Mail size={18} aria-hidden="true" />}
        disabled={busy}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        value={values.password}
        onChange={update("password")}
        error={errors.password}
        leftIcon={<Lock size={18} aria-hidden="true" />}
        disabled={busy}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={busy}
        rightIcon={<ArrowRight size={18} aria-hidden="true" />}
        className="mt-1"
      >
        Sign in
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href={registerHref} className="font-semibold text-primary-soft transition-colors hover:text-foreground">
          Create one
        </Link>
      </p>
    </form>
  );
}
