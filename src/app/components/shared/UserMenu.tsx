"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/app/components/ui/Avatar";
import { Dropdown } from "@/app/components/ui/Dropdown";
import type { DropdownItem } from "@/app/components/ui/types";
import { cn } from "@/lib/cn";
import type { UserMenuProps } from "./types";

export function UserMenu({
  user,
  variant = "default",
  placement = "bottom",
  onProfile,
  onSettings,
  onLogout,
  align = "end",
  className,
}: UserMenuProps) {
  const items: DropdownItem[] = [
    ...(onProfile
      ? [{ label: "Profile", value: "profile", icon: <UserRound />, onSelect: onProfile }]
      : []),
    ...(onSettings
      ? [{ label: "Settings", value: "settings", icon: <Settings />, onSelect: onSettings }]
      : []),
    ...(onLogout
      ? [
          ...(onProfile || onSettings ? [{ separator: true as const, value: "separator" }] : []),
          { label: "Log out", value: "logout", icon: <LogOut />, danger: true, onSelect: onLogout },
        ]
      : []),
  ];
  const isSidebar = variant === "sidebar";
  const avatarOnly = variant === "avatar";

  return (
    <Dropdown
      align={align}
      placement={placement}
      items={items}
      menuLabel="Account"
      className={cn(isSidebar && "flex w-full", className)}
      header={
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {user.role && <p className="mt-0.5 truncate text-xs text-primary-soft">{user.role}</p>}
          </div>
        </div>
      }
      trigger={(props) =>
        isSidebar ? (
          <button
            {...props}
            type="button"
            aria-label={`Account menu for ${user.name}`}
            className={cn(
              "group flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-card/70 p-2.5 text-left transition-colors",
              "hover:border-border-strong hover:bg-elevated aria-expanded:border-border-strong aria-expanded:bg-elevated",
              "md:justify-center md:border-transparent md:bg-transparent md:p-1.5 lg:justify-start lg:border-border lg:bg-card/70 lg:p-2.5",
            )}
          >
            <Avatar src={user.avatar} name={user.name} size="md" />
            <span className="min-w-0 flex-1 md:hidden lg:block">
              <span className="block truncate text-sm font-semibold text-foreground">{user.name}</span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="shrink-0 text-muted transition-transform md:hidden lg:block group-aria-expanded:rotate-180"
            />
          </button>
        ) : (
          <button
            {...props}
            type="button"
            aria-label={`Account menu for ${user.name}`}
            className={cn(
              "group flex h-11 max-w-56 items-center gap-2.5 border border-transparent transition-colors",
              avatarOnly ? "rounded-full p-0.5" : "rounded-xl pr-2 pl-1.5",
              "hover:border-border hover:bg-elevated aria-expanded:border-border aria-expanded:bg-elevated",
            )}
          >
            <Avatar src={user.avatar} name={user.name} size={avatarOnly ? "md" : "sm"} ring={avatarOnly} />
            <span className={cn("hidden min-w-0 text-left", !avatarOnly && "md:block")}>
              <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
              {user.role && <span className="block truncate text-xs text-muted">{user.role}</span>}
            </span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn(
                "hidden shrink-0 text-muted transition-transform group-aria-expanded:rotate-180",
                !avatarOnly && "md:block",
              )}
            />
          </button>
        )
      }
    />
  );
}
