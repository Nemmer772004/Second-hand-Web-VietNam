import { NextResponse } from 'next/server';

const USER_SERVICE_URL = (process.env.USER_SERVICE_URL || 'http://localhost:3004/users').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(process.env.FRONTEND_API_TIMEOUT_MS ?? 7000);

const sanitiseEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const sanitisePassword = (value: unknown) =>
  typeof value === 'string' ? value : '';

const createAbortController = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email = sanitiseEmail(payload?.email);
  const password = sanitisePassword(payload?.password);

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email và mật khẩu là bắt buộc.' },
      { status: 400 },
    );
  }

  const { controller, timeout } = createAbortController(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${USER_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || 'Email hoặc mật khẩu không chính xác.' },
        { status: response.status },
      );
    }

    const token: unknown = data?.access_token ?? data?.token;
    if (typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { message: 'Dữ liệu xác thực không hợp lệ.' },
        { status: 502 },
      );
    }

    const user = data?.user;
    const responseBody = {
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            isAdmin: Boolean(user.isAdmin),
            phone: user.phone ?? null,
          }
        : null,
    };

    const nextResponse = NextResponse.json(responseBody);
    nextResponse.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.FRONTEND_AUTH_MAX_AGE ?? 60 * 60 * 4),
    });

    return nextResponse;
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Đăng nhập quá thời gian phản hồi. Vui lòng thử lại.'
        : 'Không thể đăng nhập. Vui lòng thử lại sau.';
    console.error('Login error:', error);
    return NextResponse.json({ message }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
