import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

async function reloadApp(page: Page, expectedText: string) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.reload();
    try {
      await expect(page.getByText(expectedText, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      await page.waitForTimeout(2000);
    }
  }
}

async function loadFresh(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page, 'Pantry');
}

async function uploadScreenshot(page: Page) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('tab', { name: 'Reel', exact: true }).click();
  await expect(page).toHaveURL(/\/reel$/);
  await page.getByRole('button', { name: 'Choose screenshot', exact: true }).click();
  await (await chooser).setFiles('e2e/fixtures/reel-screenshot.png');
  await expect(page.getByText('Here’s the dish', { exact: true })).toBeVisible({ timeout: 150_000 });
}

async function openIncoming(page: Page) {
  const item = page.getByTestId('incoming-item').first();
  await item.getByRole('button').first().click();
  await expect(page.getByRole('button', { name: 'Save to cookbook', exact: true })).toBeVisible();
}

test('reel recipes persist across Incoming and Cookbook and can be cooked', async ({ page }) => {
  test.setTimeout(480_000);
  await loadFresh(page);
  await uploadScreenshot(page);

  await page.getByRole('tab', { name: 'Incoming' }).click();
  await expect(page.getByTestId('incoming-item')).toHaveCount(1);
  await expect(page.getByTestId('incoming-item').first()).toContainText('Chicken');
  await reloadApp(page, 'Incoming');
  await expect(page.getByTestId('incoming-item')).toHaveCount(1);

  await openIncoming(page);
  await page.getByRole('button', { name: 'Save to cookbook', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved to cookbook ✓', exact: true })).toBeDisabled();

  await page.goBack();
  await expect(page.getByTestId('incoming-item').first()).toContainText('Saved');
  await page.getByRole('tab', { name: 'Cookbook' }).click();
  await expect(page.getByTestId('cookbook-item')).toHaveCount(1);
  await reloadApp(page, 'Cookbook');
  await expect(page.getByTestId('cookbook-item')).toHaveCount(1);

  await page.getByRole('tab', { name: 'Incoming' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByTestId('incoming-item').getByRole('button', { name: /Remove/ }).click();
  await page.getByTestId('incoming-empty').waitFor();
  await page.getByRole('tab', { name: 'Cookbook' }).click();
  await expect(page.getByTestId('cookbook-item')).toHaveCount(1);

  await page.getByTestId('cookbook-item').getByRole('button').first().click();
  await page.getByRole('button', { name: 'Start cooking', exact: true }).click();
  await expect(page.getByTestId('cook-ingredient').first()).toBeVisible();
  await page.getByRole('button', { name: 'Start steps', exact: true }).click();
  const progress = page.getByTestId('cook-progress');
  await expect(progress).toHaveText(/^Step 1 of \d+$/);
  const totalSteps = Number((await progress.innerText()).match(/of (\d+)/)?.[1] ?? 0);
  for (let step = 1; step < totalSteps; step += 1) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(progress).toHaveText(`Step ${totalSteps} of ${totalSteps}`);
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start cooking', exact: true })).toBeVisible();
});

test('reel link deduplicates by Instagram shortcode', async ({ page }) => {
  test.setTimeout(480_000);
  await loadFresh(page);
  await page.getByRole('tab', { name: 'Reel', exact: true }).click();
  await expect(page).toHaveURL(/\/reel$/);
  await page.waitForTimeout(500);

  let reelLinkRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/reel-link')) reelLinkRequests += 1;
  });
  const url = 'https://www.instagram.com/reels/DYnOMcnz-13/';
  const input = page.getByPlaceholder('https://instagram.com/reel/…');
  await input.click();
  await input.pressSequentially(url);
  await expect(input).toHaveValue(url);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Read reel link', exact: true }).click();
  const result = page.getByText('Here’s the dish', { exact: true });
  const blocked = page.getByText("Couldn't read this reel's caption", { exact: true });
  await expect(result.or(blocked)).toBeVisible({ timeout: 150_000 });
  if (await blocked.isVisible()) {
    test.skip(true, 'Instagram caption unavailable; reel link returned needScreenshot');
    return;
  }
  await expect(result).toBeVisible();
  expect(reelLinkRequests).toBe(1);

  await page.getByRole('tab', { name: 'Incoming' }).click();
  await expect(page.getByTestId('incoming-item')).toHaveCount(1);
  await page.getByRole('tab', { name: /Reel/ }).click();
  const linkInput = page.getByPlaceholder('https://instagram.com/reel/…');
  await linkInput.fill('');
  await linkInput.pressSequentially(url);
  await page.getByRole('button', { name: 'Read reel link', exact: true }).click();
  await expect(result).toBeVisible();
  expect(reelLinkRequests).toBe(1);

  await linkInput.fill('');
  await linkInput.pressSequentially('https://www.instagram.com/reel/DYnOMcnz-13/?igsh=x');
  await page.getByRole('button', { name: 'Read reel link', exact: true }).click();
  await expect(result).toBeVisible();
  expect(reelLinkRequests).toBe(1);
  await page.getByRole('tab', { name: 'Incoming' }).click();
  await expect(page.getByTestId('incoming-item')).toHaveCount(1);
});

test('Cook suggestions save only to Cookbook', async ({ page }) => {
  test.setTimeout(480_000);
  await loadFresh(page);
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByPlaceholder('Ingredient name').fill('eggs');
  await page.getByPlaceholder('Quantity').fill('6');
  await page.getByPlaceholder('Category').fill('protein');
  await page.getByRole('button', { name: 'Add to pantry', exact: true }).click();
  await page.getByRole('tab', { name: 'Cook', exact: true }).click();
  await page.getByRole('button', { name: 'Suggest recipes', exact: true }).click();
  const card = page.getByRole('button').filter({ hasText: 'View recipe →' }).first();
  await expect(card).toBeVisible({ timeout: 150_000 });
  await card.click();
  await page.getByRole('button', { name: 'Save to cookbook', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved to cookbook ✓', exact: true })).toBeDisabled();
  await page.goBack();
  await page.getByRole('tab', { name: 'Cookbook' }).click();
  await expect(page.getByTestId('cookbook-item')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Incoming' }).click();
  await expect(page.getByTestId('incoming-empty')).toBeVisible();
});
