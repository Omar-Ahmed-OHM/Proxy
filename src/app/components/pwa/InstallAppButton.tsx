"use client";

import { Download, Share, SquarePlus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { cn } from "@/lib/cn";
import { getInstallPlatform, promptInstall, subscribeInstall } from "./installStore";
import type { InstallAppButtonProps } from "./types";

export function InstallAppButton({ variant = "compact", className }: InstallAppButtonProps) {
  const platform = useSyncExternalStore(subscribeInstall, getInstallPlatform, () => "unsupported" as const);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  if (platform === "installed" || platform === "unsupported") return null;

  const handleClick = () => {
    if (platform === "ios") setIosHelpOpen(true);
    else void promptInstall();
  };

  return (
    <>
      {variant === "card" ? (
        <Button
          size="sm"
          variant="secondary"
          fullWidth
          leftIcon={<Download size={16} aria-hidden="true" />}
          onClick={handleClick}
          className={className}
        >
          Install app
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-xl border border-primary/40 bg-primary/15 px-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/25",
            className,
          )}
        >
          <Download size={16} aria-hidden="true" />
          <span>Install</span>
        </button>
      )}

      <Modal
        open={iosHelpOpen}
        onClose={() => setIosHelpOpen(false)}
        title="ثبّت Proxy على الآيفون"
        description="خطوتين بس من Safari:"
        size="sm"
        footer={<Button onClick={() => setIosHelpOpen(false)}>تمام</Button>}
      >
        <ol dir="rtl" className="flex flex-col gap-3 text-sm text-foreground">
          <li className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-elevated text-secondary">
              <Share size={18} aria-hidden="true" />
            </span>
            دوس على زرار المشاركة تحت في Safari.
          </li>
          <li className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-elevated text-secondary">
              <SquarePlus size={18} aria-hidden="true" />
            </span>
            اختار «Add to Home Screen» وبعدين «Add».
          </li>
        </ol>
      </Modal>
    </>
  );
}
