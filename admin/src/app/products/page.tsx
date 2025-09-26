'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { graphqlRequest } from '../../lib/graphql-client';

const PRODUCTS_QUERY = /* GraphQL */ `
  query AdminProducts {
    products {
      id
      name
      description
      price
      stock
      category
      categoryId
      categoryName
      image
      createdAt
      updatedAt
    }
  }
`;

const CATEGORIES_QUERY = /* GraphQL */ `
  query AdminCategories {
    categories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT_MUTATION = /* GraphQL */ `
  mutation AdminCreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = /* GraphQL */ `
  mutation AdminUpdateProduct($id: String!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_PRODUCT_MUTATION = /* GraphQL */ `
  mutation AdminDeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number | null;
  category?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  image?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: '',
};

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  stock: string;
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ products: AdminProduct[] }>(PRODUCTS_QUERY);
      setProducts(data?.products || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await graphqlRequest<{ categories: { id: string; name: string }[] }>(CATEGORIES_QUERY);
      setCategories(data?.categories || []);
    } catch (err) {
      console.warn('Không thể tải danh mục', err);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
      fetchCategories();
    }
  }, [authLoading, user]);

  const handleInputChange = (field: keyof ProductFormState, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormValues(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setFormValues({
      name: product.name,
      description: product.description,
      price: product.price?.toString() ?? '',
      category: product.categoryId || product.category || '',
      image: product.image ?? '',
      stock: product.stock?.toString() ?? '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await graphqlRequest(DELETE_PRODUCT_MUTATION, { id });
      await fetchProducts();
      setSuccessMessage('Đã xoá sản phẩm.');
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xoá sản phẩm';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      price: Number(formValues.price),
      category: formValues.category.trim(),
      image: formValues.image.trim() || undefined,
      stock: formValues.stock === '' ? undefined : Number(formValues.stock),
    };

    if (!payload.name || !payload.description || !payload.category || Number.isNaN(payload.price)) {
      setError('Vui lòng nhập đầy đủ thông tin hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await graphqlRequest(UPDATE_PRODUCT_MUTATION, { id: editingId, input: payload });
        setSuccessMessage('Đã cập nhật sản phẩm.');
      } else {
        await graphqlRequest(CREATE_PRODUCT_MUTATION, { input: payload });
        setSuccessMessage('Đã tạo sản phẩm mới.');
      }
      await fetchProducts();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu sản phẩm';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !authLoading) {
    return null;
  }

  const headerText = editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';

  return (
    <div className="admin-grid" style={{ gap: 24 }}>
      <div className="admin-page__header">
        <div>
          <h1>Sản phẩm</h1>
          <p>Thêm mới, chỉnh sửa và quản lý kho hàng.</p>
        </div>
        <div className="admin-flex-between" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="admin-btn admin-btn--ghost"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="admin-btn admin-btn--ghost"
          >
            Làm sạch biểu mẫu
          </button>
        </div>
      </div>

      {(error || successMessage) && (
        <div className={`admin-alert ${error ? 'admin-alert--error' : 'admin-alert--success'}`}>
          {error || successMessage}
        </div>
      )}

      <div className="admin-grid admin-grid--two-columns">
        <form className="admin-card admin-form" onSubmit={handleSubmit}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{headerText}</h2>
            <p className="admin-muted" style={{ marginTop: 6 }}>
              Điền đầy đủ thông tin trước khi lưu sản phẩm.
            </p>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Tên sản phẩm</label>
            <input
              className="admin-input"
              value={formValues.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Danh mục</label>
            {categories.length > 0 ? (
              <select
                className="admin-select"
                value={formValues.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="admin-input"
                value={formValues.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Nhập danh mục"
                required
              />
            )}
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Giá (VND)</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="1000"
              value={formValues.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Tồn kho</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="1"
              value={formValues.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Ảnh (URL)</label>
            <input
              className="admin-input"
              value={formValues.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Mô tả</label>
            <textarea
              className="admin-textarea"
              value={formValues.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="admin-flex-between" style={{ justifyContent: 'flex-start', gap: 12 }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}
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
              <h2 style={{ margin: 0, fontSize: 18 }}>Danh sách sản phẩm</h2>
              <span className="admin-muted">{products.length} sản phẩm</span>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Ngày cập nhật</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="admin-muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {product.description?.slice(0, 60) || '—'}
                      </div>
                    </td>
                    <td>{product.categoryName || product.displayCategory || product.category || 'Không rõ'}</td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(product.price || 0)}
                    </td>
                    <td>{product.stock ?? '—'}</td>
                    <td className="admin-muted">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleEdit(product)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                          onClick={() => handleDelete(product.id)}
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
