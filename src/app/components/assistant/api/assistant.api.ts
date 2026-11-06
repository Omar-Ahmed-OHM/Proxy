import { ENDPOINTS, httpClient } from "@/lib/http";
import type {
  AssistantBriefing,
  AssistantBriefingResponse,
  AssistantMessageResponse,
  SendAssistantMessageInput,
} from "../types";

export async function sendAssistantMessage(input: SendAssistantMessageInput): Promise<AssistantMessageResponse> {
  const data = await httpClient.post<AssistantMessageResponse, SendAssistantMessageInput>(
    ENDPOINTS.assistant.messages,
    input,
  );
  return { message: { ...data.message, role: "assistant" }, actions: data.actions ?? [] };
}

export async function getBriefing(timezone: string, signal?: AbortSignal): Promise<AssistantBriefing> {
  const data = await httpClient.get<AssistantBriefingResponse>(ENDPOINTS.assistant.briefing, {
    params: { timezone },
    signal,
  });
  const message = typeof data.message === "string" ? data.message : data.message.content;
  return { message, stats: data.stats };
}
