import { apiClient } from "./client";
import type { LoginRequest, TokenResponse, User, RefreshTokenRequest } from "@/types";

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: data,
  });
}

export async function getMe(accessToken: string): Promise<User> {
  return apiClient<User>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function logout(accessToken: string): Promise<void> {
  return apiClient<void>("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
