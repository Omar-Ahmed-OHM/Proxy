"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ToastType, ToastProps, ToastPosition, ToastViewportProps } from "./types";

const EXIT_DURATION = 150;

const typeStyles: Record<ToastType, { icon: LucideIcon; iconClass: string; accent: string }> = {
  success: { icon: CircleCheck, iconClass: "text-success", accent: "before:bg-success" },
  error: { icon: CircleAlert, iconClass: "text-danger", accent: "before:bg-danger" },
  warning: { icon: TriangleAlert, iconClass: "text-warning", accent: "before:bg-warning" },
  info: { icon: Info, iconClass: "text-secondary", accent: "before:bg-secondary" },
};

export function Toast({
  id,
  type = "info",
  title,
  description,
  duration = 5000,
  action,
  onClose,
  className,
}: ToastProps) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = typeStyles[type];
  const Icon = styles.icon;

  const dismiss = useCallback(() => {
    setLeaving(true);
    exitTimerRef.current = setTimeout(() => onClose(id), EXIT_DURATION);
  }, [id, onClose]);

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  useEffect(() => {
    if (paused || leaving || !Number.isFinite(duration) || duration <= 0) return;
    const startedAt = Date.now();
    const timer = setTimeout(dismiss, remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current -= Date.now() - startedAt;
    };
  }, [dismiss, duration, leaving, paused]);

  return (
    <li
      role={type === "error" ? "alert" : undefined}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-border-strong bg-elevated/95 py-3.5 pr-3 pl-4 shadow-popover backdrop-blur-md",
        "before:absolute before:inset-y-0 before:left-0 before:w-1",
        "transition-[opacity,translate] duration-150",
        leaving ? "translate-y-1 opacity-0" : "animate-slide-up",
        styles.accent,
        className,
      )}
    >
      <Icon size={20} aria-hidden="true" className={cn("mt-px shrink-0", styles.iconClass)} />
      <div className="min-w-0 flex-1">
        {title && (
          <p dir="auto" className="text-sm font-semibold text-foreground">
            {title}
          </p>
        )}
        {description && (
          <p dir="auto" className={cn("text-sm break-words text-muted", title && "mt-0.5")}>
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              dismiss();
            }}
            className="mt-2 rounded-md text-sm font-medium text-primary-soft transition-colors hover:text-foreground"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="-mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-elevated-hover hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

const positionClasses: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4 sm:top-6 sm:right-6",
  "top-center": "top-4 left-1/2 -translate-x-1/2 sm:top-6",
  "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6 flex-col-reverse",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 flex-col-reverse",
};

export function ToastViewport({
  toasts,
  onClose,
  position = "bottom-right",
  label = "Notifications",
  className,
}: ToastViewportProps) {
  return (
    <section aria-label={label} className="contents">
      <ol
        aria-live="polite"
        aria-relevant="additions"
        className={cn(
          "pointer-events-none fixed z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2",
          positionClasses[position],
          className,
        )}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </ol>
    </section>
  );
}
