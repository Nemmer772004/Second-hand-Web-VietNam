import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CHATBOT_SERVICE_URL = (process.env.CHATBOT_SERVICE_URL || 'http://localhost:8008').replace(/\/$/, '');
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:3008').replace(/\/$/, '');
const AUTH_SERVICE_URL = (process.env.AUTH_SERVICE_INTERNAL_URL || process.env.AUTH_SERVICE_URL || 'http://localhost:3006').replace(/\/$/, '');

const PRODUCT_SERVICE_URL = (() => {
  const explicit = process.env.PRODUCT_SERVICE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  const host = process.env.PRODUCT_SERVICE_HOST || 'localhost';
  const port = process.env.PRODUCT_SERVICE_PORT || '3001';
  return `http://${host}:${port}`;
})();

async function verifyToken(token: string): Promise<{ id: string; email: string } | null> {
  if (!token) {
    return null;
  }
  try {
    const res = await fetch(`${AUTH_SERVICE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.warn('Token verification failed:', error);
    return null;
  }
}

async function fetchProductDetail(productId: string) {
  const trimmed = String(productId ?? '').trim();
  if (!trimmed) {
    return null;
  }
  try {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${encodeURIComponent(trimmed)}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.warn('Không thể lấy chi tiết sản phẩm', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { message, userId, topK, sessionId } = body ?? {};

    // Extract token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Bạn phải đăng nhập để sử dụng chatbot.' },
        { status: 401 },
      );
    }

    // Verify token and get authenticated user
    const authUser = await verifyToken(token);
    if (!authUser) {
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn.' },
        { status: 401 },
      );
    }

    // Ensure user can only request recommendations for themselves
    if (userId && userId !== authUser.id) {
      return NextResponse.json(
        { message: 'Bạn chỉ có thể xem gợi ý sản phẩm của chính mình.' },
        { status: 403 },
      );
    }

    const finalUserId = userId || authUser.id;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: 'Tin nhắn là bắt buộc.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${CHATBOT_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id: finalUserId,
        top_k: topK,
      }),
    });

    const data = await response.json().catch(() => ({}));

    const rawRecommendations: any[] = Array.isArray(data?.recommendations)
      ? data.recommendations
      : [];

    const enriched = await Promise.all(
      rawRecommendations.map(async (item: any) => {
        const itemId = String(item?.item_id ?? item?.itemId ?? item?.productId ?? '').trim();
        if (!itemId) {
          return null;
        }

        const detail = await fetchProductDetail(itemId);

        const priceValue = typeof detail?.price === 'number'
          ? detail.price
          : typeof detail?.price === 'string'
            ? Number(detail.price.replace(/[^0-9.-]/g, ''))
            : undefined;

        const imageUrl =
          (Array.isArray(detail?.images) && detail.images.length > 0 && detail.images[0]) ||
          detail?.image ||
          detail?.imageUrl ||
          undefined;

        return {
          item_id: itemId,
          item_name: detail?.name || item?.item_name || item?.itemName || 'Sản phẩm đề xuất',
          score: typeof item?.score === 'number' ? item.score : undefined,
          price: priceValue,
          image: imageUrl,
          product_id: detail?._id || detail?.id || itemId,
          slug: detail?.slug || detail?.legacyId || undefined,
        };
      }),
    );

    data.recommendations = enriched.filter(Boolean);

    if (AI_SERVICE_URL) {
      const events: any[] = [];

      events.push({
        userId: finalUserId,
        sessionId,
        eventType: 'chat',
        metadata: {
          message,
        },
      });

      if (Array.isArray(data?.recommendations) && data.recommendations.length > 0) {
        events.push({
          userId: finalUserId,
          sessionId,
          eventType: 'recommendation',
          metadata: {
            reply: data?.reply,
            recommendations: data.recommendations,
          },
        });
      }

      const payload = events.filter((event) => event.userId || event.sessionId);

      if (payload.length > 0) {
        try {
          await fetch(`${AI_SERVICE_URL}/interactions/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events: payload }),
            cache: 'no-store',
          });
        } catch (loggingError) {
          console.warn('Không thể ghi nhận hành vi chatbot:', loggingError);
        }
      }
    }

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || 'Chatbot hiện không khả dụng.';
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chatbot proxy error:', error);
    return NextResponse.json(
      { message: 'Không thể kết nối với chatbot. Vui lòng thử lại sau.' },
      { status: 502 },
    );
  }
}
