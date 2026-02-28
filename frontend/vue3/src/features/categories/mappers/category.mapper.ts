import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types/category.model';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../types/category.dto';

export function mapCategoryDtoToModel(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    parentId: dto.parent_id,
    children: dto.children?.map(mapCategoryDtoToModel) ?? [],
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCreateCategoryPayloadToDto(payload: CreateCategoryPayload): CreateCategoryDto {
  return {
    name: payload.name,
    parent_id: payload.parentId,
  };
}

export function mapUpdateCategoryPayloadToDto(payload: UpdateCategoryPayload): UpdateCategoryDto {
  const dto: UpdateCategoryDto = {};
  if (payload.name !== undefined) dto.name = payload.name;
  if (payload.parentId !== undefined) dto.parent_id = payload.parentId;
  return dto;
}
