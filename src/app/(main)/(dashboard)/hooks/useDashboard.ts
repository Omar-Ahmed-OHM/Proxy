"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getWeather } from "../api/dashboard.api";

export const dashboardKeys = {
  summary: ["dashboard", "summary"] as const,
  weather: ["dashboard", "weather"] as const,
};

export function useDashboardSummary() {
  return useQuery({ queryKey: dashboardKeys.summary, queryFn: ({ signal }) => getDashboardSummary(signal) });
}

export function useWeather() {
  return useQuery({
    queryKey: dashboardKeys.weather,
    queryFn: ({ signal }) => getWeather(signal),
    staleTime: 15 * 60_000,
  });
}
