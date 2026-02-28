import type { UserSummary, InviteUserPayload } from '../types/user.model';
import type { UserSummaryDto, InviteUserDto } from '../types/user.dto';

export function mapUserSummaryDtoToModel(dto: UserSummaryDto): UserSummary {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    roleName: dto.role_name,
    createdAt: dto.created_at,
  };
}

export function mapInvitePayloadToDto(payload: InviteUserPayload): InviteUserDto {
  return {
    email: payload.email,
    name: payload.name,
    role_id: payload.roleId,
  };
}
