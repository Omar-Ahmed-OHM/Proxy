import type { Metadata } from "next";
import Tasks from "./Tasks";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <Tasks />;
}
