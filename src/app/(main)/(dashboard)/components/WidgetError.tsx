import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import type { WidgetErrorProps } from "../types";

export function WidgetError({ message, onRetry }: WidgetErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-danger/10 text-danger">
        <CircleAlert size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">Couldn&apos;t load this section</p>
        {message && <p className="mt-0.5 text-xs text-muted">{message}</p>}
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RotateCw size={14} aria-hidden="true" />}>
        Try again
      </Button>
    </div>
  );
}
