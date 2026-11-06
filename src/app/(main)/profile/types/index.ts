export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  user: CurrentUser;
}

export interface UpdateProfileInput {
  name?: string;
  timezone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface MockAccount {
  user: CurrentUser;
  password: string;
}

export interface MockSession {
  account: MockAccount | null;
}

export interface ProfileSummaryProps {
  user: CurrentUser;
}

export interface ProfileFormProps {
  user: CurrentUser;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordFormErrors = Partial<Record<keyof PasswordFormValues, string>>;

export interface ProfileFormErrors {
  name?: string;
  timezone?: string;
}

export type FormStatusTone = "success" | "danger";

export interface FormStatusState {
  message: string;
  tone: FormStatusTone;
}

export interface FormStatusProps {
  message: string | null;
  tone: FormStatusTone;
}
