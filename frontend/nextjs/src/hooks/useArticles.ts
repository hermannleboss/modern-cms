"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createArticlesApi } from "@/lib/api/articles";
import { useAuth } from "@/lib/providers/AuthProvider";
import type {
  ArticleListParams,
  CreateArticleDTO,
  UpdateArticleDTO,
} from "@/types";

function useArticlesApi() {
  const { accessToken } = useAuth();
  if (!accessToken) throw new Error("Not authenticated");
  return createArticlesApi(accessToken);
}

export function useArticles(params?: ArticleListParams) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => api.list(params),
  });
}

export function useArticle(id: string) {
  const api = useArticlesApi();
  return useQuery({
    queryKey: ["articles", id],
    queryFn: () => api.getById(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDTO) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle(id: string) {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateArticleDTO) => api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function usePublishArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useSubmitArticleForReview() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useArchiveArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useLockArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.lock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUnlockArticle() {
  const api = useArticlesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.unlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
