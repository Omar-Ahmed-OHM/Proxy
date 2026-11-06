"use client";

import { AlertTriangle, CircleHelp, TriangleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Modal } from "./Modal";
import type { ConfirmDialogVariant, ConfirmDialogProps } from "./types";

const variantStyles: Record<ConfirmDialogVariant, { icon: ReactNode; iconBox: string }> = {
  default: {
    icon: <CircleHelp size={20} aria-hidden="true" />,
    iconBox: "bg-secondary/10 text-secondary border-secondary/25",
  },
  warning: {
    icon: <TriangleAlert size={20} aria-hidden="true" />,
    iconBox: "bg-warning/10 text-warning border-warning/25",
  },
  danger: {
    icon: <AlertTriangle size={20} aria-hidden="true" />,
    iconBox: "bg-danger/10 text-danger border-danger/25",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      showCloseButton={false}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading} autoFocus>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={disabled}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span
          className={cn("grid size-10 shrink-0 place-items-center rounded-xl border", styles.iconBox)}
        >
          {styles.icon}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1.5 text-sm text-muted">
              {description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
