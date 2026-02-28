import type { User, Role } from '../types/auth.model';
import type { UserDto, RoleDto } from '../types/auth.dto';

export function mapRoleDtoToModel(dto: RoleDto): Role {
  return {
    id: dto.id,
    name: dto.name,
    permissions: dto.permissions,
  };
}

export function mapUserDtoToModel(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    role: mapRoleDtoToModel(dto.role),
    permissions: dto.permissions,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
