export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: RoleDto;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleDto {
  id: string;
  name: string;
  permissions: string[];
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}
