export interface UserSummaryDto {
  id: string;
  name: string;
  email: string;
  role_name: string;
  created_at: string;
}

export interface InviteUserDto {
  email: string;
  name: string;
  role_id: string;
}

export interface AssignRoleDto {
  role_id: string;
}
