'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminHeader() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAdminAuth();

  const initial = user?.name?.[0]?.toUpperCase() || 'A';

  const goTo = (path: string) => {
    router.push(path);
  };

  return (
    <header className="admin-header">
      <span
        className="admin-header__title"
        onClick={() => goTo('/')}
      >
        Studio Dashboard
      </span>

      <div className="admin-header__user">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <strong style={{ fontSize: 14 }}>{user?.name || 'Admin'}</strong>
          <span className="admin-muted" style={{ fontSize: 12 }}>{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="admin-btn admin-btn--ghost"
          style={{ borderRadius: '999px', padding: '8px', width: 40, height: 40, lineHeight: 0 }}
        >
          {initial}
        </button>

        {isDropdownOpen && (
          <div className="admin-dropdown">
            <button
              type="button"
              className="admin-dropdown__item"
              onClick={() => goTo('/profile')}
            >
              Thông tin cá nhân
            </button>
            <button
              type="button"
              className="admin-dropdown__item"
              onClick={() => goTo('/settings')}
            >
              Cài đặt
            </button>
            <button
              type="button"
              className="admin-dropdown__item"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
