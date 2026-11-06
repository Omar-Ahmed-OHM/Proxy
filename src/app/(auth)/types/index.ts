import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/app/(main)/profile/types";

export interface AuthResponse {
  user: CurrentUser;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FormErrors<F extends string> = Partial<Record<F, string>>;

export interface AuthErrorState<F extends string> {
  message: string | null;
  fieldErrors: FormErrors<F>;
}

export interface AuthLayoutProps {
  children: ReactNode;
}

export interface AuthHighlight {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export interface AuthAlertProps {
  message: string;
}

export interface AuthFormSkeletonProps {
  fields: number;
}
