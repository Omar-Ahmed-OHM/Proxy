"use client";

import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { controlHeights, controlStyles } from "@/app/components/ui/FormField";
import { PopoverPanel } from "@/app/components/ui/PopoverPanel";
import { Select } from "@/app/components/ui/Select";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { DatePicker } from "./DatePicker";
import { SearchBar } from "./SearchBar";
import type { DateRange, FilterDefinition, FilterValue, FilterBarProps, MultiSelectControlProps, FilterControlProps } from "./types";

function isDateRange(value: FilterValue | undefined): value is DateRange {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFilterActive(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null || value === false || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isDateRange(value)) return value.from !== null || value.to !== null;
  return true;
}

function MultiSelectControl({ filter, value, onChange }: MultiSelectControlProps) {
  const {
    open: isOpen,
    side: panelSide,
    align: panelAlign,
    containerRef,
    triggerRef,
    toggle: togglePopover,
  } = usePopover({ estimatedHeight: 280 });
  const panelId = useId();
  const selectedLabels = filter.options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const toggleValue = (optionValue: string, checked: boolean) =>
    onChange(checked ? [...value, optionValue] : value.filter((item) => item !== optionValue));

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`${filter.label}${selectedLabels.length ? `: ${selectedLabels.join(", ")}` : ""}`}
        onClick={togglePopover}
        className={controlStyles({
          className: cn(
            "flex items-center gap-2 px-3 text-left",
            controlHeights.sm,
            isOpen && "border-primary/70 ring-4 ring-primary/20",
          ),
        })}
      >
        <span className={cn("min-w-0 flex-1 truncate", selectedLabels.length === 0 && "text-muted")}>
          {selectedLabels.length === 0
            ? filter.label
            : selectedLabels.length === 1
              ? selectedLabels[0]
              : `${filter.label} · ${selectedLabels.length}`}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <PopoverPanel
          id={panelId}
          role="dialog"
          aria-label={filter.label}
          side={panelSide}
          align={panelAlign}
          className="w-full min-w-52 p-2"
        >
          {filter.options.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted">No options available</p>
          ) : (
            <ul className="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
              {filter.options.map((option) => (
                <li key={option.value} className="rounded-lg px-2 py-2 transition-colors hover:bg-elevated-hover">
                  <Checkbox
                    label={option.label}
                    checked={value.includes(option.value)}
                    disabled={option.disabled}
                    onChange={(checked) => toggleValue(option.value, checked)}
                  />
                </li>
              ))}
            </ul>
          )}
        </PopoverPanel>
      )}
    </div>
  );
}

function FilterControl({ filter, value, onChange }: FilterControlProps) {
  switch (filter.type) {
    case "select":
      return (
        <Select
          aria-label={filter.label}
          placeholder={filter.placeholder ?? filter.label}
          options={filter.options}
          value={typeof value === "string" ? value : null}
          onChange={onChange}
          clearable
          size="sm"
        />
      );
    case "multi-select":
      return (
        <MultiSelectControl
          filter={filter}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );
    case "date-range": {
      const range: DateRange = isDateRange(value) ? value : { from: null, to: null };
      return (
        <div role="group" aria-label={filter.label} className="grid grid-cols-2 gap-2">
          <DatePicker
            aria-label={`${filter.label} from`}
            placeholder="From"
            value={range.from}
            maxDate={range.to ?? undefined}
            onChange={(from) => onChange({ ...range, from })}
            clearable
            size="sm"
          />
          <DatePicker
            aria-label={`${filter.label} to`}
            placeholder="To"
            value={range.to}
            minDate={range.from ?? undefined}
            onChange={(to) => onChange({ ...range, to })}
            clearable
            size="sm"
          />
        </div>
      );
    }
    case "search":
      return (
        <SearchBar
          aria-label={filter.label}
          placeholder={filter.placeholder ?? filter.label}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          size="sm"
        />
      );
    case "toggle": {
      const active = value === true;
      return (
        <button
          type="button"
          aria-pressed={active}
          onClick={() => onChange(!active)}
          className={cn(
            "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium whitespace-nowrap transition-colors sm:w-auto",
            active
              ? "border-primary/50 bg-primary/15 text-primary-soft"
              : "border-border-strong bg-surface text-muted hover:border-muted/40 hover:text-foreground",
          )}
        >
          {active && <Check size={15} aria-hidden="true" />}
          {filter.label}
        </button>
      );
    }
  }
}

const widthClasses: Record<FilterDefinition["type"], string> = {
  select: "sm:w-44",
  "multi-select": "sm:w-44",
  "date-range": "sm:w-72",
  search: "sm:w-60",
  toggle: "sm:w-auto",
};

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  activeCount,
  collapsibleOnMobile = true,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const controlsId = useId();
  const count = activeCount ?? filters.filter((filter) => isFilterActive(values[filter.id])).length;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {collapsibleOnMobile && (
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={expanded}
            aria-controls={controlsId}
            onClick={() => setExpanded((current) => !current)}
            leftIcon={<SlidersHorizontal size={16} aria-hidden="true" />}
          >
            Filters
            {count > 0 && (
              <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold text-white">
                {count}
              </span>
            )}
          </Button>
          {count > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear all
            </Button>
          )}
        </div>
      )}

      <div
        id={controlsId}
        className={cn(
          "flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center",
          collapsibleOnMobile && !expanded ? "hidden" : "flex",
        )}
      >
        {filters.map((filter) => (
          <div key={filter.id} className={cn("w-full min-w-0", widthClasses[filter.type])}>
            <FilterControl
              filter={filter}
              value={values[filter.id]}
              onChange={(value) => onChange(filter.id, value)}
            />
          </div>
        ))}

        {count > 0 && (
          <div className={cn("items-center gap-2", collapsibleOnMobile ? "hidden sm:flex" : "flex")}>
            <span className="inline-flex h-6 items-center rounded-full bg-primary/15 px-2.5 text-xs font-medium text-primary-soft">
              {count} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              leftIcon={<X size={15} aria-hidden="true" />}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
