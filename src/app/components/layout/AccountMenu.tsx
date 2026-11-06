"use client";

import { useRouter } from "next/navigation";
import { UserMenu } from "@/app/components/shared/UserMenu";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useLogout } from "@/app/(auth)/hooks/useAuth";
import { useCurrentUser } from "@/app/(main)/profile/hooks/useCurrentUser";
import { cn } from "@/lib/cn";
import type { AccountMenuProps } from "./types";

export function AccountMenu({ variant, className }: AccountMenuProps) {
  const router = useRouter();
  const logout = useLogout();
  const { data: user, isPending, isError } = useCurrentUser();
  const isSidebar = variant === "sidebar";

  if (isPending) {
    return isSidebar ? (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-border p-2.5 md:justify-center md:border-transparent lg:justify-start lg:border-border", className)}>
        <Skeleton variant="avatar" className="size-10 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:hidden lg:flex">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="90%" />
        </div>
      </div>
    ) : (
      <Skeleton variant="avatar" className={cn("size-10", className)} />
    );
  }

  if (isError || !user) return null;

  return (
    <UserMenu
      variant={isSidebar ? "sidebar" : "avatar"}
      placement={isSidebar ? "top" : "bottom"}
      align={isSidebar ? "start" : "end"}
      user={{ name: user.name, email: user.email }}
      onProfile={() => router.push("/profile")}
      onSettings={() => router.push("/settings")}
      onLogout={logout}
      className={className}
    />
  );
}
