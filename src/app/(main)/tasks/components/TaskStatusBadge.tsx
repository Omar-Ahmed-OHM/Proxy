import { CircleCheck, CircleDashed, LoaderCircle, type LucideIcon } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import type { BadgeVariant } from "@/app/components/ui/types";
import type { TaskStatus, TaskStatusBadgeProps } from "../types";

export const taskStatusConfig: Record<TaskStatus, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
  pending: { label: "Pending", variant: "default", icon: CircleDashed },
  in_progress: { label: "In progress", variant: "info", icon: LoaderCircle },
  completed: { label: "Completed", variant: "success", icon: CircleCheck },
};

export function TaskStatusBadge({ status, size = "md", showIcon = true, className }: TaskStatusBadgeProps) {
  const { label, variant, icon: Icon } = taskStatusConfig[status];

  return (
    <Badge
      variant={variant}
      size={size}
      pill
      icon={showIcon ? <Icon aria-hidden="true" /> : undefined}
      className={className}
    >
      {label}
    </Badge>
  );
}
