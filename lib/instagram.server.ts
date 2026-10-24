const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);

export type CaptionResult = {
  caption: string;
  source: 'embed' | 'page';
};

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized in named) {
      return named[normalized];
    }
    if (normalized.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    }
    if (normalized.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    }
    return entity;
  });
}

function textFromHtml(fragment: string) {
  return decodeEntities(
    fragment
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function attributesFromTag(tag: string) {
  const attributes: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(['"])(.*?)\2/gs)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[3]);
  }
  return attributes;
}

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

export function parseCaptionFromHtml(html: string) {
  const captionBlock = html.match(
    /<(?:div|article|p)\b[^>]*class=["'][^"']*(?:_a9zs|caption)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|p)>/i,
  );
  if (captionBlock) {
    const caption = textFromHtml(captionBlock[1]);
    if (caption) {
      return caption;
    }
  }

  const jsonCaption = html.match(
    /"edge_media_to_caption"\s*:\s*\{\s*"edges"\s*:\s*\[\s*\{\s*"node"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/,
  );
  if (jsonCaption) {
    try {
      const caption = textFromHtml(JSON.parse(`"${jsonCaption[1]}"`));
      if (caption) {
        return caption;
      }
    } catch {
      // Continue to metadata parsing when embedded JSON is malformed.
    }
  }

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = attributesFromTag(tag);
    const key = (attributes.property ?? attributes.name)?.toLowerCase();
    if (key === 'og:description' || key === 'og:title') {
      const caption = textFromHtml(attributes.content ?? '');
      if (caption) {
        return caption;
      }
    }
  }
  return null;
}

export async function fetchReelCaption(code: string): Promise<CaptionResult | null> {
  const requests: Array<{ url: string; source: CaptionResult['source']; userAgent?: string }> = [
    {
      url: `https://www.instagram.com/p/${encodeURIComponent(code)}/embed/captioned/`,
      source: 'embed',
    },
    {
      url: `https://www.instagram.com/reel/${encodeURIComponent(code)}/`,
      source: 'page',
      userAgent: 'facebookexternalhit/1.1',
    },
  ];

  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        headers: request.userAgent ? { 'User-Agent': request.userAgent } : undefined,
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        continue;
      }
      const caption = parseCaptionFromHtml(await response.text());
      if (caption) {
        return { caption, source: request.source };
      }
    } catch {
      // A blocked or timed-out extraction attempt falls through to the next one.
    }
  }
  return null;
}
