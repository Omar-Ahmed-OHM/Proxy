"use client";

import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { PasswordStrength } from "@/app/components/shared/PasswordStrength";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { useRegister } from "../hooks/useAuth";
import type { FormErrors, RegisterFormValues } from "../types";
import {
  focusFirstInvalid,
  hasErrors,
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  sanitizeNext,
  toFormErrorState,
  validateRegister,
} from "../utils/validation";
import { AuthAlert } from "./AuthAlert";

const FIELDS = ["name", "email", "password", "confirmPassword"] as const;

function detectTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));
  const registerUser = useRegister(next);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors<keyof RegisterFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const busy = registerUser.isPending || registerUser.isSuccess;

  const update = (field: keyof RegisterFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) {
      focusFirstInvalid(formRef.current);
      return;
    }

    registerUser.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        timezone: detectTimezone(),
      },
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

  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formError && <AuthAlert message={formError} />}

      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Your name"
        required
        maxLength={NAME_MAX}
        value={values.name}
        onChange={update("name")}
        error={errors.name}
        leftIcon={<User size={18} aria-hidden="true" />}
        disabled={busy}
      />

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

      <div className="flex flex-col gap-2.5">
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder={`At least ${PASSWORD_MIN} characters`}
          required
          maxLength={PASSWORD_MAX}
          value={values.password}
          onChange={update("password")}
          error={errors.password}
          leftIcon={<Lock size={18} aria-hidden="true" />}
          disabled={busy}
        />
        <PasswordStrength password={values.password} minLength={PASSWORD_MIN} />
      </div>

      <Input
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat your password"
        required
        maxLength={PASSWORD_MAX}
        value={values.confirmPassword}
        onChange={update("confirmPassword")}
        error={errors.confirmPassword}
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
        Create account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-primary-soft transition-colors hover:text-foreground">
          Sign in
        </Link>
      </p>
    </form>
  );
}
