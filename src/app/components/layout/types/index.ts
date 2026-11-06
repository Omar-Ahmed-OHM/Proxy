import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export type NavLayout = "sidebar" | "bar";

export interface ActiveNavProps {
  layout: NavLayout;
}

export interface AppShellProps {
  children: ReactNode;
}

export interface BrandProps {
  collapsible?: boolean;
  className?: string;
}

export interface NavItemsProps {
  layout: NavLayout;
  pathname: string | null;
}

export interface PrimaryNavProps {
  layout: NavLayout;
  className?: string;
}

export type AccountMenuVariant = "sidebar" | "header";

export interface AccountMenuProps {
  variant: AccountMenuVariant;
  className?: string;
}

export interface PromoCardProps {
  className?: string;
}

export interface HeaderSearchProps {
  className?: string;
}

export interface HeaderNotificationsProps {
  className?: string;
}
