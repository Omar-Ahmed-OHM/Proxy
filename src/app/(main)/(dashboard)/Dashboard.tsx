import { AssistantBanner } from "./components/AssistantBanner";
import { CalendarWidget } from "./components/CalendarWidget";
import { Greeting } from "./components/Greeting";
import { RemindersWidget } from "./components/RemindersWidget";
import { SummaryStats } from "./components/SummaryStats";
import { TasksWidget } from "./components/TasksWidget";
import { WeatherDateCard } from "./components/WeatherDateCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <Greeting />
        <WeatherDateCard />
      </div>

      <SummaryStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <TasksWidget />
        </div>
        <CalendarWidget />
        <RemindersWidget />
      </div>

      <AssistantBanner />
    </div>
  );
}
