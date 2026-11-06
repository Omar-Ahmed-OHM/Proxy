import { CircleAlert } from "lucide-react";
import type { AuthAlertProps } from "../types";

export function AuthAlert({ message }: AuthAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-3 text-sm text-foreground animate-fade-in"
    >
      <CircleAlert size={18} aria-hidden="true" className="mt-px shrink-0 text-danger" />
      <p>{message}</p>
    </div>
  );
}
