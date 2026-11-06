"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http";
import {
  addTaskToPlan,
  completeDailyPlan,
  createDailyPlan,
  deleteDailyPlan,
  getDailyPlanByDate,
  getDailyPlans,
  removeTaskFromPlan,
  reorderPlanTasks,
} from "../api/daily-plan.api";
import type {
  CreateDailyPlanInput,
  DailyPlan,
  DailyPlansQuery,
  DeleteDailyPlanInput,
  ReorderContext,
  ReorderPlanTasksInput,
} from "../types";

export const dailyPlanKeys = {
  all: ["daily-plans"] as const,
  list: (query: DailyPlansQuery) => ["daily-plans", "list", query] as const,
  byDate: (date: string) => ["daily-plans", "date", date] as const,
};

function storePlan(queryClient: QueryClient, plan: DailyPlan) {
  queryClient.setQueryData(dailyPlanKeys.byDate(plan.date), plan);
  return queryClient.invalidateQueries({ queryKey: [...dailyPlanKeys.all, "list"] });
}

export function useDailyPlans(query: DailyPlansQuery) {
  return useQuery({
    queryKey: dailyPlanKeys.list(query),
    queryFn: ({ signal }) => getDailyPlans(query, signal),
  });
}

export function useDailyPlan(date: string | null) {
  return useQuery({
    queryKey: dailyPlanKeys.byDate(date ?? ""),
    queryFn: ({ signal }) => getDailyPlanByDate(date ?? "", signal),
    enabled: Boolean(date),
  });
}

export function useCreateDailyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyPlanInput) => createDailyPlan(input),
    onSuccess: (plan) => storePlan(queryClient, plan),
    onError: (error, input) => {
      if (error instanceof ApiError && error.code === "DAILY_PLAN_ALREADY_EXISTS" && input.date) {
        return queryClient.invalidateQueries({ queryKey: dailyPlanKeys.byDate(input.date) });
      }
    },
  });
}

export function useAddTaskToPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTaskToPlan,
    onSuccess: (plan) => storePlan(queryClient, plan),
  });
}

export function useRemoveTaskFromPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTaskFromPlan,
    onSuccess: (plan) => storePlan(queryClient, plan),
  });
}

export function useReorderPlanTasks(date: string) {
  const queryClient = useQueryClient();
  const key = dailyPlanKeys.byDate(date);

  return useMutation<DailyPlan, Error, ReorderPlanTasksInput, ReorderContext>({
    mutationFn: reorderPlanTasks,
    onMutate: async ({ taskIds }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DailyPlan | null>(key);
      if (previous) {
        const byId = new Map(previous.tasks.map((item) => [item.taskId, item]));
        const tasks = taskIds.flatMap((id, index) => {
          const item = byId.get(id);
          return item ? [{ ...item, order: index + 1 }] : [];
        });
        queryClient.setQueryData<DailyPlan>(key, { ...previous, tasks });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (plan) => storePlan(queryClient, plan),
  });
}

export function useCompleteDailyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeDailyPlan,
    onSuccess: (plan) => storePlan(queryClient, plan),
  });
}

export function useDeleteDailyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: DeleteDailyPlanInput) => deleteDailyPlan(id),
    onSuccess: (_result, { date }) => {
      queryClient.setQueryData(dailyPlanKeys.byDate(date), null);
      return queryClient.invalidateQueries({ queryKey: [...dailyPlanKeys.all, "list"] });
    },
  });
}
