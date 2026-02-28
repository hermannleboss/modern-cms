"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategoriesApi } from "@/lib/api/categories";
import { useAuth } from "@/lib/providers/AuthProvider";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/types";

function useCategoriesApi() {
  const { accessToken } = useAuth();
  if (!accessToken) throw new Error("Not authenticated");
  return createCategoriesApi(accessToken);
}

export function useCategories() {
  const api = useCategoriesApi();
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.list(),
  });
}

export function useCreateCategory() {
  const api = useCategoriesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const api = useCategoriesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryDTO) => api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const api = useCategoriesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
