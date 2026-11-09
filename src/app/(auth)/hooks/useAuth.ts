"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { profileKeys } from "@/app/(main)/profile/hooks/useCurrentUser";
import { clearAuthToken, setAuthToken } from "@/lib/auth/token";
import { removePushSubscription } from "@/lib/push";
import { login, register } from "../api/auth.api";
import type { AuthResponse } from "../types";

function useAuthSuccess(next: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return ({ user, token }: AuthResponse) => {
    setAuthToken(token);
    queryClient.clear();
    queryClient.setQueryData(profileKeys.me, user);
    router.replace(next);
    router.refresh();
  };
}

export function useLogin(next = "/") {
  const onSuccess = useAuthSuccess(next);
  return useMutation({ mutationFn: login, onSuccess });
}

export function useRegister(next = "/") {
  const onSuccess = useAuthSuccess(next);
  return useMutation({ mutationFn: register, onSuccess });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    await removePushSubscription();
    clearAuthToken();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }, [queryClient, router]);
}
