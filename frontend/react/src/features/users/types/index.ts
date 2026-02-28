import type { Permission, Role } from '../../../shared/types';

export interface UserDetails {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserData {
  email: string;
  name: string;
  roleIds: string[];
}

export interface AssignRoleData {
  userId: string;
  roleIds: string[];
}
