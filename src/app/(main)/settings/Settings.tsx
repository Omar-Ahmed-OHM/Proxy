import { Settings as SettingsIcon } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/app/components/ui";

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your preferences." />
      <Card>
        <EmptyState
          icon={<SettingsIcon aria-hidden="true" />}
          title="Settings coming soon"
          description="Preferences and account options will live here."
        />
      </Card>
    </>
  );
}
