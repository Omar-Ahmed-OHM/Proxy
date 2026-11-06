import { Bell, CalendarCheck, CalendarDays, LayoutDashboard, ListChecks, NotebookPen, Settings, UserRound } from "lucide-react";
import type { NavItem } from "./types";

export const primaryNavigation: readonly NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, mobile: true },
  { label: "Tasks", href: "/tasks", icon: ListChecks, mobile: true },
  { label: "Reminders", href: "/reminders", icon: Bell, mobile: true },
  { label: "Daily Plan", href: "/daily-plan", icon: CalendarCheck },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, mobile: true },
  { label: "Notes", href: "/notes", icon: NotebookPen, mobile: true },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function isActiveRoute(href: string, pathname: string | null): boolean {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
