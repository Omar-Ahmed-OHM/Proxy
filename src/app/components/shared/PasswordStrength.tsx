import { cn } from "@/lib/cn";
import type { PasswordStrengthLevel, PasswordStrengthProps } from "./types";

const levels: Record<PasswordStrengthLevel, { label: string; bar: string; text: string }> = {
  0: { label: "Too short", bar: "bg-danger", text: "text-danger" },
  1: { label: "Weak", bar: "bg-danger", text: "text-danger" },
  2: { label: "Fair", bar: "bg-warning", text: "text-warning" },
  3: { label: "Good", bar: "bg-secondary", text: "text-secondary" },
  4: { label: "Strong", bar: "bg-success", text: "text-success" },
};

export function getPasswordStrength(password: string, minLength = 8): PasswordStrengthLevel {
  if (password.length < minLength) return 0;
  let score = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score += 1;
  return Math.min(score, 4) as PasswordStrengthLevel;
}

export function PasswordStrength({ password, minLength = 8, className }: PasswordStrengthProps) {
  if (!password) return null;
  const level = getPasswordStrength(password, minLength);
  const style = levels[level];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              level >= step ? style.bar : "bg-elevated",
            )}
          />
        ))}
      </div>
      <span className={cn("w-16 text-right text-xs font-medium", style.text)} aria-live="polite">
        <span className="sr-only">Password strength: </span>
        {style.label}
      </span>
    </div>
  );
}
