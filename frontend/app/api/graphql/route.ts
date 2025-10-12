import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/graphql';

const DEFAULT_TIMEOUT_MS = Number(process.env.FRONTEND_API_TIMEOUT_MS ?? 8000);

const createAbortController = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const token = request.cookies.get('auth_token')?.value;

  const { controller, timeout } = createAbortController(DEFAULT_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(UPSTREAM_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      signal: controller.signal,
    });

    const payload = await upstreamResponse.text();
    const response = new NextResponse(payload, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'application/json',
      },
    });

    return response;
  } catch (error) {
    const response = NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error && error.name === 'AbortError'
                ? 'Yêu cầu GraphQL bị quá thời gian'
                : 'Không thể kết nối tới dịch vụ GraphQL',
          },
        ],
      },
      { status: 504 },
    );
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
