"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { useDeleteAccount } from "../hooks/useProfile";
import { FormStatus } from "./FormStatus";

export function DangerZone() {
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Delete account</p>
        <p className="text-sm text-muted">Permanently remove your account and all of its data.</p>
        <div className="mt-2">
          <FormStatus
            message={deleteAccount.isError ? deleteAccount.error.message || "Couldn't delete your account" : null}
            tone="danger"
          />
        </div>
      </div>
      <Button
        variant="danger"
        leftIcon={<Trash2 size={16} aria-hidden="true" />}
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        Delete account
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteAccount.mutate(undefined, { onSettled: () => setOpen(false) })}
        title="Delete your account?"
        description="This permanently deletes your profile, tasks, reminders and plans. This can't be undone."
        confirmText="Delete account"
        variant="danger"
        loading={deleteAccount.isPending}
      />
    </div>
  );
}
