'use client';

const SESSION_STORAGE_KEY = 'ai_interaction_session_id';
const INTERACTIONS_ENDPOINT = '/api/interactions';

export type InteractionEventPayload = {
  eventType: string;
  userId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
  occurredAt?: string;
  metadata?: Record<string, unknown> | null;
};

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};

const resolveSessionId = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }
    const newId = generateSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, newId);
    return newId;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Không thể đọc/ghi sessionId cho interactions:', error);
    }
    return undefined;
  }
};

const sanitiseMetadata = (metadata: Record<string, unknown> | null | undefined) => {
  if (metadata == null) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(metadata));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Không thể serialise metadata sự kiện:', error);
    }
    return { warning: 'metadata_not_serializable' };
  }
};

export async function logInteractions(
  events: InteractionEventPayload[],
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const sessionId = resolveSessionId() ?? null;

  const prepared = events
    .filter((event) => event && typeof event.eventType === 'string')
    .map((event) => ({
      eventType: event.eventType,
      userId: event.userId ?? null,
      sessionId: event.sessionId ?? sessionId,
      productId: event.productId ?? null,
      occurredAt: event.occurredAt ?? new Date().toISOString(),
      metadata: sanitiseMetadata(event.metadata),
    }));

  if (!prepared.length) {
    return;
  }

  try {
    await fetch(INTERACTIONS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: prepared }),
      cache: 'no-store',
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Ghi sự kiện AI thất bại:', error);
    }
  }
}

export async function logInteraction(event: InteractionEventPayload): Promise<void> {
  await logInteractions([event]);
}
