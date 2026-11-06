import type { Metadata } from "next";
import Reminders from "./Reminders";

export const metadata: Metadata = { title: "Reminders" };

export default function RemindersPage() {
  return <Reminders />;
}
