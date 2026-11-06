import type { NotificationType } from "@/app/components/shared/types";

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  type?: NotificationType;
  read: boolean;
  createdAt: string;
  href?: string;
}
