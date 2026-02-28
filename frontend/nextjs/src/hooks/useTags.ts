"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTagsApi } from "@/lib/api/tags";
import { useAuth } from "@/lib/providers/AuthProvider";
import type { CreateTagDTO, UpdateTagDTO } from "@/types";

function useTagsApi() {
  const { accessToken } = useAuth();
  if (!accessToken) throw new Error("Not authenticated");
  return createTagsApi(accessToken);
}

export function useTags() {
  const api = useTagsApi();
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => api.list(),
  });
}

export function useCreateTag() {
  const api = useTagsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDTO) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag(id: string) {
  const api = useTagsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTagDTO) => api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const api = useTagsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
