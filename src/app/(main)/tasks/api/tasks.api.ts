import { ENDPOINTS, httpClient } from "@/lib/http";
import type {
  CreateTaskInput,
  SetTaskCompletedInput,
  Task,
  TaskResponse,
  TasksResponse,
  UpdateTaskInput,
} from "../types";

export async function getTasks(signal?: AbortSignal): Promise<Task[]> {
  const { tasks } = await httpClient.get<TasksResponse>(ENDPOINTS.tasks.list, { signal });
  return tasks;
}

export async function getTask(id: string, signal?: AbortSignal): Promise<Task> {
  const { task } = await httpClient.get<TaskResponse>(ENDPOINTS.tasks.byId(id), { signal });
  return task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { task } = await httpClient.post<TaskResponse, CreateTaskInput>(ENDPOINTS.tasks.list, input);
  return task;
}

export async function updateTask({ id, ...input }: UpdateTaskInput): Promise<Task> {
  const { task } = await httpClient.patch<TaskResponse>(ENDPOINTS.tasks.byId(id), input);
  return task;
}

export async function completeTask(id: string): Promise<Task> {
  const { task } = await httpClient.patch<TaskResponse>(ENDPOINTS.tasks.complete(id));
  return task;
}

export function setTaskCompleted({ id, completed }: SetTaskCompletedInput): Promise<Task> {
  return completed ? completeTask(id) : updateTask({ id, status: "pending" });
}

export function deleteTask(id: string): Promise<void> {
  return httpClient.delete(ENDPOINTS.tasks.byId(id));
}
