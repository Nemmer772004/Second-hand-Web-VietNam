import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const USER_SERVICE_URL = (process.env.USER_SERVICE_URL || 'http://localhost:3004/users').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(process.env.FRONTEND_API_TIMEOUT_MS ?? 7000);

const createAbortController = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
};

export async function GET() {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { controller, timeout } = createAbortController(DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${USER_SERVICE_URL}/me/current`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        isAdmin: Boolean(data.isAdmin),
        phone: data.phone ?? null,
      },
    });
  } catch (error) {
    const status =
      error instanceof Error && error.name === 'AbortError' ? 504 : 500;
    return NextResponse.json(
      { user: null, message: 'Không thể tải thông tin phiên.' },
      { status },
    );
  } finally {
    clearTimeout(timeout);
  }
}
