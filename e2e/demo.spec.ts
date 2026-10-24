import { test, expect, type Page } from '@playwright/test';

test.skip(!process.env.RECORD_DEMO, 'set RECORD_DEMO=1 to record the demo video');

const REEL = 'https://www.instagram.com/reels/DYnOMcnz-13/';

test.use({
  viewport: { width: 430, height: 932 },
  video: { mode: 'on', size: { width: 430, height: 932 } },
});

async function smoothScroll(page: Page, distance: number, pause = 1500) {
  await page.mouse.move(215, 450);
  const step = distance > 0 ? 12 : -12;
  for (let moved = 0; Math.abs(moved) < Math.abs(distance); moved += step) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(pause);
}

test('demo video', async ({ page }) => {
  test.setTimeout(300_000);
  const now = Date.now();
  const pantry = [
    ['chicken breast', '2 lb', 'Protein'],
    ['eggs', '12', 'Dairy'],
    ['garlic', '1 head', 'Produce'],
    ['onion', '2', 'Produce'],
    ['olive oil', '1 bottle', 'Pantry'],
    ['rice', '2 lb', 'Pantry'],
    ['butter', '1 stick', 'Dairy'],
    ['soy sauce', '1 bottle', 'Pantry'],
  ].map(([name, quantity, category], i) => ({ id: `seed-${i}`, name, quantity, category, addedAt: now - i }));
  await page.addInitScript((items) => {
    localStorage.setItem('cookfood.pantry', JSON.stringify(items));
  }, pantry);

  await page.goto('/');
  await page.waitForTimeout(2000);
  await smoothScroll(page, 300, 1000);
  await smoothScroll(page, -300, 800);

  await page.getByRole('tab', { name: 'Reel' }).click();
  await page.waitForTimeout(1200);
  const input = page.getByPlaceholder('https://instagram.com/reel/…');
  await input.click();
  await input.pressSequentially(REEL, { delay: 25 });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Read reel link' }).click();

  const viewRecipe = page.getByText('View recipe →').first();
  await expect(viewRecipe).toBeVisible({ timeout: 180_000 });
  await page.waitForTimeout(1200);
  await smoothScroll(page, 450, 2000);
  await viewRecipe.click();

  await expect(page.getByText('Method', { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(2000);
  for (let i = 0; i < 8; i++) await smoothScroll(page, 260, 1100);
  await page.waitForTimeout(1500);
});
