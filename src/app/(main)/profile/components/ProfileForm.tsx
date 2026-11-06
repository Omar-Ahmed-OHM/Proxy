"use client";

import { Save, User } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import type { SelectOption } from "@/app/components/ui/types";
import { ApiError } from "@/lib/http";
import { useUpdateProfile } from "../hooks/useProfile";
import type { FormStatusState, ProfileFormErrors, ProfileFormProps } from "../types";
import { FormStatus } from "./FormStatus";

function getTimezones(current: string): string[] {
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return zones.includes(current) ? zones : [current, ...zones];
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [status, setStatus] = useState<FormStatusState | null>(null);

  const timezoneOptions = useMemo<SelectOption[]>(
    () => getTimezones(user.timezone).map((zone) => ({ value: zone, label: zone.replaceAll("_", " ") })),
    [user.timezone],
  );

  const trimmedName = name.trim();
  const changed = trimmedName !== user.name || timezone !== user.timezone;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    if (!trimmedName) {
      setErrors({ name: "Name is required" });
      return;
    }
    if (trimmedName.length > 100) {
      setErrors({ name: "Use at most 100 characters" });
      return;
    }
    setErrors({});

    updateProfile.mutate(
      {
        ...(trimmedName !== user.name && { name: trimmedName }),
        ...(timezone !== user.timezone && { timezone }),
      },
      {
        onSuccess: () => setStatus({ message: "Profile updated", tone: "success" }),
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrors({
              name: error.fieldError("name"),
              timezone: error.code === "INVALID_TIMEZONE" ? "Choose a valid timezone" : error.fieldError("timezone"),
            });
          }
          setStatus({ message: error.message || "Couldn't update your profile", tone: "danger" });
        },
      },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          error={errors.name}
          leftIcon={<User size={18} aria-hidden="true" />}
        />
        <Select
          label="Timezone"
          options={timezoneOptions}
          value={timezone}
          onChange={(value) => {
            if (value) setTimezone(value);
            setErrors((current) => ({ ...current, timezone: undefined }));
          }}
          searchable
          searchPlaceholder="Search timezones…"
          error={errors.timezone}
        />
      </div>
      <Input label="Email" type="email" value={user.email} readOnly disabled helperText="Email can't be changed." />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <FormStatus message={status?.message ?? null} tone={status?.tone ?? "success"} />
        <Button
          type="submit"
          loading={updateProfile.isPending}
          disabled={!changed}
          leftIcon={<Save size={16} aria-hidden="true" />}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
