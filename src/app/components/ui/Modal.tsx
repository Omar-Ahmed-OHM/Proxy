"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type SyntheticEvent } from "react";
import { cn } from "@/lib/cn";
import type { ModalSize, ModalProps } from "./types";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  role = "dialog",
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerDownOnBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    return () => {
      dialog.close();
      document.documentElement.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (closeOnEscape) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
      aria-describedby={describedBy ?? (description ? descriptionId : undefined)}
      onCancel={handleCancel}
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (closeOnBackdrop && pointerDownOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-visible bg-transparent p-0 text-foreground",
        "backdrop:bg-canvas/70 backdrop:backdrop-blur-sm open:backdrop:animate-fade-in",
        sizeClasses[size],
      )}
    >
      {open && (
        <div
          className={cn(
            "flex max-h-[calc(100dvh-2rem)] animate-pop-in flex-col rounded-2xl border border-border-strong bg-elevated shadow-popover",
            className,
          )}
        >
          {(title || description || showCloseButton) && (
            <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="min-w-0">
                {title && (
                  <h2 id={titleId} className="text-lg font-semibold text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </header>
          )}
          {children && (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          )}
          {footer && (
            <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}
