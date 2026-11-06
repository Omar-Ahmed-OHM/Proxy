"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { TooltipPlacement, TooltipProps } from "./types";

const placementClasses: Record<TooltipPlacement, { panel: string; arrow: string }> = {
  top: {
    panel: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    arrow: "top-full left-1/2 -mt-1 -translate-x-1/2 border-r border-b",
  },
  bottom: {
    panel: "top-full left-1/2 mt-2 -translate-x-1/2",
    arrow: "bottom-full left-1/2 -mb-1 -translate-x-1/2 border-l border-t",
  },
  left: {
    panel: "right-full top-1/2 mr-2 -translate-y-1/2",
    arrow: "left-full top-1/2 -ml-1 -translate-y-1/2 border-t border-r",
  },
  right: {
    panel: "left-full top-1/2 ml-2 -translate-y-1/2",
    arrow: "right-full top-1/2 -mr-1 -translate-y-1/2 border-b border-l",
  },
};

const opposite: Record<TooltipPlacement, TooltipPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const EDGE_GAP = 48;

export function Tooltip({
  content,
  placement = "top",
  delay = 300,
  disabled = false,
  children,
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [side, setSide] = useState<TooltipPlacement>(placement);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const show = (immediate: boolean) => {
    if (disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const reveal = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) {
        const space: Record<TooltipPlacement, number> = {
          top: rect.top,
          bottom: window.innerHeight - rect.bottom,
          left: rect.left,
          right: window.innerWidth - rect.right,
        };
        setSide(space[placement] < EDGE_GAP && space[opposite[placement]] > space[placement] ? opposite[placement] : placement);
      }
      setVisible(true);
    };
    if (immediate || delay <= 0) reveal();
    else timerRef.current = setTimeout(reveal, delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  const isOpen = visible && !disabled;
  const styles = placementClasses[side];
  const trigger = isValidElement(children)
    ? cloneElement(children, { "aria-describedby": disabled ? undefined : tooltipId })
    : children;

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onPointerEnter={(event) => event.pointerType === "mouse" && show(false)}
      onPointerLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={(event) => event.key === "Escape" && hide()}
    >
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-64 rounded-lg border border-border-strong bg-elevated px-2.5 py-1.5 text-xs font-medium text-foreground shadow-popover",
          "transition-opacity duration-150",
          isOpen ? "visible opacity-100" : "invisible opacity-0",
          styles.panel,
          className,
        )}
      >
        {content}
        <span
          aria-hidden="true"
          className={cn("absolute size-2 rotate-45 border-border-strong bg-elevated", styles.arrow)}
        />
      </span>
    </span>
  );
}
