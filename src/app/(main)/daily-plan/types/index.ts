import type { Task } from "@/app/(main)/tasks/types";

export type DailyPlanStatus = "active" | "completed";

export interface DailyPlanTask {
  taskId: string;
  order: number;
  note: string | null;
  task: Task | null;
}

export interface DailyPlan {
  id: string;
  date: string;
  status: DailyPlanStatus;
  tasks: DailyPlanTask[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyPlanTaskInput {
  taskId: string;
  note?: string;
}

export interface DailyPlansQuery {
  date?: string;
  from?: string;
  to?: string;
}

export interface CreateDailyPlanInput {
  date?: string;
  tasks?: DailyPlanTaskInput[];
}

export interface UpdateDailyPlanInput {
  id: string;
  date?: string;
  tasks?: DailyPlanTaskInput[];
}

export interface AddPlanTaskInput {
  planId: string;
  taskId: string;
  note?: string;
}

export interface RemovePlanTaskInput {
  planId: string;
  taskId: string;
}

export interface ReorderPlanTasksInput {
  planId: string;
  taskIds: string[];
}

export interface DeleteDailyPlanInput {
  id: string;
  date: string;
}

export interface DailyPlanResponse {
  plan: DailyPlan;
}

export interface DailyPlansResponse {
  plans: DailyPlan[];
}

export interface StoredPlanTask {
  taskId: string;
  order: number;
  note?: string;
}

export interface StoredDailyPlan {
  id: string;
  date: string;
  status: DailyPlanStatus;
  tasks: StoredPlanTask[];
  createdAt: string;
  updatedAt: string;
}

export interface ReorderContext {
  previous: DailyPlan | null | undefined;
}

export interface DateNavigatorProps {
  date: string;
  today: string;
  onChange: (date: string) => void;
}

export interface EmptyPlanProps {
  dateLabel: string;
  creating: boolean;
  onCreate: () => void;
}

export interface PlanProgressProps {
  completed: number;
  total: number;
}

export interface PlanTaskRowProps {
  item: DailyPlanTask;
  index: number;
  total: number;
  readOnly: boolean;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export interface AddTaskPickerProps {
  plan: DailyPlan;
  disabled: boolean;
  adding: boolean;
  onAdd: (taskId: string) => void;
}

export interface PlanViewProps {
  plan: DailyPlan;
  dateLabel: string;
}

export interface PlanErrorProps {
  message?: string;
  onRetry: () => void;
}
