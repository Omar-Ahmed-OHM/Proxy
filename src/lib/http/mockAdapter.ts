import {
  AxiosError,
  AxiosHeaders,
  CanceledError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { MockMethod, MockResponse, MockRoute } from "./types";

interface CompiledRoute {
  route: MockRoute;
  pattern: RegExp;
  keys: string[];
}

function compile(route: MockRoute): CompiledRoute {
  const keys: string[] = [];
  const source = route.path
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      keys.push(segment.slice(1));
      return "([^/]+)";
    })
    .join("/");
  return { route, pattern: new RegExp(`^${source}/?$`), keys };
}

function parseBody(data: unknown): unknown {
  if (typeof data !== "string") return data ?? null;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mockReply(data: unknown, status = 200): MockResponse {
  return { data, status };
}

export function mockError(status: number, message: string): MockResponse {
  return { status, data: { message } };
}

export function createMockMatcher(routes: ReadonlyArray<MockRoute>) {
  const compiled = routes.map(compile);
  return (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "get").toUpperCase();
    const { pathname } = new URL(config.url ?? "/", "http://mock.local");
    return compiled.some(({ route, pattern }) => route.method === method && pattern.test(pathname));
  };
}

export function createMockAdapter(routes: ReadonlyArray<MockRoute>, delay = 350): AxiosAdapter {
  const compiled = routes.map(compile);

  return async (config) => {
    const method = (config.method ?? "get").toUpperCase() as MockMethod;
    const url = new URL(config.url ?? "/", "http://mock.local");
    const query = new URLSearchParams(url.search);
    Object.entries(config.params ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      (Array.isArray(value) ? value : [value]).forEach((item) => query.append(key, String(item)));
    });

    await wait(delay);
    if (config.signal?.aborted) throw new CanceledError(undefined, undefined, config);

    let result: MockResponse = mockError(404, `No mock for ${method} ${url.pathname}`);
    for (const { route, pattern, keys } of compiled) {
      if (route.method !== method) continue;
      const match = pattern.exec(url.pathname);
      if (!match) continue;
      const params = Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]));
      result = route.handler({ method, path: url.pathname, params, query, body: parseBody(config.data) });
      break;
    }

    const status = result.status ?? 200;
    const response: AxiosResponse = {
      data: result.data === undefined ? null : structuredClone(result.data),
      status,
      statusText: String(status),
      headers: new AxiosHeaders({ "content-type": "application/json" }),
      config,
      request: {},
    };

    const valid = config.validateStatus ? config.validateStatus(status) : status >= 200 && status < 300;
    if (!valid) {
      throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        {},
        response,
      );
    }
    return response;
  };
}
