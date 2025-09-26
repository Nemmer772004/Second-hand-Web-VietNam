'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { graphqlRequest } from '../lib/graphql-client';

const DASHBOARD_QUERY = /* GraphQL */ `
  query AdminDashboard {
    products {
      id
      price
      stock
    }
    orders {
      id
      totalAmount
      status
    }
    users {
      id
    }
  }
`;

interface DashboardData {
  products: { id: string; price: number; stock?: number | null }[];
  orders: { id: string; totalAmount: number; status?: string | null }[];
  users: { id: string }[];
}

export default function HomePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [dashboard, setDashboard] = useState<DashboardData>({ products: [], orders: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<DashboardData>(DASHBOARD_QUERY);
      setDashboard(data || { products: [], orders: [], users: [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  const metrics = useMemo(() => {
    const totalProducts = dashboard.products.length;
    const totalUsers = dashboard.users.length;
    const totalOrders = dashboard.orders.length;
    const revenue = dashboard.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const activeOrders = dashboard.orders.filter((order) => order.status && order.status !== 'completed').length;
    const lowStock = dashboard.products.filter((product) => (product.stock ?? 0) < 5).length;

    return {
      totalProducts,
      totalUsers,
      totalOrders,
      revenue,
      activeOrders,
      lowStock,
    };
  }, [dashboard]);

  if (!user && !authLoading) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Tổng quan hệ thống</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          Theo dõi nhanh tình hình kinh doanh và hoạt động vận hành.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <DashboardCard title="Tổng sản phẩm" value={metrics.totalProducts.toString()} accent="#3b82f6" loading={loading} />
        <DashboardCard title="Khách hàng" value={metrics.totalUsers.toString()} accent="#10b981" loading={loading} />
        <DashboardCard title="Đơn hàng" value={metrics.totalOrders.toString()} accent="#f97316" loading={loading} />
        <DashboardCard
          title="Doanh thu"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(metrics.revenue)}
          accent="#8b5cf6"
          loading={loading}
        />
        <DashboardCard title="Đơn cần xử lý" value={metrics.activeOrders.toString()} accent="#ec4899" loading={loading} />
        <DashboardCard title="Sắp hết hàng" value={metrics.lowStock.toString()} accent="#ef4444" loading={loading} />
      </section>

      <button
        onClick={fetchDashboard}
        disabled={loading}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 16px',
          borderRadius: '8px',
          border: 'none',
          background: '#2563eb',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {loading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
      </button>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  accent,
  loading,
}: {
  title: string;
  value: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 20px -15px rgba(15, 23, 42, 0.25)'
    }}>
      <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>{title}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: accent }}>
        {loading ? '…' : value}
      </p>
    </div>
  );
}
