"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { DEFAULT_LOCALE, toISODate } from "@/lib/date";
import { useWeather } from "../hooks/useDashboard";
import type { WeatherCondition } from "../types";

const conditionIcons: Record<WeatherCondition, { icon: LucideIcon; label: string; className: string }> = {
  clear: { icon: Sun, label: "Clear", className: "text-warning drop-shadow-[0_0_12px_rgb(255_170_54/0.7)]" },
  "partly-cloudy": { icon: CloudSun, label: "Partly cloudy", className: "text-warning" },
  cloudy: { icon: Cloud, label: "Cloudy", className: "text-muted" },
  rain: { icon: CloudRain, label: "Rain", className: "text-secondary" },
  drizzle: { icon: CloudDrizzle, label: "Drizzle", className: "text-secondary" },
  thunderstorm: { icon: CloudLightning, label: "Thunderstorm", className: "text-primary-soft" },
  snow: { icon: CloudSnow, label: "Snow", className: "text-foreground" },
  fog: { icon: CloudFog, label: "Fog", className: "text-muted" },
  wind: { icon: Wind, label: "Windy", className: "text-accent" },
};

export function WeatherDateCard() {
  const now = useNow();
  const { data: weather, isPending, isError } = useWeather();
  const condition = weather ? conditionIcons[weather.condition] ?? conditionIcons.clear : null;
  const ConditionIcon = condition?.icon;
  const showWeather = !isError;

  return (
    <section
      aria-label="Weather and date"
      className="flex shrink-0 items-center gap-5 self-start rounded-card border border-border bg-card/70 px-5 py-4 shadow-card backdrop-blur-xl"
    >
      {showWeather && (
        <>
          {isPending || !weather || !condition || !ConditionIcon ? (
            <div className="flex items-center gap-3" aria-busy="true">
              <Skeleton variant="circular" className="size-10" />
              <div className="flex flex-col gap-1.5">
                <Skeleton variant="custom" className="h-5 w-14 rounded-md" />
                <Skeleton variant="text" className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ConditionIcon size={40} strokeWidth={1.75} aria-hidden="true" className={condition.className} />
              <div>
                <p className="text-xl font-semibold text-foreground tabular-nums sm:text-2xl">
                  {Math.round(weather.temperature)}°{weather.unit}
                  <span className="sr-only">, {condition.label}</span>
                </p>
                <p className="text-sm text-muted">
                  {weather.country ? `${weather.city}, ${weather.country}` : weather.city}
                </p>
              </div>
            </div>
          )}
          <span aria-hidden="true" className="h-12 w-px bg-border-strong" />
        </>
      )}
      {now ? (
        <time dateTime={toISODate(now)} className="block">
          <span className="block text-base font-semibold text-foreground sm:text-lg">
            {new Intl.DateTimeFormat(DEFAULT_LOCALE, { weekday: "long" }).format(now)}
          </span>
          <span className="block text-sm text-muted">
            {new Intl.DateTimeFormat(DEFAULT_LOCALE, { month: "short", day: "numeric", year: "numeric" }).format(now)}
          </span>
        </time>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="custom" className="h-5 w-20 rounded-md" />
          <Skeleton variant="text" className="h-3 w-24" />
        </div>
      )}
    </section>
  );
}
