import { NotebookPen } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/app/components/ui";

export default function Notes() {
  return (
    <>
      <PageHeader title="Notes" description="Capture ideas and reference material." />
      <Card>
        <EmptyState
          icon={<NotebookPen aria-hidden="true" />}
          title="No notes yet"
          description="Notes you write will appear here."
        />
      </Card>
    </>
  );
}
