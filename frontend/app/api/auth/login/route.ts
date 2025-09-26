import { NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004/users';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email và mật khẩu là bắt buộc.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${USER_SERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || 'Email hoặc mật khẩu không chính xác.' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      access_token: data.access_token ?? data.token,
      user: data.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Không thể đăng nhập. Vui lòng thử lại sau.' },
      { status: 500 },
    );
  }
}
