import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const USER_SERVICE_URL = (process.env.USER_SERVICE_URL || 'http://localhost:3004/users').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(process.env.FRONTEND_API_TIMEOUT_MS ?? 7000);

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth_token');

  if (!token) {
    return response;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    await fetch(`${USER_SERVICE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Logout propagation timeout'
        : 'Logout propagation failed';
    console.warn(message, error);
  } finally {
    clearTimeout(timeout);
  }

  return response;
}
