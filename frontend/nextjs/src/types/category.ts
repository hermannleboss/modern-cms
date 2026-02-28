export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parent: Category | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
  parentId?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  parentId?: string | null;
}
