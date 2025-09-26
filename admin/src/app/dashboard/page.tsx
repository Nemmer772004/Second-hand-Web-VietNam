'use client';

import { useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../../lib/graphql-client';

const OVERVIEW_QUERY = /* GraphQL */ `
  query AdminOverview {
    products {
      id
      price
      stock
    }
    orders {
      id
      totalAmount
      status
      createdAt
    }
    users {
      id
    }
    categories {
      id
    }
  }
`;

interface OverviewData {
  products: { id: string; price: number; stock?: number | null }[];
  orders: { id: string; totalAmount: number; status?: string | null; createdAt?: string | null }[];
  users: { id: string }[];
  categories: { id: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await graphqlRequest<OverviewData>(OVERVIEW_QUERY);
        setData(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    if (!data) {
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCategories: 0,
        inventory: 0,
      };
    }

    const totalRevenue = data.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const inventory = data.products.reduce((sum, product) => sum + (product.stock || 0), 0);

    return {
      totalUsers: data.users.length,
      totalOrders: data.orders.length,
      totalRevenue,
      totalProducts: data.products.length,
      totalCategories: data.categories.length,
      inventory,
    };
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-grid" style={{ gap: 32 }}>
      <div className="admin-page__header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p>Thông tin nhanh về kho dữ liệu và doanh thu.</p>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span>Tổng sản phẩm</span>
          <div className="admin-kpi-value">{stats.totalProducts}</div>
          <span className="admin-muted">{stats.inventory} sản phẩm trong kho</span>
        </div>
        <div className="admin-kpi-card">
          <span>Đơn hàng</span>
          <div className="admin-kpi-value">{stats.totalOrders}</div>
          <span className="admin-muted">Doanh thu {stats.totalRevenue.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="admin-kpi-card">
          <span>Khách hàng</span>
          <div className="admin-kpi-value">{stats.totalUsers}</div>
          <span className="admin-muted">{stats.totalCategories} danh mục đang hoạt động</span>
        </div>
      </div>

      {data && data.orders.length > 0 && (
        <div className="admin-card">
          <div className="admin-flex-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Đơn hàng gần đây</h2>
              <span className="admin-muted">Top 5 đơn hàng mới nhất</span>
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {data.orders
                .slice()
                .sort((a, b) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 5)
                .map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <span className="admin-chip">{order.status || 'pending'}</span>
                    </td>
                    <td className="admin-muted">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.totalAmount || 0)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
