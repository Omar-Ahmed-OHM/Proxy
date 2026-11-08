export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallPlatform = "prompt" | "ios" | "installed" | "unsupported";

export interface InstallAppButtonProps {
  variant?: "card" | "compact";
  className?: string;
}
