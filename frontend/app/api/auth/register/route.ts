import { NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004/users';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, mật khẩu và tên là bắt buộc.' },
        { status: 400 },
      );
    }

    const payload = {
      email: email.toLowerCase(),
      password,
      name,
      role: 'user',
    };

    const response = await fetch(`${USER_SERVICE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || 'Không thể đăng ký. Vui lòng thử lại.' },
        { status: response.status },
      );
    }

    return NextResponse.json({
      access_token: data.access_token ?? data.token,
      user: data.user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Không thể đăng ký. Vui lòng thử lại sau.' },
      { status: 500 },
    );
  }
}
