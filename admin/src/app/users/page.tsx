'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { graphqlRequest } from '../../lib/graphql-client';

const USERS_QUERY = /* GraphQL */ `
  query AdminUsers {
    users {
      id
      name
      email
      role
      phone
      createdAt
      updatedAt
    }
  }
`;

const CREATE_USER_MUTATION = /* GraphQL */ `
  mutation AdminCreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`;

const UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation AdminUpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      role
      phone
      name
    }
  }
`;

const DELETE_USER_MUTATION = /* GraphQL */ `
  mutation AdminDeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface UserFormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'user',
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ users: AdminUserRow[] }>(USERS_QUERY);
      setUsers(data?.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers();
    }
  }, [authLoading, user]);

  const handleChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (row: AdminUserRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      email: row.email,
      password: '',
      phone: row.phone ?? '',
      role: row.role ?? 'user',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá người dùng này?')) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await graphqlRequest(DELETE_USER_MUTATION, { id });
      await fetchUsers();
      setSuccess('Đã xoá người dùng.');
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xoá người dùng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError('Tên và email là bắt buộc.');
      return;
    }

    if (!editingId && form.password.trim().length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const payload: Record<string, string> = {
          name: form.name.trim(),
          role: form.role,
        };
        if (form.phone.trim()) {
          payload.phone = form.phone.trim();
        }
        await graphqlRequest(UPDATE_USER_MUTATION, {
          id: editingId,
          input: payload,
        });
        setSuccess('Đã cập nhật người dùng.');
      } else {
        await graphqlRequest(CREATE_USER_MUTATION, {
          input: {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            phone: form.phone.trim() || undefined,
            role: form.role,
          },
        });
        setSuccess('Đã tạo tài khoản mới.');
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu người dùng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !authLoading) {
    return null;
  }

  return (
    <div className="admin-grid" style={{ gap: 24 }}>
      <div className="admin-page__header">
        <div>
          <h1>Người dùng</h1>
          <p>Quản lý khách hàng, phân quyền admin và thông tin liên hệ.</p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="admin-btn admin-btn--ghost"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {(error || success) && (
        <div className={`admin-alert ${error ? 'admin-alert--error' : 'admin-alert--success'}`}>
          {error || success}
        </div>
      )}

      <div className="admin-grid admin-grid--two-columns">
        <form className="admin-card admin-form" onSubmit={handleSubmit}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
            <p className="admin-muted" style={{ marginTop: 6 }}>
              Vai trò `admin` có toàn quyền, hãy cấp phát cẩn thận.
            </p>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Họ tên</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Email</label>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              disabled={!!editingId}
            />
          </div>

          {!editingId && (
            <div className="admin-form__group">
              <label className="admin-form__label">Mật khẩu</label>
              <input
                className="admin-input"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="admin-form__group">
            <label className="admin-form__label">Số điện thoại</label>
            <input
              className="admin-input"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Vai trò</label>
            <select
              className="admin-select"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="user">Khách hàng</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="admin-flex-between" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              {editingId ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
            {editingId && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={resetForm}>
                Huỷ chỉnh sửa
              </button>
            )}
          </div>
        </form>

        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div className="admin-flex-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Danh sách người dùng</h2>
              <span className="admin-muted">{users.length} tài khoản</span>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.email}</td>
                    <td>{row.phone || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{row.role || 'user'}</td>
                    <td className="admin-muted">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleEdit(row)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleDelete(row.id)}
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
