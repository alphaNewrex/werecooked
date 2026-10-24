const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);

export function extractShortcode(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !INSTAGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length !== 2 || !['reel', 'reels', 'p'].includes(segments[0].toLowerCase())) {
      return null;
    }
    return /^[A-Za-z0-9_-]+$/.test(segments[1]) ? segments[1] : null;
  } catch {
    return null;
  }
}
