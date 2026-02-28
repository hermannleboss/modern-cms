export interface UserSummary {
  id: string;
  name: string;
  email: string;
  roleName: string;
  createdAt: string;
}

export interface InviteUserPayload {
  email: string;
  name: string;
  roleId: string;
}

export interface AssignRolePayload {
  roleId: string;
}
