const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

function apiUrl(path: string) {
  return `${API_ORIGIN ?? ''}${path}`;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T | { message?: string };
  if (!response.ok) {
    throw new Error(
      typeof data === 'object' && data && 'message' in data && data.message
        ? data.message
        : `Request failed (${response.status}).`,
    );
  }
  return data as T;
}
