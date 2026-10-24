import { test, expect, type Page } from '@playwright/test';

import { instacartConfigured } from './env';

test.use({ viewport: { width: 390, height: 844 } });

declare global {
  interface Window {
    __openedUrls?: string[];
  }
}

async function addItem(page: Page, name: string, quantity: string, category: string) {
  await page.getByPlaceholder('Ingredient name').fill(name);
  await page.getByPlaceholder('Quantity').fill(quantity);
  await page.getByPlaceholder('Category').fill(category);
  await page.getByRole('button', { name: 'Add to pantry', exact: true }).click();
  await expect(page.getByPlaceholder('Ingredient name')).toHaveValue('');
}

async function uploadWithPicker(page: Page, buttonName: string, fileName: string) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  await (await chooser).setFiles(`e2e/fixtures/${fileName}`);
}

/**
 * Loads the app shell. The shared dev server occasionally answers a document request with a
 * transient SSR 500 while Metro rebuilds after file edits; log the body and retry once.
 */
async function loadApp(page: Page, action: () => Promise<unknown>) {
  for (let attempt = 1; ; attempt++) {
    const response = (await action()) as Awaited<ReturnType<Page['reload']>>;
    if (!response || response.status() < 500 || attempt === 3) {
      expect(response?.status() ?? 200).toBeLessThan(500);
      return;
    }
    const body = (await response.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    console.log(`Dev server returned ${response.status()} for ${response.url()}: ${body.slice(0, 1500)}`);
    await page.waitForTimeout(3000);
    action = () => page.reload();
  }
}

async function pantryCount(page: Page) {
  const text = (await page.getByTestId('pantry-count').textContent()) ?? '';
  const match = /^(\d+) items?$/.exec(text.trim());
  expect(match, `pantry count text: "${text}"`).not.toBeNull();
  return Number(match![1]);
}

/** Fails fast with the app's inline error instead of waiting out a long timeout. */
async function waitForResultOrError(page: Page, success: ReturnType<Page['getByText']>) {
  const error = page.getByRole('alert').filter({ visible: true });
  await expect(success.or(error).first()).toBeVisible({ timeout: 150_000 });
  if (await error.isVisible()) {
    throw new Error(`App reported an error: ${(await error.innerText()).replace(/\s+/g, ' ')}`);
  }
}

test('manual pantry, cook, grocery, and reel flows', async ({ page }) => {
  test.setTimeout(480_000);

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  // Capture Linking.openURL on web (react-native-web calls window.open) without leaving the app.
  await page.addInitScript(() => {
    window.__openedUrls = [];
    window.open = ((url?: string | URL) => {
      window.__openedUrls!.push(String(url));
      return null;
    }) as typeof window.open;
  });

  await loadApp(page, () => page.goto('/'));
  await page.evaluate(() => localStorage.clear());
  await loadApp(page, () => page.reload());
  await expect(page.getByText('Pantry', { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId('pantry-count')).toHaveText('0 items');

  // Manual pantry CRUD.
  await addItem(page, 'eggs', '6', 'protein');
  await addItem(page, 'spinach', '1 bag', 'produce');
  await addItem(page, 'garlic', '1 bulb', 'produce');
  await addItem(page, 'parmesan', '1 wedge', 'dairy');
  for (const item of ['eggs', 'spinach', 'garlic', 'parmesan']) {
    await expect(page.getByText(item, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByTestId('pantry-count')).toHaveText('4 items');

  // USDA macros are enriched silently in the background.
  await expect(page.getByText(/\d+ kcal · P \d/).first()).toBeVisible({ timeout: 30_000 });

  // Photo scan -> review -> add.
  const countBeforeScan = await pantryCount(page);
  await uploadWithPicker(page, 'Photo library', 'pantry-photo.jpg');
  await expect(page.getByText('Reading your photo…')).toBeVisible();
  await waitForResultOrError(page, page.getByText('Review detected items', { exact: true }));
  await page.getByRole('button', { name: 'Add selected to pantry', exact: true }).click();
  await expect(page.getByText('Review detected items', { exact: true })).toBeHidden();
  await expect.poll(() => pantryCount(page)).toBeGreaterThan(countBeforeScan);
  console.log(`Pantry count: ${countBeforeScan} -> ${await pantryCount(page)} after scan`);

  // Cook tab -> suggestions -> recipe detail.
  await page.getByRole('tab', { name: /Cook/ }).click();
  await page.getByRole('button', { name: 'Suggest recipes', exact: true }).click();
  const cards = page.getByRole('button').filter({ hasText: 'View recipe →', visible: true });
  await waitForResultOrError(page, cards.first());
  expect(await cards.count()).toBeGreaterThan(0);
  // Prefer a recipe that is missing something so the grocery handoff is exercised.
  let target = cards.first();
  for (const card of await cards.all()) {
    const match = /(\d+)\/(\d+) on hand/.exec(await card.innerText());
    if (match && Number(match[1]) < Number(match[2])) {
      target = card;
      break;
    }
  }
  await target.click();
  await expect(page.getByText('You have', { exact: true })).toBeVisible();
  await expect(page.getByText('You need', { exact: true })).toBeVisible();
  await expect(page.getByText('Method', { exact: true })).toBeVisible();
  await expect(page.getByTestId('method-step').first()).toBeVisible();

  // Grocery handoff: Instacart URL via Linking.openURL, or the inline shopping-list fallback.
  await page.getByRole('button', { name: 'Get groceries', exact: true }).click();
  const instacartReady = page.getByText('Your Instacart list is ready', { exact: true });
  const shoppingList = page.getByTestId('shopping-list');
  await waitForResultOrError(page, instacartReady.or(shoppingList));
  const expectInstacart = instacartConfigured();
  if (expectInstacart) {
    await expect(instacartReady, 'INSTACART_API_KEY is set, so expect an Instacart link').toBeVisible();
  } else {
    await expect(shoppingList, 'INSTACART_API_KEY is empty, so expect the shopping-list fallback').toBeVisible();
  }
  if (await instacartReady.isVisible()) {
    const opened = await page.evaluate(() => window.__openedUrls ?? []);
    console.log(`Grocery handoff: Instacart (${new URL(opened.at(-1) ?? 'about:blank').host})`);
    expect(opened.length).toBeGreaterThan(0);
    expect(opened.at(-1)).toMatch(/^https:\/\/([a-z0-9-]+\.)*instacart\.(com|tools)\//);
  } else {
    console.log('Grocery handoff: inline shopping-list fallback');
    await expect(shoppingList).toContainText('shopping list');
    await expect(shoppingList).toContainText('Estimated total');
  }

  // Reel screenshot -> recipe.
  await page.goBack();
  await page.getByRole('tab', { name: /Reel/ }).click();
  await uploadWithPicker(page, 'Choose screenshot', 'reel-screenshot.png');
  await expect(page.getByText('Reading your reel…')).toBeVisible();
  const reelCard = page.getByRole('button').filter({ hasText: 'View recipe →', visible: true });
  await waitForResultOrError(page, reelCard.first());
  await expect(page.getByText('What we could read', { exact: true })).toBeVisible();
  await reelCard.first().click();
  await expect(page.getByText('You have', { exact: true })).toBeVisible();
  await expect(page.getByText('Method', { exact: true })).toBeVisible();
  await expect(page.getByTestId('method-step').first()).toBeVisible();

  const reactErrors = consoleErrors.filter((text) =>
    /pageerror|Warning:|React|Uncaught|Minified/i.test(text),
  );
  console.log(`Browser console errors (${consoleErrors.length}):\n${consoleErrors.join('\n') || '(none)'}`);
  expect(reactErrors).toEqual([]);
});
