import type { BadgeSize } from "@/app/components/ui/types";

export type TaskStatus = "pending" | "in_progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface SetTaskCompletedInput {
  id: string;
  completed: boolean;
}

export interface TaskMutationContext {
  previous?: Task[];
}

export interface TaskResponse {
  task: Task;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskCardProps {
  task: Task;
  onComplete?: (id: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onClick?: (task: Task) => void;
  actions?: "menu" | "inline";
  overdue?: boolean;
  now?: Date;
  locale?: string;
  className?: string;
}

export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
}

export type TaskFormField = keyof TaskFormValues;

export type TaskFormErrors = Partial<Record<TaskFormField | "form", string>>;

export interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onSaved?: (task: Task) => void;
}

export type TaskListFilter = "all" | TaskStatus;
