import { useState, type FormEvent } from 'react';
import { useUsers, useRoles, useInviteUser, useAssignRole } from '../hooks/useUsers';
import { useAuth } from '../../auth/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';

export function UserListPage() {
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading, error } = useUsers();
  const { data: roles } = useRoles();
  const inviteUser = useInviteUser();
  const assignRole = useAssignRole();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRoleIds, setInviteRoleIds] = useState<string[]>([]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);

  const canRead = hasPermission(currentUser, 'user.read');
  const canInvite = hasPermission(currentUser, 'user.invite');
  const canAssignRole = hasPermission(currentUser, 'user.assign_role');

  if (!canRead) {
    return <div className="error-message">You do not have permission to view users.</div>;
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await inviteUser.mutateAsync({
        email: inviteEmail,
        name: inviteName,
        roleIds: inviteRoleIds,
      });
      setShowInvite(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRoleIds([]);
    } catch {
      // Error handled by TanStack Query
    }
  };

  const handleAssignRoles = async (userId: string) => {
    try {
      await assignRole.mutateAsync({ userId, roleIds: editRoleIds });
      setEditingUserId(null);
    } catch {
      // Error handled by TanStack Query
    }
  };

  const toggleInviteRole = (roleId: string) => {
    setInviteRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const toggleEditRole = (roleId: string) => {
    setEditRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  if (isLoading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">Failed to load users</div>;

  return (
    <div className="user-list-page">
      <div className="page-header">
        <h1>Users</h1>
        {canInvite && (
          <button onClick={() => setShowInvite(true)} className="btn btn-primary">
            Invite User
          </button>
        )}
      </div>

      {showInvite && (
        <div className="invite-form-container">
          <h2>Invite User</h2>
          <form onSubmit={handleInvite} className="invite-form">
            <div className="form-group">
              <label htmlFor="invite-name">Name</label>
              <input
                id="invite-name"
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="invite-email">Email</label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Roles</label>
              <div className="checkbox-group">
                {roles?.map((role) => (
                  <label key={role.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={inviteRoleIds.includes(role.id)}
                      onChange={() => toggleInviteRole(role.id)}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteUser.isPending}
              >
                {inviteUser.isPending ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="user-list">
        {usersData?.data.map((u) => (
          <div key={u.id} className="user-card">
            <div className="user-info">
              <strong>{u.name}</strong>
              <span>{u.email}</span>
              <div className="user-roles">
                {u.roles.map((role) => (
                  <span key={role.id} className="role-badge">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="user-actions">
              {canAssignRole && editingUserId !== u.id && (
                <button
                  onClick={() => {
                    setEditingUserId(u.id);
                    setEditRoleIds(u.roles.map((r) => r.id));
                  }}
                  className="btn btn-sm btn-secondary"
                >
                  Manage Roles
                </button>
              )}
              {canAssignRole && editingUserId === u.id && (
                <div className="role-editor">
                  <div className="checkbox-group">
                    {roles?.map((role) => (
                      <label key={role.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editRoleIds.includes(role.id)}
                          onChange={() => toggleEditRole(role.id)}
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="btn btn-sm btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAssignRoles(u.id)}
                      className="btn btn-sm btn-primary"
                      disabled={assignRole.isPending}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
