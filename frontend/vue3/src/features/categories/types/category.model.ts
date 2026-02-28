export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  parentId?: string | null;
}
