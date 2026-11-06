import { ENDPOINTS, httpClient } from "@/lib/http";
import type { ChangePasswordInput, UpdateProfileInput, UserResponse } from "../types";

export async function getCurrentUser(signal?: AbortSignal) {
  const { user } = await httpClient.get<UserResponse>(ENDPOINTS.users.me, { signal });
  return user;
}

export async function updateProfile(input: UpdateProfileInput) {
  const { user } = await httpClient.patch<UserResponse, UpdateProfileInput>(ENDPOINTS.users.me, input);
  return user;
}

export function changePassword(input: ChangePasswordInput) {
  return httpClient.put<void, ChangePasswordInput>(ENDPOINTS.users.password, input);
}

export function deleteAccount() {
  return httpClient.delete(ENDPOINTS.users.me);
}
