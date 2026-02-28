export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children: CategoryDto[];
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  parent_id?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  parent_id?: string | null;
}
