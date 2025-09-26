'use client';

import { AdminAuthProvider } from '../context/AdminAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
