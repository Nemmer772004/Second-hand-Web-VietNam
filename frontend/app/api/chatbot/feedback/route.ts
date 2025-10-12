import { NextResponse } from 'next/server';

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:3008').replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, sessionId, productId, reaction } = body ?? {};

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ message: 'Thiếu productId' }, { status: 400 });
    }

    if (!reaction || !['liked', 'disliked'].includes(String(reaction))) {
      return NextResponse.json({ message: 'Phản hồi không hợp lệ' }, { status: 400 });
    }

    if (!AI_SERVICE_URL) {
      return NextResponse.json({ message: 'AI service chưa cấu hình' }, { status: 503 });
    }

    const payload = {
      events: [
        {
          userId,
          sessionId,
          productId,
          eventType: 'recommendation_feedback',
          metadata: {
            reaction,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    };

    await fetch(`${AI_SERVICE_URL}/interactions/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }).catch((error) => {
      console.warn('Không thể ghi nhận phản hồi chatbot', error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chatbot feedback error:', error);
    return NextResponse.json({ message: 'Không thể ghi nhận phản hồi' }, { status: 500 });
  }
}
