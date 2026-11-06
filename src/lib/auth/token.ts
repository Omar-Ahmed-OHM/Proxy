export const AUTH_COOKIE = "proxy_token";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${AUTH_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(AUTH_COOKIE.length + 1)) : null;
}

export function setAuthToken(token: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthToken() {
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
