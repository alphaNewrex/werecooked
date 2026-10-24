const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get needScreenshot() {
    return this.body?.needScreenshot === true;
  }
}

function apiUrl(path: string) {
  return `${API_ORIGIN ?? ''}${path}`;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T | { message?: string };
  if (!response.ok) {
    const body = data as Record<string, unknown>;
    throw new ApiError(
      typeof data === 'object' && data && 'message' in data && data.message
        ? data.message
        : `Request failed (${response.status}).`,
      response.status,
      body,
    );
  }
  return data as T;
}
