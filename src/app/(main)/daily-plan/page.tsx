import type { Metadata } from "next";
import DailyPlan from "./DailyPlan";

export const metadata: Metadata = { title: "Daily Plan" };

export default function DailyPlanPage() {
  return <DailyPlan />;
}
