import axios from "axios";
import { ApiError, toApiError } from "./ApiError";
import type { MockMode, TokenGetter, UnauthorizedHandler } from "./types";

let getToken: TokenGetter | null = null;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setTokenGetter(getter: TokenGetter | null) {
  getToken = getter;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

function resolveMockMode(value: string | undefined): MockMode {
  if (value === "all" || value === "true") return "all";
  if (value === "pending") return "pending";
  return "off";
}

export const mockMode = resolveMockMode(process.env.NEXT_PUBLIC_API_MOCK);

if (mockMode !== "all" && !process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV !== "production") {
  console.warn("NEXT_PUBLIC_API_URL is not set. API requests will hit the Next.js server and fail.");
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

if (mockMode !== "off") {
  const networkAdapter = axios.getAdapter(axiosInstance.defaults.adapter);
  axiosInstance.defaults.adapter = async (config) => {
    const { mockAdapter, isPendingEndpoint } = await import("@/mocks");
    if (mockMode === "all" || isPendingEndpoint(config)) return mockAdapter(config);
    return networkAdapter(config);
  };
}

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getToken?.();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

function isJsonResponse(contentType: unknown, data: unknown) {
  if (data === "" || data === undefined || data === null) return true;
  return typeof contentType === "string" && contentType.includes("json");
}

axiosInstance.interceptors.response.use(
  (response) => {
    if (isJsonResponse(response.headers["content-type"], response.data)) return response;
    return Promise.reject(
      new ApiError("The server returned an unexpected response", {
        kind: "invalid-response",
        status: response.status,
        details: { url: response.config.url, contentType: response.headers["content-type"] },
      }),
    );
  },
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.isUnauthorized) onUnauthorized?.();
    return Promise.reject(apiError);
  },
);
