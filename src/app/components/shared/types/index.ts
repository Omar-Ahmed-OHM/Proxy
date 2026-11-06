import type { ControlSize, SelectOption } from "@/app/components/ui/types";
import type { PopoverSide } from "@/hooks/usePopover";
import type { WeekStart } from "@/lib/date";
import type { ReactNode } from "react";

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: ReadonlyArray<Date> | ((date: Date) => boolean);
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: ControlSize;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  locale?: string;
  weekStartsOn?: WeekStart;
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface FilterBase {
  id: string;
  label: string;
}

export interface SelectFilter extends FilterBase {
  type: "select";
  options: ReadonlyArray<SelectOption>;
  placeholder?: string;
}

export interface MultiSelectFilter extends FilterBase {
  type: "multi-select";
  options: ReadonlyArray<SelectOption>;
}

export interface DateRangeFilter extends FilterBase {
  type: "date-range";
}

export interface SearchFilter extends FilterBase {
  type: "search";
  placeholder?: string;
}

export interface ToggleFilter extends FilterBase {
  type: "toggle";
}

export type FilterDefinition =
  | SelectFilter
  | MultiSelectFilter
  | DateRangeFilter
  | SearchFilter
  | ToggleFilter;

export type FilterValue = string | string[] | DateRange | boolean | null;

export type FilterValues = Readonly<Record<string, FilterValue | undefined>>;

export interface FilterBarProps {
  filters: ReadonlyArray<FilterDefinition>;
  values: FilterValues;
  onChange: (id: string, value: FilterValue) => void;
  onClear: () => void;
  activeCount?: number;
  collapsibleOnMobile?: boolean;
  className?: string;
}

export interface MultiSelectControlProps {
  filter: MultiSelectFilter;
  value: string[];
  onChange: (value: string[]) => void;
}

export interface FilterControlProps {
  filter: FilterDefinition;
  value: FilterValue | undefined;
  onChange: (value: FilterValue) => void;
}

export type NotificationType = "info" | "success" | "warning" | "danger";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  read: boolean;
  type?: NotificationType;
  icon?: ReactNode;
}

export interface NotificationMenuProps {
  notifications: ReadonlyArray<NotificationItem>;
  unreadCount?: number;
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  locale?: string;
  className?: string;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  showShortcut?: boolean;
  shortcutKey?: string;
  size?: ControlSize;
  "aria-label"?: string;
  className?: string;
}

export type StatCardVariant = "default" | "primary" | "info" | "success" | "warning" | "danger";

export type TrendDirection = "up" | "down" | "neutral";

export type StatCardTone = "primary" | "secondary" | "success" | "warning";

export interface SparklineProps {
  data: ReadonlyArray<number>;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  trend?: string;
  trendValue?: string;
  trendDirection?: TrendDirection;
  invertTrend?: boolean;
  variant?: StatCardVariant;
  tone?: StatCardTone;
  sparkline?: ReadonlyArray<number>;
  loading?: boolean;
  className?: string;
}

export type TimeFormat = "12h" | "24h";

export type Period = "AM" | "PM";

export interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
  format?: TimeFormat;
  minuteStep?: number;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  size?: ControlSize;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  locale?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export interface TimeParts {
  hours: number;
  minutes: number;
}

export interface TimeColumnOption {
  label: string;
  value: number;
}

export interface TimeColumnProps {
  label: string;
  options: ReadonlyArray<TimeColumnOption>;
  selected: number | null;
  onSelect: (value: number) => void;
}

export interface UserMenuUser {
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

export type UserMenuVariant = "default" | "sidebar" | "avatar";

export interface UserMenuProps {
  user: UserMenuUser;
  variant?: UserMenuVariant;
  placement?: PopoverSide;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  align?: "start" | "end";
  className?: string;
}

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthProps {
  password: string;
  minLength?: number;
  className?: string;
}
