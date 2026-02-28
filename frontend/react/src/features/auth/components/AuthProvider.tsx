import { useState, useCallback, type ReactNode } from 'react';
import apiClient from '../../../api/client';
import type { User } from '../../../shared/types';
import type { LoginCredentials, AuthTokens } from '../types';
import { AuthContext } from '../context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('access_token');
  });

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get<User>('/me');
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize profile on first render if token exists
  if (isLoading && !user) {
    fetchProfile();
  }

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', credentials);
    localStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    const profileRes = await apiClient.get<User>('/me');
    setUser(profileRes.data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
