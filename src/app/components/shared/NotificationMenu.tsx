"use client";

import { Bell, BellOff, CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PopoverPanel } from "@/app/components/ui/PopoverPanel";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/lib/cn";
import { formatRelativeTime, toDate } from "@/lib/date";
import type { NotificationType, NotificationMenuProps } from "./types";

const typeStyles: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  info: { icon: Info, className: "bg-secondary/10 text-secondary" },
  success: { icon: CircleCheck, className: "bg-success/10 text-success" },
  warning: { icon: TriangleAlert, className: "bg-warning/10 text-warning" },
  danger: { icon: CircleAlert, className: "bg-danger/10 text-danger" },
};

export function NotificationMenu({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onViewAll,
  loading = false,
  open,
  onOpenChange,
  locale,
  className,
}: NotificationMenuProps) {
  const panelId = useId();
  const headingId = useId();
  const {
    open: isOpen,
    side: panelSide,
    align: panelAlign,
    containerRef,
    triggerRef,
    close: closePopover,
    toggle: togglePopover,
  } = usePopover({ open, onOpenChange, align: "end", estimatedHeight: 440, estimatedWidth: 360 });
  const unread = unreadCount ?? notifications.filter((notification) => !notification.read).length;
  const badgeLabel = unread > 99 ? "99+" : String(unread);

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <Button
        ref={triggerRef}
        variant="ghost"
        iconOnly
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={togglePopover}
        className={cn(isOpen && "bg-elevated text-foreground")}
      >
        <Bell size={20} aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-danger px-1 text-[0.625rem] leading-none font-bold text-canvas ring-2 ring-canvas"
          >
            {badgeLabel}
          </span>
        )}
      </Button>

      {isOpen && (
        <PopoverPanel
          id={panelId}
          role="dialog"
          aria-labelledby={headingId}
          side={panelSide}
          align={panelAlign}
          className="flex max-h-[min(32rem,calc(100dvh-6rem))] w-[22rem] flex-col"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 id={headingId} className="text-sm font-semibold text-foreground">
              Notifications
              {unread > 0 && <span className="ml-1.5 text-muted">({unread})</span>}
            </h2>
            {onMarkAllRead && unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="rounded-md text-xs font-medium text-primary-soft transition-colors hover:text-foreground"
              >
                Mark all as read
              </button>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5" aria-busy={loading || undefined}>
            {loading ? (
              <div className="flex flex-col gap-4 p-2.5">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton variant="custom" className="size-9 shrink-0 rounded-lg" />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                      <Skeleton variant="text" className="w-3/4" />
                      <Skeleton variant="text" className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                bordered={false}
                icon={<BellOff aria-hidden="true" />}
                title="No notifications"
                description="You're all caught up."
                className="py-8"
              />
            ) : (
              <ul className="flex flex-col gap-0.5">
                {notifications.map((notification) => {
                  const styles = typeStyles[notification.type ?? "info"];
                  const TypeIcon = styles.icon;
                  const timestamp = toDate(notification.timestamp);
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => onNotificationClick?.(notification)}
                        className={cn(
                          "relative flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-elevated-hover",
                          !notification.read && "bg-primary/[0.06]",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4.5",
                            styles.className,
                          )}
                        >
                          {notification.icon ?? <TypeIcon />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            dir="auto"
                            className={cn(
                              "block text-sm break-words",
                              notification.read ? "text-muted" : "font-medium text-foreground",
                            )}
                          >
                            {notification.title}
                          </span>
                          {notification.description && (
                            <span dir="auto" className="mt-0.5 line-clamp-2 block text-xs text-muted">
                              {notification.description}
                            </span>
                          )}
                          <time
                            dateTime={timestamp.toISOString()}
                            className="mt-1 block text-[0.6875rem] text-muted/80"
                          >
                            {formatRelativeTime(timestamp, locale)}
                          </time>
                        </span>
                        {!notification.read && (
                          <>
                            <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" />
                            <span className="sr-only">Unread</span>
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {onViewAll && (
            <footer className="border-t border-border p-1.5">
              <button
                type="button"
                onClick={() => {
                  onViewAll();
                  closePopover();
                }}
                className="h-10 w-full rounded-lg text-sm font-medium text-primary-soft transition-colors hover:bg-elevated-hover hover:text-foreground"
              >
                View all notifications
              </button>
            </footer>
          )}
        </PopoverPanel>
      )}
    </div>
  );
}
