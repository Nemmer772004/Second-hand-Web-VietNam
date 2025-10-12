'use client';

import { useAuth } from '@/context/auth-context';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bảng điều khiển quản trị</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Thông tin tài khoản</h3>
          <p className="text-gray-600">Tên: {user?.name}</p>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Vai trò: Quản trị viên</p>
        </div>
        
        {/* Add more admin dashboard widgets here */}
      </div>
    </div>
  );
}