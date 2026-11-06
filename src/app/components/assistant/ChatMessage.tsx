import { CircleAlert, Check, Clock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_LOCALE, toDate } from "@/lib/date";
import type { ChatMessageStatus, ChatMessageProps } from "./types";

const statusDetails: Record<ChatMessageStatus, { label: string; icon: ReactNode; className: string }> = {
  sending: { label: "Sending", icon: <Clock size={12} aria-hidden="true" />, className: "text-muted" },
  sent: { label: "Sent", icon: <Check size={12} aria-hidden="true" />, className: "text-muted" },
  error: { label: "Failed to send", icon: <CircleAlert size={12} aria-hidden="true" />, className: "text-danger" },
};

export function TypingIndicator() {
  return (
    <span className="flex h-5 items-center gap-1" role="status">
      <span className="sr-only">Assistant is typing</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="size-1.5 animate-typing rounded-full bg-primary-soft"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export function ChatMessage({
  role,
  content = "",
  timestamp,
  avatar,
  loading = false,
  status,
  locale = DEFAULT_LOCALE,
  className,
}: ChatMessageProps) {
  const isUser = role === "user";
  const date = timestamp ? toDate(timestamp) : null;
  const statusInfo = status ? statusDetails[status] : null;
  const defaultAvatar = isUser ? null : (
    <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-primary to-secondary text-white">
      <Sparkles size={15} aria-hidden="true" />
    </span>
  );
  const avatarNode = avatar ?? defaultAvatar;

  return (
    <div className={cn("flex w-full items-end gap-2.5", isUser ? "flex-row-reverse" : "flex-row", className)}>
      {avatarNode && <div className="shrink-0 self-end">{avatarNode}</div>}
      <div className={cn("flex max-w-[85%] min-w-0 flex-col gap-1 sm:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <span className="sr-only">{isUser ? "You said:" : "Assistant said:"}</span>
        <div
          dir="auto"
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
            isUser
              ? "rounded-br-md border border-primary/30 bg-linear-to-br from-primary/30 to-primary-end/20 text-foreground"
              : "rounded-bl-md border border-border bg-elevated text-foreground",
            status === "error" && "border-danger/40",
          )}
        >
          {loading ? <TypingIndicator /> : content}
        </div>
        {(date || statusInfo) && !loading && (
          <div className="flex items-center gap-1.5 px-1 text-[0.6875rem] text-muted/80">
            {date && (
              <time dateTime={date.toISOString()} suppressHydrationWarning>
                {new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date)}
              </time>
            )}
            {statusInfo && (
              <span className={cn("inline-flex items-center gap-1", statusInfo.className)}>
                {date && <span aria-hidden="true">·</span>}
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
