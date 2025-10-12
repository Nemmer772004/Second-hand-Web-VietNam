'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_CACHE_KEY = 'frontend_cached_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistUser = useCallback((sessionUser: User | null) => {
    setUser(sessionUser);
    if (typeof window === 'undefined') {
      return;
    }
    if (sessionUser) {
      window.sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(sessionUser));
    } else {
      window.sessionStorage.removeItem(USER_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    const restoreFromCache = () => {
      if (typeof window === 'undefined') {
        return;
      }
      try {
        const raw = window.sessionStorage.getItem(USER_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        }
      } catch (error) {
        console.warn('Không thể khôi phục người dùng từ cache phiên', error);
      }
    };

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          persistUser(null);
          return;
        }

        const data = await response.json();
        if (data?.user) {
          persistUser({
            ...data.user,
            isAdmin: Boolean(data.user.isAdmin),
          });
        } else {
          persistUser(null);
        }
      } catch (err) {
        console.warn('Không thể tải trạng thái đăng nhập hiện tại', err);
      } finally {
        setLoading(false);
      }
    };

    restoreFromCache();
    void loadSession();
  }, [persistUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Thông tin đăng nhập không chính xác');
      }

      if (!data.user || typeof data.user.isAdmin !== 'boolean') {
        throw new Error('Không thể xác thực thông tin người dùng');
      }

      persistUser({
        ...data.user,
        isAdmin: Boolean(data.user.isAdmin),
      });

      toast({
        title: 'Đăng nhập thành công',
        description: data.user.isAdmin
          ? 'Chào mừng quản trị viên đã quay trở lại!'
          : 'Chào mừng bạn đã quay trở lại!',
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể đăng nhập vào hệ thống. Vui lòng thử lại.';
      setError(message);
      toast({
        title: 'Lỗi đăng nhập',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      if (!data.user) {
        throw new Error('Không thể đăng ký. Vui lòng thử lại.');
      }

      persistUser({
        ...data.user,
        isAdmin: Boolean(data.user.isAdmin),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      persistUser(null);
      setLoading(false);
    }
  }, [persistUser]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}

export type { User, AuthContextType };
