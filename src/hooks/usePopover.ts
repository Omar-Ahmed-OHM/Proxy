import { useCallback, useRef, useState } from "react";
import { useControllableState } from "./useControllableState";
import { useDismiss } from "./useDismiss";

export type PopoverSide = "top" | "bottom";
export type PopoverAlign = "start" | "center" | "end";

export interface UsePopoverOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverSide;
  align?: PopoverAlign;
  estimatedHeight?: number;
  estimatedWidth?: number;
}

export function usePopover<TTrigger extends HTMLElement = HTMLButtonElement>({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  align: alignProp = "start",
  estimatedHeight = 320,
  estimatedWidth = 240,
}: UsePopoverOptions = {}) {
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [side, setSide] = useState<PopoverSide>(placement);
  const [align, setAlign] = useState<PopoverAlign>(alignProp);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<TTrigger>(null);

  const measure = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (placement === "bottom" && spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      setSide("top");
    } else if (placement === "top" && spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
      setSide("bottom");
    } else {
      setSide(placement);
    }

    if (alignProp === "start" && rect.left + estimatedWidth > window.innerWidth) {
      setAlign("end");
    } else if (alignProp === "end" && rect.right - estimatedWidth < 0) {
      setAlign("start");
    } else {
      setAlign(alignProp);
    }
  }, [alignProp, estimatedHeight, estimatedWidth, placement]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) measure();
      setOpenState(next);
    },
    [measure, setOpenState],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      setOpenState(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpenState],
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  useDismiss(containerRef, (reason) => close(reason === "escape"), open);

  return { open, setOpen, close, toggle, side, align, containerRef, triggerRef };
}
