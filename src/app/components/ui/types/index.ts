import type { LinkProps } from "next/link";
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  RefCallback,
} from "react";
import type { PopoverAlign, PopoverSide } from "@/hooks/usePopover";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  showStatus?: boolean;
  ring?: boolean;
  className?: string;
}

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  pill?: boolean;
  className?: string;
  children: ReactNode;
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
}

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export type CardVariant = "default" | "elevated" | "glass" | "interactive";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  as?: "section" | "article" | "div";
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  header?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  clickable?: boolean;
  padding?: CardPadding;
}

export interface CheckboxProps
  extends Omit<ComponentPropsWithRef<"input">, "type" | "onChange" | "size"> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

export type ConfirmDialogVariant = "default" | "danger" | "warning";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  disabled?: boolean;
}

export interface DropdownActionItem {
  separator?: false;
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

export interface DropdownSeparatorItem {
  separator: true;
  value: string;
}

export type DropdownItem = DropdownActionItem | DropdownSeparatorItem;

export interface DropdownTriggerProps {
  ref: RefCallback<HTMLButtonElement>;
  id: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}

export interface DropdownProps {
  trigger: (props: DropdownTriggerProps) => ReactNode;
  items: ReadonlyArray<DropdownItem>;
  header?: ReactNode;
  placement?: PopoverSide;
  align?: PopoverAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  menuLabel?: string;
  menuClassName?: string;
  className?: string;
}

export interface TriggerSlotProps extends Omit<DropdownTriggerProps, "ref"> {
  render: DropdownProps["trigger"];
  setNode: RefCallback<HTMLButtonElement>;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  bordered?: boolean;
  className?: string;
}

export type ControlSize = "sm" | "md";

export interface ControlStyleOptions {
  invalid?: boolean;
  className?: string;
}

export interface FormFieldProps {
  id: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type InputType = "text" | "email" | "password" | "number" | "search" | "url" | "tel";

export interface InputProps extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
  label?: string;
  type?: InputType;
  size?: ControlSize;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  disablePasswordToggle?: boolean;
  containerClassName?: string;
}

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  role?: "dialog" | "alertdialog";
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export interface PopoverPanelProps extends ComponentPropsWithRef<"div"> {
  side?: PopoverSide;
  align?: PopoverAlign;
}

export interface SelectOption<V extends string = string> {
  label: string;
  value: V;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectProps<V extends string = string> {
  label?: string;
  placeholder?: string;
  options: ReadonlyArray<SelectOption<V>>;
  value?: V | null;
  defaultValue?: V | null;
  onChange?: (value: V | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  clearable?: boolean;
  searchable?: boolean;
  size?: ControlSize;
  searchPlaceholder?: string;
  emptyMessage?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export type SkeletonVariant =
  | "text"
  | "circular"
  | "rectangle"
  | "card"
  | "avatar"
  | "button"
  | "custom";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  count?: number;
  rounded?: boolean;
  className?: string;
}

export interface SpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export type SwitchSize = "sm" | "md";

export interface SwitchProps {
  label?: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  id?: string;
  name?: string;
  "aria-label"?: string;
  className?: string;
}

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  autoResize?: boolean;
  maxRows?: number;
  containerClassName?: string;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastProps extends ToastData {
  onClose: (id: string) => void;
  className?: string;
}

export type ToastPosition = "top-right" | "top-center" | "bottom-right" | "bottom-center";

export interface ToastViewportProps {
  toasts: ReadonlyArray<ToastData>;
  onClose: (id: string) => void;
  position?: ToastPosition;
  label?: string;
  className?: string;
}

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
}
