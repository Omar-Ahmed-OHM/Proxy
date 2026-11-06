"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthToken, getAuthToken } from "@/lib/auth/token";
import { ApiError, setTokenGetter, setUnauthorizedHandler } from "@/lib/http";
import type { QueryProviderProps } from "./types";

setTokenGetter(getAuthToken);

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
          retry: (failureCount, error) =>
            failureCount < 2 && (!(error instanceof ApiError) || error.isRetryable),
        },
        mutations: {
          retry: false,
        },
      },
    });

    return client;
  });
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!getAuthToken()) return;
      clearAuthToken();
      queryClient.clear();
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
