"use client";

import { useState, type FormEvent } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export function CategoryManager() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { data: categories, isLoading, error } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const permissions = usePermissions();

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
        },
      },
    );
  };

  if (error) {
    return (
      <Alert
        type="error"
        message={
          error instanceof Error
            ? error.message
            : "Failed to load categories"
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <PermissionGuard permission={Permission.CATEGORY_CREATE}>
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
        >
          <h2 className="text-lg font-medium text-gray-900">
            New Category
          </h2>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Category name"
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description"
          />
          {createMutation.isError && (
            <Alert type="error" message="Failed to create category" />
          )}
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Create Category
          </Button>
        </form>
      </PermissionGuard>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : categories?.length === 0 ? (
        <p className="text-gray-500">No categories yet.</p>
      ) : (
        <div className="space-y-2">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                )}
                {category.parent && (
                  <p className="text-xs text-gray-400">
                    Parent: {category.parent.name}
                  </p>
                )}
              </div>
              {permissions.has(Permission.CATEGORY_DELETE) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate(category.id)}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteMutation.isError && (
        <Alert type="error" message="Failed to delete category" />
      )}
    </div>
  );
}
