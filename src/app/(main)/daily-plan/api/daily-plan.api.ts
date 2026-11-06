import { ENDPOINTS, httpClient } from "@/lib/http";
import type {
  AddPlanTaskInput,
  CreateDailyPlanInput,
  DailyPlan,
  DailyPlanResponse,
  DailyPlansQuery,
  DailyPlansResponse,
  RemovePlanTaskInput,
  ReorderPlanTasksInput,
  UpdateDailyPlanInput,
} from "../types";

export async function getDailyPlans(query: DailyPlansQuery, signal?: AbortSignal): Promise<DailyPlan[]> {
  const { plans } = await httpClient.get<DailyPlansResponse>(ENDPOINTS.dailyPlans.list, {
    params: { ...query },
    signal,
  });
  return plans;
}

export async function getDailyPlanByDate(date: string, signal?: AbortSignal): Promise<DailyPlan | null> {
  const plans = await getDailyPlans({ date }, signal);
  return plans[0] ?? null;
}

export async function getDailyPlan(id: string, signal?: AbortSignal): Promise<DailyPlan> {
  const { plan } = await httpClient.get<DailyPlanResponse>(ENDPOINTS.dailyPlans.byId(id), { signal });
  return plan;
}

export async function createDailyPlan(input: CreateDailyPlanInput): Promise<DailyPlan> {
  const { plan } = await httpClient.post<DailyPlanResponse, CreateDailyPlanInput>(ENDPOINTS.dailyPlans.list, input);
  return plan;
}

export async function updateDailyPlan({ id, ...input }: UpdateDailyPlanInput): Promise<DailyPlan> {
  const { plan } = await httpClient.patch<DailyPlanResponse>(ENDPOINTS.dailyPlans.byId(id), input);
  return plan;
}

export async function addTaskToPlan({ planId, ...input }: AddPlanTaskInput): Promise<DailyPlan> {
  const { plan } = await httpClient.post<DailyPlanResponse>(ENDPOINTS.dailyPlans.tasks(planId), input);
  return plan;
}

export async function removeTaskFromPlan({ planId, taskId }: RemovePlanTaskInput): Promise<DailyPlan> {
  const { plan } = await httpClient.delete<DailyPlanResponse>(ENDPOINTS.dailyPlans.task(planId, taskId));
  return plan;
}

export async function reorderPlanTasks({ planId, taskIds }: ReorderPlanTasksInput): Promise<DailyPlan> {
  const { plan } = await httpClient.patch<DailyPlanResponse>(ENDPOINTS.dailyPlans.reorder(planId), { taskIds });
  return plan;
}

export async function completeDailyPlan(id: string): Promise<DailyPlan> {
  const { plan } = await httpClient.patch<DailyPlanResponse>(ENDPOINTS.dailyPlans.complete(id));
  return plan;
}

export function deleteDailyPlan(id: string): Promise<void> {
  return httpClient.delete(ENDPOINTS.dailyPlans.byId(id));
}
