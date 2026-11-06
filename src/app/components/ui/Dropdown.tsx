"use client";

import { useCallback, useEffect, useId, useRef, type KeyboardEvent } from "react";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { PopoverPanel } from "./PopoverPanel";
import type { DropdownActionItem, DropdownProps, TriggerSlotProps } from "./types";

function TriggerSlot({ render, setNode, ...props }: TriggerSlotProps) {
  return render({ ...props, ref: setNode });
}

export function Dropdown({
  trigger,
  items,
  header,
  placement = "bottom",
  align = "start",
  open: openProp,
  defaultOpen,
  onOpenChange,
  onSelect,
  menuLabel,
  menuClassName,
  className,
}: DropdownProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerId = `${id}-trigger`;
  const menuRef = useRef<HTMLDivElement>(null);
  const focusLastOnOpen = useRef(false);
  const {
    open: isOpen,
    side: panelSide,
    align: panelAlign,
    containerRef,
    triggerRef,
    setOpen,
    close: closePopover,
    toggle: togglePopover,
  } = usePopover({
    open: openProp,
    defaultOpen,
    onOpenChange,
    placement,
    align,
    estimatedHeight: items.length * 40 + 16,
  });

  const setTriggerNode = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
    },
    [triggerRef],
  );

  const getMenuItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );

  useEffect(() => {
    if (!isOpen) return;
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [],
    );
    const target = focusLastOnOpen.current ? menuItems[menuItems.length - 1] : menuItems[0];
    focusLastOnOpen.current = false;
    (target ?? menuRef.current)?.focus();
  }, [isOpen]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusLastOnOpen.current = event.key === "ArrowUp";
      setOpen(true);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = getMenuItems();
    if (menuItems.length === 0) return;
    const index = menuItems.indexOf(document.activeElement as HTMLButtonElement);

    const focusAt = (next: number) => menuItems[(next + menuItems.length) % menuItems.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(menuItems.length - 1);
        break;
      case "Tab":
        closePopover();
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const char = event.key.toLowerCase();
          const ordered = [...menuItems.slice(index + 1), ...menuItems.slice(0, index + 1)];
          ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(char))?.focus();
        }
    }
  };

  const handleSelect = (item: DropdownActionItem) => {
    item.onSelect?.();
    onSelect?.(item.value);
    closePopover(true);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <TriggerSlot
        render={trigger}
        setNode={setTriggerNode}
        id={triggerId}
        onClick={togglePopover}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
      />

      {isOpen && (
        <PopoverPanel
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-label={menuLabel}
          aria-labelledby={menuLabel ? undefined : triggerId}
          onKeyDown={handleMenuKeyDown}
          side={panelSide}
          align={panelAlign}
          className={cn("w-56 p-1 outline-none", menuClassName)}
        >
          {header && <div className="border-b border-border px-3 py-2.5">{header}</div>}
          <div className={header ? "pt-1" : undefined}>
            {items.map((item) =>
              item.separator ? (
                <div key={item.value} role="separator" className="my-1 h-px bg-border" />
              ) : (
                <button
                  key={item.value}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm outline-none transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
                    item.danger
                      ? "text-danger hover:bg-danger/10 focus-visible:bg-danger/10"
                      : "text-foreground hover:bg-elevated-hover focus-visible:bg-elevated-hover",
                  )}
                >
                  {item.icon && (
                    <span aria-hidden="true" className={item.danger ? "text-danger" : "text-muted"}>
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </button>
              ),
            )}
          </div>
        </PopoverPanel>
      )}
    </div>
  );
}
