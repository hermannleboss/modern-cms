import { useState, type FormEvent } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../hooks/useTags';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';

export function TagListPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const canCreate = hasPermission(user, 'tag.create');
  const canUpdate = hasPermission(user, 'tag.update');
  const canDelete = hasPermission(user, 'tag.delete');

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync({ name: newTagName.trim() });
      setNewTagName('');
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateTag.mutateAsync({ id, formData: { name: editingName.trim() } });
      setEditingId(null);
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // Error handled by TanStack Query
    }
  };

  if (isLoading) return <div className="loading">Loading tags...</div>;
  if (error) return <div className="error-message">Failed to load tags</div>;

  return (
    <div className="tag-list-page">
      <h1>Tags</h1>

      {canCreate && (
        <form onSubmit={handleCreate} className="inline-form">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={createTag.isPending}>
            {createTag.isPending ? 'Creating...' : 'Add Tag'}
          </button>
        </form>
      )}

      <div className="item-list">
        {data?.data.length === 0 && <p className="empty-state">No tags yet.</p>}
        {data?.data.map((tag) => (
          <div key={tag.id} className="item-row">
            {editingId === tag.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={() => handleUpdate(tag.id)} className="btn btn-sm btn-primary">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="btn btn-sm btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="item-name">{tag.name}</span>
                <div className="item-actions">
                  {canUpdate && (
                    <button
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditingName(tag.name);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
