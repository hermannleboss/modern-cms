import type { Tag } from '../types/tag.model';
import type { TagDto } from '../types/tag.dto';

export function mapTagDtoToModel(dto: TagDto): Tag {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
