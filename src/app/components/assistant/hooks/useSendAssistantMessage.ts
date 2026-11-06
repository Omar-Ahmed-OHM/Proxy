"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { sendAssistantMessage } from "../api/assistant.api";
import type { AssistantChat, ChatMessageData } from "../types";

export function useSendAssistantMessage() {
  return useMutation({ mutationFn: sendAssistantMessage });
}

export function useAssistantChat(): AssistantChat {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const { mutate, isPending } = useSendAssistantMessage();

  const send = useCallback(
    (content: string) => {
      const id = crypto.randomUUID();
      const setStatus = (status: ChatMessageData["status"]) =>
        setMessages((current) => current.map((message) => (message.id === id ? { ...message, status } : message)));

      setMessages((current) => [
        ...current,
        { id, role: "user", content, timestamp: new Date().toISOString(), status: "sending" },
      ]);

      mutate(
        { content },
        {
          onSuccess: ({ message }) => {
            setStatus("sent");
            setMessages((current) => [...current, message]);
          },
          onError: () => setStatus("error"),
        },
      );
    },
    [mutate],
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, send, isResponding: isPending, reset };
}
