
import type { PopoverAlign, PopoverSide } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import type { PopoverPanelProps } from "./types";

const sideClasses: Record<PopoverSide, string> = {
  bottom: "top-full mt-2 origin-top",
  top: "bottom-full mb-2 origin-bottom",
};

const alignClasses: Record<PopoverAlign, string> = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
};

export function PopoverPanel({
  side = "bottom",
  align = "start",
  className,
  children,
  ...rest
}: PopoverPanelProps) {
  return (
    <div
      className={cn(
        "absolute z-50 max-w-[calc(100vw-2rem)] animate-pop-in rounded-xl border border-border-strong bg-elevated/95 shadow-popover backdrop-blur-md",
        sideClasses[side],
        alignClasses[align],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
