export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!notificationsSupported()) return null;
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return null;
  }
}

export function showSystemNotification(title: string, body?: string, tag?: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const notification = new Notification(title, { body, tag, lang: "ar", dir: "rtl" });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {}
}

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedContext ??= new AudioContextClass();
  return sharedContext;
}

export function unlockAudioOnInteraction(): () => void {
  const unlock = () => {
    const context = getAudioContext();
    if (context?.state === "suspended") void context.resume();
    if (context?.state === "running") cleanup();
  };
  const cleanup = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  return cleanup;
}

export function playChime() {
  try {
    const context = sharedContext;
    if (!context || context.state !== "running") return;
    const notes = [880, 1174.66, 1567.98];
    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * 0.18;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.42);
    });
  } catch {}
}
