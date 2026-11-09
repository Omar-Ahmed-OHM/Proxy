"use client";

import { AlarmClock, BellRing, Hourglass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReminderNotifications } from "@/app/(main)/reminders/hooks/useReminderNotifications";
import { NotificationMenu } from "@/app/components/shared/NotificationMenu";
import type { NotificationItem } from "@/app/components/shared/types";
import type { HeaderNotificationsProps } from "./types";

export function HeaderNotifications({ className }: HeaderNotificationsProps) {
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isPending,
    markSeen,
    markAllSeen,
  } = useReminderNotifications();

  const items: NotificationItem[] = notifications.map(
    ({ key, title, description, at, kind, read }) => ({
      id: key,
      title,
      description:
        description ??
        (kind === "heads-up"
          ? "فاضل ربع ساعة أو أقل على الميعاد"
          : kind === "due"
            ? "جه ميعاد التذكير ده"
            : "تذكير جاي قريب"),
      timestamp: at,
      read,
      type: kind === "upcoming" ? "info" : "warning",
      icon:
        kind === "heads-up" ? (
          <Hourglass aria-hidden="true" />
        ) : kind === "due" ? (
          <BellRing aria-hidden="true" />
        ) : (
          <AlarmClock aria-hidden="true" />
        ),
    })
  );

  const handleClick = (item: NotificationItem) => {
    if (!item.read) {
      markSeen([item.id]);
    }

    router.push(
      item.id.startsWith("pre:task:")
        ? "/tasks"
        : "/reminders"
    );
  };

  return (
    <div className="relative min-w-0">
      <NotificationMenu
        notifications={items}
        unreadCount={unreadCount}
        loading={isPending}
        onNotificationClick={handleClick}
        onMarkAllRead={unreadCount > 0 ? markAllSeen : undefined}
        onViewAll={() => router.push("/reminders")}
        className={className}
      />
    </div>
  );
}
