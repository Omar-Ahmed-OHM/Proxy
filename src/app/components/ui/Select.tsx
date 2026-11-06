"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useControllableState } from "@/hooks/useControllableState";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { controlHeights, controlStyles, fieldMessageId, FormField } from "./FormField";
import { PopoverPanel } from "./PopoverPanel";
import type { SelectOption, SelectProps } from "./types";

export function Select<V extends string = string>({
  label,
  placeholder = "Select an option",
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  clearable = false,
  searchable = false,
  size = "md",
  searchPlaceholder = "Search…",
  emptyMessage = "No options available",
  name,
  id,
  "aria-label": ariaLabel,
  className,
}: SelectProps<V>) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const optionId = (index: number) => `${triggerId}-option-${index}`;

  const [value, setValue] = useControllableState<V | null>(valueProp, defaultValue, onChange);
  const {
    open: isOpen,
    side: panelSide,
    containerRef,
    triggerRef,
    setOpen,
    close: closePopover,
  } = usePopover({ estimatedHeight: 300 });
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value) ?? null;
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const enabledIndexes = visibleOptions.flatMap((option, index) => (option.disabled ? [] : [index]));
  const message = error ?? helperText;

  useEffect(() => {
    if (isOpen && searchable) searchRef.current?.focus();
  }, [isOpen, searchable]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      document
        .getElementById(`${triggerId}-option-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen, triggerId]);

  const openList = () => {
    setQuery("");
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled),
    );
    setOpen(true);
  };

  const choose = (option: SelectOption<V>) => {
    if (option.disabled) return;
    setValue(option.value);
    closePopover(true);
  };

  const moveActive = (direction: 1 | -1 | "first" | "last") => {
    if (enabledIndexes.length === 0) return;
    if (direction === "first") return setActiveIndex(enabledIndexes[0]);
    if (direction === "last") return setActiveIndex(enabledIndexes[enabledIndexes.length - 1]);
    const position = enabledIndexes.indexOf(activeIndex);
    const nextPosition =
      position === -1
        ? 0
        : (position + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        moveActive("first");
        break;
      case "End":
        event.preventDefault();
        moveActive("last");
        break;
      case "Enter": {
        event.preventDefault();
        const option = visibleOptions[activeIndex];
        if (option) choose(option);
        break;
      }
      case " ":
        if (!searchable) {
          event.preventDefault();
          const option = visibleOptions[activeIndex];
          if (option) choose(option);
        }
        break;
      case "Tab":
        closePopover();
        break;
    }
  };

  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined;
  const showClear = clearable && selected !== null && !disabled;

  return (
    <FormField
      id={triggerId}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={searchable ? undefined : activeDescendant}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={message ? fieldMessageId(triggerId) : undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => (isOpen ? closePopover() : openList())}
          onKeyDown={handleKeyDown}
          className={controlStyles({
            invalid: Boolean(error),
            className: cn(
              "flex items-center gap-2 px-3.5 text-left",
              controlHeights[size],
              showClear ? "pr-18" : "pr-10",
              isOpen && "border-primary/70 ring-4 ring-primary/20",
            ),
          })}
        >
          {selected?.icon && (
            <span className="shrink-0 text-muted [&_svg]:size-4" aria-hidden="true">
              {selected.icon}
            </span>
          )}
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted/60")}>
            {selected ? selected.label : placeholder}
          </span>
        </button>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn("transition-transform duration-150", isOpen && "rotate-180")}
          />
        </span>

        {showClear && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              setValue(null);
              triggerRef.current?.focus();
            }}
            className="absolute inset-y-0 right-9 my-auto grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}

        {name && <input type="hidden" name={name} value={value ?? ""} />}

        {isOpen && (
          <PopoverPanel side={panelSide} align="start" className="w-full min-w-48 p-1">
            {searchable && (
              <div className="relative mb-1 border-b border-border pb-1">
                <Search
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-2.5 left-2.5 text-muted"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  role="combobox"
                  aria-expanded
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeDescendant}
                  aria-label={searchPlaceholder}
                  className="h-9 w-full rounded-lg bg-surface pr-3 pl-8 text-sm text-foreground outline-none placeholder:text-muted/60 focus-visible:outline-none"
                />
              </div>
            )}
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label ?? ariaLabel}
              className="max-h-64 overflow-y-auto overscroll-contain"
            >
              {visibleOptions.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  {query ? "No matching options" : emptyMessage}
                </li>
              ) : (
                visibleOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      onPointerMove={() => !option.disabled && setActiveIndex(index)}
                      onClick={() => choose(option)}
                      className={cn(
                        "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm transition-colors",
                        isActive && "bg-elevated-hover",
                        isSelected ? "text-primary-soft" : "text-foreground",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {option.icon && (
                        <span className="shrink-0 text-muted [&_svg]:size-4" aria-hidden="true">
                          {option.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {isSelected && <Check size={16} aria-hidden="true" className="shrink-0" />}
                    </li>
                  );
                })
              )}
            </ul>
          </PopoverPanel>
        )}
      </div>
    </FormField>
  );
}
