"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AvatarSize, AvatarStatus, AvatarProps } from "./types";

const sizeClasses: Record<AvatarSize, { box: string; text: string; icon: number; status: string }> = {
  xs: { box: "size-6", text: "text-[0.625rem]", icon: 12, status: "size-2 ring-[1.5px]" },
  sm: { box: "size-8", text: "text-xs", icon: 14, status: "size-2.5 ring-2" },
  md: { box: "size-10", text: "text-sm", icon: 18, status: "size-3 ring-2" },
  lg: { box: "size-12", text: "text-base", icon: 22, status: "size-3.5 ring-2" },
  xl: { box: "size-16", text: "text-xl", icon: 28, status: "size-4 ring-[3px]" },
};

const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-muted",
  busy: "bg-danger",
  away: "bg-warning",
};

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status = "offline",
  showStatus = false,
  ring = false,
  className,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  const initials = name ? getInitials(name) : "";
  const styles = sizeClasses[size];
  const accessibleName = alt ?? name ?? "User avatar";

  return (
    <span
      role="img"
      aria-label={showStatus ? `${accessibleName} (${status})` : accessibleName}
      className={cn("relative inline-flex shrink-0", className)}
    >
      <span
        className={cn(
          "grid place-items-center overflow-hidden rounded-full border border-border-strong bg-linear-to-br from-primary/40 to-secondary/30 font-semibold text-foreground",
          ring && "ring-2 ring-primary/70 ring-offset-2 ring-offset-canvas",
          styles.box,
          styles.text,
        )}
      >
        {showImage && src ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary user content
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            ref={(node) => {
              if (node?.complete && node.naturalWidth === 0) setFailedSrc(src);
            }}
            onError={() => setFailedSrc(src)}
          />
        ) : initials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <User size={styles.icon} aria-hidden="true" />
        )}
      </span>
      {showStatus && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-0 bottom-0 rounded-full ring-canvas",
            styles.status,
            statusClasses[status],
          )}
        />
      )}
    </span>
  );
}
