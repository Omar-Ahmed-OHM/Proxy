import type { AxiosRequestConfig } from "axios";

export type QueryParams = Record<string, string | number | boolean | null | undefined | ReadonlyArray<string | number>>;

export interface RequestConfig extends Omit<AxiosRequestConfig, "url" | "method" | "data" | "params"> {
  params?: QueryParams;
  signal?: AbortSignal;
}

export type ApiErrorKind = "http" | "network" | "timeout" | "canceled" | "invalid-response" | "unknown";

export interface ApiErrorOptions {
  kind: ApiErrorKind;
  status?: number;
  code?: string;
  details?: unknown;
  fieldErrors?: ApiFieldError[];
  cause?: unknown;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: ApiFieldError[];
}

export interface ApiErrorBody {
  error?: ApiErrorPayload | string;
  message?: string;
  code?: string;
}

export type TokenGetter = () => string | null | undefined | Promise<string | null | undefined>;

export type UnauthorizedHandler = () => void;

export type MockMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockRequest<B = unknown> {
  method: MockMethod;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: B;
}

export interface MockResponse {
  status?: number;
  data?: unknown;
}

export type MockHandler = (request: MockRequest) => MockResponse;

export interface MockRoute {
  method: MockMethod;
  path: string;
  handler: MockHandler;
}

export type MockMode = "off" | "pending" | "all";
