import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import type { PlanErrorProps } from "../types";

export function PlanError({ message, onRetry }: PlanErrorProps) {
  return (
    <Card>
      <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
          <CircleAlert size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">Couldn&apos;t load this plan</p>
          {message && <p className="mt-1 text-sm text-muted">{message}</p>}
        </div>
        <Button variant="secondary" onClick={onRetry} leftIcon={<RotateCw size={16} aria-hidden="true" />}>
          Try again
        </Button>
      </div>
    </Card>
  );
}
