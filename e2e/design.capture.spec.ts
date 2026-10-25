import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

test.skip(!process.env.CAPTURE_DESIGN, 'set CAPTURE_DESIGN=1 to capture the design system');
test.use({ viewport: { width: 430, height: 932 } });

const designDirectory = path.join(process.cwd(), 'docs/design');
const preMigrationDirectory = path.join(designDirectory, 'pre-migration');

async function expandScrollContainer(page: import('@playwright/test').Page, id: string) {
  await page.evaluate((scrollId) => {
    const scroll = document.getElementById(scrollId);
    if (!(scroll instanceof HTMLElement)) return;
    scroll.style.height = `${scroll.scrollHeight}px`;
    scroll.style.maxHeight = 'none';
    scroll.style.overflow = 'visible';
  }, id);
}

async function openScreen(page: import('@playwright/test').Page, screenPath: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(screenPath);
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: '#error-toast { display: none !important; }' });
    if (!(await page.getByText('Server Error').count())) return;
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Could not load ${screenPath}`);
}

for (const mode of ['light', 'dark'] as const) {
  test(`style guide ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/dev/design');
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: '#error-toast { display: none !important; }' });
    await expect(page.getByText('Market Stall', { exact: true })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(500);
    await expandScrollContainer(page, 'design-scroll');
    await page.screenshot({ fullPage: true, path: path.join(designDirectory, `styleguide-${mode}.png`) });
  });
}

const screens = [
  { name: 'pantry', path: '/' },
  { name: 'cook', path: '/cook' },
  { name: 'reel', path: '/reel' },
  { name: 'recipe', path: '/recipe' },
];

for (const mode of ['light', 'dark'] as const) {
  for (const screen of screens) {
    test(`${screen.name} ${mode}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: mode });
      await openScreen(page, screen.path);
      await page.waitForTimeout(500);
      await page.screenshot({
        fullPage: true,
        path: path.join(preMigrationDirectory, `${screen.name}-${mode}.png`),
      });
    });
  }
}

test.beforeAll(() => {
  mkdirSync(preMigrationDirectory, { recursive: true });
});
