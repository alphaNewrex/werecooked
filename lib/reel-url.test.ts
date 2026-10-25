import { describe, expect, it } from 'vitest';

import { extractShortcode } from './reel-url';

describe('extractShortcode', () => {
  it.each([
    ['https://instagram.com/reel/ABC123/', 'ABC123'],
    ['https://www.instagram.com/reels/Abc_12-xy/?utm_source=share', 'Abc_12-xy'],
    ['https://m.instagram.com/p/XYZ987?img_index=1', 'XYZ987'],
  ])('extracts a shortcode from %s', (url, shortcode) => {
    expect(extractShortcode(url)).toBe(shortcode);
  });

  it.each([
    'http://www.instagram.com/reel/CNmPJ92BmWh/',
    'https://example.com/reel/CNmPJ92BmWh/',
    'https://instagram.com/stories/CNmPJ92BmWh/',
    'https://instagram.com/reel/not.valid/',
    'not a URL',
  ])('rejects %s', (url) => {
    expect(extractShortcode(url)).toBeNull();
  });
});
