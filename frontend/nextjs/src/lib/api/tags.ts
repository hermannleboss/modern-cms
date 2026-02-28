import { authenticatedClient } from "./client";
import type { Tag, CreateTagDTO, UpdateTagDTO } from "@/types";

export function createTagsApi(accessToken: string) {
  const client = authenticatedClient(accessToken);

  return {
    list(): Promise<Tag[]> {
      return client<Tag[]>("/tags");
    },

    getById(id: string): Promise<Tag> {
      return client<Tag>(`/tags/${encodeURIComponent(id)}`);
    },

    create(data: CreateTagDTO): Promise<Tag> {
      return client<Tag>("/tags", {
        method: "POST",
        body: data,
      });
    },

    update(id: string, data: UpdateTagDTO): Promise<Tag> {
      return client<Tag>(`/tags/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      });
    },

    delete(id: string): Promise<void> {
      return client<void>(`/tags/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}
