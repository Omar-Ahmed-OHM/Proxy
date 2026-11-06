"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/profile.api";

export const profileKeys = {
  me: ["me"] as const,
};

export function useCurrentUser() {
  return useQuery({ queryKey: profileKeys.me, queryFn: ({ signal }) => getCurrentUser(signal) });
}
