import { ArrowDown, ArrowUp, Equal, type LucideIcon } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import type { BadgeVariant } from "@/app/components/ui/types";
import type { TaskPriority, TaskPriorityBadgeProps } from "../types";

export const taskPriorityConfig: Record<
  TaskPriority,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  low: { label: "Low", variant: "accent", icon: ArrowDown },
  medium: { label: "Medium", variant: "warning", icon: Equal },
  high: { label: "High", variant: "danger", icon: ArrowUp },
};

export function TaskPriorityBadge({ priority, size = "md", showIcon = true, className }: TaskPriorityBadgeProps) {
  const config = taskPriorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? <Icon aria-hidden="true" /> : undefined}
      className={className}
    >
      <span className="sr-only">Priority: </span>
      {config.label}
    </Badge>
  );
}
