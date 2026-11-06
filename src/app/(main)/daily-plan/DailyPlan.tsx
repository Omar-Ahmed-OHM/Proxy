"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useNow } from "@/hooks/useNow";
import { toISODate } from "@/lib/date";
import { DateNavigator, formatPlanDate, relativeDayLabel } from "./components/DateNavigator";
import { EmptyPlan } from "./components/EmptyPlan";
import { PlanError } from "./components/PlanError";
import { PlanView } from "./components/PlanView";
import { useCreateDailyPlan, useDailyPlan } from "./hooks/useDailyPlans";

function PlanSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Loading plan">
      <div className="flex flex-col gap-4">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="custom" className="h-2.5 w-full rounded-full" />
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="custom" className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </Card>
  );
}

export default function DailyPlan() {
  const now = useNow();
  const today = now ? toISODate(now) : null;
  const [selected, setSelected] = useState<string | null>(null);
  const date = selected ?? today;
  const { data: plan, isPending, isError, error, refetch } = useDailyPlan(date);
  const createPlan = useCreateDailyPlan();

  const dateLabel = date && today ? (relativeDayLabel(date, today)?.toLowerCase() ?? formatPlanDate(date)) : "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Daily Plan" description="Decide what matters today and work through it in order." />

      {date && today ? (
        <DateNavigator date={date} today={today} onChange={setSelected} />
      ) : (
        <Skeleton variant="custom" className="h-[4.75rem] w-full rounded-card" />
      )}

      {!date || isPending ? (
        <PlanSkeleton />
      ) : isError ? (
        <PlanError message={error.message} onRetry={() => void refetch()} />
      ) : plan ? (
        <PlanView key={plan.id} plan={plan} dateLabel={dateLabel} />
      ) : (
        <>
          <EmptyPlan
            dateLabel={dateLabel}
            creating={createPlan.isPending}
            onCreate={() => createPlan.mutate({ date })}
          />
          {createPlan.isError && (
            <p role="alert" className="text-center text-sm text-danger">
              {createPlan.error.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
