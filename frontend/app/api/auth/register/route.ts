import { NextResponse } from 'next/server';

const USER_SERVICE_URL = (process.env.USER_SERVICE_URL || 'http://localhost:3004/users').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(process.env.FRONTEND_API_TIMEOUT_MS ?? 7000);

const sanitiseString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const createAbortController = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
};

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email = sanitiseString(payload?.email).toLowerCase();
  const password = sanitiseString(payload?.password);
  const name = sanitiseString(payload?.name);

  if (!email || !password || !name) {
    return NextResponse.json(
      { message: 'Email, mật khẩu và tên là bắt buộc.' },
      { status: 400 },
    );
  }

  const { controller, timeout } = createAbortController(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${USER_SERVICE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        role: 'user',
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || 'Không thể đăng ký. Vui lòng thử lại.' },
        { status: response.status },
      );
    }

    const token: unknown = data?.access_token ?? data?.token;
    const user = data?.user;

    if (!user || typeof token !== 'string') {
      return NextResponse.json(
        { message: 'Dữ liệu đăng ký không hợp lệ.' },
        { status: 502 },
      );
    }

    const nextResponse = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isAdmin: Boolean(user.isAdmin),
        phone: user.phone ?? null,
      },
    });

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
        ? 'Đăng ký quá thời gian phản hồi. Vui lòng thử lại.'
        : 'Không thể đăng ký. Vui lòng thử lại sau.';
    console.error('Register error:', error);
    return NextResponse.json({ message }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
