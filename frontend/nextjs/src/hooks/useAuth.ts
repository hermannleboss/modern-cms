"use client";

import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/providers/AuthProvider";
import type { LoginRequest } from "@/types";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: (data) => {
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  return { logout };
}
