import type { Metadata } from "next";
import Notes from "./Notes";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return <Notes />;
}
