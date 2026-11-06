import { CalendarPlus, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { EmptyState } from "@/app/components/ui/EmptyState";
import type { EmptyPlanProps } from "../types";

export function EmptyPlan({ dateLabel, creating, onCreate }: EmptyPlanProps) {
  return (
    <Card>
      <EmptyState
        icon={<CalendarPlus aria-hidden="true" />}
        title={`No plan for ${dateLabel}`}
        description="Pick the tasks you want to focus on and put them in the order you'll tackle them."
        primaryAction={
          <Button loading={creating} onClick={onCreate} leftIcon={<Plus size={18} aria-hidden="true" />}>
            Create plan for this day
          </Button>
        }
      />
    </Card>
  );
}
