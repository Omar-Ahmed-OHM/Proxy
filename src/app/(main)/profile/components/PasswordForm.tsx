"use client";

import { KeyRound, Lock } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { PasswordStrength } from "@/app/components/shared/PasswordStrength";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { ApiError } from "@/lib/http";
import { useChangePassword } from "../hooks/useProfile";
import type { FormStatusState, PasswordFormErrors, PasswordFormValues } from "../types";
import { FormStatus } from "./FormStatus";

const EMPTY: PasswordFormValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

function validate(values: PasswordFormValues): PasswordFormErrors {
  const errors: PasswordFormErrors = {};
  if (!values.currentPassword) errors.currentPassword = "Enter your current password";
  if (values.newPassword.length < 8) errors.newPassword = "Use at least 8 characters";
  else if (values.newPassword.length > 128) errors.newPassword = "Use at most 128 characters";
  if (values.confirmPassword !== values.newPassword) errors.confirmPassword = "Passwords don't match";
  return errors;
}

export function PasswordForm() {
  const changePassword = useChangePassword();
  const [values, setValues] = useState<PasswordFormValues>(EMPTY);
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [status, setStatus] = useState<FormStatusState | null>(null);

  const update = (field: keyof PasswordFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          setValues(EMPTY);
          setStatus({ message: "Password changed", tone: "success" });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "INVALID_PASSWORD") {
            setErrors({ currentPassword: "Current password is incorrect" });
            return;
          }
          if (error instanceof ApiError && error.fieldErrors.length > 0) {
            setErrors({
              currentPassword: error.fieldError("currentPassword"),
              newPassword: error.fieldError("newPassword"),
            });
            return;
          }
          setStatus({ message: error.message || "Couldn't change your password", tone: "danger" });
        },
      },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Current password"
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={update("currentPassword")}
        error={errors.currentPassword}
        leftIcon={<Lock size={18} aria-hidden="true" />}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <Input
            label="New password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            maxLength={128}
            value={values.newPassword}
            onChange={update("newPassword")}
            error={errors.newPassword}
            leftIcon={<KeyRound size={18} aria-hidden="true" />}
          />
          <PasswordStrength password={values.newPassword} />
        </div>
        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          maxLength={128}
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          error={errors.confirmPassword}
          leftIcon={<KeyRound size={18} aria-hidden="true" />}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <FormStatus message={status?.message ?? null} tone={status?.tone ?? "success"} />
        <Button type="submit" variant="secondary" loading={changePassword.isPending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
