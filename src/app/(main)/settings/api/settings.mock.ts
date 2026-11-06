import { ENDPOINTS, mockReply, type MockRoute } from "@/lib/http";
import type { UpdateSettingsInput, UserSettings } from "../types";

let settingsDb: UserSettings = {
  locale: "en-US",
  timeZone: "Africa/Cairo",
  timeFormat: "12h",
  weekStartsOn: 0,
  notifications: { email: true, push: true, reminders: true, taskDueDates: true },
  assistant: { voiceEnabled: true, suggestionsEnabled: true },
};

export const settingsMock: MockRoute[] = [
  { method: "GET", path: ENDPOINTS.settings.root, handler: () => mockReply(settingsDb) },
  {
    method: "PATCH",
    path: ENDPOINTS.settings.root,
    handler: ({ body }) => {
      const input = body as UpdateSettingsInput;
      settingsDb = {
        ...settingsDb,
        ...input,
        notifications: { ...settingsDb.notifications, ...input.notifications },
        assistant: { ...settingsDb.assistant, ...input.assistant },
      };
      return mockReply(settingsDb);
    },
  },
];
