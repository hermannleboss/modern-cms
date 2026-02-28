import { useState, type FormEvent } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';
import type { Category } from '../types';

function CategoryTree({
  categories,
  parentId = null,
  level = 0,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  parentId?: string | null;
  level?: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = categories.filter((c) => c.parentId === parentId);

  return (
    <>
      {filtered.map((cat) => (
        <div key={cat.id}>
          <div className="item-row" style={{ paddingLeft: `${level * 24}px` }}>
            <span className="item-name">
              {level > 0 && '└ '}
              {cat.name}
            </span>
            <div className="item-actions">
              {canUpdate && (
                <button onClick={() => onEdit(cat)} className="btn btn-sm btn-secondary">
                  Edit
                </button>
              )}
              {canDelete && (
                <button onClick={() => onDelete(cat.id)} className="btn btn-sm btn-danger">
                  Delete
                </button>
              )}
            </div>
          </div>
          <CategoryTree
            categories={categories}
            parentId={cat.id}
            level={level + 1}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </>
  );
}

export function CategoryListPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canCreate = hasPermission(user, 'category.create');
  const canUpdate = hasPermission(user, 'category.update');
  const canDelete = hasPermission(user, 'category.delete');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          formData: { name: name.trim(), parentId },
        });
        setEditingId(null);
      } else {
        await createCategory.mutateAsync({ name: name.trim(), parentId });
      }
      setName('');
      setParentId(null);
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setParentId(cat.parentId);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setParentId(null);
  };

  if (isLoading) return <div className="loading">Loading categories...</div>;
  if (error) return <div className="error-message">Failed to load categories</div>;

  return (
    <div className="category-list-page">
      <h1>Categories</h1>

      {(canCreate || editingId) && (
        <form onSubmit={handleSubmit} className="inline-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
          />
          <select
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value || null)}
          >
            <option value="">No parent (root)</option>
            {data?.data
              .filter((c) => c.id !== editingId)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createCategory.isPending || updateCategory.isPending}
          >
            {editingId ? 'Update' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </form>
      )}

      <div className="item-list">
        {data?.data.length === 0 && <p className="empty-state">No categories yet.</p>}
        {data && (
          <CategoryTree
            categories={data.data}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
