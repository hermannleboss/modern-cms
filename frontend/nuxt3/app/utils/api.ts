import type { AuthTokens } from '~/types';

const API_BASE_URL = '/api';

function getStoredTokens(): AuthTokens | null {
  if (import.meta.server) return null;
  const raw = localStorage.getItem('auth_tokens');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

function setStoredTokens(tokens: AuthTokens): void {
  if (import.meta.server) return;
  localStorage.setItem('auth_tokens', JSON.stringify(tokens));
}

function clearStoredTokens(): void {
  if (import.meta.server) return;
  localStorage.removeItem('auth_tokens');
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const response = await $fetch<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken: tokens.refreshToken },
    });
    setStoredTokens(response);
    return response.accessToken;
  } catch {
    clearStoredTokens();
    return null;
  }
}

export async function apiFetch<T>(
  url: string,
  options: Parameters<typeof $fetch>[1] = {},
): Promise<T> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  try {
    return await $fetch<T>(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
  } catch (error: unknown) {
    const fetchError = error as { statusCode?: number; status?: number };
    const statusCode = fetchError?.statusCode || fetchError?.status;
    if (statusCode === 401 && tokens?.refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        if (newToken) {
          onTokenRefreshed(newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
          return await $fetch<T>(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
          });
        } else {
          if (!import.meta.server) {
            navigateTo('/login');
          }
          throw error;
        }
      } else {
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh(async (token: string) => {
            headers['Authorization'] = `Bearer ${token}`;
            try {
              resolve(
                await $fetch<T>(`${API_BASE_URL}${url}`, {
                  ...options,
                  headers,
                }),
              );
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }
    throw error;
  }
}

export { getStoredTokens, setStoredTokens, clearStoredTokens };
