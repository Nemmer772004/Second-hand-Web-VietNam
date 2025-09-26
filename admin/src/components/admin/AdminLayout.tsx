'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAdminAuth();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [authLoading, user, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <div className="admin-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">{children}</main>
      </div>

    </div>
  );
}
