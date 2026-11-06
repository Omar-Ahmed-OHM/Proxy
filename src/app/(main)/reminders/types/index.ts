export type ReminderStatus = "pending" | "completed" | "cancelled";

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  remindAt: string;
  remindAtLocal: string;
  timezone: string;
  status: ReminderStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  remindAt: string;
  timezone?: string;
}

export interface UpdateReminderInput {
  id: string;
  title?: string;
  description?: string | null;
  remindAt?: string;
  timezone?: string;
}

export interface ReminderListParams {
  status?: ReminderStatus;
}

export interface ReminderResponse {
  reminder: Reminder;
}

export interface RemindersResponse {
  reminders: Reminder[];
}

export interface ReminderMutationContext {
  previous: Array<[readonly unknown[], Reminder[] | undefined]>;
}

export type ReminderFilter = "all" | ReminderStatus;

export interface ReminderCardProps {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  onComplete?: (reminder: Reminder) => void;
  onCancel?: (reminder: Reminder) => void;
  onClick?: (reminder: Reminder) => void;
  upcoming?: boolean;
  busy?: boolean;
  locale?: string;
  className?: string;
}

export interface ReminderFormDialogProps {
  open: boolean;
  reminder?: Reminder | null;
  onClose: () => void;
}

export interface ReminderFormErrors {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  form?: string;
}

export interface ReminderQueryOptions {
  refetchInterval?: number;
}

export type HeadsUpSource = "task" | "reminder";

export interface HeadsUpItem {
  key: string;
  title: string;
  at: number;
  source: HeadsUpSource;
}

export type ReminderNotificationKind = "due" | "upcoming" | "heads-up";

export interface ReminderNotification {
  key: string;
  title: string;
  description: string | null;
  at: string;
  kind: ReminderNotificationKind;
  read: boolean;
}

export interface ReminderNotifications {
  notifications: ReminderNotification[];
  unreadCount: number;
  isPending: boolean;
  markSeen: (keys: ReadonlyArray<string>) => void;
  markAllSeen: () => void;
}
