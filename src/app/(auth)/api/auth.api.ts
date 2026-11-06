import { ENDPOINTS, httpClient } from "@/lib/http";
import type { AuthResponse, LoginInput, RegisterInput } from "../types";

export function login(input: LoginInput) {
  return httpClient.post<AuthResponse, LoginInput>(ENDPOINTS.auth.login, input);
}

export function register(input: RegisterInput) {
  return httpClient.post<AuthResponse, RegisterInput>(ENDPOINTS.auth.register, input);
}
