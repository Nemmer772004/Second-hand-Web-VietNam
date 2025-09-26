'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { graphqlRequest } from '../../lib/graphql-client';

const ORDERS_QUERY = /* GraphQL */ `
  query AdminOrders {
    orders {
      id
      userId
      totalAmount
      status
      paymentStatus
      paymentMethod
      shippingAddress
      notes
      confirmedAt
      createdAt
      updatedAt
      customerName
      customerEmail
      customerPhone
      items {
        productId
        productName
        productImage
        quantity
        price
        lineTotal
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = /* GraphQL */ `
  mutation AdminUpdateOrderStatus($id: String!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      paymentStatus
      updatedAt
      confirmedAt
    }
  }
`;

const DELETE_ORDER_MUTATION = /* GraphQL */ `
  mutation AdminDeleteOrder($id: String!) {
    deleteOrder(id: $id)
  }
`;

const ORDER_STATUSES = [
  { value: 'pending_confirmation', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paid_online: 'Thanh toán trực tuyến',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  card: 'Thẻ thanh toán',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  failed: 'Thanh toán thất bại',
  refunded: 'Đã hoàn tiền',
};

interface OrderItem {
  productId: string;
  productName?: string | null;
  productImage?: string | null;
  quantity: number;
  price: number;
  lineTotal?: number | null;
}

interface AdminOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  shippingAddress?: string | null;
  notes?: string | null;
  confirmedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

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

  const noOrders = useMemo(() => !loading && orders.length === 0, [loading, orders.length]);

  if (!user && !authLoading) {
    return null;
  }

  return (
    <div className="admin-grid" style={{ gap: 24 }}>
      <div className="admin-page__header">
        <div>
          <h1>Đơn hàng</h1>
          <p>Theo dõi trạng thái, thanh toán và thông tin khách hàng.</p>
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

      {noOrders ? (
        <div className="admin-card admin-empty" style={{ textAlign: 'center', padding: 40 }}>
          <p>Chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="admin-grid" style={{ gap: 16 }}>
          {orders.map((order) => {
            const prettyStatus =
              ORDER_STATUSES.find((item) => item.value === order.status)?.label || 'Không rõ';
            const paymentMethodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod || ''] || 'Không rõ';
            const paymentStatusLabel = PAYMENT_STATUS_LABELS[order.paymentStatus || ''] || '—';

            return (
              <div key={order.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="admin-flex-between" style={{ gap: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18 }}>Đơn #{order.id}</h2>
                    <p className="admin-muted" style={{ marginTop: 4 }}>
                      Tạo ngày {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Không rõ'}
                    </p>
                    {order.confirmedAt && (
                      <p className="admin-muted" style={{ fontSize: 12 }}>
                        Đã xác nhận lúc {new Date(order.confirmedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div className="admin-flex-between" style={{ gap: 12 }}>
                    <select
                      className="admin-select"
                      value={order.status || 'pending_confirmation'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={loading}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      style={{ paddingInline: 12, paddingBlock: 6 }}
                      onClick={() => handleDelete(order.id)}
                      disabled={loading}
                    >
                      Xoá
                    </button>
                  </div>
                </div>

                <div className="admin-grid admin-grid--two-columns" style={{ gap: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Khách hàng</h3>
                    <p style={{ marginTop: 8 }}>
                      <strong>{order.customerName || 'Ẩn danh'}</strong>
                    </p>
                    <p className="admin-muted" style={{ marginTop: 4 }}>
                      Email: {order.customerEmail || '—'}
                    </p>
                    <p className="admin-muted" style={{ marginTop: 2 }}>
                      SĐT: {order.customerPhone || '—'}
                    </p>
                    <p className="admin-muted" style={{ marginTop: 2 }}>
                      Mã người dùng: {order.userId || '—'}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Thanh toán & giao hàng</h3>
                    <p style={{ marginTop: 8 }}>
                      <strong>Phương thức:</strong> {paymentMethodLabel}
                    </p>
                    <p className="admin-muted" style={{ marginTop: 4 }}>
                      Trạng thái thanh toán: {paymentStatusLabel}
                    </p>
                    <p className="admin-muted" style={{ marginTop: 4 }}>
                      Địa chỉ giao hàng: {order.shippingAddress || '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Sản phẩm</h3>
                  <div style={{ marginTop: 12, border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 8 }}>
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.productId}`}
                        className="admin-flex-between"
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                        }}
                      >
                        <div>
                          <strong>{item.productName || item.productId}</strong>
                          <p className="admin-muted" style={{ marginTop: 2, fontSize: 12 }}>
                            Mã sản phẩm: {item.productId}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="admin-muted" style={{ fontSize: 12 }}>
                            SL: {item.quantity}
                          </p>
                          <p style={{ fontWeight: 600 }}>
                            {formatCurrency(item.lineTotal || item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="admin-flex-between" style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-flex-between" style={{ gap: 16 }}>
                  <div>
                    <span className="admin-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb' }}>
                      {prettyStatus}
                    </span>
                    {order.notes && (
                      <p className="admin-muted" style={{ marginTop: 8 }}>
                        Ghi chú: {order.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="admin-muted" style={{ fontSize: 12 }}>
                      Cập nhật lần cuối: {order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
