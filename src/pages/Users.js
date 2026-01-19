import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await userService.update(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
      toast.success(`User "${editingUser.name}" updated successfully`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await userService.delete(id);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate user');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      const { confirmPassword, ...userData } = newUser;
      await authService.register(userData);
      toast.success(`User "${newUser.name}" created successfully`);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'staff' });
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      staff: 'badge-warning',
      viewer: 'badge-success',
    };
    return badges[role] || '';
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">
              Manage system users and their roles
              {users.length > 0 && (
                <span className="user-count"> ({users.length} {users.length === 1 ? 'user' : 'users'})</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Add New User
          </button>
        </div>

        <div className="users-filters">
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
              >
                Add Your First User
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New User</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label htmlFor="create-name">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="create-email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    id="create-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="create-password">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    id="create-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                  {newUser.password && newUser.password.length < 6 && (
                    <span className="error">Password must be at least 6 characters</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="create-confirm-password">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <input
                    id="create-confirm-password"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) =>
                      setNewUser({ ...newUser, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                  />
                  {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                    <span className="error">Passwords do not match</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="create-role">Role</label>
                  <select
                    id="create-role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="staff">Staff - Can create and update clients</option>
                    <option value="viewer">Viewer - Read-only access</option>
                    <option value="admin">Admin - Full access</option>
                  </select>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {newUser.role === 'staff' && 'Staff can create and update clients, but cannot delete them or manage users.'}
                    {newUser.role === 'viewer' && 'Viewer has read-only access to clients.'}
                    {newUser.role === 'admin' && 'Admin has full access to all features including user management.'}
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'staff' });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingUser && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit User</h2>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label htmlFor="edit-name">Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">Role</label>
                  <select
                    id="edit-role"
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingUser.isActive}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
