import { setTimeout as delay } from 'timers/promises';

const DEFAULT_TIMEOUT_MS = Number(process.env.HTTP_CLIENT_TIMEOUT_MS ?? 5000);
const DEFAULT_RETRY_ATTEMPTS = Number(process.env.HTTP_CLIENT_RETRY_ATTEMPTS ?? 2);

type RetryOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as any).name === 'AbortError';

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRY_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? 150;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutHandle);

      if (response.ok || attempt === retries) {
        return response;
      }

      lastError = new Error(`Request failed with status ${response.status}`);
    } catch (error) {
      clearTimeout(timeoutHandle);
      lastError = error;

      if (attempt === retries || !isAbortError(error)) {
        if (attempt === retries) {
          break;
        }
      }
    }

    await delay(retryDelayMs * (attempt + 1)).catch(() => undefined);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('HTTP request failed without a known error');
}
