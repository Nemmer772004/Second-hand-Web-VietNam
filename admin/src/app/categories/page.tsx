'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { graphqlRequest } from '../../lib/graphql-client';

const CATEGORIES_QUERY = /* GraphQL */ `
  query AdminCategories {
    categories {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation AdminCreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
    }
  }
`;

const UPDATE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation AdminUpdateCategory($id: String!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_CATEGORY_MUTATION = /* GraphQL */ `
  mutation AdminDeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`;

interface AdminCategory {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface CategoryFormState {
  name: string;
  description: string;
  image: string;
}

const emptyCategory: CategoryFormState = {
  name: '',
  description: '',
  image: '',
};

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ categories: AdminCategory[] }>(CATEGORIES_QUERY);
      setCategories(data?.categories || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh mục';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCategories();
    }
  }, [authLoading, user]);

  const handleChange = (field: keyof CategoryFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? '',
      image: category.image ?? '',
    });
  };

  const resetForm = () => {
    setForm(emptyCategory);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá danh mục này?')) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await graphqlRequest(DELETE_CATEGORY_MUTATION, { id });
      await loadCategories();
      setSuccess('Đã xoá danh mục.');
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xoá danh mục';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    if (!payload.name) {
      setError('Tên danh mục là bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await graphqlRequest(UPDATE_CATEGORY_MUTATION, { id: editingId, input: payload });
        setSuccess('Đã cập nhật danh mục.');
      } else {
        await graphqlRequest(CREATE_CATEGORY_MUTATION, { input: payload });
        setSuccess('Đã tạo danh mục mới.');
      }
      await loadCategories();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu danh mục';
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
          <h1>Danh mục</h1>
          <p>Quản lý nhóm sản phẩm và hình ảnh hiển thị.</p>
        </div>
        <button
          type="button"
          onClick={loadCategories}
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
            <h2 style={{ margin: 0, fontSize: 18 }}>{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
            <p className="admin-muted" style={{ marginTop: 6 }}>
              Gắn hình ảnh để giúp khách hàng nhận dạng danh mục nhanh hơn.
            </p>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Tên danh mục</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Mô tả</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Ảnh minh hoạ (URL)</label>
            <input
              className="admin-input"
              value={form.image}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => handleChange('image', e.target.value)}
            />
          </div>

          <div className="admin-flex-between" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              {editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
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
              <h2 style={{ margin: 0, fontSize: 18 }}>Danh sách danh mục</h2>
              <span className="admin-muted">{categories.length} danh mục</span>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Ngày cập nhật</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td className="admin-muted">
                      {category.description ? category.description.slice(0, 80) : '—'}
                    </td>
                    <td className="admin-muted">
                      {category.updatedAt
                        ? new Date(category.updatedAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleEdit(category)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleDelete(category.id)}
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
