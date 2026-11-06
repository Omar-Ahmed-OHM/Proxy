"use client";

import { CalendarDays } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { MonthCalendar } from "./MonthCalendar";

export function CalendarWidget() {
  const now = useNow();

  if (!now) {
    return (
      <Card title="Calendar" icon={<CalendarDays aria-hidden="true" />} className="h-full" aria-busy="true">
        <Skeleton variant="text" className="mx-auto mb-3 w-24" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }, (_, index) => (
            <Skeleton key={index} variant="circular" className="mx-auto size-7" />
          ))}
        </div>
      </Card>
    );
  }

  return <MonthCalendar now={now} />;
}
