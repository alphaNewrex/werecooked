import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

async function addItem(page: Page, name: string, quantity: string, category: string) {
  await page.locator('input').nth(0).fill(name);
  await page.locator('input').nth(1).fill(quantity);
  await page.locator('input').nth(2).fill(category);
  await page.getByRole('button', { name: 'Add to pantry', exact: true }).click();
}

async function uploadWithPicker(page: Page, buttonName: string, fileName: string) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  await (await chooser).setFiles(`e2e/fixtures/${fileName}`);
}

test('manual pantry, cook, grocery, and reel flows', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Pantry', { exact: true }).first()).toBeVisible();

  await addItem(page, 'eggs', '6', 'protein');
  await addItem(page, 'spinach', '1 bag', 'produce');
  await addItem(page, 'garlic', '1 bulb', 'produce');
  await addItem(page, 'parmesan', '1 wedge', 'dairy');
  for (const item of ['eggs', 'spinach', 'garlic', 'parmesan']) {
    await expect(page.getByText(item, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText(/kcal · P/).first()).toBeVisible({ timeout: 20_000 });

  await uploadWithPicker(page, 'Photo library', 'pantry-photo.jpg');
  await expect(page.getByText('Review detected items')).toBeVisible({ timeout: 120_000 });
  await page.getByRole('button', { name: 'Add selected to pantry', exact: true }).click();
  await expect(page.getByText(/\d+ items/).first()).toBeVisible();

  await page.getByText('Cook', { exact: true }).last().click();
  await page.getByRole('button', { name: 'Suggest recipes', exact: true }).click();
  await expect(page.getByText('View recipe →').first()).toBeVisible({ timeout: 120_000 });
  await page.getByText('View recipe →').first().click();
  await expect(page.getByText('You have', { exact: true })).toBeVisible();
  await expect(page.getByText('You need', { exact: true })).toBeVisible();
  await expect(page.getByText('Method', { exact: true })).toBeVisible();
  const popup = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
  await page.getByRole('button', { name: 'Get groceries', exact: true }).click();
  await popup;

  await page.getByText('Reel', { exact: true }).last().click();
  await uploadWithPicker(page, 'Choose screenshot', 'reel-screenshot.png');
  await expect(page.getByText('View recipe →').first()).toBeVisible({ timeout: 120_000 });
  await page.getByText('View recipe →').first().click();
  await expect(page.getByText('Method', { exact: true })).toBeVisible();
});
