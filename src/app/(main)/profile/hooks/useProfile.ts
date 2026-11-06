"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLogout } from "@/app/(auth)/hooks/useAuth";
import { changePassword, deleteAccount, updateProfile } from "../api/profile.api";
import { profileKeys } from "./useCurrentUser";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => queryClient.setQueryData(profileKeys.me, user),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useDeleteAccount() {
  const logout = useLogout();
  return useMutation({ mutationFn: deleteAccount, onSuccess: logout });
}
