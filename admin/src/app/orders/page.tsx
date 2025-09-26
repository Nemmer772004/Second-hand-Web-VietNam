'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { graphqlRequest } from '../../lib/graphql-client';

const ORDERS_QUERY = /* GraphQL */ `
  query AdminOrders {
    orders {
      id
      userId
      totalAmount
      status
      createdAt
      updatedAt
      items {
        productId
        quantity
        price
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = /* GraphQL */ `
  mutation AdminUpdateOrderStatus($id: String!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

const DELETE_ORDER_MUTATION = /* GraphQL */ `
  mutation AdminDeleteOrder($id: String!) {
    deleteOrder(id: $id)
  }
`;

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface AdminOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<{ orders: AdminOrder[] }>(ORDERS_QUERY);
      setOrders(data?.orders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [authLoading, user]);

  if (!user && !authLoading) {
    return null;
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await graphqlRequest(UPDATE_ORDER_STATUS_MUTATION, { id: orderId, status });
      await fetchOrders();
      setSuccess('Đã cập nhật trạng thái đơn hàng.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá đơn hàng này?')) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await graphqlRequest(DELETE_ORDER_MUTATION, { id: orderId });
      await fetchOrders();
      setSuccess('Đã xoá đơn hàng.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xoá đơn hàng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-grid" style={{ gap: 24 }}>
      <div className="admin-page__header">
        <div>
          <h1>Đơn hàng</h1>
          <p>Theo dõi trạng thái và xử lý đơn hàng của khách.</p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
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

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="admin-empty">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <div className="admin-muted" style={{ fontSize: 12 }}>
                      {order.items.length} sản phẩm
                    </div>
                  </td>
                  <td>{order.userId || 'Ẩn danh'}</td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.totalAmount || 0)}
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      style={{ minWidth: 140 }}
                      value={order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-muted">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        style={{ paddingInline: 12, paddingBlock: 6 }}
                        onClick={() => handleDelete(order.id)}
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
  );
}
