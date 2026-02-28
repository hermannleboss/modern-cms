"use client";

import { useState, type FormEvent } from "react";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/useTags";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export function TagManager() {
  const [name, setName] = useState("");
  const { data: tags, isLoading, error } = useTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();
  const permissions = usePermissions();

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name },
      {
        onSuccess: () => setName(""),
      },
    );
  };

  if (error) {
    return (
      <Alert
        type="error"
        message={
          error instanceof Error ? error.message : "Failed to load tags"
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tags</h1>

      <PermissionGuard permission={Permission.TAG_CREATE}>
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
        >
          <h2 className="text-lg font-medium text-gray-900">New Tag</h2>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Tag name"
          />
          {createMutation.isError && (
            <Alert type="error" message="Failed to create tag" />
          )}
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Create Tag
          </Button>
        </form>
      </PermissionGuard>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : tags?.length === 0 ? (
        <p className="text-gray-500">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2"
            >
              <span className="text-sm font-medium text-gray-700">
                #{tag.name}
              </span>
              {permissions.has(Permission.TAG_DELETE) && (
                <button
                  onClick={() => deleteMutation.mutate(tag.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete tag"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteMutation.isError && (
        <Alert type="error" message="Failed to delete tag" />
      )}
    </div>
  );
}
