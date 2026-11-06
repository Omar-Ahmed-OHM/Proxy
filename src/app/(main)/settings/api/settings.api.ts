import { ENDPOINTS, httpClient } from "@/lib/http";
import type { UpdateSettingsInput, UserSettings } from "../types";

export function getSettings(signal?: AbortSignal) {
  return httpClient.get<UserSettings>(ENDPOINTS.settings.root, { signal });
}

export function updateSettings(input: UpdateSettingsInput) {
  return httpClient.patch<UserSettings, UpdateSettingsInput>(ENDPOINTS.settings.root, input);
}
