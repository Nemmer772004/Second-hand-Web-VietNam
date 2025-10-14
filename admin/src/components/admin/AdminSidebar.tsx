'use client';

import { useRouter, usePathname } from 'next/navigation';
import { memo } from 'react';

const menuItems = [
  { href: '/', label: 'Tổng quan', icon: '📊' },
  { href: '/products', label: 'Sản phẩm', icon: '📦' },
  { href: '/categories', label: 'Danh mục', icon: '🗂️' },
  { href: '/orders', label: 'Đơn hàng', icon: '🧾' },
  { href: '/users', label: 'Người dùng', icon: '👥' },
  { href: '/recommendations', label: 'Gợi ý realtime', icon: '🤖' },
  { href: '/ai-training', label: 'Lịch sử huấn luyện AI', icon: '🧠' },
];

function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">Studio Admin</div>
      <nav className="admin-sidebar__menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default memo(AdminSidebar);
