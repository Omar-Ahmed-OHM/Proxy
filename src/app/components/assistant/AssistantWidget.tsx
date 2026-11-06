"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/cn";
import { ChatMessage } from "./ChatMessage";
import type { AssistantWidgetProps } from "./types";

const NEAR_BOTTOM_THRESHOLD = 80;
const MAX_INPUT_HEIGHT = 160;

export function AssistantWidget({
  messages,
  onSendMessage,
  loading = false,
  disabled = false,
  placeholder = "Ask Proxy anything…",
  title = "Proxy Assistant",
  subtitle = "Your productivity copilot",
  welcomeTitle = "How can I help today?",
  welcomeMessage = "Ask about your tasks, reminders, or schedule.",
  suggestions = [],
  headerAction,
  inputAction,
  notice,
  listening = false,
  liveTranscript = "",
  listeningPlaceholder = "Listening…",
  maxLength = 4000,
  locale,
  className,
}: AssistantWidgetProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const lastMessage = messages[messages.length - 1];
  const canSend = draft.trim().length > 0 && !disabled && !loading && !listening;
  const inputValue = listening ? liveTranscript : draft;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (stickToBottom.current || lastMessage?.role === "user") {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, lastMessage?.role, loading]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [inputValue]);

  const send = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || disabled || loading || listening) return;
    onSendMessage(trimmed);
    setDraft("");
    stickToBottom.current = true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(draft);
    }
  };

  return (
    <section
      aria-label={title}
      className={cn(
        "flex h-full min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card/80 shadow-card backdrop-blur-xl",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-secondary text-white">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted">
            <span
              aria-hidden="true"
              className={cn("size-1.5 shrink-0 rounded-full", disabled ? "bg-muted" : "bg-success")}
            />
            {disabled ? "Unavailable" : loading ? "Thinking…" : subtitle}
          </p>
        </div>
        {headerAction}
      </header>

      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          stickToBottom.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_THRESHOLD;
        }}
        role="log"
        aria-live="polite"
        aria-busy={loading || undefined}
        aria-label="Conversation"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5"
      >
        {messages.length === 0 && !loading ? (
          <div className="m-auto flex max-w-sm flex-col items-center gap-4 py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary-soft">
              <Sparkles size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 dir="auto" className="text-base font-semibold text-foreground">{welcomeTitle}</h3>
              <p dir="auto" className="mt-1 text-sm text-muted">{welcomeMessage}</p>
            </div>
            {suggestions.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      dir="auto"
                      disabled={disabled}
                      onClick={() => send(suggestion)}
                      className="rounded-full border border-border-strong bg-surface px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                status={message.role === "user" ? message.status : undefined}
                locale={locale}
              />
            ))}
            {loading && <ChatMessage role="assistant" loading />}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-3 sm:p-4">
        {notice && <div className="mb-3">{notice}</div>}
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border-strong bg-surface p-1.5 pl-4 transition-[border-color,box-shadow]",
            "focus-within:border-primary/70 focus-within:ring-4 focus-within:ring-primary/20",
            disabled && "opacity-50",
          )}
        >
          <label htmlFor={inputId} className="sr-only">
            Message {title}
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={1}
            value={inputValue}
            readOnly={listening}
            dir="auto"
            maxLength={maxLength}
            disabled={disabled}
            placeholder={listening ? listeningPlaceholder : placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            enterKeyHint="send"
            className="max-h-40 min-h-9 flex-1 resize-none self-center bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted/60 focus-visible:outline-none disabled:cursor-not-allowed"
          />
          {inputAction}
          <Button
            type="submit"
            size="sm"
            iconOnly
            disabled={!canSend}
            aria-label="Send message"
            className="rounded-xl"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </Button>
        </div>
        <p className="mt-2 hidden px-1 text-[0.6875rem] text-muted/70 sm:block">
          Press Enter to send, Shift + Enter for a new line
        </p>
      </form>
    </section>
  );
}
