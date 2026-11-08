import { ENDPOINTS, httpClient } from "@/lib/http";
import type { DashboardSummary, DashboardSummaryResponse, Weather, WeatherResponse } from "../types";

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const { summary } = await httpClient.get<DashboardSummaryResponse>(ENDPOINTS.dashboard.summary, {
    params: { timezone: browserTimeZone() },
    signal,
  });
  return summary;
}

export async function getWeather(signal?: AbortSignal): Promise<Weather> {
  const { weather } = await httpClient.get<WeatherResponse>(ENDPOINTS.dashboard.weather, {
    params: { timezone: browserTimeZone() },
    signal,
  });
  return weather;
}
