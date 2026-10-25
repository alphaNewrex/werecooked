import { expect, test } from '@playwright/test';

test.skip(!process.env.VISUAL, 'set VISUAL=1 to run visual baselines');
test.use({ viewport: { width: 430, height: 932 } });

const recipe = {
  title: 'Chili Crunch Chicken Tenders',
  description: 'Crispy, spicy, and ready for the weeknight rotation.',
  servings: 4,
  timeMinutes: 40,
  ingredients: [
    { name: 'Chicken breast', amount: '2 lb', haveIt: true },
    { name: 'Cornstarch', amount: '½ cup', haveIt: false, estPriceUsd: 2.19 },
    { name: 'Chili crisp', amount: '3 tbsp', haveIt: false, estPriceUsd: 6.49 },
  ],
  steps: ['Slice the chicken into tenders.', 'Coat and fry until crisp.', 'Finish with chili crisp.'],
};

const incoming = {
  id: 'visual-incoming',
  createdAt: new Date('2025-10-03T12:00:00Z').getTime(),
  recipe,
  source: { kind: 'reel-screenshot', notes: 'A bright, crunchy dinner idea.' },
};
const cookbook = { ...incoming, id: 'visual-cookbook' };

async function seed(page: import('@playwright/test').Page) {
  await page.addInitScript(({ pantry, incomingItems, cookbookItems }) => {
    localStorage.setItem('cookfood.pantry', JSON.stringify(pantry));
    localStorage.setItem('cookfood.incoming', JSON.stringify(incomingItems));
    localStorage.setItem('cookfood.cookbook', JSON.stringify(cookbookItems));
  }, {
    pantry: [
      { id: 'visual-1', name: 'Chicken breast', quantity: '2 lb', category: 'Protein', addedAt: 1 },
      { id: 'visual-2', name: 'Garlic', quantity: '1 bulb', category: 'Produce', addedAt: 2 },
      { id: 'visual-3', name: 'Spinach', quantity: '1 bag', category: 'Produce', addedAt: 3 },
      { id: 'visual-4', name: 'Rice', quantity: '2 lb', category: 'Pantry', addedAt: 4 },
      { id: 'visual-5', name: 'Olive oil', quantity: '1 bottle', category: 'Pantry', addedAt: 5 },
      { id: 'visual-6', name: 'Eggs', quantity: '12', category: 'Dairy', addedAt: 6 },
      { id: 'visual-7', name: 'Butter', quantity: '1 stick', category: 'Dairy', addedAt: 7 },
      { id: 'visual-8', name: 'Soy sauce', quantity: '1 bottle', category: 'Pantry', addedAt: 8 },
    ],
    incomingItems: [incoming],
    cookbookItems: [cookbook],
  });
}

async function loadUntil(
  page: import('@playwright/test').Page,
  route: string,
  assertion: () => Promise<void>,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: '#error-toast { display: none !important; }' });
    await page.evaluate(() => document.getElementById('error-toast')?.remove());
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(1_000);
    }
  }
  throw lastError;
}

for (const mode of ['light', 'dark'] as const) {
  test(`style guide ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/dev/design', () => expect(page.getByText('Market Stall', { exact: true })).toBeVisible());
    await page.evaluate(() => {
      const scroll = document.getElementById('design-scroll');
      if (!(scroll instanceof HTMLElement)) return;
      scroll.style.height = `${scroll.scrollHeight}px`;
      scroll.style.maxHeight = 'none';
      scroll.style.overflow = 'visible';
    });
    await expect(page).toHaveScreenshot(`styleguide-${mode}.png`, { fullPage: true });
  });

  test(`pantry ${mode}`, async ({ page }) => {
    await seed(page);
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/', () => expect(page.getByTestId('pantry-count')).toHaveText('8 items'));
    await expect(page).toHaveScreenshot(`pantry-${mode}.png`, { fullPage: true });
  });

  test(`cook empty ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/cook', () => expect(page.getByText('What can I make?', { exact: true })).toBeVisible());
    await expect(page).toHaveScreenshot(`cook-${mode}.png`, { fullPage: true });
  });

  test(`reel ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/reel', () => expect(page.getByText('Cook the reel', { exact: true })).toBeVisible());
    await expect(page).toHaveScreenshot(`reel-${mode}.png`, { fullPage: true });
  });

  test(`incoming ${mode}`, async ({ page }) => {
    await seed(page);
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/incoming', () => expect(page.getByTestId('incoming-item')).toHaveCount(1));
    await expect(page).toHaveScreenshot(`incoming-${mode}.png`, { fullPage: true });
  });

  test(`cookbook ${mode}`, async ({ page }) => {
    await seed(page);
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/cookbook');
    await page.waitForLoadState('networkidle');
    await page.evaluate((value) => localStorage.setItem('cookfood.cookbook', JSON.stringify(value)), [cookbook]);
    await loadUntil(page, '/cookbook', () => expect(page.getByTestId('cookbook-item')).toHaveCount(1));
    await expect(page).toHaveScreenshot(`cookbook-${mode}.png`, { fullPage: true });
  });

  test(`recipe ${mode}`, async ({ page }) => {
    await seed(page);
    await page.emulateMedia({ colorScheme: mode });
    await loadUntil(page, '/incoming', () => expect(page.getByTestId('incoming-item')).toHaveCount(1));
    await page.getByTestId('incoming-item').getByRole('button').first().click();
    await expect(page.getByText(recipe.title, { exact: true }).last()).toBeVisible();
    await expect(page).toHaveScreenshot(`recipe-${mode}.png`, { fullPage: true });
  });
}
