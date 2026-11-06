"use client";

import { Bell, CalendarDays, CircleCheck, Flame } from "lucide-react";
import { StatCard } from "@/app/components/shared/StatCard";
import { DEFAULT_LOCALE } from "@/lib/date";
import { useDashboardSummary } from "../hooks/useDashboard";
import type { DashboardStatConfig } from "../types";
import { WidgetError } from "./WidgetError";

const stats: ReadonlyArray<DashboardStatConfig> = [
  { key: "totalTasks", title: "Total Tasks", tone: "primary", icon: <CircleCheck aria-hidden="true" /> },
  { key: "upcomingReminders", title: "Upcoming Reminders", tone: "secondary", icon: <Bell aria-hidden="true" /> },
  { key: "tasksThisWeek", title: "This Week", tone: "success", icon: <CalendarDays aria-hidden="true" /> },
  { key: "dayStreak", title: "Day Streak", tone: "warning", icon: <Flame aria-hidden="true" /> },
];

const numberFormat = new Intl.NumberFormat(DEFAULT_LOCALE);

function formatTrend(trend: number): string {
  return `${Math.abs(Math.round(trend))}%`;
}

export function SummaryStats() {
  const { data, isPending, isError, error, refetch } = useDashboardSummary();

  if (isError) {
    return (
      <section aria-label="Summary" className="rounded-card border border-border bg-card">
        <WidgetError message={error.message} onRetry={() => void refetch()} />
      </section>
    );
  }

  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const entry = data?.[stat.key];
        return (
          <StatCard
            key={stat.key}
            title={stat.title}
            tone={stat.tone}
            icon={stat.icon}
            loading={isPending}
            value={entry ? numberFormat.format(entry.value) : "—"}
            trendValue={entry ? formatTrend(entry.trend) : undefined}
            trendDirection={!entry || entry.trend === 0 ? "neutral" : entry.trend > 0 ? "up" : "down"}
            sparkline={entry?.series}
          />
        );
      })}
    </section>
  );
}
