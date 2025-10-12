'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: 'Chưa đăng nhập',
          description: 'Bạn cần đăng nhập với tài khoản quản trị để truy cập trang này',
          variant: 'destructive',
        });
        router.push('/login?redirect=/admin');
        return;
      }

      if (!user.isAdmin) {
        toast({
          title: 'Không có quyền truy cập',
          description: 'Tài khoản của bạn không có quyền truy cập vào trang quản trị',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Quản trị viên</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block p-2 hover:bg-gray-100 rounded-md">
                  Trang tổng quan
                </Link>
              </li>
              <li>
                <Link href="/admin/products" className="block p-2 hover:bg-gray-100 rounded-md">
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="block p-2 hover:bg-gray-100 rounded-md">
                  Quản lý đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="block p-2 hover:bg-gray-100 rounded-md">
                  Quản lý người dùng
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="block p-2 hover:bg-gray-100 rounded-md">
                  Quản lý danh mục
                </Link>
              </li>
              <li>
                <Link href="/admin/reports" className="block p-2 hover:bg-gray-100 rounded-md">
                  Báo cáo & Thống kê
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
