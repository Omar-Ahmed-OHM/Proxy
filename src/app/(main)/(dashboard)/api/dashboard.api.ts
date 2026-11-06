import { ENDPOINTS, httpClient } from "@/lib/http";
import type { DashboardSummary, Weather } from "../types";

export function getDashboardSummary(signal?: AbortSignal) {
  return httpClient.get<DashboardSummary>(ENDPOINTS.dashboard.summary, { signal });
}

export function getWeather(signal?: AbortSignal) {
  return httpClient.get<Weather>(ENDPOINTS.dashboard.weather, { signal });
}
