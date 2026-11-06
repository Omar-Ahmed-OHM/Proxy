import { ApiError } from "@/lib/http";
import type {
  AuthErrorState,
  FormErrors,
  LoginFormValues,
  RegisterFormValues,
} from "../types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 100;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address";
  return undefined;
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters`;
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return "Name is required";
  if (value.length > NAME_MAX) return `Use at most ${NAME_MAX} characters`;
  return undefined;
}

function compact<F extends string>(errors: Record<F, string | undefined>): FormErrors<F> {
  const result: FormErrors<F> = {};
  (Object.keys(errors) as F[]).forEach((key) => {
    if (errors[key]) result[key] = errors[key];
  });
  return result;
}

export function validateLogin(values: LoginFormValues): FormErrors<keyof LoginFormValues> {
  return compact({
    email: validateEmail(values.email),
    password: values.password ? undefined : "Password is required",
  });
}

export function validateRegister(values: RegisterFormValues): FormErrors<keyof RegisterFormValues> {
  return compact({
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirmPassword:
      values.confirmPassword && values.confirmPassword === values.password
        ? undefined
        : values.confirmPassword
          ? "Passwords don't match"
          : "Confirm your password",
  });
}

export function hasErrors<F extends string>(errors: FormErrors<F>): boolean {
  return Object.keys(errors).length > 0;
}

function sentence(message: string): string {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

export function toFormErrorState<F extends string>(error: unknown, fields: readonly F[]): AuthErrorState<F> {
  if (!(error instanceof ApiError)) {
    return { message: "Something went wrong. Please try again.", fieldErrors: {} };
  }

  const fieldErrors: FormErrors<F> = {};
  error.fieldErrors.forEach((item) => {
    const field = fields.find((name) => name === item.path);
    if (field && !fieldErrors[field]) fieldErrors[field] = sentence(item.message);
  });

  const emailField = fields.find((name) => name === "email");
  if (error.code === "EMAIL_ALREADY_EXISTS" && emailField) {
    fieldErrors[emailField] = "An account with this email already exists";
    return { message: null, fieldErrors };
  }

  if (error.code === "INVALID_CREDENTIALS") {
    return { message: "Incorrect email or password.", fieldErrors };
  }

  if (error.code === "TOO_MANY_REQUESTS" || error.status === 429) {
    return { message: "Too many attempts. Please wait a few minutes and try again.", fieldErrors };
  }

  if (error.kind === "network" || error.kind === "timeout") {
    return { message: "Can't reach the server. Check your connection and try again.", fieldErrors };
  }

  if (hasErrors(fieldErrors)) {
    return { message: null, fieldErrors };
  }

  return { message: error.message || "Something went wrong. Please try again.", fieldErrors };
}

export function sanitizeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/";
  return value;
}

export function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}
