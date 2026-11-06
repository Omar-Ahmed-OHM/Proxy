"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  setTaskCompleted,
  updateTask,
} from "../api/tasks.api";
import type { SetTaskCompletedInput, Task, TaskMutationContext } from "../types";

export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

function replaceTask(tasks: Task[] | undefined, task: Task): Task[] | undefined {
  return tasks?.map((item) => (item.id === task.id ? task : item));
}

export function useTasks() {
  return useQuery({ queryKey: taskKeys.all, queryFn: ({ signal }) => getTasks(signal) });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: ({ signal }) => getTask(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) => (tasks ? [task, ...tasks] : tasks));
      return queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) => replaceTask(tasks, task));
      return queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeTask,
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) => replaceTask(tasks, task));
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, SetTaskCompletedInput, TaskMutationContext>({
    mutationFn: setTaskCompleted,
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.all);
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) =>
        tasks?.map((task) =>
          task.id === id ? { ...task, status: completed ? "completed" : "pending" } : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(taskKeys.all, context.previous);
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) => replaceTask(tasks, task));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, TaskMutationContext>({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.all);
      queryClient.setQueryData<Task[]>(taskKeys.all, (tasks) => tasks?.filter((task) => task.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(taskKeys.all, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
