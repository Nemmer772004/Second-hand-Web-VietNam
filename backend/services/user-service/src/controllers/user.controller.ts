import { Request, Response } from 'express';
import { AppDataSource } from '../database.js';
import { UserProfile } from '../entities/user-profile.entity.js';

const AUTH_SERVICE_BASE = (process.env.AUTH_SERVICE_URL || 'http://localhost:3006/auth').replace(/\/$/, '');

type AuthUser = {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

type FetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

const ensurePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const authFetch = (path: string, init: FetchInit = {}) => {
  const url = `${AUTH_SERVICE_BASE}${ensurePath(path)}`;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (!headers['Accept']) {
    headers['Accept'] = 'application/json';
  }
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...init, headers });
};

const userRepository = () => AppDataSource.getRepository(UserProfile);

const normalizeAddress = (address: any): Record<string, any> | null => {
  if (!address) return null;
  if (typeof address === 'object') {
    return {
      street: address.street ?? null,
      city: address.city ?? null,
      state: address.state ?? null,
      zipCode: address.zipCode ?? null,
      country: address.country ?? null,
    };
  }
  return { raw: String(address) };
};

const toISO = (value?: Date | string | null) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const resolveRole = (role?: string, fallback: 'admin' | 'user' = 'user'): 'admin' | 'user' => {
  if (role === 'admin') return 'admin';
  if (role === 'user') return 'user';
  return fallback;
};

const ensureUserProfile = async (
  authUser: AuthUser,
  options: {
    name?: string;
    role?: string;
    phone?: string;
    address?: any;
  } = {},
) => {
  const repo = userRepository();
  const role = resolveRole(options.role, authUser.isAdmin ? 'admin' : 'user');

  let profile = await repo.findOne({ where: [{ authId: authUser.id }, { email: authUser.email }] });

  if (!profile) {
    profile = repo.create({
      authId: authUser.id,
      email: authUser.email,
      name: options.name || authUser.name,
      role,
      phone: options.phone ?? null,
      address: normalizeAddress(options.address),
      avatar: authUser.avatar ?? null,
    });
  } else {
    profile.authId = authUser.id;
    profile.email = authUser.email;
    profile.name = options.name || authUser.name || profile.name;
    profile.role = resolveRole(options.role, profile.role);
    profile.phone = typeof options.phone === 'string' ? options.phone : profile.phone;
    profile.address = options.address !== undefined ? normalizeAddress(options.address) : profile.address;
    profile.avatar = authUser.avatar ?? profile.avatar ?? null;
  }

  return repo.save(profile);
};

const toClientUser = (authUser: AuthUser, profile?: UserProfile | null) => {
  const isAdmin = Boolean(authUser.isAdmin) || profile?.role === 'admin';
  return {
    id: authUser.id,
    authId: authUser.id,
    profileId: profile?.id,
    email: authUser.email,
    name: profile?.name || authUser.name,
    avatar: authUser.avatar || profile?.avatar || null,
    isAdmin,
    role: profile?.role || (isAdmin ? 'admin' : 'user'),
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    createdAt: toISO(profile?.createdAt) || authUser.createdAt,
    updatedAt: toISO(profile?.updatedAt) || authUser.updatedAt,
  };
};

const toProfileResponse = (profile: UserProfile | null) => {
  if (!profile) return null;
  return {
    id: profile.id,
    profileId: profile.id,
    authId: profile.authId,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    phone: profile.phone,
    address: profile.address,
    createdAt: toISO(profile.createdAt),
    updatedAt: toISO(profile.updatedAt),
  };
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userRepository().find({ order: { createdAt: 'ASC' } });
    res.json(users.map(toProfileResponse));
  } catch (error) {
    console.error('getAllUsers error', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userRepository().findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(toProfileResponse(user));
  } catch (error) {
    console.error('getUserById error', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const getUserByAuthId = async (req: Request, res: Response) => {
  try {
    const authId = Number.parseInt(req.params.authId, 10);
    if (!Number.isInteger(authId)) {
      return res.status(400).json({ message: 'Invalid authId' });
    }

    const user = await userRepository().findOne({ where: { authId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(toProfileResponse(user));
  } catch (error) {
    console.error('getUserByAuthId error', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role, address } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const authRes = await authFetch('/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name,
        isAdmin: role === 'admin',
      }),
    });

    if (!authRes.ok) {
      const errorPayload = await authRes.json().catch(() => ({}));
      return res.status(authRes.status).json(errorPayload);
    }

    const authData = (await authRes.json()) as AuthResponse;
    const profile = await ensureUserProfile(authData.user, {
      name,
      phone,
      role: resolveRole(role),
      address,
    });

    res.status(201).json({
      access_token: authData.access_token,
      user: toClientUser(authData.user, profile),
    });
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    console.error('createUser error', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const repo = userRepository();
    const user = await repo.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, role, address } = req.body || {};
    if (typeof name === 'string') user.name = name;
    if (typeof phone === 'string') user.phone = phone;
    if (typeof role === 'string') user.role = resolveRole(role, user.role);
    if (address !== undefined) {
      user.address = normalizeAddress(address);
    }

    const saved = await repo.save(user);
    res.json(toProfileResponse(saved));
  } catch (error) {
    console.error('updateUser error', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const repo = userRepository();
    const result = await repo.delete({ id: req.params.id });
    if (!result.affected) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('deleteUser error', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const authRes = await authFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!authRes.ok) {
      const errorPayload = await authRes.json().catch(() => ({}));
      return res.status(authRes.status).json(errorPayload);
    }

    const authData = (await authRes.json()) as AuthResponse;
    const profile = await ensureUserProfile(authData.user, { name: authData.user.name });
    res.json({
      access_token: authData.access_token,
      user: toClientUser(authData.user, profile),
    });
  } catch (error) {
    console.error('login error', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = (req.headers.authorization ||
      (typeof req.query?.token === 'string' ? req.query.token : undefined)) as string | undefined;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : authHeader;

    const authRes = await authFetch('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!authRes.ok) {
      const errorPayload = await authRes.json().catch(() => ({}));
      return res.status(authRes.status).json(errorPayload);
    }

    const authUser = (await authRes.json()) as AuthUser;
    const profile =
      (await userRepository().findOne({ where: { authId: authUser.id } })) ||
      (await ensureUserProfile(authUser, { name: authUser.name }));

    res.json(toClientUser(authUser, profile));
  } catch (error) {
    console.error('getCurrentUser error', error);
    res.status(500).json({ message: 'Error fetching current user' });
  }
};

export const syncProfile = async (req: Request, res: Response) => {
  try {
    const { authUser, profile: profilePayload } = req.body || {};

    if (authUser?.id === undefined || !authUser?.email) {
      return res.status(400).json({ message: 'Invalid auth user payload' });
    }

    const saved = await ensureUserProfile(authUser, {
      name: authUser.name,
      role: profilePayload?.role,
      phone: profilePayload?.phone,
      address: profilePayload?.address,
    });

    res.json(toProfileResponse(saved));
  } catch (error) {
    console.error('syncProfile error', error);
    res.status(500).json({ message: 'Error syncing profile' });
  }
};
