import { authenticatedClient } from "./client";
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from "@/types";

export function createCategoriesApi(accessToken: string) {
  const client = authenticatedClient(accessToken);

  return {
    list(): Promise<Category[]> {
      return client<Category[]>("/categories");
    },

    getById(id: string): Promise<Category> {
      return client<Category>(`/categories/${encodeURIComponent(id)}`);
    },

    create(data: CreateCategoryDTO): Promise<Category> {
      return client<Category>("/categories", {
        method: "POST",
        body: data,
      });
    },

    update(id: string, data: UpdateCategoryDTO): Promise<Category> {
      return client<Category>(`/categories/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      });
    },

    delete(id: string): Promise<void> {
      return client<void>(`/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}
