export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
  },
  users: {
    me: "/users/me",
    password: "/users/me/password",
  },
  tasks: {
    list: "/tasks",
    byId: (id: string) => `/tasks/${id}`,
    complete: (id: string) => `/tasks/${id}/complete`,
  },
  reminders: {
    list: "/reminders",
    byId: (id: string) => `/reminders/${id}`,
    complete: (id: string) => `/reminders/${id}/complete`,
    cancel: (id: string) => `/reminders/${id}/cancel`,
  },
  dailyPlans: {
    list: "/daily-plans",
    byId: (id: string) => `/daily-plans/${id}`,
    complete: (id: string) => `/daily-plans/${id}/complete`,
    tasks: (id: string) => `/daily-plans/${id}/tasks`,
    task: (id: string, taskId: string) => `/daily-plans/${id}/tasks/${taskId}`,
    reorder: (id: string) => `/daily-plans/${id}/tasks/reorder`,
  },
  notes: {
    list: "/notes",
    byId: (id: string) => `/notes/${id}`,
  },
  calendar: {
    events: "/calendar/events",
    eventById: (id: string) => `/calendar/events/${id}`,
  },
  notifications: {
    list: "/notifications",
    read: (id: string) => `/notifications/${id}/read`,
    readAll: "/notifications/read-all",
  },
  dashboard: {
    summary: "/dashboard/summary",
    weather: "/dashboard/weather",
  },
  settings: {
    root: "/settings",
  },
  assistant: {
    messages: "/assistant/messages",
    briefing: "/assistant/briefing",
  },
} as const;
