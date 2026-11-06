import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FormStatusProps } from "../types";

export function FormStatus({ message, tone }: FormStatusProps) {
  if (!message) return null;
  const Icon = tone === "success" ? CircleCheck : CircleAlert;

  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 text-sm animate-fade-in",
        tone === "success" ? "text-success" : "text-danger",
      )}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      {message}
    </p>
  );
}
