'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../lib/graphql-client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  isAdmin?: boolean;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

const LOGIN_MUTATION = /* GraphQL */ `
  mutation AdminLogin($input: LoginInput!) {
    login(input: $input) {
      access_token
      user {
        id
        email
        name
        avatar
        isAdmin
      }
    }
  }
`;

const ME_QUERY = /* GraphQL */ `
  query AdminMe {
    me {
      id
      email
      name
      avatar
      isAdmin
    }
  }
`;

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_USER_KEY) : null;

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const data = await graphqlRequest(ME_QUERY, undefined, storedToken);
          if (data?.me) {
            setUser(data.me);
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.me));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to hydrate admin session', err);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await graphqlRequest(LOGIN_MUTATION, { 
        input: { 
          email, 
          password, 
          isAdminLogin: true 
        } 
      });

      const { access_token, user: userData } = response?.login;
      
      if (!access_token || !userData) {
        throw new Error('Đăng nhập không thành công.');
      }

      if (!userData.isAdmin) {
        throw new Error('Tài khoản không có quyền quản trị.');
      }

      setToken(access_token);
      setUser(userData);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_TOKEN_KEY, access_token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userData));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, error, login, logout }),
    [user, token, loading, error, login, logout]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
