import axios from "axios";
import type { ApiErrorBody, ApiErrorKind, ApiErrorOptions, ApiErrorPayload, ApiFieldError } from "./types";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, { kind, status, code, details, fieldErrors = [], cause }: ApiErrorOptions) {
    super(message, { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.fieldErrors = fieldErrors;
  }

  fieldError(path: string): string | undefined {
    return this.fieldErrors.find((item) => item.path === path)?.message;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isServerError() {
    return this.status !== undefined && this.status >= 500;
  }

  get isRetryable() {
    return this.kind === "network" || this.kind === "timeout" || this.isServerError;
  }
}

function readPayload(data: unknown): ApiErrorPayload {
  if (typeof data !== "object" || data === null) return {};
  const body = data as ApiErrorBody;
  if (typeof body.error === "object" && body.error !== null) return body.error;
  return { message: typeof body.error === "string" ? body.error : body.message, code: body.code };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError("Request was canceled", { kind: "canceled", cause: error });
  }

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("The request timed out", { kind: "timeout", code: error.code, cause: error });
    }

    if (!error.response) {
      return new ApiError("Unable to reach the server", { kind: "network", code: error.code, cause: error });
    }

    const payload = readPayload(error.response.data);
    return new ApiError(payload.message ?? error.message ?? "Request failed", {
      kind: "http",
      status: error.response.status,
      code: payload.code ?? error.code,
      details: error.response.data,
      fieldErrors: Array.isArray(payload.details) ? payload.details : [],
      cause: error,
    });
  }

  return new ApiError(error instanceof Error ? error.message : "Something went wrong", {
    kind: "unknown",
    cause: error,
  });
}
