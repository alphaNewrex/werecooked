import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { expect, test } from '@playwright/test';

import { RecipeSchema } from '../lib/schemas';
import { instacartConfigured, krogerConfigured } from './env';

const fixture = (name: string) => resolve(process.cwd(), 'e2e/fixtures', name);

async function imageBase64(name: string) {
  return (await readFile(fixture(name))).toString('base64');
}

test.describe('CookFood API', () => {
  test('scans the pantry photo', async ({ request }) => {
    // pantry-photo.jpg shows only one food (poblanos), so a correct scan returns one item.
    // Use the multi-food USDA photo to verify that several distinct items are detected.
    const response = await request.post('/api/scan-pantry', {
      data: {
        imageBase64: await imageBase64('pantry-groceries.jpg'),
        mimeType: 'image/jpeg',
      },
      timeout: 120_000,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(2);
    expect(body.items.every((item: { name?: string }) => item.name)).toBeTruthy();
  });

  test('suggests recipes with pantry matches and steps', async ({ request }) => {
    const response = await request.post('/api/suggest', {
      data: { pantry: ['eggs', 'spinach', 'garlic', 'parmesan'] },
      timeout: 120_000,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.recipes.length).toBeGreaterThanOrEqual(1);
    expect(body.recipes.length).toBeLessThanOrEqual(3);
    for (const recipe of body.recipes) {
      expect(RecipeSchema.parse(recipe).steps.length).toBeGreaterThan(0);
      expect(recipe.ingredients.some((ingredient: { haveIt: boolean }) => ingredient.haveIt)).toBeTruthy();
    }
  });

  test('reads a reel screenshot into a recipe', async ({ request }) => {
    const response = await request.post('/api/reel', {
      data: {
        imageBase64: await imageBase64('reel-screenshot.png'),
        mimeType: 'image/png',
        pantry: ['chicken breast', 'garlic', 'spinach', 'parmesan'],
      },
      timeout: 120_000,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const recipe = RecipeSchema.parse(body.recipe);
    expect(`${recipe.title} ${recipe.ingredients.map((item) => item.name).join(' ')}`).toMatch(/chicken/i);
  });

  test('handles an Instagram reel link', async ({ request }) => {
    const response = await request.post('/api/reel-link', {
      data: {
        url: 'https://www.instagram.com/reel/CNmPJ92BmWh/',
        pantry: ['chicken breast', 'garlic'],
      },
      timeout: 120_000,
    });
    expect([200, 422]).toContain(response.status());
    const body = await response.json();
    if (response.status() === 200) {
      expect(RecipeSchema.parse(body.recipe).steps.length).toBeGreaterThan(0);
    } else {
      expect(body.needScreenshot).toBe(true);
    }
  });

  test('creates a grocery link', async ({ request }) => {
    const response = await request.post('/api/grocery-link', {
      data: { title: 'CookFood test', items: [{ name: 'eggs', amount: '12' }] },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body, `grocery-link body: ${JSON.stringify(body)}`).toMatchObject({
      url: instacartConfigured() ? expect.stringMatching(/^https:\/\//) : null,
    });
  });

  test('looks up egg and banana macros', async ({ request }) => {
    const response = await request.post('/api/nutrition', {
      data: { names: ['egg', 'banana'] },
      timeout: 30_000,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const egg = body.results.find((result: { name: string }) => result.name === 'egg').macros;
    const banana = body.results.find((result: { name: string }) => result.name === 'banana').macros;
    expect(egg.proteinG).toBeGreaterThanOrEqual(10);
    expect(egg.proteinG).toBeLessThanOrEqual(16);
    expect(banana.kcal).toBeGreaterThanOrEqual(70);
    expect(banana.kcal).toBeLessThanOrEqual(110);
  });

  test('looks up Kroger prices or returns the unconfigured reason', async ({ request }) => {
    const response = await request.post('/api/prices', {
      data: {
        items: [{ name: 'eggs' }, { name: 'spinach' }, { name: 'parmesan' }],
        zip: process.env.KROGER_ZIP || '45202',
      },
      timeout: 60_000,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    if (krogerConfigured()) {
      expect(body.store).not.toBeNull();
      const matches = body.results.filter(
        (result: { match: { priceUsd: number; url: string } | null }) => result.match,
      );
      expect(matches.length).toBeGreaterThanOrEqual(2);
      for (const result of matches) {
        expect(result.match.priceUsd).toBeGreaterThanOrEqual(0.5);
        expect(result.match.priceUsd).toBeLessThanOrEqual(30);
        expect(result.match.url).toMatch(/^https:\/\/www\.kroger\.com\//);
      }
    } else {
      expect(body.store).toBeNull();
      expect(body.reason).toBeTruthy();
    }
  });

  test('rejects an invalid Kroger ZIP code', async ({ request }) => {
    const response = await request.post('/api/prices', {
      data: { items: [{ name: 'eggs' }], zip: '1234' },
    });
    expect(response.status()).toBe(400);
  });
});
