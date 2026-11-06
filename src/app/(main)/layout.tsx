import { AppShell } from "@/app/components/layout/AppShell";
import { DailyBriefing } from "@/app/components/assistant/DailyBriefing";
import { ReminderAlerts } from "./reminders/components/ReminderAlerts";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <ReminderAlerts />
      <DailyBriefing />
    </>
  );
}
