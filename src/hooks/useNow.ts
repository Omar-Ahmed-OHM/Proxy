import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
}

const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;
const getServerSnapshot = () => null;

export function useNow(): Date | null {
  const timestamp = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return timestamp === null ? null : new Date(timestamp);
}
