export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
