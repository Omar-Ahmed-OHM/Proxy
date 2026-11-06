import { CalendarDays } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/app/components/ui";

export default function Calendar() {
  return (
    <>
      <PageHeader title="Calendar" description="See your schedule." />
      <Card>
        <EmptyState
          icon={<CalendarDays aria-hidden="true" />}
          title="No events scheduled"
          description="Events will appear here once your calendar is set up."
        />
      </Card>
    </>
  );
}
