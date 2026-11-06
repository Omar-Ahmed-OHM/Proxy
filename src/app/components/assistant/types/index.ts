import type { ReactNode } from "react";

export type ChatRole = "user" | "assistant";

export type ChatMessageStatus = "sending" | "sent" | "error";

export type VoiceState = "idle" | "listening" | "processing" | "disabled";

export type VoiceVisualizerState = "idle" | "listening" | "speaking" | "processing";

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date | string;
  status?: ChatMessageStatus;
}

export interface AssistantWidgetProps {
  messages: ReadonlyArray<ChatMessageData>;
  onSendMessage: (content: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  title?: string;
  subtitle?: string;
  welcomeTitle?: string;
  welcomeMessage?: string;
  suggestions?: ReadonlyArray<string>;
  headerAction?: ReactNode;
  inputAction?: ReactNode;
  notice?: ReactNode;
  listening?: boolean;
  liveTranscript?: string;
  listeningPlaceholder?: string;
  maxLength?: number;
  locale?: string;
  className?: string;
}

export interface ChatMessageProps {
  role: ChatRole;
  content?: string;
  timestamp?: Date | string;
  avatar?: ReactNode;
  loading?: boolean;
  status?: ChatMessageStatus;
  locale?: string;
  className?: string;
}

export type VoiceButtonSize = "sm" | "md" | "lg";

export interface VoiceButtonProps {
  state?: VoiceState;
  onClick?: () => void;
  size?: VoiceButtonSize;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export type VoiceVisualizerSize = "sm" | "md" | "lg";

export interface VoiceVisualizerProps {
  state?: VoiceVisualizerState;
  size?: VoiceVisualizerSize;
  bars?: number;
  className?: string;
}

export type AssistantHistoryRole = "user" | "assistant";

export interface AssistantHistoryItem {
  role: AssistantHistoryRole;
  content: string;
}

export interface SendAssistantMessageInput {
  content: string;
  history?: AssistantHistoryItem[];
  timezone?: string;
}

export type AssistantActionType =
  | "task.created"
  | "task.updated"
  | "task.completed"
  | "task.deleted"
  | "reminder.created"
  | "reminder.completed"
  | "reminder.cancelled";

export interface AssistantAction {
  type: AssistantActionType;
  id: string;
}

export interface AssistantMessageResponse {
  message: ChatMessageData;
  actions: AssistantAction[];
}

export interface AssistantBriefingNextItem {
  title: string;
  at: string;
}

export interface AssistantBriefingStats {
  tasksToday: number;
  overdue: number;
  remindersToday: number;
  nextItem: AssistantBriefingNextItem | null;
}

export interface AssistantBriefingResponse {
  message: string | ChatMessageData;
  stats: AssistantBriefingStats;
}

export interface AssistantBriefing {
  message: string;
  stats: AssistantBriefingStats;
}

export type AssistantMode = "ai" | "local";

export interface AssistantChat {
  messages: ReadonlyArray<ChatMessageData>;
  send: (content: string) => void;
  isResponding: boolean;
  reset: () => void;
}

export type TaskPriorityLevel = "low" | "medium" | "high";

export type DayPeriod = "am" | "noon" | "pm" | "night";

export interface AssistantToken {
  raw: string;
  norm: string;
}

export interface ExtractedDate {
  date: Date;
  explicit: boolean;
  indices: number[];
}

export interface ExtractedTime {
  time: string;
  indices: number[];
}

export interface ExtractedRelative {
  date: Date;
  time: string;
  indices: number[];
}

export interface ExtractedPriority {
  priority: TaskPriorityLevel;
  indices: number[];
}

export type AssistantIntent =
  | { type: "CREATE_TASK"; title: string; dueDate: Date | null; time: string | null; priority: TaskPriorityLevel | null }
  | { type: "CREATE_REMINDER"; title: string; date: Date | null; dateExplicit: boolean; time: string | null }
  | { type: "GET_TODAY_TASKS" }
  | { type: "GET_TOMORROW_TASKS" }
  | { type: "GET_OVERDUE_TASKS" }
  | { type: "GET_PENDING_TASKS" }
  | { type: "COMPLETE_TASK"; query: string }
  | { type: "DELETE_TASK"; query: string }
  | { type: "RESCHEDULE_TASK"; query: string; dueDate: Date | null; time: string | null }
  | { type: "CONFIRM" }
  | { type: "CANCEL" }
  | { type: "HELP" }
  | { type: "UNKNOWN" };

export type AssistantIntentType = AssistantIntent["type"];

export interface MatchableTask {
  id: string;
  title: string;
}

export interface TaskMatch<T extends MatchableTask> {
  best: T | null;
  candidates: T[];
  ambiguous: boolean;
}

export interface SpokenTask {
  title: string;
  due: Date | null;
  allDay: boolean;
}

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onFinal: (transcript: string) => void;
}

export interface SpeechRecognitionControls {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  clearError: () => void;
}

export interface UseSpeechSynthesisOptions {
  lang?: string;
}

export interface SpeechVoiceOption {
  uri: string;
  name: string;
  lang: string;
  natural: boolean;
}

export interface SpeechSynthesisControls {
  supported: boolean;
  speaking: boolean;
  muted: boolean;
  toggleMuted: () => void;
  speak: (text: string) => void;
  cancel: () => void;
  voices: SpeechVoiceOption[];
  voiceURI: string | null;
  setVoice: (uri: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  preview: (uri?: string) => void;
}

export interface VoiceSettingsProps {
  speech: SpeechSynthesisControls;
  onClose: () => void;
}

export type PendingAction = { type: "delete"; taskId: string; title: string };


export interface VoiceAssistant extends AssistantChat {
  sendMessage: (content: string) => void;
  mode: AssistantMode;
  voiceState: VoiceState;
  visualizerState: VoiceVisualizerState;
  recognition: SpeechRecognitionControls;
  speech: SpeechSynthesisControls;
  startListening: () => void;
  stopListening: () => void;
  stopAll: () => void;
}

export interface AssistantVoicePanelProps {
  assistant: VoiceAssistant;
}

export interface DailyBriefingResult {
  title: string;
  message: string;
  source: AssistantMode;
}

export interface DailyBriefingControls {
  loadBriefing: () => Promise<DailyBriefingResult>;
  firstName: string | null;
}
