import { NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3008';

type IncomingEvent = {
  eventType?: unknown;
  userId?: unknown;
  sessionId?: unknown;
  productId?: unknown;
  occurredAt?: unknown;
  metadata?: unknown;
};

const normaliseEvent = (raw: IncomingEvent) => {
  if (!raw || typeof raw.eventType !== 'string' || raw.eventType.trim().length === 0) {
    return null;
  }

  const occurredAt =
    typeof raw.occurredAt === 'string' && raw.occurredAt.trim().length > 0
      ? new Date(raw.occurredAt).toISOString()
      : new Date().toISOString();

  let metadata: any = null;
  if (raw.metadata != null) {
    if (typeof raw.metadata === 'object') {
      try {
        metadata = JSON.parse(JSON.stringify(raw.metadata));
      } catch {
        metadata = { warning: 'metadata_not_serializable' };
      }
    } else if (typeof raw.metadata === 'string' && raw.metadata.trim().length > 0) {
      try {
        metadata = JSON.parse(raw.metadata);
      } catch {
        metadata = { warning: 'metadata_not_json_string', value: raw.metadata };
      }
    }
  }

  const userId =
    typeof raw.userId === 'number' && Number.isFinite(raw.userId)
      ? String(Math.trunc(raw.userId))
      : typeof raw.userId === 'string'
      ? raw.userId.trim()
      : null;

  return {
    eventType: raw.eventType,
    userId: userId && userId.length ? userId : null,
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : null,
    productId: typeof raw.productId === 'string' ? raw.productId : null,
    occurredAt,
    metadata,
  };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEvents = Array.isArray(body?.events)
      ? body.events
      : Array.isArray(body)
      ? body
      : body?.event
      ? [body.event]
      : [];

    const events = rawEvents
      .map((item: IncomingEvent) => normaliseEvent(item))
      .filter(
        (
          event: ReturnType<typeof normaliseEvent> | null,
        ): event is NonNullable<ReturnType<typeof normaliseEvent>> => event !== null,
      );

    if (!events.length) {
      return NextResponse.json(
        { message: 'Không có sự kiện hợp lệ để ghi.' },
        { status: 400 },
      );
    }

    const response = await fetch(`${AI_SERVICE_URL}/interactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Không thể chuyển tiếp sự kiện tới AI service:', error);
    return NextResponse.json(
      { message: 'Ghi nhận sự kiện thất bại.' },
      { status: 502 },
    );
  }
}
